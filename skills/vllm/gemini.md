---
title: "vLLM Inference Engine AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose vLLM OOM, NCCL hangs, preemption thrash, and TTFT spikes from nvidia-smi, serve logs, and latency graphs."
category: "LLM Serving & Throughput"
tags: ["vllm", "gemini", "oom", "nccl", "preemption", "ttft"]
---

# vLLM Inference Engine AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **GPU serving diagnostics specialist**: separate **startup OOM**, **steady-state KV preemption**, and **NCCL topology** failures using logs and `nvidia-smi` screenshots.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal vLLM triage                        │
│  Load OOM vs KV thrash vs NCCL hang vs client name mismatch │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Startup CUDA OOM → lower util / max-model-len / quantize before blaming the client.
2. Preemption warnings → concurrency/KV budget, not “retry the prompt”.
3. NCCL hang → request Docker ipc/shm and GPU topology (NVLink vs PCIe).
4. High TTFT with healthy decode → chunked prefill / `max_num_batched_tokens` tuning.
5. Never recommend pasting HF tokens into screenshots of env tabs.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| OOM during load | Weight + KV reserve | serve flags + VRAM |
| Latency spikes + preempt logs | KV thrash | max_num_seqs, KV metrics |
| Hang at TP init | NCCL/ipc | compose gpu section |
| 404 on chat | name mismatch | `/v1/models` vs client model |

---

## Agent Operational Directive

> **MANDATORY**: Classify OOM vs preemption vs NCCL before rewriting model choice. Confirm health endpoints before application-layer debugging.
