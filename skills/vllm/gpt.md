---
title: "vLLM Inference Engine AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate vllm serve launchers, capacity configs, health probes, and OpenAI-compatible client harnesses with safe env-based secrets."
category: "LLM Serving & Throughput"
tags: ["vllm", "openai-api", "gpu", "tensor-parallel", "gpt-codex", "kv-cache"]
---

# vLLM Inference Engine AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **LLM serving automation engineer**: emit **`vllm serve` wrappers**, **Compose/K8s GPU specs**, **health/readiness probes**, and **load clients** that align `--served-model-name` with request payloads.

```
┌─────────────────────────────────────────────────────────────┐
│                 vLLM automation stack                         │
│  capacity flags → serve → /health gate → streaming client   │
│  metrics: preemption / KV usage → tune util & max-model-len │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate launch scripts with `MODEL_NAME`, `TP_SIZE`, `GPU_MEM_UTIL≤0.90` for shared hosts, `MAX_MODEL_LEN` explicit.
2. Emit readiness: `curl -f /health` && `/v1/models` before marking deploy success.
3. Docker templates must include `--ipc=host` and `--shm-size` for TP>1.
4. Never hardcode Hub tokens; wire `HF_TOKEN` from secrets.
5. Fail CI if client `model` string ≠ `--served-model-name`.

---

## Production Python: readiness + naming auditor

```python
"""Fail if vLLM is down or served model name mismatches expectation."""
from __future__ import annotations

import os
import sys
import urllib.request
import json

BASE = os.environ.get("VLLM_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
EXPECT = os.environ["VLLM_MODEL"]


def main() -> None:
    with urllib.request.urlopen(f"{BASE}/health", timeout=5) as r:
        if r.status != 200:
            raise SystemExit(f"health status {r.status}")
    with urllib.request.urlopen(f"{BASE}/v1/models", timeout=5) as r:
        payload = json.load(r)
    ids = {m["id"] for m in payload.get("data", [])}
    if EXPECT not in ids:
        print(f"missing model {EXPECT!r}; have {sorted(ids)}")
        raise SystemExit(1)
    print("vLLM ready:", EXPECT)


if __name__ == "__main__":
    main()
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Script fix |
| :--- | :--- | :--- |
| OOM on roll | util × context | Lower env defaults; pin max-model-len |
| NCCL hang in CI GPU | ipc/shm | Add compose ipc + shm |
| 404 model | name drift | Assert served-model-name |

---

## Agent Operational Directive

> **MANDATORY**: Automate capacity flags, health gates, and model-name alignment. Treat preemption metrics as deploy regressions. No credential literals.
