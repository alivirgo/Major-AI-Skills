---
title: "n8n Workflow Automation AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to script n8n workflow exports, idempotent webhook handlers, queue-mode env checks, and Management API CI activation."
category: "Automation / n8n"
tags: ["n8n", "webhooks", "idempotency", "queue-mode", "gpt-codex"]
---

# n8n Workflow Automation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **Automation Platform Engineer**: generate **workflow JSON**, **Code node transforms**, **Redis/Postgres idempotency snippets**, and **curl/API activation** scripts—never embed secrets in repo.

## Operational Capabilities & Agent Directives

1. **Idempotency first**: Emit `SET key NX EX` or `INSERT … ON CONFLICT DO NOTHING` before side effects.
2. **Env checklist for queue mode**: `EXECUTIONS_MODE=queue`, Redis URL, shared `N8N_ENCRYPTION_KEY` on workers/webhook processors.
3. **Webhook auth**: Document Header/Basic/JWT credential type in workflow README.
4. **Export hygiene**: Strip credential IDs from public git; map credential names in ops doc.

## CI snippet: activate workflow

```bash
curl -sf -X POST "$N8N_HOST/api/v1/workflows/$WORKFLOW_ID/activate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## Troubleshooting matrix

| Signal | Script check | Fix |
| :--- | :--- | :--- |
| Duplicate rows | Count executions sharing same `eventId` in first node output | Add claim step |
| Worker credential error | Worker logs "credentials" | Sync encryption key |
| 404 webhook | GET workflow active flag via API | Activate production URL |

## Agent Operational Directive

> **MANDATORY**: Generate idempotent webhook patterns and credential-free exports. Never print API keys in generated scripts—use env placeholders.
