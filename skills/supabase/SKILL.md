---
name: supabase
description: "Operational skill for Claude to automate Supabase via JS client, SQL migrations, RLS policies, Edge Functions, Auth, and CLI workflows."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["supabase", "postgres", "rls", "edge-functions", "auth", "cli", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Supabase Postgres Platform AI Skill Guide (Claude)

## Overview & Engine Architecture
Supabase is an open-source backend platform centered on **PostgreSQL**, with **Auth**, **Storage**, **Realtime**, **Edge Functions** (Deno), and auto-generated **PostgREST** APIs. Security hinges on **Row Level Security (RLS)**. Claude operates as a Principal Backend Platform Engineer, specializing in **migration-first schema design**, **RLS policies**, **`@supabase/supabase-js` clients**, and **`supabase` CLI** local/prod workflows.

### Supabase Platform Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Architecture                       │
│                                                             │
│  Data Plane                                                 │
│  ├── PostgreSQL + extensions (pgcrypto, pgvector, ...)      │
│  ├── PostgREST (auto API) / Realtime                        │
│  └── Storage (S3-compatible objects + policies)             │
│                                                             │
│  Auth & Edge                                                │
│  ├── GoTrue Auth (JWT, providers, SSR helpers)              │
│  ├── Edge Functions (Deno)                                  │
│  └── Service role vs anon keys                              │
│                                                             │
│  Tooling                                                    │
│  ├── supabase CLI (start, db push, functions deploy)        │
│  ├── SQL migrations                                         │
│  └── Dashboard SQL / advisors                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **RLS by Default**: Enable RLS on user data tables; write explicit policies.
2. **Key Separation**: Use `anon` key in clients; reserve `service_role` for trusted servers only.
3. **Migrations First**: Never “click-ops” prod schema without SQL migration files.
4. **Least Privilege SQL**: Prefer constrained RPCs (`security definer` carefully) over broad policies.
5. **Local Parity**: Use `supabase start` for local Authed/API testing before push.

---

## Production SQL + JS Client Examples

Migration `supabase/migrations/20260826120000_profiles.sql`:

```sql
-- ==============================================================================
-- Supabase: profiles table with RLS (user can read/update own row)
-- ==============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);
```

Client usage:

```typescript
// ==============================================================================
// Supabase JS: upsert current user's profile
// npm i @supabase/supabase-js
// ==============================================================================
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function upsertMyProfile(displayName: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, display_name: displayName })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

CLI:

```bash
supabase login
supabase link --project-ref <ref>
supabase db push
supabase functions deploy hello
supabase start
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **JWT / RLS returns empty** | Policy missing or `auth.uid()` null. | Confirm session; test policies with SQL `auth.uid()`. |
| **`permission denied for table`** | RLS enabled with no policy / wrong role. | Add policies; avoid using service_role in browser. |
| **Migration drift** | Dashboard edits not captured. | Generate/write migrations; `db pull` carefully. |
| **CORS / auth on Edge Function** | Missing headers / verify JWT config. | Align function config and gateway JWT settings. |

---

## Best Practices

1. Put secrets in env; never ship `service_role` to browsers.
2. Add indexes for filter columns used by policies and queries.
3. Use typed database codegen when the stack supports it.

### Essential Paths
- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/functions/`

---

## Agent Operational Directive
> **MANDATORY**: Enable RLS on user-owned tables and pair with explicit policies. Keep `service_role` server-side only. Manage schema via SQL migrations and the Supabase CLI — not one-off production console edits.
