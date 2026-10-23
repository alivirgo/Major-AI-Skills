---
title: "Vercel Deployment AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Vercel build failures, Preview vs Production env drift, NEXT_PUBLIC_ leaks, and runtime mismatches from deployment screenshots and logs."
category: "Frontend Deploy Platforms"
tags: ["vercel", "gemini", "diagnostics", "build-logs", "environment-variables"]
---

# Vercel Deployment AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Vercel Diagnostics Specialist**: read **Build Logs, Deployment Details, env screenshots, and runtime 500s** to separate **missing scoped env**, **build-time public inlining**, and **framework/runtime errors**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Vercel multimodal triage                    │
│  Build failed → first Error above “exited with 1”           │
│  Preview OK / Prod crash → Production env missing           │
│  Secret in browser → NEXT_PUBLIC_ or client import          │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Build failure** → scroll to first substantive Error; ask user to run the same build locally.
2. **Only Production breaks** → compare Production vs Preview env scopes (names, not values).
3. **Wrong public API host** → `NEXT_PUBLIC_*` rebuild required after change.
4. **Edge/Middleware stack** → Node API incompatibility or deprecated Edge on newer Next.
5. **Never ask** for `VERCEL_TOKEN` or raw secret values—point to dashboard rotation.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| Red deployment, last line exit 1 | Earlier compile error | Full Build Log snippet |
| Works on PR URL not on domain | Prod env / promotion | Which deployment is aliased |
| API key visible in Sources | Public env misuse | Var name prefix |
| First `vercel` used prod DB | New project first deploy rule | Project deploy history |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose from Build Logs and env scopes before rewriting app code. Flag `NEXT_PUBLIC_` secret exposure. Never request production Vercel tokens in chat.
