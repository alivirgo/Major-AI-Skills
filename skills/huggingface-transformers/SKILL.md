---
name: huggingface-transformers
description: "Operational skill for Hugging Face Transformers: pipelines, tokenizers, fine-tuning, and inference with AutoModel APIs."
category: scientific
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["huggingface", "transformers", "nlp", "fine-tuning", "pytorch", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Hugging Face Transformers AI Skill Guide

## Overview & Engine Architecture

Transformers provides pretrained model configs, tokenizers, and `Auto*` loaders plus high-level `pipeline` helpers. Tokenizers map text to tensors; models run on PyTorch/TensorFlow/Flax backends. Agents pin model revisions, respect max sequence lengths, separate train/eval modes, and treat Hub downloads as supply-chain inputs (revision hashes, not floating `latest`).

```
Tokenizer -> input_ids / attention_mask
      -> AutoModel* (forward)
          -> logits / generated tokens
          -> decode
```

## When to use this skill

- NLP classification, NER, summarization, generation
- Vision/audio models exposed via Transformers APIs
- Fine-tuning with Trainer or custom `@pytorch` loops

## Operational directives

1. Pin `revision` (commit hash) for production model loads.
2. Use `pipeline` for prototypes; switch to explicit tokenizer+model for control.
3. Truncate/pad consistently with the model's max length.
4. Call `model.eval()` and `torch.inference_mode()` for serving paths.
5. Respect model licenses and data privacy before uploading to the Hub.

## Pipeline + explicit inference

```python
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

clf = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english", revision="main")
print(clf("This deployment looks solid."))

tok = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased-finetuned-sst-2-english",
    revision="main",
)
model.eval()
batch = tok(["ship it", "needs work"], return_tensors="pt", padding=True, truncation=True)
with torch.inference_mode():
    logits = model(**batch).logits
    print(logits.softmax(-1))
```

## Fine-tune sketch

```python
from transformers import Trainer, TrainingArguments

args = TrainingArguments(
    output_dir="out/sentiment",
    per_device_train_batch_size=16,
    num_train_epochs=2,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
)
trainer = Trainer(model=model, args=args, train_dataset=train_ds, eval_dataset=val_ds, tokenizer=tok)
trainer.train()
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| CUDA OOM | batch/seq too long | smaller batch; gradient checkpointing |
| Garbage generations | missing special tokens / bad template | use model chat template |
| Train/serve skew | different tokenizer revision | pin identical revisions |
| Slow first call | cold download/compile | cache models; warm-up |

## Best practices

- Log Hub model id + revision + dataset version in `@mlflow`.
- Prefer safetensors weights when available.
- Quantization/PEFT for large models after FP16 baseline works.
- Validate on domain examples, not only GLUE-style scores.

## Limitations

- Multimodal and extremely large models need specialized serving stacks.
- Hub availability and gated models require tokens/permissions.
- Trainer defaults are starting points - tune for your hardware.

## Related skills

- `@pytorch` - custom training loops
- `@langchain` / `@llamaindex` - LLM app orchestration around models
- `@mlflow` - track fine-tunes
