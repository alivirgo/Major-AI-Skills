---
title: "ChromaDB Vector Store AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate idempotent Chroma ingest scripts, collection contracts, filter auditors, and rebuild pipelines with pinned embedding models."
category: "Vector Store & RAG Persistence"
tags: ["chromadb", "embeddings", "rag", "gpt-codex", "upsert", "metadata-filter"]
---

# ChromaDB Vector Store AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **RAG persistence automation engineer**: emit **collection factories**, **deterministic upsert jobs**, **where-filter helpers**, and **CI checks** that fail on embedding-dimension / persist-path drift.

```
┌─────────────────────────────────────────────────────────────┐
│                 Chroma automation stack                       │
│  pin EF + space → create collection → batch upsert          │
│  golden queries → recall@k gate → versioned collection cutover│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Generate ingest CLIs** that hash `(source, chunk_text)` → id and call `upsert` only.
2. **Fail CI** if collection metadata `embedding_model` ≠ configured EF model name.
3. **Emit rebuild playbooks** (`corpus__model__vN`) instead of in-place model swaps.
4. **Never hardcode API keys**; read `OPENAI_API_KEY` / provider env vars.
5. Prefer `HttpClient` templates when Compose shows multiple writers.

---

## Production Python: collection contract auditor

```python
"""Fail if persist path collections disagree with expected embedding model."""
from __future__ import annotations

import os
import sys

import chromadb

EXPECTED_MODEL = os.environ["EXPECTED_EMBEDDING_MODEL"]
PATH = os.environ.get("CHROMA_PATH", "var/chroma")
NAME = os.environ.get("CHROMA_COLLECTION", "policies")


def main() -> None:
    client = chromadb.PersistentClient(path=PATH)
    col = client.get_collection(NAME)
    meta = col.metadata or {}
    got = meta.get("embedding_model")
    if got != EXPECTED_MODEL:
        print(f"embedding_model mismatch: {got!r} != {EXPECTED_MODEL!r}")
        raise SystemExit(1)
    print(f"OK {NAME} count={col.count()} model={got}")


if __name__ == "__main__":
    main()
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Script fix |
| :--- | :--- | :--- |
| CI dim exception | EF model changed in config | Bump collection name + reindex job |
| Flaky parallel jobs | Shared persist path | Switch generator to HttpClient URL |
| Empty golden recall | where types coerced | Assert metadata dtypes at upsert |

---

## Agent Operational Directive

> **MANDATORY**: Automate deterministic ids, embedding-model metadata checks, and versioned rebuilds. Never emit credential literals. Prefer filters in `where` over post-query Python drops.
