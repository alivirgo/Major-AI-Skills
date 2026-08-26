---
name: pytorch
description: "Operational skill for PyTorch: tensors, nn.Module models, training/eval loops, device placement, checkpointing, and inference hygiene."
category: scientific
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["pytorch", "deep-learning", "tensors", "training", "python", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# PyTorch Model Development AI Skill Guide

## Overview & Engine Architecture

PyTorch provides tensor compute with autograd, `nn.Module` for models, and DataLoader utilities for batches. Training steps run forward -> loss -> backward -> optimizer; inference uses `eval()` and `torch.no_grad()`. Agents keep device placement consistent, checkpoint reproducibly, and separate train/eval normalization behavior (dropout/batchnorm).

```
Dataset/DataLoader
      -> model (nn.Module) on device
          -> loss
          -> backward / optimizer
          -> torch.save checkpoint
```

## When to use this skill

- Implementing or debugging training loops
- Moving models/tensors between CPU and CUDA
- Saving/loading checkpoints for resume or export
- Basic inference scripts

## Operational directives

1. Call `model.train()` for training and `model.eval()` for evaluation/inference.
2. Wrap inference in `torch.no_grad()` (or `inference_mode()`).
3. Move model and batches to the same device.
4. Save `model.state_dict()` plus optimizer/scaler/epoch for resumes.
5. Set seeds when reproducibility matters; still expect nondeterminism on some GPU ops.

## Minimal training step

```python
model.train()
for xb, yb in loader:
    xb, yb = xb.to(device), yb.to(device)
    optimizer.zero_grad(set_to_none=True)
    logits = model(xb)
    loss = criterion(logits, yb)
    loss.backward()
    optimizer.step()
```

## Checkpoint sketch

```python
torch.save({
    "model": model.state_dict(),
    "optimizer": optimizer.state_dict(),
    "epoch": epoch,
}, "ckpt.pt")

ckpt = torch.load("ckpt.pt", map_location=device)
model.load_state_dict(ckpt["model"])
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Device mismatch | batch on CPU, model on CUDA | `.to(device)` both |
| Loss NaN | LR too high / bad inputs | lower LR; check data |
| Leakage VRAM | holding graphs | detach; clear cache carefully |
| Bad val accuracy | forgot eval() | disable dropout/BN train behavior |

## Best practices

- Log hyperparameters and git SHA with metrics (`@mlflow` when available).
- Start with a tiny overfit-on-one-batch sanity check.
- Use mixed precision only after the FP32 path is stable.
- Version datasets and preprocessing independently from model code.

## Limitations

- Distributed data parallel and FSDP are specialized topics.
- Export to ONNX/TorchScript has model-specific constraints.
- Licensing and dataset privacy remain user responsibilities.

## Related skills

- `@huggingface-transformers` - pretrained NLP/vision stacks
- `@jupyter` - exploratory training notebooks
- `@mlflow` - experiment tracking
