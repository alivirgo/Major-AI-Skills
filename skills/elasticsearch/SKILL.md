---
name: elasticsearch
description: "Operational skill for agents to operate Elasticsearch - index mappings, ILM, queries, clusters health, ingest pipelines, and safe reindex patterns."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["elasticsearch", "elastic", "search", "ilm", "opensearch", "indexing"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Elasticsearch Search Cluster AI Skill Guide

## Overview

Elasticsearch is a distributed search and analytics engine. Documents live in **indices** sharded across nodes; **mappings** define field types; queries use the JSON DSL. Agents should treat mapping changes as high-risk (many require reindex), watch cluster health (`green`/`yellow`/`red`), and use Index Lifecycle Management (ILM) for time-series log indices.

```
Ingest (Beats/Logstash/OTel/app)
        |
        v
Coordinating + data nodes
        |
        +--> primary shards / replicas
        +--> ILM hot -> warm -> delete
```

Note: OpenSearch forks share many APIs; confirm product-specific differences before copying settings.

## When to use

- Designing index mappings and analyzers for search features
- Debugging slow queries, mapping explosions, or rejected bulk requests
- Setting ILM policies for logs/metrics indices
- Reindexing safely after mapping fixes

## Operational directives

1. Check `GET _cluster/health` and node disk watermarks before heavy indexing.
2. Define explicit mappings for production fields - avoid dynamic mapping blowups.
3. Use aliases (`logs-write`, `logs-read`) so reindex/cutover does not break clients.
4. Prefer bulk API with backoff; respect `429` / circuit breakers.
5. Never delete indices without confirming alias targets and retention policy.

## Concrete examples

### Index + mapping

```http
PUT /products-v1
{
  "settings": { "number_of_shards": 1, "number_of_replicas": 1 },
  "mappings": {
    "properties": {
      "name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "price": { "type": "scaled_float", "scaling_factor": 100 },
      "created_at": { "type": "date" }
    }
  }
}
```

### Alias cutover after reindex

```http
POST /_reindex
{
  "source": { "index": "products-v1" },
  "dest": { "index": "products-v2" }
}

POST /_aliases
{
  "actions": [
    { "remove": { "index": "products-v1", "alias": "products" } },
    { "add": { "index": "products-v2", "alias": "products" } }
  ]
}
```

### Query and health CLI

```bash
curl -s localhost:9200/_cluster/health?pretty
curl -s localhost:9200/_cat/indices?v
curl -s localhost:9200/products/_search -H 'Content-Type: application/json' -d '{
  "query": { "match": { "name": "wireless headphones" } }
}'
```

### ILM sketch

```json
{
  "policy": {
    "phases": {
      "hot": { "actions": { "rollover": { "max_primary_shard_size": "50gb", "max_age": "7d" } } },
      "delete": { "min_age": "30d", "actions": { "delete": {} } }
    }
  }
}
```

## Cluster symptom table

| Health / symptom | Likely cause | Action |
| :--- | :--- | :--- |
| yellow | Unassigned replicas | Check node count / replica settings |
| red | Missing primary | Urgent: shard recovery / restore |
| mapping explosion | Too many dynamic fields | Flatten; disable dynamic; reindex |
| circuit_breaking_exception | Heap pressure | Reduce query size; scale RAM; fix aggs |

## Best practices

1. Cap fields; use `keyword` for exact match/sort/agg, `text` for full-text.
2. Separate hot ingest indices from long-term searchable snapshots if needed.
3. Version index templates; test analyzers with `_analyze`.
4. Authenticate (Elasticsearch security / proxy) - never expose anonymous `:9200` publicly.

## Limitations

- Not a relational DB - joins are limited; denormalize thoughtfully.
- Relevance tuning is iterative; agents should propose experiments, not claim perfect ranking.
- Major version upgrades need compatibility checks and often rolling upgrade plans.

## Related skills

- `opentelemetry` - ship traces/logs that may land in Elastic stacks
- `docker` - local single-node Elastic for dev
- `nginx-hardening` - reverse proxy TLS in front of Kibana/ES
- `trivy` - scan Elastic Docker images
