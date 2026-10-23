---
title: "PyTorch Training & Inference AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate device-safe training loops, AMP (torch.amp) trainers, weights_only checkpoints, and smoke eval harnesses."
category: "Deep Learning Runtime"
tags: ["pytorch", "amp", "checkpoints", "gpt-codex", "cuda", "inference-mode"]
---

# PyTorch Training & Inference AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **training-loop automation engineer**: emit **device-correct loaders**, **AMP-ready steps**, **checkpoint save/restore**, and **CI smoke trains** (one-batch overfit) with `weights_only` loads.

```
┌─────────────────────────────────────────────────────────────┐
│                 PyTorch automation stack                      │
│  DataLoader → AMP train step → ckpt → eval harness          │
│  CI: one-batch overfit + weights_only load roundtrip        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generated loops always toggle `train()` / `eval()` and use `inference_mode` for eval.
2. Use `torch.amp.GradScaler("cuda")` + `autocast`—not deprecated `torch.cuda.amp` in new code.
3. Checkpoints save model/optimizer/scaler/epoch; load with `weights_only=True` for state_dict bundles.
4. Gate `torch.compile` behind a flag; document AMP backward autocast caveat.
5. Log hyperparams via `@mlflow` helpers when experiment tracking is in-repo.

---

## Production Python: checkpoint roundtrip smoke

```python
"""CI: train one step, save state_dicts, reload with weights_only=True."""
from __future__ import annotations

from pathlib import Path

import torch
import torch.nn as nn

device = torch.device("cpu")
model = nn.Linear(4, 2).to(device)
opt = torch.optim.SGD(model.parameters(), lr=0.1)
xb = torch.randn(8, 4)
yb = torch.randint(0, 2, (8,))

model.train()
opt.zero_grad(set_to_none=True)
loss = nn.functional.cross_entropy(model(xb), yb)
loss.backward()
opt.step()

path = Path("ckpt_smoke.pt")
torch.save({"model": model.state_dict(), "optimizer": opt.state_dict(), "epoch": 0}, path)
ckpt = torch.load(path, map_location=device, weights_only=True)
model.load_state_dict(ckpt["model"])
print("checkpoint roundtrip OK", ckpt["epoch"])
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Script fix |
| :--- | :--- | :--- |
| Device assert in CI | CPU-only runner | `map_location` + device env |
| `weights_only` fail | pickled module | Resave state_dicts only |
| NaN after AMP flag | unstable FP16 | Disable AMP in smoke; compare FP32 |

---

## Agent Operational Directive

> **MANDATORY**: Emit train/eval discipline, safe checkpoint I/O, and modern AMP APIs. Never load untrusted pickles with `weights_only=False` without an explicit trust note.
