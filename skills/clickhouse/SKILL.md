---
name: clickhouse
description: "Operational skill for ClickHouse: MergeTree tables, partitions, projections, ingest, and analytical SQL performance."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["clickhouse", "olap", "mergetree", "analytics", "sql", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# ClickHouse OLAP AI Skill Guide

## Overview & Engine Architecture

ClickHouse is a columnar OLAP DBMS optimized for high-ingest analytics. MergeTree-family engines store data sorted by primary key; partitions prune scans; background merges compact parts. Agents design ORDER BY for filter/range patterns, avoid finalizing huge `SELECT *`, and prefer batch inserts over tiny single-row writes.

```
Insert batches -> parts on disk
      -> MergeTree merges
      -> SELECT with partition + primary-key pruning
```

## When to use this skill

- Event/metrics analytics at high cardinality and volume
- Real-time-ish dashboards over wide denormalized facts
- Replacing slower row-store aggregations for append-heavy data

## Operational directives

1. Choose `ORDER BY` for the most selective filters and ranges you actually query.
2. Partition by time (e.g. month) - not by high-cardinality ids.
3. Insert in large batches; tiny inserts create part storms.
4. Use `FINAL` sparingly (ReplacingMergeTree) - prefer dedupe in ETL or `argMax`.
5. Set quotas/timeouts for ad-hoc users on shared clusters.

## Table + query example

```sql
CREATE TABLE events.page_views
(
  event_date Date,
  event_time DateTime,
  user_id UInt64,
  path LowCardinality(String),
  duration_ms UInt32
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (path, user_id, event_time)
TTL event_date + INTERVAL 180 DAY;

INSERT INTO events.page_views
SELECT * FROM input('event_date Date, event_time DateTime, user_id UInt64, path String, duration_ms UInt32')
FORMAT Parquet;

SELECT path, count() AS views, avg(duration_ms)
FROM events.page_views
WHERE event_date >= today() - 7 AND path = '/pricing'
GROUP BY path;
```

## Useful introspection

```sql
SHOW CREATE TABLE events.page_views;
SELECT * FROM system.query_log ORDER BY event_time DESC LIMIT 20;
EXPLAIN indexes = 1
SELECT count() FROM events.page_views WHERE path = '/pricing';
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Too many parts | small inserts / bad partitions | batch; fix PARTITION BY |
| Full scan | ORDER BY mismatch | rewrite order; projections |
| Memory limit | huge GROUP BY | approx functions; limit cardinality |
| Mutation lag | heavy ALTER UPDATE/DELETE | redesign for append; lightweight deletes carefully |

## Best practices

- Use `LowCardinality` for low-entropy strings.
- Materialized views for rollups when dashboards repeat the same aggregates.
- Keep dictionaries for dimension lookups when appropriate.
- Monitor merges, replication queue, and disk in `@docker`/K8s deployments.

## Limitations

- Not a full OLTP replacement; point updates are not its strength.
- Replication/sharding topologies need dedicated ops design.
- SQL dialect quirks differ from Postgres - test migrations carefully.

## Related skills

- `@duckdb` - local OLAP without a server
- `@dbt` - ClickHouse models via adapters
- `@kafka`-adjacent pipelines often feed ClickHouse (use project Kafka skill if present)
