---
title: "Hugging Face Transformers AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate revision-pinned loaders, chat-template inference, Trainer configs with eval_strategy, and MLflow-tagged fine-tune scripts."
category: "Hub Models & Fine-Tuning"
tags: ["transformers", "huggingface", "trainer", "chat-template", "gpt-codex", "safetensors"]
---

# Hugging Face Transformers AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **model ops automation engineer**: emit **pinned `from_pretrained` loaders**, **chat-template inference CLIs**, **Trainer YAML/args**, and **CI smoke tests** that warm-load revision + safetensors.

```
┌─────────────────────────────────────────────────────────────┐
│                 Transformers automation                       │
│  pin revision → load safetensors → template → generate/eval │
│  Trainer(eval_strategy) → metrics → @mlflow tags            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Always parameterize `MODEL_ID` + `REVISION` (commit SHA in prod templates).
2. Emit `apply_chat_template` for any `*-Instruct` / chat model—never hand-rolled markers unless matching that tokenizer.
3. Use `eval_strategy` / `save_strategy` in generated `TrainingArguments`.
4. Read `HF_TOKEN` from env only; never invent tokens.
5. Add a post-train assert that tokenizer revision matches model revision in saved metadata.

---

## Production Python: revision smoke loader

```python
"""CI smoke: load model@revision and run one forward/generate."""
from __future__ import annotations

import os

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = os.environ["HF_MODEL_ID"]
REVISION = os.environ["HF_REVISION"]


def main() -> None:
    tok = AutoTokenizer.from_pretrained(MODEL_ID, revision=REVISION)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        revision=REVISION,
        use_safetensors=True,
        torch_dtype=torch.float32,
    )
    model.eval()
    messages = [{"role": "user", "content": "ping"}]
    if getattr(tok, "chat_template", None):
        text = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    else:
        text = "ping"
    batch = tok(text, return_tensors="pt")
    with torch.inference_mode():
        out = model.generate(**batch, max_new_tokens=8)
    print(tok.decode(out[0], skip_special_tokens=True))


if __name__ == "__main__":
    main()
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Script fix |
| :--- | :--- | :--- |
| OOM in CI GPU job | batch/seq | Cap `max_length`; tiny smoke model |
| Garbled instruct output | skipped template | Branch on `chat_template` |
| Hub 401 | missing secret | Fail fast if gated and `HF_TOKEN` unset |

---

## Agent Operational Directive

> **MANDATORY**: Pin revisions, prefer safetensors, apply chat templates, use current Trainer arg names. Never embed Hub credentials in generated code.
