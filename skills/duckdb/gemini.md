---
title: "DuckDB AI Skill Guide (Gemini)"
description: "Gemini DuckDB diagnostics: EXPLAIN ANALYZE plans, schema drift across Parquet files, and OOM triage."
category: "Scientific / Analytics"
tags: ["duckdb", "explain", "gemini"]
---

# DuckDB AI Skill Guide (Gemini)

## Directives

1. Compare `EXPLAIN ANALYZE` row counts vs expected samples.
2. For UNION errors, list conflicting column types across files.
3. Distinguish **lock** issues from **memory** issues in error text.

---

## Agent Operational Directive

> **MANDATORY**: Recommend warehouse scale-up only after filter/projection fixes are ruled out.

---

## Sources

- [DuckDB EXPLAIN](https://duckdb.org/docs/dev/profiling)
