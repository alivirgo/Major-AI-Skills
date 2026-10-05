---
title: "DuckDB AI Skill Guide (GPT & Codex)"
description: "GPT/Codex DuckDB scripts: read_parquet pipelines, COPY exports, and CI resource pragmas."
category: "Scientific / Analytics"
tags: ["duckdb", "parquet", "gpt-codex"]
---

# DuckDB AI Skill Guide (GPT & Codex)

## Directives

1. Start scripts with optional `PRAGMA memory_limit` and `threads`.
2. Use parameterized paths; load secrets from environment for httpfs.
3. Prefer `CREATE VIEW` SQL files over embedding large logic in Python strings when reused.

---

## Template

```python
import duckdb
import os

con = duckdb.connect(database=":memory:")
con.execute("PRAGMA memory_limit='4GB'")
con.execute("INSTALL httpfs; LOAD httpfs;")
con.execute(f"SET s3_region='{os.environ['AWS_REGION']}'")
print(con.execute("SELECT count(*) FROM read_parquet('s3://bucket/path/*.parquet')").fetchone())
```

---

## Agent Operational Directive

> **MANDATORY**: CI DuckDB jobs must declare input path globs and expected row-count assertions.

---

## Sources

- [DuckDB Parquet](https://duckdb.org/docs/data/parquet/overview)
