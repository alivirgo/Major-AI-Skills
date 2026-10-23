---
title: "OpenAI API Client AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate OpenAI Responses/Completions clients, structured-output parsers, retry policies, and usage CI smoke tests."
category: "LLM Provider SDKs"
tags: ["openai", "responses-api", "structured-outputs", "embeddings", "gpt-codex", "retries"]
---

# OpenAI API Client AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Provider Integration Automation Engineer**: emit **typed clients**, **Pydantic parse helpers**, **retry wrappers that respect Retry-After**, and **smoke tests** that assert model pin + `store=false` when required.

```
┌─────────────────────────────────────────────────────────────┐
│                 OpenAI Automation                           │
│  client factory → responses.parse schemas → retry policy    │
│  usage logger → CI smoke (1 call) → cost budget gate        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate a single `get_openai_client()` with timeout, max_retries, and env-only key loading.
2. Default new features to **Responses** + `.parse`; provide Completions only behind a compat flag.
3. Emit `store=False` unless the product explicitly needs stored response state.
4. Implement retries that **read Retry-After**, add jitter, and **exclude** insufficient_quota.
5. Never print API keys; redact `Authorization` in HTTP debug logs.

---

## Production Python: 429-aware retry helper

```python
"""Retry transient 429s; never spin on quota/billing errors."""
from __future__ import annotations

import random
import time
from typing import Callable, TypeVar

from openai import APIStatusError, OpenAI, RateLimitError

T = TypeVar("T")


def with_backoff(fn: Callable[[], T], *, attempts: int = 5) -> T:
    delay = 1.0
    for i in range(attempts):
        try:
            return fn()
        except Exception as e:
            msg = str(e).lower()
            if "insufficient_quota" in msg or "billing" in msg:
                raise
            if not isinstance(e, (RateLimitError, APIStatusError)):
                raise
            if i == attempts - 1:
                raise
            retry_after = None
            if getattr(e, "response", None) is not None:
                retry_after = e.response.headers.get("retry-after")
            sleep_for = float(retry_after) if retry_after else delay
            sleep_for += random.uniform(0, 0.25)
            time.sleep(sleep_for)
            delay = min(delay * 2, 30.0)
    raise RuntimeError("unreachable")


def smoke() -> None:
    client = OpenAI(timeout=30.0, max_retries=0)  # retries owned here
    resp = with_backoff(
        lambda: client.responses.create(
            model="gpt-4.1-mini",
            store=False,
            input="ping",
        )
    )
    assert resp.id
    print("ok", resp.id, resp.usage)


if __name__ == "__main__":
    smoke()
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Nested 429 storms | App retries + SDK max_retries>0 | Set SDK retries 0 when wrapping |
| Accidental retention | `store` omitted in Responses | Lint for `store=False` in prod paths |
| Schema drift | Raw JSON without parse | Require `.parse` + shared Pydantic models |
| Dim mismatch CI | Embed size ≠ collection | Assert `len(embedding)==expected` |

---

## Agent Operational Directive

> **MANDATORY**: Automate env-only keys, Responses-first clients, Structured Outputs, and Retry-After-aware backoff. Default `store=false` for new prod paths. Never emit credential literals.
