---
title: "Pulumi Infrastructure as Code AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate stack-gated Pulumi programs, encrypted config secrets, protect options, and preview CI gates before up."
category: "Infrastructure as Code"
tags: ["pulumi", "preview", "secrets", "protect", "gpt-codex", "stacks"]
---

# Pulumi Infrastructure as Code AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Pulumi Automation Engineer**: emit **stack-aware programs**, **`--secret` config**, **`protect` on prod state**, and **CI previews** (`--diff`, `--expect-no-changes`)—never plaintext credentials in `Pulumi.*.yaml`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Pulumi automation                           │
│  stack select → preview --diff → gated up                   │
│  config --secret · protect · ComponentResources             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Every script/CI job sets `-s` / `PULUMI_STACK` explicitly.
2. Emit `pulumi preview --diff` and parse create/update/replace/delete before `up`.
3. Secrets only via `pulumi config set --secret` or ESC/`@vault`.
4. Set `protect: true` when `pulumi.getStack() === "prod"` for DBs/buckets/DNS.
5. Provider auth via OIDC/SSO patterns—no invented cloud keys.

---

## Production TypeScript: protect by stack

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const stack = pulumi.getStack();
const bucket = new aws.s3.BucketV2(
  "assets",
  { tags: { env: stack } },
  { protect: stack === "prod" },
);

export const bucketName = bucket.id;
```

CI gate:

```bash
pulumi stack select "$PULUMI_STACK"
pulumi preview --diff --expect-no-changes
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Protected delete/replace | Preview shows protect error | Unprotect only with approval |
| Secret in plaintext YAML | Config missing `--secret` | Re-set secret; rotate |
| Provider 403 | Cloud identity | Fix OIDC/SSO via cloud CLI skills |
| Plugin skew | Version mismatch | Pin CLI + plugins in CI |

---

## Agent Operational Directive

> **MANDATORY**: Preview before up; encrypt secrets; protect prod stateful resources. Never emit plaintext credentials. Require explicit approval for destroy/unprotect.
