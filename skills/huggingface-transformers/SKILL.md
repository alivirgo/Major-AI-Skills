---
name: huggingface-transformers
description: "Load Hub models with pinned revisions, run pipelines or AutoModel inference, apply chat templates correctly, and fine-tune with Trainer using current TrainingArguments (eval_strategy, safetensors)."
category: scientific
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["huggingface", "transformers", "tokenizer", "chat-template", "trainer", "safetensors", "pipeline"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Hugging Face Transformers AI Skill Guide (Claude)

## Overview & Engine Architecture

Transformers is the Hub-facing stack for **configs, tokenizers, and model classes** (`Auto*` / task-specific heads) plus high-level `pipeline` helpers. Text becomes `input_ids` / `attention_mask` (and optional chat control tokens via **chat templates**); the model runs on PyTorch (primary), with optional TF/Flax. Agents **pin `revision`**, prefer **safetensors**, separate train vs `eval` + `inference_mode`, and treat Hub downloads as supply-chain inputs—not floating `main` in production.

```
┌─────────────────────────────────────────────────────────────┐
│                 Transformers inference / train                │
│                                                             │
│  Hub artifact (model_id @ revision + safetensors)           │
│       │                                                     │
│       ├── AutoTokenizer / processor                         │
│       │     └── apply_chat_template (instruct/chat models)  │
│       │                                                     │
│       └── AutoModel* / pipeline                             │
│             ├── forward → logits / hidden states            │
│             ├── generate → decode                           │
│             └── Trainer + TrainingArguments (fine-tune)     │
│                                                             │
│  Serving handoff: export weights → @vllm / custom @pytorch  │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Classification, NER, summarization, generation, vision/audio models exposed via Transformers APIs.
- Prototyping with `pipeline`, then hardening with explicit tokenizer + model.
- Fine-tuning or PEFT adapters with `Trainer` / custom `@pytorch` loops; log runs in `@mlflow`.

**Do not use when**

- High-QPS multi-tenant LLM serving is the goal → `@vllm` (or similar) after weights are ready.
- The task is pure classical ML tabular baselines → `@scikit-learn`.
- User requests uploading proprietary data to Hub without license/privacy review → stop and escalate.

---

## Operational Capabilities & Agent Directives

1. **Pin `revision`** (commit SHA) for production `from_pretrained`; log `model_id` + revision + dataset version.
2. **Prefer safetensors** (`use_safetensors=True` when available); avoid untrusted pickle weights.
3. **Chat models**: always `tokenizer.apply_chat_template(...)` for the **same** model family—wrong control tokens destroy quality.
4. **Inference**: `model.eval()` + `torch.inference_mode()`; set `pad_token` if missing (often `eos_token`).
5. **Trainer args**: use `eval_strategy` / `save_strategy` (not legacy `evaluation_strategy` in new code).
6. **Memory**: truncate to model max length; shrink batch; enable gradient checkpointing before exotic tricks.
7. **Gated Hub models**: require `HF_TOKEN` from env/secret store—never invent or commit tokens.
8. **Train/serve skew**: ship identical tokenizer revision + chat template with the fine-tuned weights.

---

## Production Example: pinned classification + chat generation

```python
from __future__ import annotations

import os

import torch
from transformers import (
    AutoModelForCausalLM,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    pipeline,
)

# Pin a real revision in prod (example placeholder — replace with commit SHA from Hub UI)
SST_ID = "distilbert-base-uncased-finetuned-sst-2-english"
SST_REV = "main"  # replace with commit hash for production

clf = pipeline(
    "text-classification",
    model=SST_ID,
    revision=SST_REV,
    device=0 if torch.cuda.is_available() else -1,
)
print(clf("This deployment looks solid."))

tok = AutoTokenizer.from_pretrained(SST_ID, revision=SST_REV)
model = AutoModelForSequenceClassification.from_pretrained(
    SST_ID,
    revision=SST_REV,
    use_safetensors=True,
)
model.eval()
batch = tok(
    ["ship it", "needs work"],
    return_tensors="pt",
    padding=True,
    truncation=True,
    max_length=512,
)
with torch.inference_mode():
    probs = model(**batch).logits.softmax(-1)
print(probs)

# Instruct / chat model — template is mandatory
CHAT_ID = "Qwen/Qwen2.5-1.5B-Instruct"
chat_tok = AutoTokenizer.from_pretrained(CHAT_ID, revision="main")
chat_model = AutoModelForCausalLM.from_pretrained(
    CHAT_ID,
    revision="main",
    torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
    device_map="auto" if torch.cuda.is_available() else None,
)
messages = [
    {"role": "system", "content": "You are a concise ops assistant."},
    {"role": "user", "content": "Give three checks before promoting a model."},
]
prompt = chat_tok.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)
inputs = chat_tok(prompt, return_tensors="pt")
if torch.cuda.is_available():
    inputs = {k: v.to(chat_model.device) for k, v in inputs.items()}
with torch.inference_mode():
    out = chat_model.generate(**inputs, max_new_tokens=128, do_sample=False)
print(chat_tok.decode(out[0][inputs["input_ids"].shape[-1] :], skip_special_tokens=True))
```

Fine-tune sketch (current arg names):

```python
from transformers import Trainer, TrainingArguments

args = TrainingArguments(
    output_dir="out/sentiment",
    per_device_train_batch_size=16,
    per_device_eval_batch_size=32,
    num_train_epochs=2,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",
    fp16=torch.cuda.is_available(),
    report_to=["mlflow"],  # or "none"
    push_to_hub=False,
)
# trainer = Trainer(model=model, args=args, train_dataset=train_ds, eval_dataset=val_ds, processing_class=tok)
# trainer.train()
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| CUDA OOM on train/generate | Batch × seq length too large | Smaller batch; truncate; gradient checkpointing; 4bit/PEFT after FP16 baseline |
| Garbage / off-tone chat output | Missing or wrong chat template | `apply_chat_template` for that exact tokenizer; do not hand-roll `[INST]` for unrelated models |
| Duplicate BOS/special tokens | `add_special_tokens=True` after templated string | Prefer `apply_chat_template(tokenize=True)` or tokenize with `add_special_tokens=False` |
| Train/serve quality skew | Different tokenizer or revision | Pin identical `revision`; version with `@mlflow` tags |
| Slow first call | Cold Hub download / compile | Cache `HF_HOME`; warm-up request; pin revision to avoid surprise downloads |
| `evaluation_strategy` TypeError / warning | Legacy TrainingArguments field | Use `eval_strategy` |
| Gated repo 401/403 | Missing/invalid Hub token | Set `HF_TOKEN` from secrets; accept license on Hub UI |
| `pad_token` / attention mask warnings | Causal LM lacks pad | `tokenizer.pad_token = tokenizer.eos_token` before batching |

---

## Best Practices

1. Log Hub id + revision + dataset digest in `@mlflow` for every production candidate.
2. Establish FP16/BF16 baseline before quantization or LoRA; measure domain examples, not only public GLUE scores.
3. Use `pipeline` for demos; promote to explicit `Auto*` for serving contracts and batching.
4. For generation serving at scale, export and hand off to `@vllm` rather than raw `generate` loops.
5. Respect model cards / licenses; never upload customer data without approval.

---

## Limitations

- Extremely large multimodal models need specialized processors and serving stacks beyond basic pipelines.
- Hub availability, rate limits, and gated access are operational dependencies.
- Trainer defaults are starting points—tune for hardware and overfitting risk.
- Stop and ask if target hardware, license constraints, or eval sets are missing.

---

## Related Skills

- `@pytorch` — custom training loops, AMP, checkpoints
- `@vllm` — high-throughput OpenAI-compatible serving
- `@mlflow` — track fine-tunes and registry aliases
- `@langchain` / `@llamaindex` — app orchestration around models
- `@jupyter` — exploratory notebooks that should still pin revisions

---

## Agent Operational Directive

> **MANDATORY**: Pin Hub `revision` for production loads. Prefer safetensors. Use the model's chat template for instruct models. Run inference under `eval` + `inference_mode`. Use current `TrainingArguments` (`eval_strategy`). Never invent Hub tokens or bake them into source.

---

## Source anchors (research)

- [Trainer / TrainingArguments (`eval_strategy`)](https://huggingface.co/docs/transformers/main_classes/trainer)
- [Chat templates](https://huggingface.co/docs/transformers/en/chat_templating)
- [Pipelines](https://huggingface.co/docs/transformers/main_classes/pipelines)
