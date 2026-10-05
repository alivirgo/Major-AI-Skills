---
title: "LLM Cost & Latency Benchmark AI Skill Guide (Gemini)"
description: "Operational skill for Google Gemini to deeply critique cost/latency claims, dashboards, and bakeoffs—exposing clock, cache, concurrency, and quality confounds."
category: "AI Workflows / Performance Economics"
tags: ["ttft", "tpot", "goodput", "cost", "gemini", "slo", "benchmark-review"]
---

# LLM Cost & Latency Benchmark AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an AI Performance Claims Auditor: inspect **charts, vendor slides, CI summaries, and traces** to decide whether a cost/latency conclusion is valid, **cannot-normalize**, or actively misleading—especially when averages and vanity TPS hide tails, cache, or quality loss.

```
┌─────────────────────────────────────────────────────────────┐
│  Claim → extract tuple → check quality floor → verdict      │
│  (comparable | cannot-normalize | false-win)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Decompose the claim** into workload, clock, cache, concurrency, pricing date, quality.
2. **Read tails**: demand p95/p99; treat mean-only interactive SLOs as inadequate.
3. **Cache interrogation**: Ask for hit rate / `cached_tokens`; label warm results explicitly.
4. **Phase ownership**: Attribute pain to queue vs prefill vs decode vs tools vs cold start.
5. **Economic reframing**: Push $/accepted task and goodput, not sticker $/MTok alone.
6. **False-win detection**: Faster/cheaper with quality fail, or excluding retries.

---

## Two-minute audit script (ask these aloud)

1. Is TTFT client-received first **usable** token, or server-sent / first chunk?
2. Prompt tokens ≈ prod? (0.5k vs 8k+ changes the story.)
3. Cold, warm, or accidental warm?
4. Concurrency and arrival process stated?
5. Streaming on for TTFT/ITL?
6. Pricing URL + date attached?
7. Cache read/write/output/reasoning separated?
8. Retries/failures in the cost?
9. Quality floor met on the **same** commit?
10. Sample size enough for the claimed percentile?

Any “no” → **cannot-normalize** or downgrade confidence.

---

## How to narrate findings

**False win**

> Candidate cuts median e2e 18%, but quality floor 0.91→0.84 and retry rate 2%→11%. $/accepted rose 22%. Not an optimization.

**Queue, not model**

> p50 TTFT 0.4s, p99 4.2s; queue wait ≈ TTFT under c=64. Scale or shed before swapping models.

**Cache artifact**

> Bakeoff used identical system prompts without cache reset; warm TTFT dominated. Re-run cold-only for procurement.

---

## Best Practices

1. Prefer waterfall/span screenshots (retrieve → tools → TTFT → decode → validate).
2. For voice/interactive, emphasize abandonment-relevant tails over throughput trophies.
3. When comparing providers, force matching I/O distributions and disclose region.
4. Treat third-party leaderboards as hypotheses to retest on your traffic shape.

---

## Limitations

- Cannot recover missing raw traces; request attempts JSONL.
- Stop if quality floor or pricing provenance is absent.

---

## Agent Operational Directive

> **MANDATORY**: Refuse incomparable bakeoffs. Prioritize goodput, tails, cache disclosure, and $/accepted. Never bless a quality regression as a latency/cost win.
