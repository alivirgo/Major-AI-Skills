---
name: redis-streams
description: "Operational skill for Redis Streams: XADD/XREADGROUP, consumer groups, acknowledgements, pending entries, and trim policies (complementary to Redis caching)."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["redis", "streams", "consumer-groups", "messaging", "devops", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Redis Streams & Consumer Groups AI Skill Guide

## Overview & Engine Architecture

Redis Streams are an append-only log data type with consumer groups for competing consumers. Producers `XADD`; consumers in a group `XREADGROUP`, then `XACK` processed IDs. Pending entries (`XPENDING`/`XCLAIM`) handle crashes. Agents design idempotent consumers, explicit ACK policies, and trimming (`MAXLEN`/`MINID`) so streams do not grow forever. Use `@redis` for cache/TTL patterns; this skill focuses on stream processing.

```
Producers --XADD--> Stream key
                       |
              Consumer group
             /      |      \
         consumer  consumer  consumer
              \     |      /
               XACK after success
```

## When to use this skill

- Building lightweight job/event pipelines on existing Redis
- Implementing at-least-once processing with consumer groups
- Reclaiming stuck pending messages after worker death
- Cap stream length for operational safety

## Operational directives

1. Always use consumer groups for competing workers (`XGROUP CREATE`).
2. Process then `XACK`; crash before ACK => message stays pending (at-least-once).
3. Make handlers idempotent (dedupe by message ID or business key).
4. Trim streams (`MAXLEN ~`) or expire by ID policy; monitor length.
5. Do not treat Streams as a full Kafka replacement for huge multi-tenant bus needs without capacity planning.

## Command sketches

```bash
XGROUP CREATE mystream mygroup $ MKSTREAM
XADD mystream * type order.created orderId 123
XREADGROUP GROUP mygroup worker1 COUNT 10 BLOCK 2000 STREAMS mystream >
XACK mystream mygroup 1680000000000-0
XPENDING mystream mygroup
XCLAIM mystream mygroup worker2 60000 1680000000000-0
XTRIM mystream MAXLEN ~ 10000
```

## Consumer loop sketch (pseudo)

```text
entries = XREADGROUP GROUP g c COUNT 10 BLOCK 2000 STREAMS s >
for each entry:
  try:
    handle(entry)          # idempotent
    XACK s g entry.id
  catch:
    log; leave pending for retry/claim
```

## Operational pitfalls

| Pitfall | Result | Fix |
| --- | --- | --- |
| Never ACK | Pending grows; redelivery storms | ACK after success; alert on PEL size |
| ACK before side effects commit | Lost work on crash | ACK after durable success |
| Unbounded stream | OOM | `MAXLEN` / `MINID` trim |
| One consumer name reused across pods | Confusing PEL ownership | Unique consumer IDs per instance |

## Best practices

- Include schema/version field in each entry payload.
- Monitor lag: last delivered vs last ID, and `XPENDING` counts.
- Use `XAUTOCLAIM` (newer Redis) to simplify reclaim loops when available.
- Separate stream keys by domain (`orders:events`) rather than one global firehose.

## Limitations

- Redis availability and persistence settings affect durability guarantees.
- Exactly-once delivery is not provided; emulate with idempotent writes.
- Cluster hash-tag design matters when co-locating related keys.

## Related skills

- `@redis` - caching, TTLs, general data structures
- `@kafka` - heavier durable streaming when Redis is insufficient
- `@incident-runbooks` - consumer lag / PEL incident response
