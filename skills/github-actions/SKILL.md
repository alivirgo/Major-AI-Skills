---
name: github-actions
description: "Design least-privilege GitHub Actions with explicit permissions, OIDC to cloud, cache keys tied to lockfiles, and fork-safe workflows—avoid secret/OIDC footguns agents repeat."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["github-actions", "ci", "cd", "oidc", "reusable-workflows", "permissions", "supply-chain"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# GitHub Actions CI/CD AI Skill Guide (Claude)

## Overview & Engine Architecture

GitHub Actions runs **workflows** (YAML under `.github/workflows/`) on **events** (`push`, `pull_request`, `workflow_dispatch`, …). Jobs execute on **runners**; steps use `run:` or **actions** from the marketplace. Security is the product: **explicit `permissions`**, **OIDC federation** instead of long-lived cloud keys, **pinned action SHAs** for high assurance, and **fork PR rules** that block secrets and OIDC by design.

```
┌─────────────────────────────────────────────────────────────┐
│                 GitHub Actions trust model                  │
│                                                             │
│  Event → workflow → job(s) → steps                          │
│  ├── GITHUB_TOKEN (scoped by permissions: block)            │
│  ├── Repository / environment secrets                       │
│  └── OIDC JWT (id-token: write) → cloud IAM role            │
│                                                             │
│  Reusable workflow: caller permissions CAP callee           │
│  Fork pull_request: read-only token; NO OIDC injection      │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Adding CI (lint/test/build) on PRs and release/deploy on protected branches.
- Wiring AWS/GCP/Azure login via OIDC; caching dependencies; matrix builds.
- Debugging failed checks, cache misses, permission errors, or reusable workflow auth.

**Do not use when**

- `pull_request_target` is suggested to “fix” fork OIDC while checking out **untrusted PR code**—refuse; use maintainer-triggered workflows or skip cloud steps on forks.
- Long-lived cloud access keys in repo secrets when OIDC is available.
- Running unreviewed third-party actions with write permissions.

---

## Operational Capabilities & Agent Directives

1. **Set `permissions:` explicitly** at workflow or job level; listing scopes **replaces** repo defaults—include everything needed (`contents: read`, `pull-requests: write`, etc.).
2. **OIDC jobs require `id-token: write`** on the **caller** when using reusable workflows; callee cannot exceed caller caps.
3. **Fork PRs**: assume **no secrets, no OIDC**; gate cloud deploy steps with `if: github.event.pull_request.head.repo.full_name == github.repository` or manual `workflow_dispatch`.
4. **Pin actions** to full commit SHA for deploy workflows; at minimum pin major tags you trust for inner loops.
5. **Never echo secrets**; use `mask` patterns; rotate if leaked in logs.
6. **Cache keys** must hash lockfiles (`package-lock.json`, `poetry.lock`, `go.sum`).
7. **Separate** PR CI from production deploy workflows; use **environments** with required reviewers for prod.
8. **Supply chain**: audit what marketplace actions execute; prefer composite actions you own.

---

## Production Example: CI + OIDC deploy (same-repo PRs)

PR CI:

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]

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

Deploy (protected branch + environment):

```yaml
name: deploy
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/gha-deploy
          aws-region: us-east-1
      - run: ./scripts/deploy.sh
```

Reusable workflow caller pattern:

```yaml
jobs:
  release:
    permissions:
      id-token: write
      contents: read
    uses: org/shared/.github/workflows/deploy.yml@v1
    secrets: inherit
```

Cloud trust policy must constrain `sub`/`aud` to repo and environment (see GitHub OIDC docs).

---

## Technical Troubleshooting Matrix

| Failure signature | Likely cause | Fix |
| :--- | :--- | :--- |
| `did not inject ACTIONS_ID_TOKEN` | Fork PR or missing `id-token: write` | Same-repo gate; add permission on caller job |
| `Resource not accessible by integration` | Incomplete `permissions:` after tightening | Add required scopes explicitly |
| Secrets empty on PR | Fork or wrong environment | Expected on forks; use env secrets + approval |
| Cache miss every run | Wrong path/hash in key | Include lockfile hash; verify working directory |
| OIDC AssumeRole denied | Trust policy `sub` mismatch | Align repo, ref, environment claims |
| Reusable workflow auth fail | Caller lacks `id-token: write` | Elevate caller job permissions only |
| `pull_request_target` exploit path | Untrusted code with secrets | Never checkout PR head with secrets; use label-gated maintainer flow |

---

## Best Practices

1. Concurrency groups cancel superseded deploys: `concurrency: group: deploy-${{ github.ref }}`.
2. Upload artifacts between jobs; runner disk is ephemeral.
3. Use `workflow_dispatch` inputs for prod promotions when needed.
4. Dependabot for actions + `@dependabot-config` patterns.
5. Pair image build with `@trivy` and sign artifacts where org requires SLSA.

---

## Limitations

- Self-hosted runners need hardening, label strategy, and org isolation.
- Billing/queue behavior differs by plan; not all features on free tier.
- `pull_request_target` security model is easy to misuse—default away from it.
- Stop and ask if cloud trust policies, environment names, or deploy targets are unknown.

---

## Related Skills

- `@docker` — build/push images in jobs
- `@terraform` — plan/apply with environment gates
- `@kubernetes` / `@argocd` — deploy after CI updates Git tags
- `@trivy` — vulnerability gates

---

## Agent Operational Directive

> **MANDATORY**: Declare least-privilege `permissions` on every workflow. Use OIDC for cloud auth; never recommend long-lived cloud keys in GitHub secrets when OIDC is viable. Do not use `pull_request_target` to run untrusted PR code with secrets or OIDC. For fork PRs, skip or split cloud-authenticated jobs. Pin deploy actions to SHAs when writing high-assurance pipelines.

---

## Source anchors (research)

- [GitHub OIDC reference](https://docs.github.com/en/actions/reference/security/oidc)
- [Reusable workflow id-token caller cap](https://latchkey.dev/learn/github-actions/reusable-workflow-id-token-not-granted-in-ci)
- [Fork PR OIDC injection failure (issue example)](https://github.com/linera-io/linera-protocol/issues/5751)
- [pull_request_target security (Stack Overflow summary)](https://stackoverflow.com/questions/76952023/how-to-make-github-actions-safely-access-secrets-for-prs-created-from-forks)
