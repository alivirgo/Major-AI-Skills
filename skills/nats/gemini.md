---
title: "NATS AI Skill Guide (Gemini)"
description: "Gemini NATS/JetStream triage: consumer info, redelivery stats, and slow-consumer vs AckWait confusion."
category: "DevOps / Messaging"
tags: ["nats", "jetstream", "gemini"]
---

# NATS AI Skill Guide (Gemini)

## Directives

1. Ask for `nats stream info` and `nats consumer info` output before tuning retention.
2. Separate **publish dedupe** from **consumer redelivery** causes.
3. Flag batch pull sizes that exceed `MaxAckPending` or worker concurrency.

---

## Agent Operational Directive

> **MANDATORY**: State delivery semantics as at-least-once unless user implements idempotent side effects and ack discipline.

---

## Sources

- [nats-server #6628 AckWait vs duplicate_window](https://github.com/nats-io/nats-server/discussions/6628)
