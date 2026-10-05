---
title: "Redis AI Skill Guide (Gemini)"
description: "Gemini Redis diagnostics: memory/eviction charts, persistence mode review, and slow-log interpretation."
category: "DevOps / Caching"
tags: ["redis", "eviction", "aof", "gemini"]
---

# Redis AI Skill Guide (Gemini)

## Directives

1. Separate **eviction** (memory pressure) from **restart data loss** (persistence off).
2. Read `INFO memory` and `used_memory_rss` vs `maxmemory`.
3. Flag simultaneous cache + durable queue on one instance without memory headroom.

---

## Agent Operational Directive

> **MANDATORY**: Before suggesting persistence changes, state the acceptable data-loss window (RDB interval vs AOF fsync).

---

## Sources

- [Redis persistence and durability tutorial](https://redis.io/tutorials/operate/redis-at-scale/persistence-and-durability/)
