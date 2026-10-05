---
title: "n8n Workflow Automation AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to read n8n execution traces, diagnose expression paths, webhook auth failures, and duplicate delivery patterns."
category: "Automation / n8n"
tags: ["n8n", "executions", "webhooks", "diagnostics", "gemini"]
---

# n8n Workflow Automation AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an **Automation Diagnostics Specialist**: interpret **execution graphs**, **pinned item JSON**, and **retry timelines** to separate expression bugs from at-least-once duplicates.

## Operational Capabilities & Agent Directives

1. **Trace reading**: Identify first node where item count fans out or drops to zero.
2. **Duplicate signature**: Same external `event_id` in multiple executions within retry window → idempotency gap.
3. **Auth failures**: Compare Webhook node auth type vs caller headers (redact secrets in reports).
4. **Queue latency**: Note delay between Webhook receive and worker start—set expectations for sync Respond nodes.

## User-facing report template

| Execution | event_id | Outcome | Stage failed | Next lever |
| :--- | :--- | :--- | :--- | :--- |
| 8842 | evt_abc | duplicate CRM | no dedupe | Add claim node |
| 8843 | evt_def | 401 | Header auth | Fix credential |

## Agent Operational Directive

> **MANDATORY**: Classify failures as auth, expression, inactive workflow, or retry duplicate before recommending new nodes. Never suggest disabling webhook auth for debugging.
