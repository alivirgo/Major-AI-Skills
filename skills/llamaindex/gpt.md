---
title: "LlamaIndex RAG AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate LlamaIndex ingestion jobs, persist/load indexes, retrieval eval harnesses, and metadata-filter gates."
category: "RAG / Retrieval"
tags: ["llamaindex", "rag", "ingestion", "embeddings", "gpt-codex", "ci"]
---

# LlamaIndex RAG AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **RAG Platform Automation Engineer**: emit **ingestion CLIs**, **index version manifests**, **hit-rate@k evaluators**, and **tenant-filter assertions**.

```
┌─────────────────────────────────────────────────────────────┐
│                 LlamaIndex Automation                       │
│  load → chunk → embed → persist → manifest (embed+chunk hash)│
│  golden Qs → retrieve → hit-rate@k → CI gate                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate `build_index.py` / `query.py` with pinned `Settings.llm` and `Settings.embed_model`.
2. Write a **manifest** recording embed model, chunk size/overlap, corpus hash, persist dir.
3. Emit eval that fails if mean hit-rate@k < threshold on labeled evidence.
4. Assert every query path applies `tenant_id` (or equivalent) filters for multi-tenant apps.
5. Never embed credentials in generated notebooks or `.env.example` values.

---

## Production Python: retrieval hit-rate sketch

```python
"""Evaluate whether gold source paths appear in top_k source_nodes."""
from __future__ import annotations

import json
from pathlib import Path


def hit_at_k(engine, cases: list[dict], k: int = 4) -> float:
    hits = 0
    for case in cases:
        resp = engine.query(case["query"])
        sources = {n.metadata.get("source") for n in resp.source_nodes[:k]}
        if case["gold_source"] in sources:
            hits += 1
    return hits / max(len(cases), 1)


def main() -> None:
    cases = [json.loads(l) for l in Path("evals/rag_v1.jsonl").read_text().splitlines() if l.strip()]
    # engine = build_or_load_index().as_query_engine(similarity_top_k=4)
    # score = hit_at_k(engine, cases, k=4)
    score = 0.0  # wire engine in project
    if score < 0.8:
        raise SystemExit(f"hit-rate@4={score:.2f} below 0.80")
    print(f"hit-rate@4={score:.2f}")


if __name__ == "__main__":
    main()
```

---

## Technical Troubleshooting Matrix

| Signature | Check | Automation |
| :--- | :--- | :--- |
| Node count ≈ doc count | Chunker not applied | Assert `nodes >= docs * 2` after ingest |
| Eval collapse after “upgrade” | Embed model drift | Diff manifest embed id; force rebuild |
| CI flaky answers | temp≠0 | Pin temperature=0 in Settings |
| Tenant leak in staging | Filter omitted | Static check query kwargs for filter key |

---

## Agent Operational Directive

> **MANDATORY**: Automate index manifests, re-embed on embed-model change, and hit-rate@k gates. Enforce tenant metadata filters. Never invent corpus credentials or ACL bypasses.
