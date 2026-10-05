---
title: "MongoDB AI Skill Guide (GPT & Codex)"
description: "Scriptable MongoDB patterns for GPT/Codex: index definitions, aggregation templates, idempotent upserts, and connection URI checklists."
category: "DevOps / Databases"
tags: ["mongodb", "indexes", "aggregation", "gpt-codex", "write-concern"]
---

# MongoDB AI Skill Guide (GPT & Codex)

## Directives

1. Generate **compound indexes** from exact `find().sort()` shapes; include partial filters when scoped.
2. Wrap aggregations with **`$match` first** to use indexes.
3. Emit **idempotent** `updateOne`/`replaceOne` with business-key filters for event consumers.
4. Connection strings: include `replicaSet`, `authSource`, TLS params; never hardcode passwords.
5. Document `writeConcern` when generating bulk loaders.

---

## Template: index from query

```javascript
// Query: db.orders.find({ customerId, status: "open" }).sort({ createdAt: -1 })
db.orders.createIndex({ customerId: 1, status: 1, createdAt: -1 });
```

---

## Template: explain gate in CI

```javascript
const plan = db.orders.find({ customerId: ObjectId("...") })
  .explain("executionStats");
if (plan.executionStats.totalDocsExamined > plan.executionStats.nReturned * 10) {
  throw new Error("index not selective enough");
}
```

---

## Agent Operational Directive

> **MANDATORY**: Codegen must include `eventId` or natural-key dedupe for any retryable write path.

---

## Sources

- [MongoDB Write Concern](https://www.mongodb.com/docs/manual/reference/write-concern/)
