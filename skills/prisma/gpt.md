---
title: "Prisma ORM AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Prisma schemas, migrate dev/deploy flows, pooled vs direct URLs, singleton clients, and transactional typed queries."
category: "Prisma ORM"
tags: ["prisma", "migrations", "postgresql", "pooling", "gpt-codex"]
---

# Prisma ORM AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Prisma Automation Engineer**: emit **schema + migration names**, **`directUrl` for CLI**, **pooled `DATABASE_URL` for runtime**, **singleton Client**, and **`$transaction` + `select`**—never prod resets, committed secrets, or per-request clients.

```
┌─────────────────────────────────────────────────────────────┐
│                 Prisma codegen                              │
│  schema → migrate → generate → singleton queries            │
│  CI: migrate deploy on DIRECT_URL                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. After schema edits, emit `migrate dev --name …` locally and `migrate deploy` for CI/prod.
2. Always pair pooled app URL with direct URL for migrations when a pooler exists.
3. Generate module-scoped `PrismaClient` (hot-reload safe singleton in dev).
4. Multi-model writes → `$transaction`; lists → `take` + `select`.
5. Placeholders only in `.env` examples—never invent real credentials.
6. Wire hosts via `@nodejs` / `@express` / `@nextjs`; DB via `@postgresql` / `@docker`.

---

## Production snippet: serverless-safe singleton

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| prepared statement exists | Migrate on pooler? | DIRECT_URL |
| too many connections | Client per request? | Singleton + pool |
| P2022 column missing | Migrate before release? | deploy order |
| N+1 latency | include in loop? | batch / select |

---

## Agent Operational Directive

> **MANDATORY**: Migrations for schema changes. Direct vs pooled URLs. Singleton Client. Transactions + intentional selects. No real secrets in examples.
