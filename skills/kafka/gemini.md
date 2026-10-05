---
title: "Kafka AI Skill Guide (Gemini)"
description: "Gemini Kafka lag and rebalance diagnostics from consumer group describe output and processing timelines."
category: "DevOps / Streaming"
tags: ["kafka", "lag", "rebalance", "gemini"]
---

# Kafka AI Skill Guide (Gemini)

## Directives

1. Read `LAG`, `CURRENT-OFFSET`, `LOG-END-OFFSET` per partition; flag single-partition lag (hot key).
2. Map duplicates to rebalance windows or commit-before-process antipatterns.
3. Challenge EOS claims unless txn outbox or idempotent sink is documented.

---

## Agent Operational Directive

> **MANDATORY**: Report delivery semantics explicitly (at-least-once vs transactional) in every consumer design review.

---

## Sources

- [kafka-node #548](https://github.com/SOHU-Co/kafka-node/issues/548)
