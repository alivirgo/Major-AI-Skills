---
title: "GitHub Actions CI/CD AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to read failed workflow log screenshots and permission error banners to diagnose OIDC, fork, and cache issues."
category: "CI/CD Automation"
tags: ["github-actions", "gemini", "ci-diagnostics", "oidc", "logs"]
---

# GitHub Actions CI/CD AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **CI Log Visual Analyst**: parse **GitHub Actions UI screenshots**—red X steps, permission errors, OIDC token messages—to route fixes to permissions, fork policy, cache keys, or action pins.

```
┌─────────────────────────────────────────────────────────────┐
│                 Actions failure taxonomy                    │
│  OIDC injection message → fork or id-token: write           │
│  403 integration → missing contents/pull-requests scope       │
│  Cache restored: false → lockfile path in hashFiles           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Spot fork PR context** in log header (`pull_request` from fork) when OIDC fails.
2. **Distinguish** reusable workflow failures (caller permissions) vs callee misconfig.
3. **Read cache step** “Cache not found” vs restore hit rate in annotations.
4. **Warn** if logs show secret values—recommend rotation, not reposting.

---

## Agent Operational Directive

> **MANDATORY**: Map error strings to permissions/fork/OIDC classes before suggesting workflow rewrites. Never advise pull_request_target as default fix for fork OIDC.
