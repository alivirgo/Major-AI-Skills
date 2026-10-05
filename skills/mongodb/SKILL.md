---
name: mongodb
description: "Model MongoDB documents and compound indexes, tune read/write concern and TLS connection strings, run safe aggregations, and avoid backup/restore and majority-write traps on small replica sets."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["mongodb", "aggregation", "indexes", "replica-set", "write-concern", "tls", "backup", "atlas", "schema-validation"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# MongoDB Document Database AI Skill Guide

## Overview & Engine Architecture

MongoDB stores **BSON documents** in collections. Query paths drive **compound index** design; the aggregation pipeline is a staged computation graph. Replica sets provide durability via oplog replication; **write concern** and **read concern** define what “acknowledged” means—agents often treat `majority` as free insurance without counting voting data-bearing nodes.

```
Drivers (TLS, authSource, replicaSet)
    -> mongod replica set / sharded cluster
        -> collections + indexes (B-tree, partial, TTL, text)
        -> oplog -> secondary apply (async)
        -> change streams (resume tokens)
```

---

## When to use / when not to

**Use when**

- Access patterns favor embedded documents or flexible schema with controlled validation
- You need aggregation analytics over documents without heavy cross-row joins
- Designing indexes for `find` + `sort` + range on the same query shape

**Do not use when**

- Multi-table joins and strict relational invariants dominate (`@postgresql`)
- You need cross-document ACID on many collections routinely—transactions exist but cost throughput
- Someone proposes storing secrets in client-side connection strings or disabling TLS on Atlas—refuse

---

## Operational Capabilities & Agent Directives

1. **Connection safety**: Full **SRV** URI with `replicaSet`, `authSource`, `tls=true`, and cert options for self-hosted; cap `maxPoolSize`; set `serverSelectionTimeoutMS` and `connectTimeoutMS`.
2. **Write concern**: Default global `majority` is common; on **P-S-A** (primary + secondary + arbiter), `w: majority` can fail when the only data-bearing secondary is down—size replica sets for real redundancy or document degraded modes explicitly.
3. **Indexes**: Equality fields first in compound index, then sort, then range; use **partial** and **TTL** indexes intentionally; avoid unbounded array growth.
4. **Migrations**: Prefer additive schema + `$jsonSchema` validation; online index builds still load the cluster—build during low traffic with `background` equivalent (modern builds use index build coordination—check server version docs).
5. **Backup/restore**: Point-in-time needs oplog/coordinated backup (Atlas, PBM, Cloud Manager). **Do not restore a backup over prod** without isolation; after non-majority periods, Percona PBM docs require restoring **majority** before relying on restored data.
6. **Auth**: Database users with least privilege; `readPreference` secondary for analytics only when stale reads are acceptable.
7. **Exactly-once myth**: Retryable writes prevent duplicate keys on idempotent ops but **do not** make downstream handlers exactly-once—use idempotent `updateOne` filters on business keys.

---

## Production examples

### Modeling + indexes

```javascript
db.orders.createIndex({ customerId: 1, createdAt: -1 });
db.orders.createIndex(
  { status: 1 },
  { partialFilterExpression: { status: "open" } }
);

db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customerId", "status", "createdAt"],
      properties: {
        status: { enum: ["open", "paid", "cancelled"] },
        items: { bsonType: "array", maxItems: 50 }
      }
    }
  }
});
```

### Aggregation with early `$match`

```javascript
db.orders.aggregate([
  { $match: { createdAt: { $gte: ISODate("2026-01-01") }, status: "paid" } },
  { $group: { _id: "$customerId", revenue: { $sum: "$totalCents" } } },
  { $sort: { revenue: -1 } },
  { $limit: 50 }
]);
```

### Idempotent upsert (handler safety)

```javascript
db.events.updateOne(
  { eventId: "evt-1042" },
  { $setOnInsert: { payload: doc, createdAt: new Date() } },
  { upsert: true }
);
```

### Explain

```javascript
db.orders.find({ customerId: id, status: "open" })
  .sort({ createdAt: -1 })
  .explain("executionStats");
```

### Backup agent URI (TLS + degraded ack — document explicitly)

```text
mongodb://pbmuser:***@host1,host2,host3/?replicaSet=rs0&authSource=admin&tls=true&tlsCAFile=/etc/pbm/ca.pem&readConcernLevel=local&w=1
```

Use reduced concern only when majority is lost; **restore only after majority is healthy** (PBM guidance).

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| `COLLSCAN` / high `docsExamined` | Missing or wrong index order | Align compound index with filter + sort |
| `WriteConcernError` majority timeout | Too few data-bearing nodes up | Fix topology; temporary lower `w` with explicit risk doc |
| Duplicate events on retry | Non-idempotent handler | Upsert on natural key; store processed event IDs |
| Backup fails under outage | PBM default majority | Temporary `local`/`w=1` per vendor docs; restore after majority |
| TLS handshake errors | Wrong CA / SNI / cert rotation | Fix `tlsCAFile`; rotate app certs before mongod |
| Transaction abort storms | Multi-doc tx on hot paths | Redesign embedding or outbox pattern |

---

## Best practices

- Cap document size and array lengths; use **bucket pattern** for time series.
- Use **change streams** with persisted resume tokens; handle `invalidate` on collection drops.
- Monitor `opcounters`, replication lag, and index build progress.
- Atlas: IP access lists + IAM auth; never expose `0.0.0.0/0` without explicit approval.

---

## Limitations

- Cross-shard transactions and global indexes add operational complexity.
- Graph-heavy workloads may fit better elsewhere.
- Agent suggestions cannot replace load tests on representative document sizes.

---

## Related skills

- `@postgresql` — relational alternative when joins dominate
- `@redis` — cache hot Mongo reads
- `@kafka` — change capture / event outbox patterns

---

## Agent Operational Directive

> **MANDATORY**: Always specify write/read concern implications when changing replica set topology or backup tools. Never recommend `sslAllowInvalidCertificates` in production. Design handlers idempotently; do not claim exactly-once without a dedupe key and proof.

---

## Source anchors (research)

- [MongoDB Write Concern](https://www.mongodb.com/docs/manual/reference/write-concern/)
- [Connection String Options (TLS, w, timeoutMS)](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [Percona Backup for MongoDB — authentication & majority](https://docs.percona.com/percona-backup-mongodb/details/authentication.html)
