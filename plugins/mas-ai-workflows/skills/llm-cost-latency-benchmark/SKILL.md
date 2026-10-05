---
name: llm-cost-latency-benchmark
description: "Benchmark AI workflow cost and latency with TTFT/TPOT/ITL/e2e percentiles, cache-aware token billing, goodput under SLOs, and a quality floor. Use before claiming a model, prompt, or infra change is cheaper or faster."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "latency", "ttft", "tpot", "cost", "tokens", "goodput", "prompt-caching", "slo"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# LLM Cost & Latency Benchmark AI Skill Guide (Claude)

## Overview & Engine Architecture

Cost and latency are **not one number**. A claim is a tuple: *workload × clock boundary × cache state × concurrency/arrival process × token mix × pricing snapshot × quality floor*. Mixing those variables produces vendor-slide fiction. A response that is faster but fails acceptance is **not** an optimization win—it is a different product.

Claude operates as a Principal LLM Performance Economist, specializing in **client-observed TTFT vs server TTFT**, **TPOT vs ITL**, **cache-cold vs cache-hot regimes**, **billable token categories** (uncached input, cache read, cache write, output including reasoning), **workflow wall-clock** (retrieval + tools + retries + queue), **percentile reporting**, and **SLO-qualified goodput**.

```
┌─────────────────────────────────────────────────────────────┐
│              Cost × Latency Benchmark Stack                 │
│                                                             │
│  Workload contract                                          │
│  ├── Case population (prod-shaped) + quality floor          │
│  ├── Input/output length distributions (or fixed I/O)       │
│  ├── Concurrency + arrival process (closed vs open loop)    │
│  └── Cache policy: cold | warm | production-mix             │
│                                                             │
│  Timing planes (never conflate)                             │
│  ├── Client TTFT: send → first nonempty streamed token      │
│  ├── Prefill / queue / network (diagnostic breakdown)       │
│  ├── TPOT / ITL after first token                           │
│  └── Workflow e2e: user intent → final accepted artifact    │
│                                                             │
│  Cost planes                                                │
│  ├── Provider usage: input, cached_read, cache_write, out   │
│  ├── Non-token: tools, search, containers, retries, fails   │
│  └── Pricing manifest: URL + retrieved_at + model tier      │
│                                                             │
│  Decision                                                   │
│  ├── Percentiles + sample size + goodput@SLO                │
│  └── Compare only configs that meet the quality floor       │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Choosing models, regions, streaming settings, prompt-cache layouts, or concurrency limits.
- Proving a “cheaper/faster” PR for prompts, packers, rerankers, or serving stacks.
- Setting SLOs (interactive chat, voice, batch) and capacity planning.
- Debugging why p50 looks fine but p99 destroys UX (queueing, cold start, long prefill).

**Do not use when**

- Quality is undefined—run `@prompt-regression-gate` / `@ai-evaluation-dataset` first and set a **quality floor**.
- Someone wants a single TPS headline without workload/cache/concurrency disclosure.
- Extrapolating 10 synthetic short prompts to production guarantees.
- Hard-coding remembered $/MTok as “current” without a dated pricing source.

---

## Deep metric dictionary (formulas you must name)

Let request `i` be sent at client time `s_i`, first **nonempty usable** streamed token arrive at `f_i`, last token at `e_i`. Let `O_i` = provider-reported **output/completion tokens** (includes reasoning/formatting tokens when billed that way). Let `I_i` = total input/prompt tokens.

| Metric | Formula / definition | Notes that break comparisons |
| :--- | :--- | :--- |
| **Client TTFT** | `f_i − s_i` | Includes network + queue + prefill. State client region. |
| **Server TTFT** | receipt → first token **sent** | Different clock; do not swap with client TTFT. |
| **E2E request latency** | `e_i − s_i` | Model-call only unless labeled **workflow e2e**. |
| **TPOT** | `(e_i − f_i) / (O_i − 1)` | Undefined if `O_i < 2`. Excludes first token by convention (NVIDIA/vLLM-style). |
| **ITL** | gaps `t_{j+1}−t_j` | Distribution over intervals; p95 of all gaps ≠ mean of per-request TPOT. |
| **Decode TPS (per user)** | `(O_i − 1) / (e_i − f_i)` = `1/TPOT` | Not full-request rate. |
| **Full-request TPS** | `O_i / (e_i − s_i)` | Includes TTFT; lower; different claim. |
| **Aggregate TPS** | `sum(O) / T_run` | Fleet/GPU scope must be named. |
| **Goodput** | compliant completions / second **or** fraction meeting SLO | Name SLO (e.g. TTFT p99≤X ∧ TPOT p99≤Y); count errors as noncompliant. |

**First-token identity (reasoning models):** declare whether `f_i` is (a) first SSE/data chunk, (b) first reasoning token, or (c) first **visible answer** token. Voice/chat UX usually cares about (c). Chunk ≠ token (common harness bug called out on r/LocalLLaMA tooling).

**OpenTelemetry alignment (when instrumenting):** prefer `gen_ai.client.operation.time_to_first_chunk` / `gen_ai.usage.input_tokens` / `output_tokens`, and cache detail attributes when available. Report **billed** units when providers distinguish billed vs consumed.

---

## Cost accounting (think in billable categories)

### Token classes (do not collapse)

Providers increasingly price **separately**:

1. **Uncached input** — ordinary prompt tokens  
2. **Cache read (`cached_tokens`)** — discounted reuse of a prefix  
3. **Cache write (`cache_write_tokens`)** — may be **>1×** uncached input on some model families (e.g. OpenAI docs: writes at 1.25×, reads at 0.1× on newer families—**verify live pricing**)  
4. **Output / completion** — includes **reasoning tokens** and often invisible formatting/tool-channel tokens; billed as output even when not shown to the user  

**Arithmetic sketch** (replace rates from a dated pricing pull):

```text
cost ≈
  u_in  * rate_uncached_in
+ c_read * rate_cached_in
+ c_write * rate_cache_write
+ out   * rate_out
+ Σ tool_calls * tool_rate
+ Σ non_token_fees
```

Rules:

- Prefer **provider `usage`** over local `len/4` guesses (tools, images, schemas break heuristics).  
- If usage is missing → mark **`unknown`**, never invent.  
- **Include failed and retried attempts** in cost totals (they still billed or partially billed).  
- Stream with `stream_options.include_usage` (or provider equivalent) so finals are recorded.  
- Reasoning: budget `max_output_tokens` for hidden tokens + visible answer; otherwise empty completions skew latency/cost.

### Pricing manifest (mandatory artifact)

```json
{
  "retrieved_at": "2026-10-05T18:00:00Z",
  "source_url": "https://…/pricing",
  "model": "…",
  "currency": "USD",
  "rates_per_1m": {
    "input_uncached": null,
    "input_cached_read": null,
    "input_cache_write": null,
    "output": null
  },
  "notes": "Paste exact rows; do not rely on memory."
}
```

### Unit economics to report

| KPI | Definition |
| :--- | :--- |
| **$/accepted task** | Total $ for all attempts / tasks that passed quality floor |
| **$/1k input tokens (effective)** | Blended after cache hit mix |
| **Cache hit rate** | `cached_read / input` (verify via usage fields, not hope) |
| **Retry tax** | $ and latency of retries / successes |
| **Cost at iso-quality** | Only among configs meeting the floor |

Cheapest raw tokens with 2× retries and quality fails is usually **more expensive per accepted task**.

---

## Workload contract (comparability gate)

Before trusting any A vs B claim, both sides must match—or differences must be labeled as the **intentional** experimental factor:

1. **Model + snapshot/version** + tokenizer  
2. **Prompt/tool schema hashes**  
3. **Input/output length policy** (fixed I/O vs production distribution)  
4. **Streaming on/off** (TTFT/ITL meaningless without streaming)  
5. **Cache regime**: cold (force unique prefixes) vs warm (stable system prefix) vs measured mix  
6. **Concurrency + arrival**: closed-loop (send next after done) ≠ open-loop/Poisson ≠ “fire all at t=0”  
7. **Client vantage** (region/network)  
8. **Warm-up policy** (discard N cold starts; separate serverless cold-start study)  
9. **Quality floor** + same eval dataset hash  
10. **Pricing date** for cost claims  

If any required field is missing → verdict **cannot-normalize**, not “approximately faster.”

### Cache is a different experiment

Prefix/KV caching can dominate TTFT. Practitioners repeatedly show:

- Accidental cache hits from reused prompts make TTFT look unrealistically low.  
- Calculated prefill savings ≠ measured TTFT (network/queue floor remains).  
- Production agents with growing tool histories live in **prefill-bound** regimes; chat short-prompt TPS rankings mislead.

**Always report cold and warm separately**, with measured `cached_tokens` / hit rate.

### Concurrency and tails

- p50 TTFT at concurrency=1 ≈ network + single prefill—**almost useless** for capacity.  
- Test near expected **p95 concurrent** load.  
- Under load, TTFT is often **queue wait**; log queue separately when the server exposes it.  
- For interactive/voice, **p95/p99** matter more than mean; hedging (dual endpoint race) is an architectural response to tail risk, not a benchmark cheat—cost it explicitly (~2× input on hedged fraction).

**Sample size honesty (IETF-style guidance):** p99 needs large N (order ~10³ samples for rough relative accuracy); tiny benches must not claim p99 production SLOs.

---

## Workflow vs model-call latency

For product decisions, measure **workflow wall-clock**:

```text
user_submit → retrieve/tools/guards → model (TTFT…E2E) → validate/repair → accept
```

Attribute spans:

| Span | Typical owners |
| :--- | :--- |
| Retrieval / rerank | `@rag-retrieval-audit` |
| Tool round-trips | agent graph |
| Validation retries | `@llm-json-contract-check` |
| Model TTFT/TPOT | provider/serving |
| Human-perceived | UX (streaming indicators reset abandonment clocks) |

Optimizing only decode TPS while RAG prefill and tools dominate e2e is cargo-cult performance work.

---

## Procedure

### 1. Preflight

- Define population (prod log sample vs synthetic fixed I/O).  
- Set quality floor (pass rate / P0 gate).  
- Set SLOs (e.g. client TTFT p95 ≤ 800ms; TPOT p95 ≤ 40ms; or batch: maximize $/tok within overnight window).  
- Budget ($) and max duration.  
- Fetch **live** pricing → pricing manifest.  
- Choose cache regime(s) and concurrency sweep plan.

### 2. Instrument each attempt

Record per request (sanitized):

```json
{
  "case_id": "c-17",
  "attempt": 1,
  "ok_quality": true,
  "error_type": null,
  "s_client": 0.0,
  "f_first_usable_token": 0.42,
  "e_last_token": 1.88,
  "ttft_ms": 420,
  "tpot_ms": 28.5,
  "usage": {
    "input": 3500,
    "cached_read": 3200,
    "cache_write": 0,
    "output": 180,
    "reasoning_output_subset": 40
  },
  "cost_usd": null,
  "cache_regime": "warm",
  "concurrency_bin": 16,
  "model": "…",
  "pricing_retrieved_at": "…"
}
```

### 3. Analyze

- Percentiles p50/p95/p99 for TTFT, TPOT, workflow e2e—**by cache regime and concurrency**.  
- Cost totals and **$/accepted**.  
- Goodput @ declared SLO.  
- Error/retry rates.  
- Reject cross-regime averages that hide cold starts.

### 4. Decide

Only compare configs that clear the quality floor. Prefer:

1. Higher goodput at equal or lower $/accepted, or  
2. Lower latency percentiles **without** quality loss, or  
3. Explicit Pareto: “+12% cost for −40% p99 TTFT” with product sign-off.

Deliver raw measurements + config + pricing refs + arithmetic. Label extrapolation limits.

---

## Production example: percentile + cost rollup

```python
"""Cost/latency rollup with TTFT, TPOT, and dated pricing."""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence


def percentile(sorted_vals: Sequence[float], p: float) -> float:
    """Nearest-rank percentile; p in [0, 100]. Empty → nan."""
    if not sorted_vals:
        return float("nan")
    if p <= 0:
        return sorted_vals[0]
    if p >= 100:
        return sorted_vals[-1]
    k = max(1, int(math.ceil(p / 100.0 * len(sorted_vals))))
    return sorted_vals[k - 1]


@dataclass(frozen=True)
class Rates:
    """USD per 1M tokens. None means unknown—do not invent."""
    input_uncached: float | None
    input_cached_read: float | None
    input_cache_write: float | None
    output: float | None


def cost_usd(usage: dict[str, int], rates: Rates) -> float | None:
    need = {
        "input_uncached": rates.input_uncached,
        "input_cached_read": rates.input_cached_read,
        "input_cache_write": rates.input_cache_write,
        "output": rates.output,
    }
    if any(v is None for v in need.values()):
        return None
    inp = usage.get("input", 0)
    cread = usage.get("cached_read", 0)
    cwrite = usage.get("cache_write", 0)
    # Uncached portion = input - cached_read - cache_write (clamp at 0)
    u = max(0, inp - cread - cwrite)
    out = usage.get("output", 0)
    return (
        u * rates.input_uncached
        + cread * rates.input_cached_read
        + cwrite * rates.input_cache_write
        + out * rates.output
    ) / 1_000_000.0


def tpot_ms(ttft_ms: float, e2e_ms: float, output_tokens: int) -> float:
    if output_tokens < 2:
        return float("nan")
    return (e2e_ms - ttft_ms) / (output_tokens - 1)


def summarize(rows: list[dict[str, Any]], rates: Rates, slo_ttft_ms: float) -> dict[str, Any]:
    ttfts = sorted(r["ttft_ms"] for r in rows if r.get("ttft_ms") is not None)
    tpots = sorted(
        tpot_ms(r["ttft_ms"], r["e2e_ms"], r["usage"]["output"])
        for r in rows
        if r.get("ttft_ms") is not None and r.get("e2e_ms") is not None
    )
    tpots = [x for x in tpots if x == x]

    costs = []
    unknown_cost = 0
    for r in rows:
        c = cost_usd(r["usage"], rates)
        if c is None:
            unknown_cost += 1
        else:
            costs.append(c)

    accepted = [r for r in rows if r.get("ok_quality")]
    good = [r for r in accepted if r["ttft_ms"] <= slo_ttft_ms]

    return {
        "n": len(rows),
        "ttft_p50": percentile(ttfts, 50),
        "ttft_p95": percentile(ttfts, 95),
        "ttft_p99": percentile(ttfts, 99),
        "tpot_p50": percentile(tpots, 50),
        "tpot_p95": percentile(tpots, 95),
        "cost_total_usd": sum(costs) if costs else None,
        "cost_unknown_rows": unknown_cost,
        "cost_per_accepted_usd": (sum(costs) / len(accepted)) if costs and accepted else None,
        "goodput_fraction_ttft_slo": (len(good) / len(rows)) if rows else float("nan"),
        "quality_pass_rate": (len(accepted) / len(rows)) if rows else float("nan"),
    }


# Load JSONL attempts, attach pricing from manifest, print summarize().
```

### Minimal experiment matrix (start here)

| Cell | Purpose |
| :--- | :--- |
| Fixed 0.5k/0.5k I/O, c=1, cache-cold | Pure model responsiveness |
| Same, cache-warm | Prefix-cache benefit |
| Prod-length distribution, c≈p95 load | Capacity reality |
| Full workflow e2e | Product truth |
| + quality floor filter | Economic truth |

---

## Technical troubleshooting matrix

| Signature | Deep cause | What to do |
| :--- | :--- | :--- |
| Amazing TTFT in bench, bad in prod | Accidental prefix cache / short prompts | Force unique prefixes; match prod lengths; report hit rate |
| p50 fine, p99 awful | Queueing, throttling, noisy neighbors | Correlate spikes with RPS vs wall clock; raise replicas or shed load; consider hedge |
| High TPS, unhappy users | Optimizing aggregate decode, ignoring TTFT SLO | Track goodput; plot latency vs offered load |
| “Cheaper model” costs more | More output/reasoning/retries | Optimize **$/accepted** and output tokens, not $/MTok sticker |
| Empty/fast failures | Reasoning burned `max_tokens` | Raise output budget; classify as errors not wins |
| Serverless look slow | Cold start (pull/CUDA/weights) | Separate cold-start study; warm pool for interactive |
| TTFT ≈ queue | Saturation | Capacity problem, not “slow model” |
| Cross-provider bakeoff chaos | Different clocks/tokenizers/cache | Comparability gate; cannot-normalize if mismatched |
| Client harness overhead | Sync client dominating | Async load gen; note NVIDIA warnings on client overhead |
| Cost unknown | Streaming without usage | Enable usage on stream; else mark unknown |

---

## Best practices

1. **Quality floor first**—then latency—then cost among survivors.  
2. Report **percentiles**, never mean-only for SLOs.  
3. Separate **cold/warm** cache and **model-only vs workflow** e2e.  
4. Pin and date **pricing**; re-pull when claiming savings.  
5. Include **retries, failures, tool fees** in cost.  
6. Name every TPS/TTFT definition in the report title.  
7. For p99 SLOs, collect enough samples or refuse the claim.  
8. Align product class: interactive (TTFT/ITL), RAG/agents (prefill + tools), batch (throughput/$).  
9. Prefer provider usage + OTel GenAI attributes for long-term dashboards.  
10. When changing prompts for cache locality, re-run `@prompt-regression-gate`—cache wins that break quality are not wins.

---

## Limitations

- Third-party latency leaderboards rarely match your prompt length, tools, and cache mix.  
- This skill does not replace provider SLAs or capacity postmortems.  
- Tokenization differs across models—iso-character prompts are not iso-token.  
- Stop and ask if quality floor, workload shape, or pricing source is missing.

---

## Related skills

- `@prompt-regression-gate` — quality floor / paired go-no-go  
- `@ai-evaluation-dataset` — representative case population  
- `@rag-retrieval-audit` — retrieval latency vs generation  
- `@llm-json-contract-check` — repair retries inflate cost/latency  
- `@llm-cost-latency-benchmark` — this skill  
- `@vllm` / provider skills — serving knobs (batching, prefix cache)

---

## Agent Operational Directive

> **MANDATORY**: Treat every cost/latency claim as a workload+clock+cache+concurrency+pricing+quality tuple. Measure client TTFT and TPOT/ITL with named formulas. Bill all token classes and failures honestly; date the pricing source. Never call a quality regression an optimization. Prefer goodput and $/accepted over vanity TPS. If comparability fields are missing, say **cannot-normalize**.

---

## Source anchors (research)

- Anyscale / vLLM metric definitions (TTFT, TPOT, ITL, goodput)  
- NVIDIA / Artificial Analysis / GPUSmith: clock boundaries, TPS ambiguity, cache disclosure  
- OpenAI: prompt caching billable categories; reasoning tokens billed as output; dated pricing page  
- OpenTelemetry GenAI: `time_to_first_chunk`, token usage (+ cache attributes), billed vs consumed  
- IETF draft LLM benchmarking methodology: percentiles, sample sizes, SLO capacity search  
- r/LLMDevs & r/LocalLLaMA: p99 tails, hedging, prefill-bound agents, cold starts, false TTFT from first chunk / cache reuse
