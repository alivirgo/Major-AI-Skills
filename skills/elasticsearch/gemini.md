---
title: "Elasticsearch AI Skill Guide (Gemini)"
description: "Gemini Elasticsearch diagnostics: cluster health colors, shard allocation explain, and heap/circuit breaker triage."
category: "DevOps / Search"
tags: ["elasticsearch", "cluster-health", "gemini"]
---

# Elasticsearch AI Skill Guide (Gemini)

## Directives

1. Map **red/yellow/green** to shard allocation actions before suggesting mapping changes.
2. Read `_cluster/health`, `_cat/shards`, and `/_nodes/stats/jvm`.
3. Distinguish **ingest backpressure** (429) from **query** circuit breaks.

---

## Agent Operational Directive

> **MANDATORY**: For missing documents, check refresh/NRT and alias write index before reindex recommendations.

---

## Sources

- [Elasticsearch circuit breakers](https://www.elastic.co/guide/en/elasticsearch/reference/current/circuit-breaker.html)
