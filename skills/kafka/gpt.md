---
title: "Kafka AI Skill Guide (GPT & Codex)"
description: "GPT/Codex Kafka client configs, consumer commit helpers, and idempotent sink snippets with lag check scripts."
category: "DevOps / Streaming"
tags: ["kafka", "consumer-groups", "idempotent", "gpt-codex"]
---

# Kafka AI Skill Guide (GPT & Codex)

## Directives

1. Emit producer configs with `acks=all` and `enable.idempotence=true` unless user opts out in writing.
2. Consumer code: `enable.auto.commit=false`; commit after successful batch processing.
3. Parallel processing within partition: track contiguous offsets before commit (gap-filling committer).
4. Include DLQ publish on terminal failure with original offset metadata.

---

## Template: gap-aware commit (concept)

```python
# pending[partition][offset] = True when processed
# commit offset = highest contiguous processed offset + 1
```

---

## Agent Operational Directive

> **MANDATORY**: Codgen consumers must name the idempotency key column or header used for dedupe.

---

## Sources

- [Confluent exactly-once blog](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
