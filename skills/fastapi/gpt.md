---
title: "FastAPI Python APIs AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate typed routers, webhook raw-body endpoints, TestClient suites, and idempotent Stripe handlers."
category: "Development / FastAPI"
tags: ["fastapi", "pydantic", "webhooks", "gpt-codex"]
---

# FastAPI Python APIs AI Skill Guide (GPT & Codex)

## Operational Capabilities & Agent Directives

1. Split `APIRouter` modules; central exception handlers.
2. Webhook routes use `await request.body()`—no global JSON middleware on that path.
3. Emit pytest + `TestClient` auth and 401/201 cases.
4. Idempotency: SQLAlchemy/asyncpg UNIQUE on `stripe_event_id` with transaction wrapper.

## Agent Operational Directive

> **MANDATORY**: Raw bytes for signature verification. Async routes must not call blocking ORM without threadpool.
