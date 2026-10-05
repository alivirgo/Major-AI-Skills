---
title: "Supabase Platform AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose empty RLS results, 42501 inserts, and JWT/header mismatches from network captures."
category: "DevOps / Supabase"
tags: ["supabase", "rls", "jwt", "gemini"]
---

# Supabase Platform AI Skill Guide (Gemini)

## Operational Capabilities & Agent Directives

1. **Compare headers**: `apikey` vs `Authorization` Bearer—user JWT must differ from anon key.
2. **42501 insert**: `auth.uid()` NULL at runtime—decode JWT `sub` vs policy column.
3. **Service role still blocked**: User session attached to admin client—SSR gotcha.

## Agent Operational Directive

> **MANDATORY**: Do not recommend disabling RLS. Fix JWT client attachment or policies.
