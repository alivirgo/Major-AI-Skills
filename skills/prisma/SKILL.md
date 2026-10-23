---
name: prisma
description: "Operate Prisma schema, migrate dev/deploy, typed Client queries, transactions, and pooled vs direct DB URLs—avoiding serverless connection exhaustion and N+1 relation loads."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["prisma", "orm", "migrations", "postgresql", "typescript", "connection-pooling", "transactions"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Prisma ORM AI Skill Guide (Claude)

## Overview & Engine Architecture

Prisma maps a declarative **`schema.prisma`** to a generated **TypeScript Client**. **Migrate** evolves the database (SQL history in `prisma/migrations`); the Client provides type-safe queries. Agents treat the schema as source of truth, never hand-edit prod schema, use **`$transaction`** for multi-step writes, **`select`/`include` intentionally** to control cost, and split **pooled runtime URLs** from **direct URLs for migrate/admin**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Prisma schema → DB → Client                   │
│                                                             │
│  schema.prisma                                              │
│  ├── migrate dev (local) → migrations/ SQL                  │
│  ├── migrate deploy (CI/prod, direct URL)                   │
│  └── prisma generate → @prisma/client                       │
│                                                             │
│  Runtime                                                    │
│  ├── singleton PrismaClient (module scope)                  │
│  ├── DATABASE_URL pooled (PgBouncer / Accelerate)           │
│  └── queries: select/include · $transaction · batch         │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Modeling Postgres (or supported DBs) with Prisma; writing typed queries and transactions.
- Creating/applying migrations safely across local → CI → prod.
- Debugging Client validation vs DB constraint errors, N+1 includes, or connection exhaustion.

**Do not use when**

- You need Postgres RLS policy design as the primary concern → `@postgresql` / `@supabase-rls` (Prisma can sit above).
- Schema-less document workflows or heavy analytic SQL are the product → raw SQL / other stores.
- Someone asks to commit production `DATABASE_URL`, run `migrate reset` on prod, or `db push` as the only prod workflow → refuse destructive shortcuts.

---

## Operational Capabilities & Agent Directives

1. **Schema change → migration**: local `prisma migrate dev --name …`; CI/prod **`prisma migrate deploy`** only—do not drift with manual SQL in prod.
2. Use **`DIRECT_URL` (or CLI datasource)** for migrate/studio/pull; use **pooled `DATABASE_URL`** for app traffic (PgBouncer transaction mode / provider pooler).
3. **One `PrismaClient` per process** (module singleton); in serverless, instantiate **outside** the handler so warm invokes reuse—pair with pooler; start from low `connection_limit` when needed.
4. Wrap multi-model writes in **`$transaction`** (interactive or batched).
5. Prefer **`select` / targeted `include`**; never `include` entire graphs inside loops—batch with `in` or loaders (`@graphql-apis` DataLoader).
6. Never commit `.env` with real credentials; use placeholders and secret stores.
7. After schema edits: `generate` + tests against a disposable DB; in CI consider `migrate diff` to detect drift.

---

## Production Example: schema, client, migrate URLs

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id    String @id @default(cuid())
  email String @unique
  items Item[]
}

model Item {
  id        String   @id @default(cuid())
  sku       String   @unique
  qty       Int      @default(0)
  createdAt DateTime @default(now())
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])

  @@index([ownerId, createdAt])
}
```

`.env` (local placeholders — never real prod secrets):

```bash
# App / Prisma Client (pooled)
DATABASE_URL="postgresql://app@localhost:6432/app?pgbouncer=true"
# Migrate / introspect / studio (direct)
DIRECT_URL="postgresql://app@localhost:5432/app"
```

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function createItem(ownerId: string, sku: string, qty: number) {
  return prisma.$transaction(async (tx) => {
    const owner = await tx.user.findUniqueOrThrow({ where: { id: ownerId } });
    return tx.item.create({
      data: { ownerId: owner.id, sku, qty },
      select: { id: true, sku: true, qty: true },
    });
  });
}

export async function listOwnerItems(ownerId: string) {
  return prisma.item.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, sku: true, qty: true, createdAt: true },
  });
}
```

Commands:

```bash
npx prisma init
npx prisma migrate dev --name add_items
npx prisma generate
npx prisma migrate deploy          # CI/prod, direct URL
npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --exit-code
npx prisma studio                  # local only
```

Host with `@nodejs` / `@express` / `@nextjs`; database with `@postgresql`; containers with `@docker` (run migrate as a release job, not from every serverless invoke).

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `prepared statement "s0" already exists` on migrate | Migrate through PgBouncer/pooler | Use `directUrl` / `DIRECT_URL` for CLI migrate |
| `Too many connections` | New client per request; direct URL under load; unbounded serverless concurrency | Singleton + pooled URL; cap concurrency; tune pool |
| Partial writes / inconsistent rows | Multi-step without `$transaction` | Interactive or batched transaction |
| Latency spike listing relations | N+1 `include` in loops | Batch `where: { id: { in } }`; select fields; DataLoader |
| P2022 / column missing | Deployed code ahead of migrations | Run `migrate deploy` before/with release |
| P2002 unique violation | App race or missing upsert | Upsert or handle conflict; align unique in schema |
| Serverless cold pool thrash | Client inside handler | Hoist client; connection_limit; Accelerate/pooler |
| Drift local vs prod | `db push` in one env, migrate in another | One migrate workflow everywhere for SQL DBs |

---

## Best Practices

1. Commit `prisma/migrations/**`; treat migrate history as production artifact.
2. Prefer migrate over `db push` for shared/staging/prod SQL databases (`db push` is prototyping).
3. Mirror important uniqueness/FKs at DB level (Prisma schema should match constraints).
4. Seed deterministic fixtures for tests; never `migrate reset` against shared DBs.
5. Log Prisma errors with request IDs; do not log connection strings.
6. For GraphQL resolvers, pair with `@graphql-apis` loaders to avoid per-field finds.

---

## Limitations

- Raw SQL still needed for complex reports, advisory locks, and some DDL edge cases.
- Multi-schema / exotic provider features vary; check current Prisma docs for the provider.
- MongoDB uses different push/deploy norms than SQL migrate.
- Accelerate/Pulse and managed pooling are optional platform pieces—document cost/limits separately.

---

## Related Skills

- `@typescript` / `@nodejs` — typed runtime hosting the Client
- `@postgresql` — engine-level Postgres, pooling, backups
- `@express` / `@nextjs` — common HTTP hosts
- `@docker` — DB/service Compose and release migrate jobs
- `@graphql-apis` — Prisma under GraphQL resolvers

---

## Agent Operational Directive

> **MANDATORY**: Schema changes ship as migrations. Use direct URL for migrate, pooled URL for runtime. Singleton Client; transactions for multi-write; intentional `select`/`include`. Never commit real `DATABASE_URL`s or reset production databases.

---

## Source anchors (research)

- [Prisma: deploy migrations (`migrate deploy`)](https://www.prisma.io/docs/orm/v6/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)
- [Prisma: PgBouncer + direct URL for migrate](https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/databases-connections/pgbouncer)
- [Prisma: database connections / serverless](https://www.prisma.io/docs/orm/v6/prisma-client/setup-and-configuration/databases-connections)
- [Prisma Postgres pooling: pooled vs direct](https://www.prisma.io/docs/postgres/database/connection-pooling)
