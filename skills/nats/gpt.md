---
title: "NATS AI Skill Guide (GPT & Codex)"
description: "GPT/Codex JetStream stream/consumer codegen with Nats-Msg-Id, pull fetch loops, and ack/nak handling."
category: "DevOps / Messaging"
tags: ["nats", "jetstream", "pull-consumer", "gpt-codex"]
---

# NATS AI Skill Guide (GPT & Codex)

## Directives

1. Streams declare `duplicate_window` when publishers retry.
2. Consumers: durable pull, `AckExplicit`, `MaxAckPending` documented vs batch size.
3. Handlers call `ack()` only after DB/API success; `nak(delay)` on transient errors.

---

## Agent Operational Directive

> **MANDATORY**: Never set `AckNone` on financial/inventory consumers without explicit user acceptance of loss.

---

## Sources

- [NATS pull consumers](https://docs.nats.io/learn/jetstream/pull-consumers)
