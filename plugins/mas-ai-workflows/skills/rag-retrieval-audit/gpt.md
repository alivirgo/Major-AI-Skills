---
title: "RAG Retrieval Audit AI Skill Guide (GPT & Codex)"
description: "Operational skill for OpenAI GPT and Codex to script RAG retrieval audits: labeled harnesses, Recall@K/MRR/nDCG, hybrid-arm canaries, and CI gates without ACL bypasses."
category: "AI Workflows / RAG Evaluation"
tags: ["rag", "retrieval-audit", "recall-at-k", "mrr", "ndcg", "hybrid-search", "gpt-codex", "ci-evaluation"]
---

# RAG Retrieval Audit AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a Principal RAG Platform Automation Engineer: author **reproducible eval scripts**, **CI metric gates**, **trace JSON schemas**, and **single-variable experiment runners** that isolate retrieval from generation.

```
┌─────────────────────────────────────────────────────────────┐
│                 Retrieval Audit Automation                  │
│                                                             │
│  Dataset → retrieve_final_context() → ID metrics → report   │
│  ├── Gold chunk IDs scoped to user ACL                      │
│  ├── Arms: dense / BM25 → RRF → rerank → pack               │
│  └── Artifacts: metrics.json + per_query.csv + config.yaml  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Harness first**: Implement `retrieve_final_context_ids(query) -> list[str]` that mirrors production packing (filters, rerank, truncation)—never score only the raw vector ANN list.
2. **CI smoke + deep**: Hit-rate@K on every PR; full Recall@K / Precision@K / MRR / nDCG on main or nightly.
3. **Hybrid canary**: Assert BM25-only share of top-K stays above a floor after deploys.
4. **Config as code**: Dump embedding model, index revision, `K`, fusion weights, and filter AST beside metrics.
5. **Safe defaults**: Exclude ACL-inaccessible gold from denominators; refuse authorization bypass “fixes.”

---

## Production Python: experiment runner (one knob)

```python
"""Run baseline vs candidate retrieval configs; emit metric delta."""
from __future__ import annotations

import json
from pathlib import Path
from statistics import fmean
from typing import Callable, Sequence


def mean_ignore_nan(xs: Sequence[float]) -> float:
    vals = [x for x in xs if x == x]
    return fmean(vals) if vals else float("nan")


def summarize(rows: list[dict]) -> dict:
    return {
        "n": len(rows),
        "hit_rate": mean_ignore_nan([r["hit"] for r in rows]),
        "recall": mean_ignore_nan([r["recall"] for r in rows]),
        "precision": mean_ignore_nan([r["precision"] for r in rows]),
        "mrr": mean_ignore_nan([r["mrr"] for r in rows]),
    }


def compare(
    name_a: str,
    rows_a: list[dict],
    name_b: str,
    rows_b: list[dict],
    out_dir: Path,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    summary = {"a": {**summarize(rows_a), "name": name_a}, "b": {**summarize(rows_b), "name": name_b}}
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    # Fail CI if recall or MRR regress beyond tolerance
    tol = 0.02
    if summary["b"]["recall"] + tol < summary["a"]["recall"]:
        raise SystemExit(f"Recall regression: {summary['a']['recall']:.3f} → {summary['b']['recall']:.3f}")
    if summary["b"]["mrr"] + tol < summary["a"]["mrr"]:
        raise SystemExit(f"MRR regression: {summary['a']['mrr']:.3f} → {summary['b']['mrr']:.3f}")


# Wire rows from the SKILL.md audit() helper using baseline vs candidate retrieve fns.
```

### Framework hooks

- **LlamaIndex**: `RetrieverEvaluator.from_metric_names(["hit_rate","mrr","precision","recall","ndcg"], retriever=...)` — apply the same postprocessors as prod.
- **Ragas**: prefer `IDBasedContextRecall` when IDs exist; else Context Recall / Context Precision with references.
- **Vector stores**: stamp `embedding_model` on chunks; filter dense arm by model during dual-write rembeds.

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix to script |
| :--- | :--- | :--- |
| Empty tenant results | Count gold surviving filter before ANN | Pre-filter query or raise `fetch_k` |
| Hybrid dead | % of top-K with `sources == {"bm25"}` == 0 | Move similarity floor before fusion |
| Score cross-talk | Distinct embedding model IDs in one run | Fail audit if mixed models without filter |
| Packing loss | `set(ann_ids) - set(final_context_ids)` nonempty for gold | Log truncation; raise context budget or rerank |

---

## Best Practices

1. Store gold sets as JSONL: `query_id`, `query`, `gold_ids[]`, `acl`.
2. Pin library versions in the eval job; retrieval regressions from client upgrades are real.
3. Emit JUnit or GitHub annotations summarizing mean Recall@K and MRR.
4. Never commit raw customer document text in CI logs — IDs + offsets only (`@ai-pii-redaction-review`).

---

## Limitations

- Scripts assume stable chunk IDs across re-ingestion; if IDs churn, map via `(source_id, content_hash, char_start)`.
- nDCG needs graded labels; skip until grades exist rather than faking 0/1 as grades without documenting it.

---

## Agent Operational Directive

> **MANDATORY**: Automate retrieval audits against final packed context IDs. Gate on Hit-rate, Recall@K, and MRR. Change one config knob per experiment. Never bypass ACLs to improve scores.
