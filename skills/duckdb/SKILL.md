---
name: duckdb
description: "Run embedded OLAP SQL on Parquet/CSV locally; configure memory and thread limits; attach remote files safely; export with COPY; avoid multi-writer locks and treating DuckDB as a production server database."
category: scientific
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["duckdb", "sql", "parquet", "olap", "embedded", "httpfs", "memory-limit", "analytics"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# DuckDB Analytical SQL AI Skill Guide

## Overview & Engine Architecture

DuckDB is an **embedded** columnar OLAP engine: runs in-process (Python/R/JDBC/CLI), vectorized execution, reads **Parquet/CSV/JSON** directly without a server. Ideal for notebooks, CI data checks, and local lake queries—not a substitute for fleet-scale warehouse serving.

```
Parquet/CSV/S3 (httpfs)
    -> DuckDB in-process
        -> SQL (join/window/aggregate)
        -> Arrow/DataFrame / COPY export
Optional .duckdb file for persistent views
```

---

## When to use / when not to

**Use when**

- Ad-hoc SQL on local or lake files; replacing heavy pandas groupbys
- CI validation of datasets (row counts, schema contracts)
- Prototyping transforms before `@dbt` on Snowflake/BigQuery

**Do not use when**

- Many concurrent writers or multi-tenant serving layer needed (`@postgresql`, `@snowflake`)
- Data exceeds single-node RAM without spill tuning—consider `@spark` or warehouse
- Untrusted remote URLs without reviewing `httpfs` credential scope

---

## Operational Capabilities & Agent Directives

1. **Connection safety**: One writer per `.duckdb` file; use `read_only` connections for parallel readers; avoid NFS locking surprises.
2. **Remote access**: `INSTALL httpfs; LOAD httpfs;` only when needed; secrets via env vars (`AWS_*`), never committed keys.
3. **Performance**: Project columns early; predicate pushdown on `read_parquet`; use `EXPLAIN ANALYZE` on slow queries.
4. **Resource limits**: `PRAGMA threads=N; PRAGMA memory_limit='4GB';` on shared CI runners to prevent OOM kills.
5. **Schema drift**: `union_by_name=true` on multi-file Parquet; explicit casts in views for stable contracts.
6. **Backup/migration**: `.duckdb` is a file—copy while no writer or use export; Parquet lake remains source of truth for immutable pipelines.
7. **Exactly-once myth**: DuckDB does not coordinate distributed exactly-once; downstream pipelines still need idempotent loads.

---

## Production examples

### Parquet analytics

```sql
INSTALL httpfs; LOAD httpfs;

SELECT
  customer_id,
  date_trunc('month', created_at) AS month,
  sum(amount) AS revenue,
  count(*) AS orders
FROM read_parquet('data/orders/*.parquet', union_by_name=true)
WHERE created_at >= DATE '2025-01-01'
GROUP BY 1, 2
ORDER BY revenue DESC;
```

### Persistent views

```sql
ATTACH 'analytics.duckdb' AS meta;
CREATE OR REPLACE VIEW meta.orders AS
SELECT * FROM read_parquet('data/orders/*.parquet');
```

### Export

```sql
COPY (
  SELECT customer_id, sum(amount) AS revenue
  FROM read_parquet('data/orders/*.parquet')
  GROUP BY 1
) TO 'out/revenue.parquet' (FORMAT PARQUET);
```

### Python

```python
import duckdb

con = duckdb.connect("analytics.duckdb", read_only=False)
con.execute("PRAGMA memory_limit='4GB'")
df = con.execute("SELECT count(*) FROM read_parquet('data/orders/*.parquet')").fetchdf()
```

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| `Binder Error` on UNION files | Schema drift | `union_by_name`; cast in view |
| OOM on join | Large hash join | Filter first; raise memory_limit; sample |
| Database locked | Second writer | Single writer; read_only readers |
| Slow full scan | Reading all columns | Select subset; partition filters on paths |
| S3 403 | Missing creds/role | Fix env; scope IAM read-only |
| Wrong row counts vs prod | Stale local files | Pin snapshot paths; checksum inputs |

---

## Best practices

- Keep raw lake files immutable; version curated `.duckdb` views in git as SQL scripts, not binary blobs when possible.
- Hand off slim results to `@polars` / `@pandas` for visualization only.
- Use DuckDB for **correctness checks** before warehouse loads.

---

## Limitations

- Single-node; no built-in HA serving tier.
- Extension availability differs in air-gapped CI images.
- Not a replacement for row-level security products unless implemented in app layer.

---

## Related skills

- `@polars` — DataFrame engine on same files
- `@snowflake` — promote vetted SQL to warehouse
- `@dbt` — versioned transform layer

---

## Agent Operational Directive

> **MANDATORY**: Set memory/thread pragmas in CI scripts. Never embed cloud secrets in SQL files. Do not propose DuckDB as the production OLTP or multi-tenant serving database without explicit requirements.

---

## Source anchors (research)

- [DuckDB SQL introduction](https://duckdb.org/docs/sql/introduction)
- [Reading multiple Parquet files](https://duckdb.org/docs/data/parquet/overview)
- [Pragmas (memory, threads)](https://duckdb.org/docs/configuration/pragmas)
