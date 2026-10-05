---
title: "Elasticsearch AI Skill Guide (GPT & Codex)"
description: "GPT/Codex Elasticsearch automation: bulk batching, alias swap scripts, and ILM policy JSON with backoff."
category: "DevOps / Search"
tags: ["elasticsearch", "bulk", "ilm", "gpt-codex"]
---

# Elasticsearch AI Skill Guide (GPT & Codex)

## Directives

1. Generate **alias-based** index names in client config, never versioned physical indices.
2. Bulk helpers: chunk by **5–15MB** or 500–5000 docs; retry 429 with jitter.
3. Mappings: `dynamic: strict` unless explicitly approved.
4. Reindex jobs: include `_reindex` slices + throttle (`requests_per_second`).

---

## Template: bulk with backoff (Python sketch)

```python
def bulk_with_backoff(es, actions, max_retries=8):
    delay = 1.0
    for attempt in range(max_retries):
        try:
            return helpers.bulk(es, actions, raise_on_error=True)
        except TransportError as e:
            if e.status_code != 429:
                raise
            time.sleep(delay + random.random())
            delay = min(delay * 2, 60)
    raise RuntimeError("bulk failed after retries")
```

---

## Agent Operational Directive

> **MANDATORY**: Codgen clients must target aliases and include snapshot/restore warnings in migration scripts.

---

## Sources

- [Elasticsearch reindex](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-reindex.html)
