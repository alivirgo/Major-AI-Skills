---
name: chromadb
description: "Operational skill for ChromaDB: collections, embeddings, metadata filters, persistence, and local RAG vector storage."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["chromadb", "vector-database", "embeddings", "rag", "python", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# ChromaDB Vector Store AI Skill Guide

## Overview & Engine Architecture

Chroma stores embedding vectors with documents and metadata in collections. Clients run embedded (in-process + persist directory) or against a server. Querying embeds the text (or accepts precomputed vectors) and returns nearest neighbors with optional metadata `where` filters. Agents choose stable collection names, persist paths intentionally, and keep embedding model IDs aligned between upsert and query.

```
embed(text) -> collection.add / upsert
query(embed) + metadata filter -> ids / documents / distances
```

## When to use this skill

- Local/dev RAG prototypes
- Lightweight persistent vector search beside `@langchain` / `@llamaindex`
- Per-project collections with metadata ACLs tags

## Operational directives

1. Persist to an explicit directory in non-throwaway apps (`PersistentClient`).
2. Store `embedding_model` in collection metadata; rebuild if the model changes.
3. Upsert with deterministic ids (content hash / doc path) for idempotent ingest.
4. Filter with metadata - do not retrieve then discard everything in Python when possible.
5. Do not put secrets inside documents that get embedded and logged.

## Persistent collection example

```python
import os
import chromadb
from chromadb.utils import embedding_functions

ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.environ["OPENAI_API_KEY"],
    model_name="text-embedding-3-small",
)

client = chromadb.PersistentClient(path="var/chroma")
col = client.get_or_create_collection(
    name="policies",
    embedding_function=ef,
    metadata={"embedding_model": "text-embedding-3-small"},
)

col.upsert(
    ids=["refund-policy"],
    documents=["Annual plans may refund within 14 days of purchase."],
    metadatas=[{"source": "policies/refund.md", "acl": "public"}],
)

hits = col.query(
    query_texts=["How long is the refund window?"],
    n_results=3,
    where={"acl": "public"},
)
print(hits["documents"], hits["distances"])
```

## Local default embeddings

```python
# Default all-MiniLM can work offline for demos; pin versions for prod parity
client = chromadb.Client()
col = client.create_collection("demo")
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Empty results | wrong collection / path | verify persist path |
| Quality drop | embedding model changed | re-upsert all vectors |
| Duplicate chunks | random ids each run | stable ids + upsert |
| Filter misses | metadata type mismatch | consistent types in `where` |

## Best practices

- Batch upserts; avoid one-by-one remote embedding calls without batching.
- Keep chunk text in `documents` and structural fields in `metadatas`.
- Backup the persist directory with the app release that built it.
- Measure recall on a golden query set before swapping distance metrics.

## Limitations

- Embedded mode is not a multi-region production vector service.
- Large-scale ANN ops may need dedicated vector DBs.
- Embedding provider rate limits dominate ingest time.

## Related skills

- `@langchain` / `@llamaindex` - RAG orchestration on top of Chroma
- `@openai-api` - common embedding provider
- `@prefect` - scheduled reindex jobs
