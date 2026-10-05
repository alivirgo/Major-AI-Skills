---
title: "Redis AI Skill Guide (GPT & Codex)"
description: "GPT/Codex Redis automation: key naming, TTL helpers, SCAN-based maintenance, and stream consumer ack patterns."
category: "DevOps / Caching"
tags: ["redis", "cache", "streams", "gpt-codex"]
---

# Redis AI Skill Guide (GPT & Codex)

## Directives

1. Generate keys as `app:env:entity:id`; always include `EX` or explicit `PEXPIRE`.
2. Use `UNLINK` over `DEL` for large keys when supported.
3. Stream handlers: `XREADGROUP` → process → `XACK`; include idempotency key in payload.
4. Never codegen `KEYS`; use `SCAN` iterators in scripts.

---

## Template: cache-aside helper (pseudo)

```python
def get_item(redis, db, item_id: int):
    key = f"shop:prod:item:{item_id}"
    if raw := redis.get(key):
        return json.loads(raw)
    row = db.fetch_item(item_id)
    redis.set(key, json.dumps(row), ex=300)
    return row
```

---

## Agent Operational Directive

> **MANDATORY**: Scripts must set `maxmemory-policy` assumptions in comments (`volatile-lru` vs `allkeys-lru`).

---

## Sources

- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
