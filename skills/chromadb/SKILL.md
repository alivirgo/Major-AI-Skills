---
name: chromadb
description: "Build and operate Chroma collections for RAG: PersistentClient vs HttpClient, embedding-function contracts, metadata/where filters, and dimension-safe upsert/query paths agents routinely break."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["chromadb", "vector-database", "embeddings", "rag", "metadata-filter", "hnsw", "persistent-client"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# ChromaDB Vector Store AI Skill Guide (Claude)

## Overview & Engine Architecture

Chroma is an embedding-first vector store: documents (or precomputed vectors) land in **collections**, each locked to a **fixed embedding dimension** and **distance space** after first write. Clients run **embedded** (`PersistentClient` / ephemeral `Client`) or **client–server** (`HttpClient` / `AsyncHttpClient`). Agents treat the embedding function + distance metric as a **retrieval contract**, persist paths intentionally, and never mix models across upsert and query without a new collection rebuild.

```
┌─────────────────────────────────────────────────────────────┐
│                 Chroma retrieval stack                        │
│                                                             │
│  Clients                                                    │
│  ├── Ephemeral Client() — in-memory notebooks/tests         │
│  ├── PersistentClient(path) — local embedded + on-disk      │
│  └── HttpClient / AsyncHttpClient — remote Chroma server    │
│                                                             │
│  Collection contract                                        │
│  ├── EmbeddingFunction (default: all-MiniLM-L6-v2 / 384-d)  │
│  ├── Space: hnsw.space = l2 | cosine | ip (immutable)     │
│  └── Dimension locked on first embedding write              │
│                                                             │
│  Read path                                                  │
│  ├── query(query_texts|query_embeddings) + where            │
│  ├── where_document ($contains / $regex)                    │
│  └── get(ids|filters) — no similarity ranking               │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Local/dev RAG with durable collections beside `@langchain` / `@llamaindex`.
- Metadata-filtered nearest-neighbor retrieval (ACL tags, source path, tenant).
- Embedded apps that ship a single-node persist directory.

**Do not use when**

- You need multi-region HA, horizontal sharding, or strict multi-writer concurrency on one local path → dedicated managed vector DB / Chroma Cloud / app-level sharding.
- Concurrent **processes** share one `PersistentClient` path (Chroma is thread-safe, not process-safe for writers) → one writer process or HttpClient + server.
- Someone asks to embed API keys, PII, or secrets into `documents` that get logged → refuse; redact or store secrets outside the index.

---

## Operational Capabilities & Agent Directives

1. **Choose the client deliberately**: ephemeral for tests; `PersistentClient(path=...)` for single-process apps; `HttpClient` when multiple processes/hosts must share one store.
2. **Pin the embedding contract** at collection create time (`embedding_function` + `configuration={"hnsw": {"space": "cosine"}}` when cosine distance is intended). Store `embedding_model` / dim in collection metadata.
3. **Never change model mid-collection**: dimension and space are immutable after first write—create a new collection and re-index.
4. **Upsert with deterministic ids** (content hash, `source#chunk_i`) so re-ingest is idempotent.
5. **Filter in `where` / `where_document`**, not post-hoc Python discard of the full candidate set.
6. **Normalize custom vectors** before `l2`/`ip` spaces; prefer `cosine` when magnitude drift is expected.
7. **Batch upserts** for remote embedding providers; respect rate limits and retry with backoff.
8. **One writer per persist path**; for multi-service access, run a Chroma server and use HttpClient.

---

## Production Example: persistent RAG collection with filters

```python
from __future__ import annotations

import hashlib
import os
from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction

PERSIST = Path(os.environ.get("CHROMA_PATH", "var/chroma"))
MODEL = "text-embedding-3-small"

ef = OpenAIEmbeddingFunction(
    api_key=os.environ["OPENAI_API_KEY"],  # from env / secret store — never hardcode
    model_name=MODEL,
)

client = chromadb.PersistentClient(path=str(PERSIST))
col = client.get_or_create_collection(
    name="policies",
    embedding_function=ef,
    metadata={"embedding_model": MODEL},
    configuration={"hnsw": {"space": "cosine"}},
)


def chunk_id(source: str, text: str) -> str:
    return hashlib.sha256(f"{source}\n{text}".encode()).hexdigest()[:32]


docs = [
    ("policies/refund.md", "Annual plans may refund within 14 days of purchase.", "public"),
    ("policies/refund.md", "Enterprise contracts follow the MSA termination clause.", "internal"),
]

col.upsert(
    ids=[chunk_id(src, body) for src, body, _ in docs],
    documents=[body for _, body, _ in docs],
    metadatas=[{"source": src, "acl": acl} for src, _, acl in docs],
)

hits = col.query(
    query_texts=["How long is the refund window?"],
    n_results=5,
    where={"$and": [{"acl": "public"}, {"source": {"$eq": "policies/refund.md"}}]},
    include=["documents", "metadatas", "distances"],
)
print(hits["ids"], hits["distances"], hits["documents"])
```

HttpClient pattern (shared server):

```python
client = chromadb.HttpClient(host="127.0.0.1", port=8000)
# same get_or_create_collection / upsert / query API
```

Validation loop:

```bash
python -c "import chromadb; c=chromadb.PersistentClient('var/chroma'); print(c.heartbeat()); print(c.list_collections())"
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `InvalidDimensionException: Embedding dimension X does not match collection dimensionality Y` | Upsert/query model differs from first write (e.g. 1536 vs MiniLM 384) | New collection + full re-index with one EF; align `@langchain` / `@llamaindex` embedder dim |
| Empty or irrelevant hits | Wrong persist path / collection name; filter too strict | Verify `path`, `list_collections()`, relax `where` types |
| Distances in tens/hundreds | Unnormalized vectors under default `l2` | L2-normalize custom embeddings or create with `cosine` space |
| Filter returns nothing | Metadata type mismatch (`"10"` vs `10`) or missing keys | Consistent types at upsert; `$exists` checks via get |
| Corrupt / flaky local DB under load | Multiple processes writing same persist dir | Single writer or migrate to HttpClient + server |
| Quality cliff after “model upgrade” | Changed EF without rebuild | Keep old collection read-only; build `policies_v2` and cut over |
| Duplicate chunks | Random UUIDs each ingest | Stable ids + `upsert` |
| Slow ingest | One-by-one remote embed calls | Batch documents; cache embeddings when reindexing unchanged text |

---

## Best Practices

1. Treat EF + space + dim as versioned: name collections `corpus__model__vN`.
2. Keep narrative text in `documents`; put structure (`source`, `acl`, `chunk_index`, `mtime`) in `metadatas`.
3. Golden-query set: assert recall@k before swapping models or distance metrics.
4. Backup the persist directory with the app release that built it; document Chroma package version.
5. Prefer `get` for id lookups; reserve `query` for similarity.
6. Do not log full retrieved document bodies that contain secrets—redact at ingest.

---

## Limitations

- Embedded mode is not a multi-region production vector service; scale is primarily vertical on single-node.
- Distance metric cannot be changed after collection creation without clone/rebuild.
- Default MiniLM is a demo-grade local EF—pin and evaluate domain quality before production RAG.
- Stop and ask if Hub/API tokens, tenant isolation, or retention requirements are unspecified.

---

## Related Skills

- `@langchain` / `@llamaindex` — RAG orchestration on top of Chroma
- `@openai-api` — common remote embedding provider
- `@huggingface-transformers` — local embedding / reranker models
- `@prefect` — scheduled reindex / rebuild jobs
- `@docker` — run Chroma server beside the app

---

## Agent Operational Directive

> **MANDATORY**: Lock one embedding function and distance space per collection. Use deterministic ids and `upsert`. Persist to an explicit path (or HttpClient). Filter with `where`/`where_document`. Never embed secrets. On dimension mismatch, rebuild a new collection—do not “fix” vectors in place.

---

## Source anchors (research)

- [Chroma clients (Persistent / Http)](https://docs.trychroma.com/docs/run-chroma/clients)
- [Query, get, where, where_document](https://docs.trychroma.com/docs/querying-collections/query-and-get)
- [Metadata filtering](https://docs.trychroma.com/docs/querying-collections/metadata-filtering)
- [Embedding functions & default MiniLM](https://docs.trychroma.com/docs/embeddings/embedding-functions)
- [FAQ: dimension mismatch, large distances](https://cookbook.chromadb.dev/faq/)
- [System constraints: not process-safe writers](https://cookbook.chromadb.dev/core/system_constraints/)
