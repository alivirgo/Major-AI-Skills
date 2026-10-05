---
name: clickhouse
description: "Design ClickHouse MergeTree ORDER BY and partitions; batch inserts; use projections and skip indexes; tune mutations, replication lag, and backups without treating it as OLTP."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["clickhouse", "olap", "mergetree", "partitions", "projections", "kafka-engine", "backpressure", "backup"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# ClickHouse OLAP AI Skill Guide

## Overview & Engine Architecture

ClickHouse is a **columnar OLAP** DBMS: data lives in **parts** merged in the background; **ORDER BY** (primary key order) enables sparse indexing—not a traditional PK uniqueness guarantee. **PARTITION BY** prunes scans; tiny inserts create **too many parts** (merge storms). Replication uses ZooKeeper/ClickHouse Keeper; Kafka engine tables buffer ingest.

```
Batch inserts / Kafka engine / S3 insert
    -> MergeTree parts on disk
        -> background merges
        -> SELECT with partition + primary-key pruning
        -> optional projections / materialized views
```

---

## When to use / when not to

**Use when**

- High-volume event/analytics, append-heavy facts, sub-second aggregations over billions of rows
- Denormalized wide tables and pre-aggregated rollups (MVs)

**Do not use when**

- Frequent row-level updates/deletes are core (`@postgresql`)
- You need multi-row transactional OLTP
- Someone wants single-row INSERT loops from app servers—redesign to batches

---

## Operational Capabilities & Agent Directives

1. **Schema**: `ORDER BY` matches filter + group keys; **partition by time** (month/week), never high-cardinality IDs alone.
2. **Ingest backpressure**: Insert batches (thousands–millions of rows); async_insert/buffer tables where appropriate; monitor `parts_to_merge` and `Too many parts`.
3. **Indexes**: Data skipping indexes and **projections** for alternate sort paths—measure with `EXPLAIN indexes = 1`.
4. **Mutations**: `ALTER UPDATE/DELETE` are heavy—prefer append-only + `ReplacingMergeTree`/`CollapsingMergeTree` patterns; use `FINAL` sparingly.
5. **Auth/TLS**: RBAC users with row policies in multi-tenant setups; TLS between clients and cluster.
6. **Backup/restore**: `BACKUP`/`RESTORE` (version-dependent) or freeze + object storage; restore to **new** tables/clusters first; verify parts on all replicas.
7. **Exactly-once myth**: Kafka engine + MV pipelines are at-least-once; dedupe with version columns or downstream idempotent sinks.

---

## Production examples

### MergeTree table

```sql
CREATE TABLE events.page_views
(
  event_date Date,
  event_time DateTime,
  user_id UInt64,
  path LowCardinality(String),
  duration_ms UInt32
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/page_views', '{replica}')
PARTITION BY toYYYYMM(event_date)
ORDER BY (path, user_id, event_time)
TTL event_date + INTERVAL 180 DAY;

INSERT INTO events.page_views
SELECT * FROM input('event_date Date, event_time DateTime, user_id UInt64, path String, duration_ms UInt32')
FORMAT Parquet;
```

### Query with pruning check

```sql
EXPLAIN indexes = 1
SELECT path, count() AS views, avg(duration_ms)
FROM events.page_views
WHERE event_date >= today() - 7 AND path = '/pricing'
GROUP BY path;
```

### Batch insert anti-pattern (forbidden in prod)

```sql
-- DO NOT: millions of single-row INSERTs from app loops
INSERT INTO events.page_views VALUES (...);
```

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| `Too many parts` | Tiny inserts / bad partition key | Batch; async_insert; fix PARTITION BY |
| Full table scan | ORDER BY mismatch | Reorder keys; add projection |
| Memory limit exceeded | Huge GROUP BY cardinality | Preaggregate; `approx_*`; limit dimensions |
| Replication lag | Large parts / network | Check system.replicas; disk |
| Mutation stuck | Mass UPDATE | Redesign append-only; cancel mutation |
| Duplicate rows in ReplacingMergeTree | Expected without FINAL | Query with `argMax` pattern |

---

## Best practices

- `LowCardinality(String)` for enums; sensible codecs (`Delta`, `ZSTD`).
- Materialized views for dashboard rollups; version MV definitions in git.
- Quotas + `max_execution_time` for ad-hoc SQL users.
- Monitor merge rate, disk free, ZooKeeper/Keeper health.

---

## Limitations

- SQL dialect differs from Postgres—test migrations.
- Lightweight deletes (experimental features) vary by version.
- Not a replacement for interactive BI governance (`@snowflake` features differ).

---

## Related skills

- `@duckdb` — local OLAP on files
- `@kafka` — ingest into Kafka engine tables
- `@dbt` — ClickHouse adapter models

---

## Agent Operational Directive

> **MANDATORY**: Reject single-row insert loops for high-volume paths. Always pair ORDER BY and PARTITION BY with documented query patterns. Treat ReplacingMergeTree dedupe as merge-time, not transactional exactly-once.

---

## Source anchors (research)

- [ClickHouse MergeTree engine](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree)
- [ClickHouse INSERT best practices](https://clickhouse.com/docs/en/guides/inserting-data)
- [Too many parts troubleshooting](https://clickhouse.com/docs/en/guides/troubleshooting#too-many-parts)
