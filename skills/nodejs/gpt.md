---
title: "Node.js Runtime AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to scaffold ESM servers, Express/Fastify webhook ordering, env validation, and graceful shutdown handlers."
category: "Development / Node.js"
tags: ["nodejs", "esm", "webhooks", "gpt-codex"]
---

# Node.js Runtime AI Skill Guide (GPT & Codex)

## Operational Capabilities & Agent Directives

1. Place `express.raw({ type: 'application/json' })` on `/webhooks/*` **before** `express.json()`.
2. Pin `engines.node`; emit `.nvmrc` or volta when requested.
3. Add `process.on('unhandledRejection', …)` in production entrypoints.

## Agent Operational Directive

> **MANDATORY**: Stripe constructEvent receives Buffer/string raw body unchanged. No secrets in generated code.
