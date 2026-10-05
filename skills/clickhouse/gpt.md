---
title: "ClickHouse AI Skill Guide (GPT & Codex)"
description: "GPT/Codex ClickHouse DDL and batch ingest generators with EXPLAIN gates and part-count guards."
category: "DevOps / OLAP"
tags: ["clickhouse", "mergetree", "gpt-codex"]
---

# ClickHouse AI Skill Guide (GPT & Codex)

## Directives

1. DDL must include `PARTITION BY`, `ORDER BY`, and engine clause appropriate to replication.
2. Ingest code must batch ≥1000 rows or use file/Parquet loads.
3. Emit `EXPLAIN indexes = 1` checks for new dashboard queries in CI when feasible.

---

## Agent Operational Directive

> **MANDATORY**: Never generate ORM-style per-row INSERT loops for ClickHouse fact tables.

---

## Sources

- [ClickHouse inserting data](https://clickhouse.com/docs/en/guides/inserting-data)
