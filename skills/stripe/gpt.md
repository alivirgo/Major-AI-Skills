---
title: "Stripe Payments AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to implement constructEvent handlers, idempotency tables, Checkout session creators, and CLI test hooks."
category: "Development / Stripe"
tags: ["stripe", "webhooks", "idempotency", "gpt-codex"]
---

# Stripe Payments AI Skill Guide (GPT & Codex)

## Operational Capabilities & Agent Directives

1. Generate handlers: verify → dedupe `event.id` → transactional fulfill → 200; handler error → 500.
2. Express/Next/FastAPI variants must preserve raw body.
3. Use test keys in examples (`sk_test_`, `whsec_` placeholders only).
4. Checkout: server-side `price` IDs; never client-supplied amounts.

## SQL idempotency gate

```sql
CREATE TABLE stripe_events (
  event_id text PRIMARY KEY,
  type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
```

## Agent Operational Directive

> **MANDATORY**: No fulfillment logic without signature verification and event.id dedupe. Never commit live keys.
