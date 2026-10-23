---
name: pytorch
description: "Build reliable PyTorch training and inference loops: device placement, train/eval modes, AMP with torch.amp, safe torch.load (weights_only), checkpoints, and torch.compile caveats."
category: scientific
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["pytorch", "deep-learning", "amp", "checkpoints", "torch-compile", "autograd", "cuda"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# PyTorch Model Development AI Skill Guide (Claude)

## Overview & Engine Architecture

PyTorch provides **tensor compute + autograd**, `nn.Module` for models, and `DataLoader` for batches. A training step is forward → loss → backward → optimizer; inference uses **`eval()`** and **`torch.inference_mode()`**. Modern stacks use **`torch.amp`** for mixed precision and must handle **`torch.load(..., weights_only=True)`** defaults (PyTorch 2.6+). Agents keep device placement consistent, checkpoint reproducibly (model + optimizer + scaler), and never confuse train-time Dropout/BN with eval behavior.

```
┌─────────────────────────────────────────────────────────────┐
│                 PyTorch train / infer loop                    │
│                                                             │
│  Dataset → DataLoader → batch.to(device)                    │
│       │                                                     │
│       ▼                                                     │
│  nn.Module on device                                        │
│  ├── train(): Dropout/BN training behavior                  │
│  └── eval() + inference_mode(): serving / val               │
│                                                             │
│  AMP (optional): autocast + GradScaler("cuda")              │
│  Checkpoint: state_dict + optimizer + scaler + epoch        │
│  Optional: torch.compile (watch AMP backward semantics)     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Implementing or debugging custom training loops and modules.
- Moving tensors/models across CPU / CUDA / MPS with consistent placement.
- Saving/loading checkpoints for resume, export prep, or eval harnesses.

**Do not use when**

- The job is Hub pipeline / Trainer-first NLP → start with `@huggingface-transformers`.
- The job is high-QPS LLM HTTP serving → `@vllm` after weights exist.
- Tabular baselines without deep nets → `@scikit-learn`.

---

## Operational Capabilities & Agent Directives

1. **`model.train()`** for training; **`model.eval()`** for validation/inference—always.
2. Wrap inference in **`torch.inference_mode()`** (prefer over bare `no_grad` for speed/correctness intent).
3. Move **model and batch** to the same `device`; never leave labels on CPU by accident.
4. Checkpoint **`state_dict`s** (model, optimizer, scaler, epoch, RNG if needed)—not pickled full modules from untrusted sources.
5. **`torch.load`**: default `weights_only=True` since 2.6—use `weights_only=False` only for trusted full pickles; prefer pure state_dict checkpoints.
6. AMP: `torch.autocast` + `torch.amp.GradScaler("cuda")` (not deprecated `torch.cuda.amp.*` in new code). Stabilize FP32 first.
7. `optimizer.zero_grad(set_to_none=True)` unless a library requires otherwise.
8. Log hyperparams + git SHA + metrics via `@mlflow` when experiments matter.

---

## Production Example: AMP training step + safe checkpoint

```python
from __future__ import annotations

from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
use_amp = device.type == "cuda"

model = nn.Sequential(nn.Linear(128, 64), nn.ReLU(), nn.Linear(64, 10)).to(device)
opt = torch.optim.AdamW(model.parameters(), lr=3e-4)
criterion = nn.CrossEntropyLoss()
scaler = torch.amp.GradScaler("cuda", enabled=use_amp)


def train_one_epoch(loader: DataLoader) -> float:
    model.train()
    total = 0.0
    for xb, yb in loader:
        xb, yb = xb.to(device, non_blocking=True), yb.to(device, non_blocking=True)
        opt.zero_grad(set_to_none=True)
        with torch.autocast(device_type=device.type, dtype=torch.float16, enabled=use_amp):
            logits = model(xb)
            loss = criterion(logits, yb)
        scaler.scale(loss).backward()
        scaler.step(opt)
        scaler.update()
        total += float(loss.detach())
    return total / max(len(loader), 1)


@torch.inference_mode()
def evaluate(loader: DataLoader) -> float:
    model.eval()
    correct = total = 0
    for xb, yb in loader:
        xb, yb = xb.to(device), yb.to(device)
        pred = model(xb).argmax(dim=-1)
        correct += int((pred == yb).sum())
        total += yb.numel()
    return correct / max(total, 1)


def save_ckpt(path: Path, epoch: int) -> None:
    torch.save(
        {
            "epoch": epoch,
            "model": model.state_dict(),
            "optimizer": opt.state_dict(),
            "scaler": scaler.state_dict(),
        },
        path,
    )


def load_ckpt(path: Path) -> int:
    # state_dict-only payload → weights_only=True is appropriate
    ckpt = torch.load(path, map_location=device, weights_only=True)
    model.load_state_dict(ckpt["model"])
    opt.load_state_dict(ckpt["optimizer"])
    if "scaler" in ckpt:
        scaler.load_state_dict(ckpt["scaler"])
    return int(ckpt["epoch"])
```

Optional compile (after FP32/AMP baseline works):

```python
# If backward runs outside autocast (recommended AMP pattern), set:
# torch._functorch.config.backward_pass_autocast = "off"
# model = torch.compile(model)
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `Expected all tensors on same device` | Batch/model device skew | `.to(device)` both; watch `non_blocking` + pinned memory |
| Val/infer worse than train inexplicably | Forgot `eval()` | Disable Dropout/BN train behavior |
| Loss NaN / exploding | LR too high; bad inputs; FP16 overflow | Lower LR; check data; try BF16 or GradScaler path; verify AMP compatibility |
| VRAM grows each step | Holding graphs / storing tensors with grad | `detach`; don't append loss tensors to lists with graph; `inference_mode` on val |
| `weights_only` UnpicklingError | Full checkpoint needs pickle | Trusted source only → `weights_only=False`, or resave as state_dicts |
| AMP + `torch.compile` numeric weirdness | Autocast backward semantics | Set `backward_pass_autocast` per AMP+compile docs; compile after stable baseline |
| Non-deterministic eval | GPU algos / unordered reductions | Seeds help but not guarantee; document nondeterminism |
| Resume diverges | Missing optimizer/scaler state | Restore full training checkpoint bundle |

---

## Best Practices

1. Overfit one batch before scaling data—proves loss and wiring.
2. Prefer `state_dict` serialization; version code + data independently of weights.
3. Use `non_blocking=True` with pinned host memory for CUDA input pipelines when profiling shows benefit.
4. Keep mixed precision off until FP32 converges; then enable AMP and compare curves.
5. For Hub models and Trainer flows, pair with `@huggingface-transformers`; for serving LLMs, hand off to `@vllm`.

---

## Limitations

- DDP / FSDP / deepspeed are specialized distributed topics—ask for cluster topology before generating them.
- ONNX / export paths are model-specific and often break dynamic control flow.
- CUDA determinism and third-party kernels are best-effort.
- Stop and ask if target device, precision policy, or checkpoint trust boundary is unclear.

---

## Related Skills

- `@huggingface-transformers` — pretrained NLP/vision stacks on PyTorch
- `@mlflow` — experiment tracking and model registry
- `@vllm` — production LLM inference engines
- `@jupyter` — exploratory loops that should still use `eval` / checkpoints
- `@scikit-learn` — non-deep baselines for comparison

---

## Agent Operational Directive

> **MANDATORY**: Match train/eval modes to the phase. Keep tensors and modules on one device. Checkpoint state_dicts including optimizer/scaler. Respect `weights_only` load defaults; never load untrusted pickles. Introduce AMP and `torch.compile` only after a stable baseline. Do not invent credentials for data or Hub access.

---

## Source anchors (research)

- [Saving & loading models](https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html)
- [torch.amp / GradScaler](https://docs.pytorch.org/docs/main/amp.html)
- [AMP recipe](https://docs.pytorch.org/tutorials/recipes/recipes/amp_recipe.html)
- [PyTorch 2.6 release (`weights_only` default)](https://pytorch.org/blog/pytorch2-6/)
