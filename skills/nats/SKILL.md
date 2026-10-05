---
name: nats
description: "Design NATS subjects and JetStream streams; use pull consumers, AckWait, and Nats-Msg-Id dedupe; configure TLS/auth; debunk exactly-once—at-least-once with publish dedupe and idempotent handlers."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["nats", "jetstream", "messaging", "pull-consumer", "deduplication", "ack-wait", "workqueue", "tls", "backpressure"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# NATS & JetStream Distributed Messaging AI Skill Guide

## Overview & Engine Architecture

**Core NATS** is fire-and-forget pub/sub (at-most-once on lossy paths). **JetStream** adds persistence, replay, consumer acks, KV/Object stores, and Raft-replicated metadata. **Publish deduplication** (`Nats-Msg-Id` + stream `duplicate_window`) prevents duplicate *records in the stream*; **consumer delivery** remains **at-least-once** unless handlers are idempotent and ack timing is correct.

```
Publishers (TLS, creds/JWT)
    -> NATS cluster (4222 client / 6222 route)
        -> JetStream streams (limits/workqueue/interest retention)
        -> consumers (pull preferred in prod)
Subscribers ack/nak/in-progress
```

---

## When to use / when not to

**Use when**

- Lightweight cloud-native messaging, request-reply, edge telemetry fanout
- Work queues with JetStream **WorkQueue** retention (one consumer per filter subject)
- KV/Object config with TTL and history limits

**Do not use when**

- You need Kafka-grade log retention analytics ecosystem without ops appetite
- Global ordering across all messages without partition/key design
- Marketing “exactly-once delivery” without idempotent consumers—correct to **at-least-once + dedupe**

---

## Operational Capabilities & Agent Directives

1. **Subject design**: Hierarchical `app.region.entity.action`; scope stream `subjects` narrowly—avoid catch-all `>` on high-throughput streams without filters.
2. **Publish dedupe**: Set `Nats-Msg-Id` to stable business IDs; size `duplicate_window` to retry horizon—not a substitute for consumer idempotency ([streams docs](https://github.com/nats-io/nats.docs/blob/master/nats-concepts/jetstream/streams.md)).
3. **Pull consumers (prod)**: Durable pull with explicit batch/`max_bytes`; keep **`MaxAckPending` ≥ batch size**; avoid huge batches if processing is sequential ([pull consumers](https://docs.nats.io/learn/jetstream/pull-consumers)).
4. **Ack timing**: `AckWait` must exceed p99 processing or send **in-progress** heartbeats; short AckWait causes double delivery while work still runs ([ack docs](https://docs.nats.io/learn/jetstream/acknowledgment)). **`duplicate_window` ≠ AckWait** ([nats-server #6628](https://github.com/nats-io/nats-server/discussions/6628)).
5. **Backpressure**: Core NATS **slow consumer** drops—move to JetStream pull; tune fetch batch vs memory; scale consumer workers.
6. **Auth/TLS**: Operator mode/JWT or NKeys; TLS everywhere; never commit creds files to git.
7. **Backup/restore**: JetStream file store snapshots / server backup procedures; restore drills on staging; WorkQueue streams delete messages on ack—design retention accordingly.

---

## Production examples

### Stream + deduped publish (TypeScript)

```typescript
import { connect, JSONCodec, headers } from "nats";

const nc = await connect({ servers: ["nats://127.0.0.1:4222"], tls: { /* caFile */ } });
const jsm = await nc.jetstreamManager();
await jsm.streams.add({
  name: "ORDERS",
  subjects: ["orders.*"],
  retention: "limits",
  max_bytes: 1024 ** 3,
  duplicate_window: 120 * 1e9, // 2m publish dedupe window
});

const hdrs = headers();
hdrs.set("Nats-Msg-Id", `order-${order.orderId}`);
await nc.jetstream().publish("orders.created", codec.encode(order), { headers: hdrs });
```

### Durable pull consumer

```typescript
const consumer = await js.consumers.get("ORDERS", "order-worker");
const iter = await consumer.fetch({ max_messages: 10, expires: 30_000 });
for await (const msg of iter) {
  try {
    await processIdempotent(msg);
    msg.ack();
  } catch (e) {
    msg.nak(millis(2000));
  }
}
```

### Work queue constraints

- **WorkQueue** retention: one durable consumer per overlapping subject filter; message deleted after ack.

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| Slow consumer (core) | Push faster than handler | JetStream pull; scale workers |
| Duplicate deliveries | AckWait too short / no ack | Raise AckWait; in-progress; idempotent handler |
| Duplicate publishes retried | Missing `Nats-Msg-Id` | Stable msg id + duplicate_window |
| Stalled pull | `MaxAckPending` too low | Raise pending ≥ batch; ack faster |
| `No storage` / disk full | Stream limits / volume | `nats stream info`; expand PVC |
| Raft leader issues | Even-sized cluster / partition | Odd node count; check route mesh |
| Lost ack redelivery | Network drop after process | Double ack mode for critical ops ([delivery doc](https://docs.nats.io/learn/jetstream/delivery-and-acknowledgment)) |

---

## Best practices

- Use **interest** or **limits** retention for fanout analytics; **workqueue** for job processing.
- Terminate poison messages (`term()`) after N deliveries with alert.
- Monitor stream bytes, consumer ack floor lag, and redelivery counts.
- Supercluster/disaster recovery: document RPO/RTO separately for meta vs file store.

---

## Limitations

- Cross-region active/active is non-trivial; expect eventual consistency between sites.
- JetStream performance depends on disk fsync and batch sizes.
- Not a drop-in replacement for Kafka log compaction semantics in all cases.

---

## Related skills

- `@kafka` — heavier log-oriented streaming
- `@rabbitmq` — classic broker queues
- `@temporal` — durable orchestration over activities

---

## Agent Operational Directive

> **MANDATORY**: Do not equate `duplicate_window` with exactly-once processing. Use pull consumers with explicit ack after side effects. Set AckWait above processing p99 or use in-progress. Financial flows require idempotent handlers and consider double ack.

---

## Source anchors (research)

- [JetStream streams (dedupe window)](https://github.com/nats-io/nats.docs/blob/master/nats-concepts/jetstream/streams.md)
- [AckWait vs duplicate_window (#6628)](https://github.com/nats-io/nats-server/discussions/6628)
- [Pull consumers in depth](https://docs.nats.io/learn/jetstream/pull-consumers)
- [Acknowledgment & redelivery](https://docs.nats.io/learn/jetstream/acknowledgment)
- [Delivery and double ack](https://docs.nats.io/learn/jetstream/delivery-and-acknowledgment)
