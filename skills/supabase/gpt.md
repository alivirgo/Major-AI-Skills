---
title: "Supabase Platform AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to author RLS migrations, server vs browser clients, indexed policies, and CLI push workflows."
category: "DevOps / Supabase"
tags: ["supabase", "rls", "migrations", "gpt-codex"]
---

# Supabase Platform AI Skill Guide (GPT & Codex)

## Operational Capabilities & Agent Directives

1. Every user table migration: `ENABLE ROW LEVEL SECURITY` + policies for needed commands.
2. Use `(select auth.uid())` form in policies for perf.
3. Separate admin `createClient(url, secretKey)` without SSR cookie session.
4. Never generate browser code with `service_role` or secret keys.

## CLI

```bash
supabase db push
supabase gen types typescript --local > src/database.types.ts
```

## Agent Operational Directive

> **MANDATORY**: RLS on user data. Secret keys server-only. Debug auth.uid on live REST, not SQL Editor.
