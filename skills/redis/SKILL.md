---
name: redis
description: "Design Redis caching, TTLs, and eviction policies; configure ACL auth and persistence (RDB/AOF); avoid KEYS, unbounded memory, and backup-restore windows that lose cache-aside coherency."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["redis", "cache", "ttl", "eviction", "aof", "rdb", "acl", "cluster", "streams", "backpressure"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Redis Caching & Data Structures AI Skill Guide

## Overview & Engine Architecture

Redis is a **single-threaded** (per shard) in-memory data structure server: strings, hashes, lists, sets, sorted sets, streams. It excels at cache, rate limits, coordination, and lightweight queues—but **eviction ≠ persistence** and **cache ≠ system of record** unless durability is explicitly engineered.

```
App -> Redis (standalone / Sentinel / Cluster)
         |- TTL + maxmemory-policy (eviction)
         |- optional RDB snapshots + AOF log
         |- ACL users / TLS (managed offerings)
         |- replication buffer (not counted in maxmemory)
```

---

## When to use / when not to

**Use when**

- Cache-aside or read-through for hot reads with explicit TTL
- Rate limiting, session storage with sliding TTL, leaderboards (ZSET)
- Lightweight work queues (LIST/STREAM) with documented at-least-once behavior

**Do not use when**

- Redis is the only copy of financial ledger data without AOF + backups + restore drills
- You need multi-key ACID across many keys in Cluster without hash tags
- Someone asks to run `KEYS *` or `FLUSHALL` in production—refuse without approval

---

## Operational Capabilities & Agent Directives

1. **Connection safety**: Use TLS and ACL users with command restrictions; cap client output buffers; set `timeout` on idle clients.
2. **TTL discipline**: Every cache key gets TTL; document stale-read tolerance; invalidate on write (`DEL`/`UNLINK` or versioned keys).
3. **Eviction vs durability**: `allkeys-lru` evicts cache keys under pressure; **`noeviction`** rejects writes—pick per instance role. Leave headroom below `maxmemory` for replication buffers.
4. **Persistence**: Hybrid **RDB + AOF** is common in production; `appendfsync everysec` ≈ 1s loss window; `always` is slower. Copy RDB/AOF during **BACKUP SEAL** or off-host backups—not mid-rewrite without guidance.
5. **Backpressure**: Large values block the event loop; pipeline responsibly; use `CLIENT PAUSE` only in controlled maintenance.
6. **Exactly-once myth**: Streams consumer groups are **at-least-once**; use idempotent handlers + `XACK` after side effects; pending entries list (PEL) needs monitoring.
7. **Auth**: `requirepass` alone is legacy; prefer ACL; never commit passwords; rotate on compromise.

---

## Production examples

### Cache-aside (namespaced keys)

```bash
SET shop:prod:item:42 '{"id":42,"price":199}' EX 300 NX
GET shop:prod:item:42
# On DB write success:
UNLINK shop:prod:item:42
```

### Rate limit (prefer app token bucket; fixed window sketch)

```bash
SET ratelimit:user:9:202610061200 0 EX 60 NX
INCR ratelimit:user:9:202610061200
```

### Stream consumer group (ack after work)

```bash
XGROUP CREATE events order-workers $ MKSTREAM
XREADGROUP GROUP order-workers consumer1 COUNT 10 BLOCK 2000 STREAMS events >
# process ...
XACK events order-workers <message-id>
```

### Safe iteration

```bash
SCAN 0 MATCH shop:prod:item:* COUNT 100
```

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| OOM / evictions spike | `maxmemory` too low or no TTL | Raise memory; TTL all cache keys; split instances |
| `OOM command not allowed` | `noeviction` + full memory | Eviction policy or scale; stop non-cache use on same DB |
| Data “lost” after restart | No AOF/RDB or wrong `dir` | Enable hybrid persistence; verify backup files |
| Slow p99 | Big values / `KEYS` / Lua loops | Shrink payloads; SCAN; split hot keys |
| Replica lag / partial sync fail | Buffer limits | Increase repl backlog; reduce write burst |
| Cache stampede | Thundering herd on expiry | Jitter TTL; singleflight in app |
| Restore mismatch | Restored RDB while app wrote DB | Treat cache as cold; flush namespaced keys post-restore |

---

## Best practices

- Separate **cache** Redis from **queue/coordination** Redis when possible.
- Cluster: use **hash tags** `{user:42}:...` for multi-key ops in one slot.
- Monitor: `used_memory`, evicted_keys, instantaneous_ops_per_sec, connected_clients.
- Distributed locks: prefer Redlock only with eyes open; use **fencing tokens** for external resources.

---

## Limitations

- Locks without fencing can double-write to downstream systems.
- Active-active geo replication has conflict semantics—not transparent multi-master SQL.
- Managed Redis changes VPC, AUTH, and backup UX.

---

## Related skills

- `@postgresql` — system of record behind cache
- `@kafka` / `@nats` — durable event bus vs Redis streams
- `@opentelemetry` — trace cache miss latency

---

## Agent Operational Directive

> **MANDATORY**: Never recommend Redis as sole durable store without documented AOF/RDB/backup strategy and restore test. Set TTL on cache keys. Ban `KEYS *` in production paths. Ack stream messages only after successful side effects.

---

## Source anchors (research)

- [Redis persistence (RDB, AOF, BACKUP)](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis eviction policies](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis Enterprise recovery / partial data loss](https://redis.io/docs/latest/operate/rs/databases/recover/)
