---
name: elasticsearch
description: "Design Elasticsearch mappings, aliases, and ILM; tune bulk ingest with backpressure; secure API auth; plan reindex cutovers and avoid mapping explosions, red shards, and restore index-name traps."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["elasticsearch", "opensearch", "search", "ilm", "reindex", "bulk", "mappings", "security", "backpressure"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Elasticsearch Search Cluster AI Skill Guide

## Overview & Engine Architecture

Elasticsearch is a distributed **search and analytics** engine: documents in **indices** (sharded, replicated), **mappings** define field types, queries use JSON DSL. Ingest is bulk-oriented; coordinators merge shard results. **Mapping changes are mostly immutable**—plan **reindex + alias swap**. OpenSearch shares many APIs; verify version-specific behavior.

```
Ingest (bulk / Beats / OTel)
    -> coordinating node
        -> primary/replica shards (Lucene segments)
        -> merge / refresh / flush
        -> ILM: hot -> warm -> cold -> delete
Visibility index (async) != transactional DB
```

---

## When to use / when not to

**Use when**

- Full-text search, faceted browse, log/metrics search at scale
- Time-series indices with ILM rollover and retention
- Aggregations over denormalized documents

**Do not use when**

- You need primary OLTP with row-level updates as the main pattern (`@postgresql`)
- Join-heavy relational models without denormalization
- Someone wants dynamic mapping on unbounded user keys in production—block or constrain

---

## Operational Capabilities & Agent Directives

1. **Connection/auth safety**: HTTPS + API keys or native security; never expose `:9200` anonymously on the public internet; rotate keys; use least-privilege roles per index pattern.
2. **Mappings**: Explicit `properties` for prod fields; disable or limit **dynamic** mapping; use `keyword` for filter/sort/agg, `text` for search (multi-fields when both needed).
3. **Aliases**: Clients read/write **`logs-write`** / **`logs-read`** aliases; reindex to `logs-v2`, atomic alias flip—never delete old index until verified.
4. **Backpressure**: Bulk with bounded batch bytes/docs; exponential backoff on `429` and `circuit_breaking_exception`; watch thread pools and indexing pressure.
5. **Index design**: Shard count is hard to change—start conservative; use ILM rollover on size/age; avoid oversharding small clusters.
6. **Backup/restore**: Snapshot repositories (S3/GCS); restore creates **new** indices—rename/alias carefully; snapshot restore is not a merge into live index names without downtime plan.
7. **Exactly-once myth**: Ingest pipelines may retry; use `_id` or external version for idempotent indexing; consumers of search results still see near-real-time delay (`refresh_interval`).

---

## Production examples

### Index template + alias

```http
PUT _index_template/products
{
  "index_patterns": ["products-*"],
  "template": {
    "settings": { "number_of_shards": 1, "number_of_replicas": 1 },
    "mappings": {
      "dynamic": "strict",
      "properties": {
        "name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
        "price": { "type": "scaled_float", "scaling_factor": 100 },
        "created_at": { "type": "date" }
      }
    }
  }
}

POST _aliases
{
  "actions": [
    { "add": { "index": "products-000001", "alias": "products-read" } },
    { "add": { "index": "products-000001", "alias": "products-write", "is_write_index": true } }
  ]
}
```

### Reindex cutover

```http
POST _reindex
{ "source": { "index": "products-000001" }, "dest": { "index": "products-000002" } }

POST _aliases
{
  "actions": [
    { "remove": { "index": "products-000001", "alias": "products-write" } },
    { "add": { "index": "products-000002", "alias": "products-write", "is_write_index": true } },
    { "add": { "index": "products-000002", "alias": "products-read" } }
  ]
}
```

### Bulk ingest (bounded)

```bash
curl -s -H 'Content-Type: application/x-ndjson' -XPOST localhost:9200/_bulk \
  --data-binary @bulk.ndjson
# On 429: reduce batch size, increase backoff, check disk watermarks
```

---

## Technical troubleshooting matrix

| Failure signature | Root cause | Diagnostic & fix |
| :--- | :--- | :--- |
| Cluster **red** | Primary shard missing | Shard allocation explain; restore snapshot |
| Cluster **yellow** | Unassigned replicas | Add nodes or reduce replica count |
| `circuit_breaking_exception` | Heap / fielddata / agg size | Reduce agg size; `docvalue_fields`; scale heap |
| Mapping explosion | Dynamic mapping on high-cardinality keys | Strict mapping; reindex |
| Bulk 429 storm | Indexing pressure / disk watermark | Backoff; ILM rollover; free disk |
| Search misses new docs | Refresh interval | `refresh=wait_for` for tests only; accept NRT |
| Restore overwrote wrong index | Restored snapshot to live name | Restore to new index + re-alias |

---

## Best practices

- Test analyzers with `_analyze` before shipping multilingual search.
- Use **data streams** + ILM for logs where version supports it.
- Monitor JVM heap, GC, indexing rate, merge throttling, disk watermarks.
- Cross-cluster search/replication: document lag and auth separately.

---

## Limitations

- Relevance tuning is iterative; agents propose experiments with metrics (nDCG, click-through), not magic weights.
- Major version upgrades need compatibility matrices and often reindex.
- Not a substitute for columnar OLAP at petabyte aggregations (`@clickhouse`).

---

## Related skills

- `@opentelemetry` — trace/log pipelines into Elastic stack
- `@kafka` — ingest buffer before indexing
- `@nginx-hardening` — TLS reverse proxy for Kibana/ES

---

## Agent Operational Directive

> **MANDATORY**: Production mapping changes require reindex + alias plan. Never delete indices without confirming alias targets and retention. Bulk ingest must include backoff on 429. Do not disable security for convenience.

---

## Source anchors (research)

- [Elasticsearch: Index lifecycle management](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html)
- [Elasticsearch: Reindex API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html)
- [Circuit breaker settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/circuit-breaker.html)
