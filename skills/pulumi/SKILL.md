---
name: pulumi
description: "Operate Pulumi stacks with preview gates, encrypted config secrets, protect/retainOnDelete, and replace-aware ups agents routinely mishandle."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["pulumi", "iac", "stacks", "preview", "secrets", "typescript", "python", "oidc"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Pulumi Infrastructure as Code AI Skill Guide (Claude)

## Overview & Engine Architecture

**Pulumi** expresses cloud infrastructure as real programs (TypeScript, Python, Go, C#, YAML). **State** lives in a backend (Pulumi Cloud or self-managed DIY); each **stack** is an isolated deployment of the same program (`dev`, `prod`). Providers (AWS/Azure/GCP/Kubernetes) use the same cloud auth patterns as CLIs—prefer **OIDC / SSO / short-lived roles** over long-lived keys. Agents treat **`pulumi preview`** as mandatory before `up`, encrypt secrets with **`pulumi config set --secret`**, and flag **`+-` replacements** and **`-` deletes** as high risk.

```
┌─────────────────────────────────────────────────────────────┐
│                 Pulumi program → stack → cloud                │
│                                                             │
│  Program (index.ts / __main__.py / …)                       │
│  ├── Resources + ComponentResources                         │
│  ├── Options: protect · retainOnDelete · aliases · dependsOn│
│  └── Stack config + secrets (encrypted in state)            │
│                                                             │
│  Engine                                                     │
│  ├── preview (--diff / --refresh / --expect-no-changes)     │
│  ├── up / destroy (gated)                                   │
│  └── state: Pulumi Cloud or DIY backend                     │
│                                                             │
│  Providers → AWS · Azure · GCP · Kubernetes · …             │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Creating/reviewing Pulumi projects, stack configs, and ComponentResources.
- Previewing diffs before apply; importing existing cloud resources; managing stack secrets.
- Preferring general-purpose languages over HCL for shared logic/tests.

**Do not use when**

- Team standard is Terraform-only AWS modules → `@terraform` / `@terraform-aws`.
- Imperative one-off cloud debug → `@aws-cli` / `@azure-cli` / `@gcloud-cli`.
- Someone asks for plaintext secrets in `Pulumi.<stack>.yaml` or chat → refuse; use `--secret` or `@vault` / ESC.

---

## Operational Capabilities & Agent Directives

1. **Select stack explicitly**: `pulumi stack select` or `-s`; confirm with `pulumi whoami -v`.
2. **Always preview** (`pulumi preview --diff`, add `--refresh` when drift is possible) and summarize create/update/**replace**/delete before `up`.
3. Store secrets with **`pulumi config set --secret`**; never commit decrypted values; avoid `--show-secrets` in shared logs.
4. Mark production stateful resources with **`protect: true`** (and consider `retainOnDelete`); unprotect deliberately before destroy/replace.
5. Call out **replacements** (`+-`) that imply downtime/data loss (DBs, disks, clusters).
6. Prefer cloud **OIDC/SSO** for provider creds; pin provider plugin versions in CI for reproducible previews.
7. Require **explicit user approval** for `pulumi destroy` and for unprotected deletes of stateful resources.

---

## Production Example: TypeScript stack + secrets + protect

```bash
pulumi new aws-typescript -y -n api-infra -s dev
pulumi stack select dev
pulumi config set aws:region us-east-1
# Prompt user for value; do not invent passwords:
pulumi config set --secret dbPassword
pulumi whoami -v
pulumi preview --diff
# pulumi up   # only after review
```

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const cfg = new pulumi.Config();
const environment = pulumi.getStack();

const bucket = new aws.s3.BucketV2(
  "assets",
  {
    tags: { service: "api", env: environment },
  },
  {
    protect: environment === "prod",
  },
);

const dbPassword = cfg.requireSecret("dbPassword");

export const bucketName = bucket.id;
// Do not export raw secrets
void dbPassword;
```

Stack ops:

```bash
pulumi stack ls
pulumi stack output --json
pulumi preview --refresh --diff
pulumi up --yes          # only with explicit approval
pulumi destroy --yes     # only with explicit approval

# Import existing
pulumi import aws:s3/bucketV2:BucketV2 assets my-existing-bucket-name

# Protected resource blocking replace/delete:
# pulumi state unprotect <urn>   # deliberate; then preview again
```

CI gate:

```bash
pulumi preview --diff --expect-no-changes   # assert no drift on protected envs
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Preview/up errors on protected resource | `protect: true` blocks delete/replace | Review diff; `pulumi state unprotect` only if intentional; use `--ignore-protect` on **preview** only to inspect |
| Unexpected `+-` replace | Immutable property change | Diff with `--diff`; add aliases / avoid ForceNew attrs; plan migration |
| Provider auth failure | Wrong cloud identity; CLI≠SDK creds | Fix SSO/OIDC/`@aws-cli`/`@gcloud-cli`/`@azure-cli` context; refresh |
| Secret appears in plaintext state | Set without `--secret` | `config set --secret`; rotate leaked value |
| Drift vs Console | Out-of-band change | `preview --refresh`; import or revert |
| Plugin version skew in CI | Unpinned providers | Lock plugin versions; same Pulumi CLI version locally/CI |

---

## Best Practices

1. One stack per environment; share code via **ComponentResources**, not copy-paste.
2. Policy packs / CI previews on PRs; block merge on unexpected deletes.
3. `protect: true` on prod databases, critical DNS, and KMS keys.
4. Pair with `@kubernetes` for k8s provider workloads; `@docker` for image refs by digest.
5. Use ESC / `@vault` when org secret sprawl exceeds stack config.

---

## Limitations

- Preview is not a guarantee against provider eventual-consistency races.
- Large orgs may need Automation API + ESC for scale.
- Cross-cloud programs still need correct provider credentials **per stack**.
- Stop and ask if stack name, backend, or destroy/replace approval is missing.

---

## Related Skills

- `@terraform` / `@terraform-aws` — HCL IaC alternative / AWS specifics
- `@aws-cli` / `@azure-cli` / `@gcloud-cli` — imperative auth and debug beside stacks
- `@kubernetes` — Pulumi Kubernetes provider workloads
- `@docker` — image digests referenced by compute
- `@vault` — external secrets integrated with stacks
- `@github-actions` — OIDC for cloud providers in CI

---

## Agent Operational Directive

> **MANDATORY**: Select the correct stack; run `pulumi preview` (prefer `--diff`, `--refresh` when needed) and summarize replace/delete risk before `up`. Use `config set --secret` for credentials; never invent or commit plaintext secrets. Apply `protect` on prod stateful resources. Require explicit approval for destroy and for unprotecting resources. Prefer OIDC/SSO over long-lived cloud keys.

---

## Source anchors (research)

- [Protecting against undesired changes](https://www.pulumi.com/docs/iac/operations/stack-management/protecting-against-undesired-changes/)
- [pulumi preview CLI](https://www.pulumi.com/docs/iac/cli/commands/pulumi_preview/)
- [Resource option: protect](https://www.pulumi.com/docs/iac/concepts/resources/options/protect/)
- [Secrets handling](https://www.pulumi.com/docs/iac/concepts/secrets/)
