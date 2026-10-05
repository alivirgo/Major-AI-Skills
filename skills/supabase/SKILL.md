---
name: supabase
description: "Build Supabase apps with migration-first SQL, RLS policies, auth.uid() performance, SSR cookie clients vs service role, Edge Functions, and JWT troubleshooting. Use for Postgres-backed products with client-side data access under RLS."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["supabase", "postgres", "rls", "edge-functions", "auth", "jwt", "cli", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Supabase Postgres Platform AI Skill Guide (Claude)

## Overview & Engine Architecture

Supabase centers on **PostgreSQL** with **PostgREST** auto-API, **GoTrue Auth** (JWT sessions), **Storage**, **Realtime**, and **Edge Functions** (Deno). **Security is RLS**, not hiding the anon/publishable key. **Service role / secret keys** bypass RLS only on the server—and only when no user JWT overrides the Authorization header.

Claude operates as a Principal Backend Platform Engineer: **RLS-by-default**, **policy performance**, **SSR client separation**, and **CLI migrations**.

```
Client (anon/publishable key + user JWT)
  → PostgREST → Postgres (RLS enforced)

Server (secret/service role, no user session on same client)
  → admin tasks / webhooks / batch jobs
```

---

## When to use / when not to

**Use when**

- Postgres + auth + storage with client-direct queries under strict RLS.
- Local dev parity via `supabase start` and SQL migrations.

**Do not use when**

- Every query should go through a custom BFF with no client DB access—RLS still helps but client SDK may be unnecessary.
- You need complex graph queries without RPC/views—design SQL carefully.

---

## Operational Capabilities & Agent Directives

1. **Enable RLS** on every user-data table; explicit policies for `select/insert/update/delete`.
2. **Never ship `service_role` or secret keys** to browsers or mobile binaries.
3. **Separate clients**:
   - Browser/SSR user client: anon/publishable + session cookies.
   - Server admin client: secret key, **no** shared cookie session from SSR helper on same instance.
4. **Policy performance**: Prefer `(select auth.uid()) = user_id` over bare `auth.uid() = user_id` per row re-eval (Supabase RLS guide).
5. **Migrations first**: `supabase/migrations/*.sql`; avoid prod dashboard-only schema drift.
6. **Debug RLS on live API**, not SQL Editor—`auth.uid()` is NULL in editor context.
7. **JWT issues (2025–2026)**: If `getUser()` works but REST returns 42501 with NULL `auth.uid()`, decode Authorization on failing request—verify user access token (not apikey) and signing key alignment (see GitHub #46946, #43066).

---

## Migration + policies

```sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
```

Client (browser—anon key only):

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## Service role gotchas

| Mistake | Symptom | Fix |
| --- | --- | --- |
| SSR `@supabase/ssr` client + service key for "admin" | User session overrides Authorization → RLS applies | Separate `createClient(url, secretKey)` without cookies |
| `signUp` on service client | Returns session; key behaves like user | Use `auth.admin.createUser` for provisioning |
| Policy `service_role` in USING | Meaningless | Service role bypasses policies entirely |
| Secret key + user Bearer together | RLS as user, not bypass | Strip user token for admin ops |

---

## Technical Troubleshooting Matrix

| Issue | Root cause | Fix |
| :--- | :--- | :--- |
| **Empty results, no error** | RLS filters all rows | Policy for role; check `auth.uid()` |
| **42501 on insert** | `WITH CHECK` fails or NULL uid | JWT on request; policy match |
| **permission denied** | RLS on but no policy / revoked grant | Add policy; review grants |
| **Migration drift** | Dashboard edits | Pull/migrate; `db push` from git |
| **Slow lists** | RLS + missing index | Index filter columns |

---

## Best practices

- Index columns used in policies (`user_id`, `tenant_id`).
- Use typed codegen when available.
- Storage policies mirror table RLS patterns.
- Edge Functions: verify JWT at gateway; secrets in env.
- Webhooks (`@stripe`): use server client + service role only after signature verify.

---

## Limitations

- PostgREST exposes schema you grant—RLS must match product intent.
- Realtime payloads still respect RLS.
- Complex auth flows may need custom RPC (`security definer` reviewed carefully).

---

## Related skills

- `@postgresql` — SQL design and indexes
- `@nextjs` — cookie-based Supabase SSR
- `@stripe` — server webhooks updating entitlements
- `@supabase-rls` — deep RLS-only pass (if installed)

---

## Agent Operational Directive

> **MANDATORY**: Enable RLS on user-owned tables with explicit policies. Keep secret/service keys server-side only. Never debug RLS only in SQL Editor—reproduce on live REST with decoded JWT. Manage schema via migrations, not one-off prod clicks.

---

## Sources

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Service role troubleshooting](https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z)
- GitHub: [#46946 auth.uid NULL live REST](https://github.com/supabase/supabase/issues/46946), [#43066 JWT claims](https://github.com/supabase/supabase/issues/43066)
