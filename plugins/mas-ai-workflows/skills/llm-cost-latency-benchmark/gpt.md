---
title: "LLM Cost & Latency Benchmark AI Skill Guide (GPT & Codex)"
description: "Operational skill for OpenAI GPT and Codex to instrument TTFT/TPOT, cache-aware usage costing, concurrency sweeps, goodput gates, and dated pricing manifests in CI."
category: "AI Workflows / Performance Economics"
tags: ["ttft", "tpot", "cost", "prompt-caching", "goodput", "gpt-codex", "benchmarking"]
---

# LLM Cost & Latency Benchmark AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a Principal Performance Automation Engineer: ship **streaming timers**, **usage parsers** (`cached_tokens`, `cache_write_tokens`, output/reasoning), **JSONL traces**, **percentile/goodput reports**, and **CI jobs** that fail when a “faster” change breaks the quality floor or exceeds cost SLOs.

```
┌─────────────────────────────────────────────────────────────┐
│  Load gen → stream (stamp s,f,e) → usage → cost(rates@date) │
│  → join quality labels → summarize percentiles + $/accepted │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Time **client-observed** first nonempty token (not first empty SSE ping).
2. Parse Responses/Chat usage details for cache read/write; never assume 0.
3. Pull pricing at run start into `pricing_manifest.json`; refuse cost claims without it.
4. Sweep concurrency; emit separate cold vs warm cache suites.
5. Gate: `quality_pass_rate ≥ floor` AND (`ttft_p95 ≤ slo` OR documented Pareto tradeoff).
6. Count retries/failures in `$` and latency distributions.

---

## Production: streaming TTFT capture (sketch)

```python
"""Stamp client TTFT/E2E on an OpenAI-style stream; attach final usage."""
import time
from typing import Any, Iterator


def iter_with_latency(stream: Iterator[Any]) -> dict[str, Any]:
    s = time.perf_counter()
    f = None
    text_parts: list[str] = []
    usage = None
    for event in stream:
        # Provider-specific: detect first delta with content
        chunk_text = getattr(event, "content", None) or ""
        if chunk_text and f is None:
            f = time.perf_counter()
        if chunk_text:
            text_parts.append(chunk_text)
        if getattr(event, "usage", None):
            usage = event.usage
    e = time.perf_counter()
    return {
        "ttft_ms": None if f is None else (f - s) * 1000,
        "e2e_ms": (e - s) * 1000,
        "usage": usage,  # map to input/cached_read/cache_write/output
        "text": "".join(text_parts),
    }
```

Map `usage` fields explicitly per API (Chat Completions `prompt_tokens_details` vs Responses `input_tokens_details`). Enable stream usage inclusion flags required by the SDK version under test.

### CI matrix job ideas

- `bench-cold-c1`, `bench-warm-c1`, `bench-warm-c16`
- Artifact: `attempts.jsonl` + `summary.json` + `pricing_manifest.json`
- Fail if `cost_unknown_rows > 0` when the job claims a $ delta
- Fail if quality floor regresses vs baseline artifact

---

## Technical Troubleshooting Matrix

| Automation bug | Fix |
| :--- | :--- |
| TTFT=0 | Measuring wrong event; wait for nonempty token |
| Cost too low | Ignoring cache_write or tool fees |
| Unstable p99 | N too small; extend run or stop claiming p99 |
| Warm pollutes cold | Unique prefixes / cache bypass between cold trials |

---

## Best Practices

1. Store raw attempts forever (sanitized); recompute percentiles when definitions change.
2. Add `system_fingerprint` / model version to rows when APIs expose them.
3. For reasoning models, log `max_output_tokens` and whether TTFT is answer-visible.
4. Pair every cost PR with `@prompt-regression-gate` results on the same commit.

---

## Agent Operational Directive

> **MANDATORY**: Automate named TTFT/TPOT, cache-aware costing with dated rates, and quality-gated summaries. Separate cold/warm and concurrency cells. Never publish $/claims with unknown usage rows.
