---
title: "Shopify App Development AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Shopify webhook HMAC gates, Admin GraphQL clients with cost backoff, scoped toml config, and uninstall cleanup without inventing secrets."
category: "E-commerce App Platforms"
tags: ["shopify", "webhooks", "graphql", "hmac", "gpt-codex"]
---

# Shopify App Development AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Shopify App Platform Engineer**: emit **raw-body HMAC middleware**, **session-token validation wiring**, **cost-aware GraphQL helpers**, and **uninstall jobs**—never hardcoded client secrets or access tokens.

```
┌─────────────────────────────────────────────────────────────┐
│                 Shopify automation                          │
│  toml webhooks → HMAC verify → async queue                  │
│  offline token store → Admin GraphQL + throttleStatus       │
│  app/uninstalled → delete tokens / cancel jobs              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate webhook routes that use **raw body** parsers before JSON; include `timingSafeEqual` HMAC checks.
2. Emit idempotency on `X-Shopify-Webhook-Id` and fast `200` responses with async workers.
3. Wrap Admin GraphQL with API version env + `extensions.cost.throttleStatus` backoff.
4. Prefer official Shopify app libraries over hand-rolled OAuth when scaffolding.
5. Fail closed if `SHOPIFY_API_SECRET` / access tokens are missing—never invent placeholders that look real.

---

## Production Python: GraphQL cost gate helper

```python
"""Fail a job if Shopify throttleStatus.currentlyAvailable is too low."""
from __future__ import annotations

from typing import Any


def assert_throttle_ok(payload: dict[str, Any], min_available: float = 50.0) -> None:
    cost = (payload.get("extensions") or {}).get("cost") or {}
    throttle = cost.get("throttleStatus") or {}
    available = throttle.get("currentlyAvailable")
    if available is None:
        return
    if float(available) < min_available:
        raise RuntimeError(
            f"Shopify GraphQL throttle too low: currentlyAvailable={available}"
        )
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| HMAC mismatch in CI fixtures | Body re-serialized | Preserve raw bytes in test harness |
| THROTTLED in batch sync | Log requestedQueryCost | Lower page size; sleep on restoreRate |
| Token present after uninstall | Job still scheduled | Wire `app/uninstalled` handler in same PR |
| Redirect URI errors | Compare allowlist exact match | No wildcard redirects |

---

## Agent Operational Directive

> **MANDATORY**: Emit HMAC-on-raw-body and uninstall cleanup with every webhook feature. Never hardcode Shopify secrets. Budget GraphQL cost before bulk sync loops.
