---
name: kafka
description: "Design Kafka topics, keys, and consumer groups; implement idempotent handlers and ordered offset commits; tune producer acks and backpressure; debunk end-to-end exactly-once without app cooperation."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["kafka", "streaming", "consumer-groups", "idempotent-producer", "transactions", "lag", "backpressure", "schema-registry"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Apache Kafka Streaming AI Skill Guide

## Overview & Engine Architecture

Kafka is a distributed **commit log**: producers append to **topics** partitioned for parallelism; **consumer groups** divide partitions among consumers. Ordering is **per partition** (key-dependent). Brokers replicate partitions (ISR); consumers track **offsets**. Delivery is **at-least-once by default**; idempotent producers and transactions narrow failure modes but **do not replace application idempotency** across external systems.

```
Producers (idempotence?, acks, compression)
    -> brokers (leader/followers, ISR)
        -> consumer group (poll, process, commit offsets)
            -> side effects (DB, HTTP) — must be idempotent
```

---

## When to use / when not to

**Use when**

- Event-driven integration, log-based replay, stream processing
- Buffering spikes between services with clear retention policies
- Changelog/compacted topics for state projection sources

**Do not use when**

- Simple task queues with few consumers (`@rabbitmq`, `@nats` JetStream work-queue)
- Request/response latency under tens of ms without careful design
- Someone claims “Kafka gives exactly-once end-to-end” without transactional outbox or idempotent sinks—correct them

---

## Operational Capabilities & Agent Directives

1. **Keys & partitions**: Key by entity ID for per-entity order; avoid null keys on ordered flows; partition count is costly to change—plan throughput and consumer count up front.
2. **Producer safety**: `acks=all`, `min.insync.replicas` aligned with replication; `enable.idempotence=true` for deduped broker writes; retries with max.in.flight=1 when ordering matters (trade throughput).
3. **Consumer safety**: Disable auto-commit; commit offsets **after** side effects succeed; preserve **per-partition offset order** when parallelizing—out-of-order commits skip messages (fs2-kafka, reactor-kafka patterns).
4. **Backpressure**: `max.poll.interval.ms` and `max.poll.records` sized to handler latency; pause consumption when downstream is saturated; monitor **consumer lag** and rebalance storms.
5. **Auth/TLS**: SASL/SCRAM or mTLS on managed clusters; ACLs per topic/principal; never embed JAAS secrets in git.
6. **Schema**: Confluent Schema Registry (or equivalent) for Avro/Protobuf evolution; include schema/version in payload contracts.
7. **Backup/restore**: MirrorMaker/cluster linking for DR; topic configs and offsets are operational state—document restore runbooks; log compaction retains latest key, not full history.

---

## Production examples

### Producer (Java properties sketch)

```properties
acks=all
enable.idempotence=true
retries=2147483647
max.in.flight.requests.per.connection=5
compression.type=lz4
```

### Consumer loop (at-least-once, commit after work)

```java
while (true) {
  ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(500));
  for (ConsumerRecord<String, String> rec : records) {
    processIdempotent(rec.key(), rec.value()); // dedupe on business key
  }
  consumer.commitSync(); // after batch success
}
```

### Idempotent sink pattern

```sql
INSERT INTO processed_events (event_id, payload)
VALUES ($1, $2)
ON CONFLICT (event_id) DO NOTHING;
```

### Lag inspection

```bash
kafka-consumer-groups.sh --bootstrap-server $BOOTSTRAP \
  --describe --group order-service
```

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| Growing lag | Slow handler / blocked IO | Scale consumers ≤ partitions; optimize handler; pause upstream |
| Duplicate processing | Rebalance + at-least-once | Idempotent writes; store offsets with outbox pattern |
| Lost messages | Commit before process | Commit after effects; transactional consume if justified |
| Hot partition | Skewed keys | Salt keys; separate topics |
| Rebalance loop | Long poll interval exceeded | Raise `max.poll.interval.ms`; shrink batch |
| `OutOfOrderSequenceException` | idempotence + too many in-flight | Reduce in-flight or enable idempotence properly |
| EOS “works” but DB dupes | External system outside txn | Outbox/inbox; idempotent MERGE |

---

## Best practices

- **DLQ** topic for poison pills with metadata; do not infinite-retry without cap.
- Alert on **under-replicated partitions** and offline brokers.
- Load-test with realistic message sizes; compression helps network, not handler CPU.
- Document retention vs compaction per topic.

---

## Limitations

- Broker tuning (disk, JVM, network) needs platform expertise.
- Kafka transactions + DB exactly-once requires **consume-transform-produce** in same transaction or outbox.
- Managed Kafka (MSK, Confluent Cloud) changes networking and IAM.

---

## Related skills

- `@postgresql` — projecting events to tables
- `@temporal` — durable workflows consuming events
- `@schema` — `@llm-json-contract-check` for event payloads

---

## Agent Operational Directive

> **MANDATORY**: Default consumer designs to at-least-once with idempotent handlers. Never commit offsets before successful side effects unless the user explicitly accepts loss. Explain that exactly-once spans messaging + application + datastore. Size `max.poll.interval.ms` to worst-case handler time.

---

## Source anchors (research)

- [Confluent — Exactly-once semantics](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
- [kafka-node #548 — consumer cannot alone implement EOS](https://github.com/SOHU-Co/kafka-node/issues/548)
- [fs2-kafka #137 — offset order with parallel processing](https://github.com/fd4s/fs2-kafka/issues/137)
- [reactor-kafka #243 — out-of-order commits](https://github.com/reactor/reactor-kafka/issues/243)
- [KIP-98 / KAFKA-4815 transactional producer](https://issues.apache.org/jira/browse/KAFKA-4815)
