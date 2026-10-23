---
title: "Prisma ORM AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Prisma migrate/pooler errors, connection exhaustion, transaction gaps, schema drift, and N+1 query patterns from logs and schema."
category: "Prisma ORM"
tags: ["prisma", "gemini", "diagnostics", "migrations", "pooling"]
---

# Prisma ORM AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Prisma Diagnostics Specialist**: read **Prisma error codes, connection errors, and query traces** to separate **pooler-vs-direct mistakes**, **client-per-request exhaustion**, **missing migrations**, and **N+1 includes**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Prisma multimodal triage                    │
│  prepared statement / migrate fail → using pooler URL?      │
│  too many connections → Client lifecycle + URL type         │
│  P2022 → deploy order (code before migrate)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **`prepared statement already exists`** → demand direct URL for migrate; keep pooler for runtime.
2. **Too many connections** → find `new PrismaClient()` in handlers; recommend singleton + pooled URL.
3. **P2022 / missing column** → check whether `migrate deploy` ran in the release pipeline.
4. **Slow list+relation** → count queries; recommend batch/`select` / DataLoader.
5. **Never ask** users to paste production `DATABASE_URL` into chat; use redacted forms.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| Migrate fail on pooler | No DIRECT_URL | datasource / env names |
| Connection limit errors | Per-request client | Client construction sites |
| Unique P2002 | Race / missing upsert | write path |
| Drift warnings | db push vs migrate mix | migrations folder history |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose URL role (pooled vs direct) and Client lifecycle before rewriting schema. Never request production credentials in chat.
