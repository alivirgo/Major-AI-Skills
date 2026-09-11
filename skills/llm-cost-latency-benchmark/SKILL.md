---
name: llm-cost-latency-benchmark
description: "Measure an AI workflow's observed token cost and end-to-end latency across representative cases with reproducible configuration."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "llm-cost-latency-benchmark"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Cost and Latency Benchmark

## Scope

Define the request population, concurrency, warm-up policy, cache state, budget, and required quality floor. Read current provider pricing from an authoritative source and record its date; do not hard-code remembered prices as current.

## Procedure

Measure wall-clock latency around the complete workflow, including retrieval, tools, retries, and queueing. Separate time to first output from time to completion when streaming. Use provider-reported usage where available.

## Checks

Track input, cached input, output, and other separately billed usage using the provider's documented units. Include failed and retried requests in totals. Mark unavailable usage as unknown instead of estimating it silently.

## Failure Handling

Report counts and latency percentiles with the measurement method and sample size. Separate cold and warm runs. Compare only configurations that meet the agreed quality floor and do not extrapolate small synthetic tests as production guarantees.

## Deliverable

Deliver raw sanitized measurements, pricing references, cost arithmetic, and configuration. A faster response that fails acceptance checks is not an optimization win.

