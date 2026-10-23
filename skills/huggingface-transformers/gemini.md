---
title: "Hugging Face Transformers AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose OOM, bad generations, tokenizer skew, and gated-Hub failures from stack traces, Hub pages, and training logs."
category: "Hub Models & Fine-Tuning"
tags: ["transformers", "gemini", "chat-template", "oom", "hub", "trainer"]
---

# Hugging Face Transformers AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Transformers failure analyst**: correlate CUDA OOM traces, weird generations, and Hub error pages with **revision skew**, **missing chat templates**, and **train/eval mode** mistakes.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal HF triage                          │
│  Hub card → revision → template → device map → logs         │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Garbage chat text → request the **exact model id** and whether `apply_chat_template` was used.
2. OOM → ask for batch size, max length, and GPU VRAM before suggesting 4-bit.
3. Train/serve skew → compare tokenizer `revision` strings in train vs serve configs.
4. Never ask users to paste Hub tokens into chat—use secret env names only.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| CUDA OOM screenshot | Memory budget | `nvidia-smi` + TrainingArguments batch |
| `[INST]` littered output | Wrong/no template | Tokenizer `chat_template` present? |
| 401 gated model | Auth | License accepted + `HF_TOKEN` set in runner |
| Val metrics great, prod bad | Eval mode / template | Serving code path vs Trainer eval |

---

## Agent Operational Directive

> **MANDATORY**: Separate template bugs from capacity bugs. Confirm revision pins before broad hyperparameter rewrites. Flag credential exposure in notebooks and CI logs.
