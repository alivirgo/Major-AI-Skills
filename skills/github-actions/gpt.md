---
title: "GitHub Actions CI/CD AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate workflow YAML, OIDC trust snippets, cache-key helpers, and fork-safe condition templates."
category: "CI/CD Automation"
tags: ["github-actions", "gpt-codex", "oidc", "reusable-workflows", "ci"]
---

# GitHub Actions CI/CD AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **CI Platform Automation Engineer**: scaffold **workflows**, **composite actions**, **matrix generators**, and **policy linters** that reject missing `permissions` and fork-unsafe OIDC patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                 Actions codegen                             │
│  workflow template → permissions linter → OIDC deploy job   │
│  cache key = hashFiles('**/package-lock.json')              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Always emit top-level or job `permissions`** when workflow uses checkout + PR comments + OIDC.
2. **Template fork guard**: `if: github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository`.
3. **Generate AWS trust policy JSON** with `StringEquals` on `token.actions.githubusercontent.com:sub`.
4. **Never codegen `pull_request_target` + checkout@PR head** without explicit security review block comment.
5. **Pin third-party actions to SHA** in deploy templates.

---

## Production snippet: reusable OIDC caller

```yaml
jobs:
  call-deploy:
    if: github.ref == 'refs/heads/main'
    permissions:
      id-token: write
      contents: read
    uses: org/platform/.github/workflows/deploy.yml@main
    with:
      environment: production
    secrets: inherit
```

---

## Agent Operational Directive

> **MANDATORY**: Lint generated workflows for `id-token: write` on OIDC jobs and fork guards on cloud steps. Never output static AWS access keys.
