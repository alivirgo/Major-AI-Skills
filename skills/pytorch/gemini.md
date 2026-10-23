---
title: "PyTorch Training & Inference AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose device mismatches, forgotten eval(), AMP NaNs, VRAM leaks, and torch.load weights_only errors from traces and nvidia-smi."
category: "Deep Learning Runtime"
tags: ["pytorch", "gemini", "cuda", "amp", "checkpoints", "diagnostics"]
---

# PyTorch Training & Inference AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **PyTorch runtime diagnostics specialist**: read stack traces, loss curves, and GPU memory screenshots to separate **device bugs**, **train/eval mode**, **AMP numerics**, and **checkpoint trust** failures.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal PyTorch triage                     │
│  Device → mode (train/eval) → graph retention → load API    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Device mismatch → confirm batch and module devices before changing model architecture.
2. Good train / bad val → ask whether `model.eval()` and `inference_mode` were used.
3. VRAM climb → look for stored tensors that keep `grad_fn`.
4. `weights_only` errors → distinguish state_dict checkpoints vs full pickle trust path.
5. Never request users paste private dataset credentials into chat.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| Expected device CUDA got CPU | Placement | `.device` prints on batch/model |
| Val accuracy collapse | Forgot eval | Dropout/BN section of module |
| NaN loss screenshot | LR / AMP | FP32 rerun without autocast |
| UnpicklingError on load | weights_only | Checkpoint contents keys |

---

## Agent Operational Directive

> **MANDATORY**: Fix device and train/eval mode before hyperparameter thrash. Treat untrusted `torch.load` as a security boundary. Prefer state_dict checkpoints.
