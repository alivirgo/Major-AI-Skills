---
title: "LLM JSON Contract Check AI Skill Guide (GPT & Codex)"
description: "Operational skill for OpenAI GPT and Codex to implement strict structured outputs, layered JSON contract validators, repair/retry loops, and CI fixtures before side effects."
category: "AI Workflows / Structured Outputs"
tags: ["json-schema", "structured-outputs", "zod", "pydantic", "validation", "gpt-codex"]
---

# LLM JSON Contract Check AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a Principal API Contract Engineer: wire **strict `json_schema` / tool parameters**, generate schemas from Zod/Pydantic, and ship **CI fixtures** that prove domain rejects (e.g. negative quantity) never reach side effects.

```
┌─────────────────────────────────────────────────────────────┐
│  Pydantic/Zod model → JSON Schema (strict) → API call       │
│  → refusal/finish check → validate → domain → side effect   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Prefer OpenAI `response_format` with `strict: true` (or strict function tools) over prompt-only JSON.
2. Check `refusal` and incomplete `finish_reason` before `JSON.parse` / SDK `.parse()`.
3. Keep unsupported constraints (`pattern`, numeric min/max, maxItems) in application validators.
4. Implement bounded repair: feed `validator.errors` back once or twice; then fallback.
5. Emit `reject_layer` metrics and `schema_hash` on every structured call path.

---

## Production example: OpenAI + Pydantic

```python
"""Strict structured output with post-domain gate."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, ValidationError, model_validator


class Order(BaseModel):
    sku: str
    quantity: int
    currency: Literal["USD", "EUR", "GBP"]
    note: Optional[str] = None

    @model_validator(mode="after")
    def qty_positive(self) -> "Order":
        if self.quantity <= 0:
            raise ValueError("quantity must be > 0")
        return self


# Pseudo-call:
# completion = client.chat.completions.parse(..., response_format=Order)
# if getattr(completion.choices[0].message, "refusal", None): handle_refusal()
# order = completion.choices[0].message.parsed
# if order is None: handle_incomplete()
# submit_order(order)  # only after parse + domain validators succeeded
```

### CI fixture pattern

```python
def test_negative_quantity_rejected():
    raw = '{"sku":"SKU-1","quantity":-3,"currency":"USD"}'
    # parse JSON OK → schema OK → domain FAIL
    result = check_contract(raw_text=raw, schema=ORDER_SCHEMA)
    assert result.ok is False and result.layer.value == "domain"
```

---

## Technical Troubleshooting Matrix

| Signature | Fix in code |
| :--- | :--- |
| Schema 400 from API | Remove unsupported keywords; inline `$ref`; flatten depth |
| `.parse()` throws on refusal | Branch on `refusal` first |
| Retries always fire | Simplify enums; split multi-stage extraction |
| Extra keys in prod | Enable strict / `additionalProperties: false` |

---

## Best Practices

1. Single model class → schema export → runtime validate.
2. Log repair strategy names (fence strip vs generative retry) separately.
3. Never coerce `sku` or money fields in the parse layer.
4. Version schemas next to prompts for regression gates.

---

## Agent Operational Directive

> **MANDATORY**: Use strict structured outputs when available. Validate schema and domain before side effects. Classify refusal/truncation correctly. Bound retries. Ship negative-path fixtures.
