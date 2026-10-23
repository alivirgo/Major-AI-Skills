---
name: vllm
description: "Deploy and tune vLLM OpenAI-compatible servers: PagedAttention KV budgeting, continuous batching, chunked prefill, tensor parallel, quantization, and preemption/OOM failure modes."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["vllm", "llm-inference", "paged-attention", "continuous-batching", "tensor-parallel", "openai-api", "kv-cache"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# vLLM High-Throughput Inference Engine AI Skill Guide (Claude)

## Overview & Engine Architecture

vLLM is an open-source **high-throughput LLM serving engine**. **PagedAttention** stores KV cache in non-contiguous blocks (OS-page analogy), cutting fragmentation. **Continuous batching** schedules at iteration granularity; **chunked prefill** (default on V1 when possible) interleaves long prefills with decode so TTFT spikes do not starve live streams. Agents size **GPU memory utilization vs max model length vs concurrency**, expose the **OpenAI-compatible** HTTP API, and treat preemption warnings as capacity signals—not noise.

```
┌─────────────────────────────────────────────────────────────┐
│                    vLLM engine topology                       │
│                                                             │
│  Ingress: OpenAI-compatible HTTP                            │
│  ├── /v1/chat/completions | /v1/completions | /v1/models    │
│  ├── /health  (+ metrics / Prometheus in prod)              │
│  └── SSE token streaming                                    │
│                                                             │
│  Scheduler + PagedAttention                                 │
│  ├── Continuous batching (preempt / recompute when KV full) │
│  ├── Block table: logical tokens → physical KV blocks       │
│  └── Chunked prefill + max_num_batched_tokens budget        │
│                                                             │
│  Workers                                                    │
│  ├── Tensor parallel (NCCL) / optional pipeline parallel    │
│  ├── Quantization: awq | gptq | fp8 | bitsandbytes          │
│  └── FlashAttention / FlashInfer kernels                    │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Serving one or few dense LLMs with high concurrency on NVIDIA (or supported) GPUs.
- Drop-in OpenAI API compatibility for apps already on `@openai-api` clients.
- Need continuous batching + KV paging beyond naïve `@huggingface-transformers` `generate`.

**Do not use when**

- No GPU / tiny CPU-only demos → Transformers pipeline or cloud API.
- Training or LoRA research loops → `@pytorch` / `@huggingface-transformers` Trainer.
- Multi-model routing, auth, and quotas are the product → put a gateway in front; vLLM is the engine, not the full platform.

---

## Operational Capabilities & Agent Directives

1. Prefer **`vllm serve <model>`** (current CLI) over ad-hoc imports for production processes.
2. Size **`--gpu-memory-utilization`** (default **0.92**) with headroom for CUDA graphs / NCCL; do **not** push ≥0.95 on multi-tenant boxes.
3. Cap **`--max-model-len`** to the product context you actually serve—unused context burns KV.
4. On multi-GPU: `--tensor-parallel-size N` with Docker `--ipc=host` and adequate `--shm-size`; debug hangs with `NCCL_DEBUG=INFO`.
5. Tune **`--max-num-batched-tokens`**: lower (~2048) favors ITL; higher (>8192) favors throughput/TTFT on small models / large GPUs. Chunked prefill is on by default in V1 when possible.
6. Treat **preemption** logs as KV pressure: raise util / TP, or lower `max_num_seqs` / context—not as a silent retry loop.
7. Health-gate traffic: `curl -f /health` and `/v1/models` before attaching load balancers.
8. Gated Hub weights: pass token via env (`HF_TOKEN`)—never commit credentials; local OpenAI clients may use a placeholder api_key only when the server does not auth.

---

## Production Example: serve + streaming client

`start_vllm.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

MODEL_NAME="${MODEL_NAME:-Qwen/Qwen2.5-7B-Instruct}"
SERVED_MODEL_NAME="${SERVED_MODEL_NAME:-qwen2.5-7b}"
PORT="${PORT:-8000}"
TP_SIZE="${TP_SIZE:-1}"
GPU_MEM_UTIL="${GPU_MEM_UTIL:-0.90}"
MAX_MODEL_LEN="${MAX_MODEL_LEN:-8192}"

nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader
export VLLM_LOGGING_LEVEL="${VLLM_LOGGING_LEVEL:-INFO}"

exec vllm serve "$MODEL_NAME" \
  --served-model-name "$SERVED_MODEL_NAME" \
  --host 0.0.0.0 \
  --port "$PORT" \
  --tensor-parallel-size "$TP_SIZE" \
  --gpu-memory-utilization "$GPU_MEM_UTIL" \
  --max-model-len "$MAX_MODEL_LEN" \
  --dtype auto
```

Streaming client:

```python
"""Async OpenAI-compatible client against a local vLLM server."""
from __future__ import annotations

import asyncio
import os

from openai import AsyncOpenAI


async def stream_chat(prompt: str) -> str:
    base = os.environ.get("VLLM_BASE_URL", "http://127.0.0.1:8000/v1")
    # Server without auth: placeholder key required by SDK shape only
    client = AsyncOpenAI(base_url=base, api_key=os.environ.get("VLLM_API_KEY", "EMPTY"))
    model = os.environ.get("VLLM_MODEL", "qwen2.5-7b")

    stream = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a concise assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=512,
        stream=True,
    )
    parts: list[str] = []
    async for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        print(delta, end="", flush=True)
        parts.append(delta)
    print()
    return "".join(parts)


if __name__ == "__main__":
    asyncio.run(stream_chat("Explain PagedAttention in three bullets."))
```

Recipes:

```bash
# FP8 / quantized path when weights support it
vllm serve Qwen/Qwen2.5-7B-Instruct --quantization fp8 --gpu-memory-utilization 0.85

# 4-GPU TP for larger instruct weights
vllm serve meta-llama/Llama-3.1-70B-Instruct --tensor-parallel-size 4 --max-model-len 16384

curl -f http://127.0.0.1:8000/health
curl -s http://127.0.0.1:8000/v1/models | head
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| CUDA OOM at load | Weights + KV reserve > util × VRAM | Lower `--gpu-memory-utilization`; shorten `--max-model-len`; quantize; increase TP |
| OOM / `ncclUnhandledCudaError` without `OutOfMemoryError` | NCCL buffers after KV pool filled | Lower blocks override / util; ensure NCCL init accounted; upgrade vLLM/NCCL |
| Preemption warnings / latency spikes | KV cache thrash under concurrency | Lower `max_num_seqs`; raise util/TP; confirm chunked prefill; watch KV metrics |
| High TTFT under load | Long prefills starving decode | Keep chunked prefill; tune `max_num_batched_tokens` |
| Multi-GPU hang / NCCL timeout | Missing IPC/shm or bad P2P topology | Docker `--ipc=host --shm-size=16g`; `NCCL_P2P_DISABLE=1` on broken PCIe; matching GPU SKUs |
| `max-model-len` ValueError | Requested len > model / rope limit | Align with model card; use documented rope-scaling only when supported |
| Hub 401 on gated model | Missing HF token | `HF_TOKEN` from secret store; accept license |
| Client 404 model name | `--served-model-name` ≠ client `model` | Align names in `/v1/models` |

---

## Best Practices

1. Log startup line for `# GPU blocks` — that is your KV budget.
2. Pin model revision / snapshot for reproducibility; record vLLM version in deploy manifests (`@docker` / `@kubernetes`).
3. Load-test with realistic prompt/decode lengths before raising concurrency SLOs.
4. Separate staging TP/util experiments from prod; change one capacity knob at a time.
5. Put auth, quotas, and TLS at the gateway—do not assume open `0.0.0.0` is safe.

---

## Limitations

- Engine quality tracks model + tokenizer chat template parity from training (`@huggingface-transformers`).
- Not a training framework; not a multi-model control plane.
- Hardware/driver/NCCL skew causes non-portable flags across fleets.
- Stop and ask if GPU SKU count, target context, or concurrency SLO are unspecified.

---

## Related Skills

- `@huggingface-transformers` — model export, chat templates, fine-tunes
- `@pytorch` — CUDA/AMP fundamentals and NCCL-adjacent debugging context
- `@openai-api` — client patterns against compatible servers
- `@docker` — GPU container flags (`ipc`, `shm-size`, device mounts)
- `@mlflow` — record serving config experiments / eval metrics

---

## Agent Operational Directive

> **MANDATORY**: Budget KV with `gpu-memory-utilization` and `max-model-len` before promising concurrency. Prefer `vllm serve`. Health-check before routing traffic. Treat preemption as capacity failure. Never embed Hub or API secrets in scripts—read from the environment. Keep served model name aligned with clients.

---

## Source anchors (research)

- [vLLM `serve` CLI / CacheConfig](https://docs.vllm.ai/en/stable/cli/serve/)
- [Optimization: preemption & chunked prefill](https://docs.vllm.ai/en/latest/configuration/optimization/)
- [Troubleshooting OOM / NCCL notes](https://docs.vllm.ai/en/latest/usage/troubleshooting/)
