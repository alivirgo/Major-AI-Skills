---
name: llamaindex
description: "Build production LlamaIndex ingestion, VectorStoreIndex, and query engines with chunk/metadata discipline, idempotent pipelines, and retrieval eval agents miss."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["llamaindex", "rag", "ingestion", "retrieval", "embeddings", "query-engine", "python"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# LlamaIndex RAG AI Skill Guide (Claude)

## Overview & Engine Architecture

LlamaIndex connects LLMs to private data via **loaders → node parsers → indexes → retrievers → response synthesizers**. Ingestion builds nodes + embeddings into a vector store (local or `@qdrant` / `@chromadb`); query time retrieves nodes and synthesizes answers with source citations. Prefer **IngestionPipeline** for repeatable jobs, but treat pipeline runs as **fail-closed**: verify docstore/vector consistency after errors (historically, failed transforms could poison hashes or drop chunks—pin recent `llama-index-core` and re-check counts).

```
┌─────────────────────────────────────────────────────────────┐
│                 LlamaIndex RAG loop                           │
│                                                             │
│  Ingestion                                                  │
│  Documents → NodeParser (chunk/overlap) → Embeddings        │
│       → Docstore + VectorStore (+ optional cache)           │
│                                                             │
│  Query                                                      │
│  QueryEngine / ChatEngine                                   │
│  ├── Retriever (top_k, filters, hybrid)                     │
│  ├── Postprocessors (rerank, similarity cutoff)             │
│  └── Response synthesizer + source_nodes                     │
│                                                             │
│  Eval                                                       │
│  └── Hit-rate@k on labeled Qs before prompt polish          │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Document QA, policy chat, and knowledge-base assistants with citations.
- Structured ingestion from PDFs, Notion, SQL, APIs into a persistent index.
- Tuning chunking, metadata filters, and hybrid retrieval before swapping models.

**Do not use when**

- You only need a single LLM call with no corpus → `@openai-api` / `@anthropic-api`.
- Heavy multi-agent tool orchestration is the product → `@langchain` / LangGraph.
- Someone asks to skip ACL metadata and “just embed everything” for multi-tenant data → refuse; enforce filters + app auth.

---

## Operational Capabilities & Agent Directives

1. **Tune chunk size/overlap with retrieval metrics** (hit-rate@k), not vibe-based defaults alone.
2. **Attach metadata** (`source`, `tenant_id`, `as_of`, ACL tags) on every node; filter at query time.
3. **Pin embed + LLM models** in `Settings`; **re-embed the whole corpus** when the embed model changes.
4. **Persist intentionally**; never silently rebuild prod indexes in the request path.
5. **Return `source_nodes`** (path/page/score) whenever factual claims matter.
6. **Ingestion hygiene**: after pipeline failures, verify document/node counts before assuming success—retry safely; avoid versions with eager docstore deletes on failed upserts.
7. **Keys only from env**; never commit notebooks with embedded secrets.

---

## Production Example: ingest, persist, query with citations

```python
import os
from llama_index.core import (
    Settings,
    StorageContext,
    VectorStoreIndex,
    SimpleDirectoryReader,
    load_index_from_storage,
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

Settings.llm = OpenAI(model="gpt-4.1-mini", temperature=0)
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
Settings.node_parser = SentenceSplitter(chunk_size=512, chunk_overlap=64)

PERSIST = "storage/policies"


def build_or_load_index(data_dir: str = "data/policies") -> VectorStoreIndex:
    if os.path.isdir(PERSIST) and os.listdir(PERSIST):
        storage = StorageContext.from_defaults(persist_dir=PERSIST)
        return load_index_from_storage(storage)

    docs = SimpleDirectoryReader(data_dir).load_data()
    for d in docs:
        d.metadata.setdefault("tenant_id", "default")
        d.metadata.setdefault("source", d.metadata.get("file_path", "unknown"))
    index = VectorStoreIndex.from_documents(docs, show_progress=True)
    index.storage_context.persist(persist_dir=PERSIST)
    return index


index = build_or_load_index()
engine = index.as_query_engine(
    similarity_top_k=4,
    response_mode="compact",
)

resp = engine.query("What is the refund window for annual plans?")
print(resp)
for n in resp.source_nodes:
    print(n.metadata.get("source"), n.score, n.node.get_content()[:120])
```

### IngestionPipeline sketch (batch jobs)

```python
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding

pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=512, chunk_overlap=64),
        OpenAIEmbedding(model="text-embedding-3-small"),
    ],
)
# Prefer explicit vector_store + docstore for multi-process serving (@qdrant)
nodes = pipeline.run(documents=docs, show_progress=True)
assert nodes, "ingestion produced zero nodes — refuse silent success"
```

Validation loop:

```bash
# Count docs vs nodes; run labeled questions; log empty retrieval rate
python -c "from app import index; print(index.vector_store)"  # smoke
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Irrelevant context | Chunk size wrong / no metadata filters | Retune splitter; add filters; rerank |
| Empty / thin answers | Bad reader paths; zero docs loaded | Count `load_data()`; fix paths/permissions |
| “Document missing” after failed ingest | Pipeline wrote hashes/deletes before embed succeeded | Upgrade `llama-index-core`; wipe poisoned hashes; re-run; assert counts |
| Only last chunk of each doc present | Historical upsert dict-by-`ref_doc_id` bug | Upgrade core; re-ingest; verify node count ≫ doc count |
| Embedding mismatch / nonsense scores | Embed model changed without re-index | Full re-embed; version collection name |
| Token blowups / truncated synth | `top_k` too high / huge chunks | Lower k; compress; similarity cutoff |
| Cross-tenant leak | Missing `tenant_id` filter | Mandatory metadata filter + app authZ |
| PDF garbage text | Layout/table-heavy PDF | Specialized loaders / OCR; don’t blame the LLM first |

---

## Best Practices

1. Evaluate **retrieval** (hit-rate@k) before prompt gymnastics.
2. Separate ingestion (`@prefect` jobs) from online query paths.
3. Use `@qdrant` or `@chromadb` for multi-process / multi-host serving—not only in-memory stores.
4. Cite filename + page/section in the synthesizer prompt; surface `source_nodes` in the API.
5. Version indexes (`policies_v3_emb3small`) when embed model or chunking changes.
6. Keep unanswerable questions in the golden set (`@ai-evaluation-dataset`).

---

## Limitations

- PDF/HTML parsing quality varies; complex layouts need specialized extractors.
- Package surface is split (`llama-index-core`, `llama-index-llms-*`, embeddings, vector stores)—pin all used extras.
- Metadata filters are not a substitute for authentication/authorization.
- Stop and ask if corpus ACL rules, embed model, or eval labels are missing.

---

## Related Skills

- `@langchain` — orchestration / multi-tool agents
- `@qdrant` / `@chromadb` — production vector stores
- `@openai-api` / `@anthropic-api` — underlying providers
- `@prefect` — scheduled ingestion
- `@ai-evaluation-dataset` — labeled RAG cases

---

## Agent Operational Directive

> **MANDATORY**: Pin embed and LLM models; re-embed on embed-model change. Attach and filter metadata for tenancy. Persist indexes outside the request path. Return source nodes for factual answers. After ingestion errors, verify node/doc counts—never assume success. Keys from environment only.

---

## Source anchors (research)

- [LlamaIndex docs](https://docs.llamaindex.ai/)
- [IngestionPipeline silent data loss (hash poison)](https://github.com/run-llama/llama_index/issues/19579)
- [Eager deletes on failed upserts](https://github.com/run-llama/llama_index/issues/22639)
- [Upsert dropped all-but-last chunk per doc](https://github.com/run-llama/llama_index/pull/22133)
