---
name: github-actions
description: "Operational skill for GitHub Actions CI/CD: workflows, jobs, matrices, caching, OIDC cloud auth, secrets, and reusable workflows."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["github-actions", "ci", "cd", "oidc", "workflows", "yaml", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# GitHub Actions CI/CD AI Skill Guide

## Overview & Engine Architecture

GitHub Actions runs workflows defined under `.github/workflows/` in response to events (push, pull_request, schedule, workflow_dispatch). Jobs run on runners; steps call actions or shell commands. Agents design fast, least-privilege pipelines, pin risky actions, and prefer OIDC federation over long-lived cloud keys.

```
GitHub event
    -> workflow YAML
        -> jobs (matrix / needs)
            -> steps (actions/* or run:)
                -> artifacts / caches / OIDC tokens
```

## When to use this skill

- Adding CI for lint/test/build on pull requests
- Publishing images or packages from tags
- Wiring cloud deploys with OIDC (AWS/GCP/Azure)
- Speeding pipelines with dependency caches

## Operational directives

1. Set `permissions:` explicitly; default to read-only and elevate per job.
2. Prefer `actions/checkout` and setup actions at major versions you trust; pin to commit SHA for high-assurance repos.
3. Never echo secrets; mask outputs; rotate compromised tokens immediately.
4. Fail PR checks fast; keep release workflows separate from PR workflows when possible.
5. Cache keys must include lockfile hashes (`package-lock.json`, `pnpm-lock.yaml`, etc.).

## Minimal CI workflow

```yaml
name: ci
on:
  push:
    branches: [master, main]
  pull_request:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
```

## OIDC to AWS (sketch)

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/gha-deploy
      aws-region: us-east-1
```

Trust the role with GitHub's OIDC provider and limit `sub` to your repo/environment.

## Debugging

```bash
# Locally where act is available (optional):
# act -l
# In GitHub UI: re-run failed jobs; download logs
```

| Failure | Check |
| --- | --- |
| Cache miss every run | cache key / lockfile path |
| Secrets empty | Environment vs repo secret scope; fork PR rules |
| OIDC AssumeRole fails | trust policy `sub`/`aud`, `id-token: write` |
| Flaky tests | isolate order dependence; add retry only when justified |

## Best practices

- Use environments with required reviewers for production deploys.
- Upload build artifacts explicitly; do not rely on runner disk across jobs.
- Prefer reusable workflows for org standards instead of copy-paste YAML.
- Keep workflow YAML reviewed like production code.

## Limitations

- Self-hosted runners need their own hardening and label strategy.
- Marketplace actions vary in quality; audit what they execute.
- Concurrent workflow cancellation and queueing behave differently on free vs paid plans.

## Related skills

- `@docker` - image builds inside jobs
- `@terraform` - plan/apply gated by environments
- `@trivy` - vulnerability gates in CI
