---
title: "Qdrant Vector Database AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Qdrant collection schemas, payload-index gates, query_points hybrid clients, and upsert batchers."
category: "Vector Search"
tags: ["qdrant", "query-points", "hybrid-search", "payload-index", "gpt-codex", "rag"]
---

# Qdrant Vector Database AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Vector Platform Automation Engineer**: emit **collection constructors**, **payload-index auditors**, **hybrid `query_points` clients**, and **batch upsert jobs** with embed-model versioning in collection names.

```
┌─────────────────────────────────────────────────────────────┐
│                 Qdrant Automation                           │
│  create_collection → payload indexes → upsert batches       │
│  query_points hybrid → recall@k CI → snapshot script       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate setup scripts that **create payload indexes** for every filter key used in queries.
2. Emit **only** `query_points` (flag any `client.search` as deprecated).
3. Version collection names with embed model + dim (`kb_v3_te3small_1536`).
4. Batch upserts 500–2000; include retry with idempotent point ids.
5. Never hardcode Cloud API keys—env `QDRANT_URL` / `QDRANT_API_KEY` only.

---

## Production Python: payload-index CI gate

```python
"""Fail if query filter fields lack payload indexes."""
from __future__ import annotations

import sys
from qdrant_client import QdrantClient

REQUIRED = {"tenant_id", "published_timestamp"}


def main(url: str, collection: str) -> None:
    client = QdrantClient(url=url)
    info = client.get_collection(collection)
    # schema keys vary slightly by client version; normalize to field names
    indexed = set()
    payload_schema = getattr(info, "payload_schema", None) or {}
    if isinstance(payload_schema, dict):
        indexed = set(payload_schema.keys())
    missing = REQUIRED - indexed
    if missing:
        print(f"missing payload indexes: {sorted(missing)}")
        raise SystemExit(1)
    print("payload indexes OK")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "http://localhost:6333", "rag_documents")
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Slow filtered search in staging | Index auditor fails | Create indexes before traffic |
| Dim mismatch upsert | Assert len(vector)==size | Recreate collection |
| Deprecated warnings in CI | rg `\.search\(` | Rewrite to `query_points` |
| Tenant leak test red | Query without filter | Require filter kwarg in client wrapper |

---

## Agent Operational Directive

> **MANDATORY**: Automate payload-index creation, `query_points` clients, and collection versioning on embed changes. Batch upserts. Never emit credential literals.
