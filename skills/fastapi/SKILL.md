---
name: fastapi
description: "Build production FastAPI services with Pydantic v2 models, async-safe I/O, dependency injection, OpenAPI, webhook raw-body routes, and structured errors. Use for JSON APIs, Stripe webhooks, and TestClient/httpx testing."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["fastapi", "python", "pydantic", "openapi", "async", "webhooks", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# FastAPI Python APIs AI Skill Guide (Claude)

## Overview & Engine Architecture

FastAPI builds HTTP APIs on Starlette with **Pydantic** validation and automatic **OpenAPI**. **Dependencies** inject auth, DB sessions, and settings. Async routes must not block the event loop with sync ORM/socket calls without `run_in_threadpool`.

Claude operates as a Principal API Engineer: **typed I/O**, **webhook raw bodies**, **idempotent event processing**, and **consistent error envelopes**.

```
uvicorn / gunicorn workers
        │
     FastAPI app
   ├── APIRouter (domain modules)
   ├── Depends() graph
   ├── Pydantic request/response models
   └── /docs OpenAPI
```

---

## When to use / when not to

**Use when**

- High-throughput JSON APIs with automatic schema docs.
- Webhook receivers (Stripe, GitHub) with signature verification.
- Internal microservices where Python ecosystem fits.

**Do not use when**

- Heavy CPU work belongs in a queue worker—not `BackgroundTasks` alone.
- Team standard is Django ORM/admin—don't force FastAPI for CRUD admin.

---

## Operational Capabilities & Agent Directives

1. **Request + response models** on public routes; avoid bare `dict` responses.
2. **`APIRouter` per domain** with shared exception handlers.
3. **Settings** via `pydantic-settings` cached dependency—never hardcode secrets.
4. **Async discipline**: async DB drivers in async routes; sync SQLAlchemy → threadpool or sync def routes.
5. **Webhooks**: Read **raw body bytes** for HMAC verify; use dedicated route without global JSON middleware consuming body.
6. **Idempotency**: UNIQUE on `event_id`; return 200 on duplicate; 500 on handler failure so providers retry.
7. **CORS**: Explicit origins—never `*` with credentials.

---

## App sketch

```python
from fastapi import Depends, FastAPI, HTTPException, Request
from pydantic import BaseModel, Field

app = FastAPI(title="Inventory API", version="1.2.0")

class ItemIn(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    qty: int = Field(ge=0)

class ItemOut(ItemIn):
    id: int

def get_current_user(authorization: str | None = None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="unauthorized")
    return "user"

@app.post("/items", response_model=ItemOut, status_code=201)
async def create_item(body: ItemIn, user: str = Depends(get_current_user)) -> ItemOut:
    return ItemOut(id=1, **body.model_dump())
```

Stripe webhook (raw body):

```python
@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
    # idempotency gate on event.id
```

---

## Technical Troubleshooting Matrix

| Issue | Root cause | Fix |
| :--- | :--- | :--- |
| **Signature verify fails** | Body parsed/re-serialized | Use raw `request.body()` |
| **Event loop blocked** | Sync DB in `async def` | Threadpool or sync route |
| **422 on valid JSON** | Pydantic v2 strict extras | Align models; `model_config` |
| **OpenAPI drift** | Missing `response_model` | Declare response types |
| **Duplicate fulfillment** | No idempotency store | UNIQUE `event_id` + txn |

---

## Best practices

- Central `@app.exception_handler` for domain errors.
- Correct HTTP semantics: 201 create, 204 delete, 409 conflict.
- Version external APIs (`/v1`).
- Structured logs with `request_id` middleware.
- `TestClient` or httpx ASGI transport for integration tests.

---

## Limitations

- `BackgroundTasks` ≠ durable queue (use Celery, ARQ, Temporal).
- WebSockets need explicit patterns.
- Migrations (Alembic) are separate from FastAPI.

---

## Related skills

- `@stripe` — payment events and idempotency
- `@postgresql` — transactional fulfillment
- `@docker` — multi-worker uvicorn/gunicorn
- `@nodejs` — compare Express webhook raw body patterns

---

## Agent Operational Directive

> **MANDATORY**: Verify webhook signatures on untouched raw bytes. Persist provider event IDs before side effects. Never block async routes with sync DB without an explicit threadpool strategy. Load secrets from environment only.

---

## Sources

- [FastAPI docs](https://fastapi.tiangolo.com/)
- [Stripe webhook signatures (Python)](https://docs.stripe.com/webhooks/signature)
- Idempotency patterns for Stripe webhooks (transaction + UNIQUE event_id)
