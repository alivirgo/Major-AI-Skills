---
name: supabase-rls
description: "Advanced operational skill for Supabase Row Level Security: policy design, security definer RPCs, storage policies, Edge Function authz, and RLS performance."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["supabase", "rls", "postgres", "policies", "edge-functions", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Supabase Advanced RLS AI Skill Guide

## Overview & Engine Architecture

This skill complements `@supabase` with deep Row Level Security (RLS) practice. PostgREST and Storage honor Postgres policies using `auth.uid()`, JWT claims, and role (`anon` / `authenticated` / `service_role`). Agents design deny-by-default tables, avoid recursive policy traps, push complex authz into carefully audited `security definer` RPCs, and keep Edge Functions from becoming a silent RLS bypass.

```
Client (anon key + user JWT)
        |
 PostgREST / Storage
        |
 Postgres RLS policies  <--- auth.uid() / claims
        |
 Optional: Edge Function (service role) with explicit authz
```

## When to use this skill

- Hardening multi-tenant or team-based access beyond owner-only rows
- Debugging unexpected empty results or policy recursion errors
- Designing `security definer` RPCs safely
- Authorizing Storage objects and Edge Function writes that must not bypass intent

## Operational directives

1. `enable row level security` on every user-data table; add explicit policies per command (`select`/`insert`/`update`/`delete`).
2. Prefer `auth.uid()` and stable claim helpers over embedding user ids from client payloads alone.
3. Use `security definer` only with fixed `search_path`, narrow grants, and internal checks - never as a blanket bypass.
4. Edge Functions using `service_role` must re-validate the caller JWT and enforce the same authz rules in code.
5. Index columns referenced in policy predicates (`owner_id`, `org_id`) - RLS runs per row.

## Multi-tenant policy sketch

```sql
-- memberships link users to orgs
create table public.org_members (
  org_id uuid not null references public.orgs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  primary key (org_id, user_id)
);

alter table public.org_members enable row level security;
alter table public.documents enable row level security;

create policy "members read memberships"
  on public.org_members for select
  using (user_id = auth.uid());

create policy "members read org documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.org_members m
      where m.org_id = documents.org_id
        and m.user_id = auth.uid()
    )
  );

create policy "members insert org documents"
  on public.documents for insert
  with check (
    exists (
      select 1 from public.org_members m
      where m.org_id = documents.org_id
        and m.user_id = auth.uid()
    )
  );
```

## Safe `security definer` RPC pattern

```sql
create or replace function public.add_org_member(target_org uuid, target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.org_members
    where org_id = target_org and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'not authorized';
  end if;

  insert into public.org_members (org_id, user_id, role)
  values (target_org, target_user, 'member')
  on conflict do nothing;
end;
$$;

revoke all on function public.add_org_member(uuid, uuid) from public;
grant execute on function public.add_org_member(uuid, uuid) to authenticated;
```

## Edge Function authz reminder

```ts
// Verify JWT, then use user-scoped client when possible.
// If service_role is required, re-check org membership before writes.
const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
if (!jwt) return new Response("unauthorized", { status: 401 });
// supabase.auth.getUser(jwt) -> enforce same predicates as RLS
```

## Commands

```bash
supabase start
supabase db reset
supabase test db
supabase functions serve
supabase db lint
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Policy recursion across tables | Infinite recursion errors | Helper functions / redesign |
| `service_role` in mobile apps | Full bypass of RLS | Anon + user JWT only |
| RLS without indexes | Slow queries at scale | Index predicate columns |
| Storage policies forgotten | Public bucket leaks | Mirror table authz intent |

## Best practices

- Write negative tests: user A must not read user B rows.
- Separate `using` (existing row) vs `with check` (new row) thoughtfully on updates.
- Prefer views + RLS or RPCs for complex joins rather than duplicating brittle policies.
- Audit `grant` on tables/functions after every migration.

## Limitations

- RLS does not replace input validation or abuse rate limits.
- Realtime and Storage each need their own policy surface.
- Performance of correlated `exists` policies can still force schema redesign.

## Related skills

- `@supabase` - platform overview, CLI, basic client usage
- `@postgresql` - indexing and SQL fundamentals
- `@prisma` - app ORM that must coexist with RLS (use user-scoped keys)
