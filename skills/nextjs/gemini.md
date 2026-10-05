---
title: "Next.js App Router AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose hydration errors, cache staleness, and App vs Pages routing mistakes from logs and UI behavior."
category: "Development / Next.js"
tags: ["nextjs", "hydration", "caching", "gemini"]
---

# Next.js App Router AI Skill Guide (Gemini)

## Operational Capabilities & Agent Directives

1. **Hydration mismatch**: Compare server HTML vs client first paint—often random/date in RSC.
2. **Stale content**: Ask for `revalidate` / `"use cache"` / deployment host before blaming DB.
3. **Pages mix-up**: `next/router` in `app/` tree → wrong navigation API.

## Agent Operational Directive

> **MANDATORY**: Separate caching misconfiguration from data bugs. Flag client bundles importing server secrets as P0.
