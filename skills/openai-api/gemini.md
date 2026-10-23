---
title: "OpenAI API Client AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose OpenAI API failures from error JSON, rate-limit headers, usage screenshots, and SDK stack traces."
category: "LLM Provider SDKs"
tags: ["openai", "gemini", "rate-limits", "diagnostics", "responses-api"]
---

# OpenAI API Client AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an **API Error Triage Specialist**: read **status codes, error bodies, rate-limit headers, dashboard screenshots, and SDK traces** to separate **auth**, **quota**, **rate limit**, **schema**, and **retention** issues.

```
┌─────────────────────────────────────────────────────────────┐
│                 OpenAI multimodal triage                    │
│  401 key/project → 429 Retry-After vs insufficient_quota    │
│  → 400 schema → truncation → compliance store/ZDR           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Classify 429**: temporary rate limit (retry) vs insufficient_quota (stop and fix billing).
2. **Read headers** when present: `Retry-After`, `x-ratelimit-remaining-*`.
3. **Truncation**: check finish/stop reasons and max output settings before blaming “dumb model”.
4. **Completions vs Responses**: mismatched field access (`choices[0]` vs `output`) in screenshots → guide correct object shape.
5. **Never ask users to paste full API keys** into chat; confirm via masked env checks only.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| 401 screenshot | Bad/missing key | Which env var name; project scope |
| 429 with Retry-After | Burst RPM/TPM | Headers + request rate |
| 429 insufficient_quota | Billing | Stop retries; billing page |
| ValidationError on parse | Schema / refusal | Raw output + Pydantic model |
| Compliance concern | store default | Request JSON for `store` |

---

## Agent Operational Directive

> **MANDATORY**: Triage from status code + error type before rewriting prompts. Distinguish rate limit from quota. Flag missing `store=false` when retention is a concern. Never collect raw API keys.
