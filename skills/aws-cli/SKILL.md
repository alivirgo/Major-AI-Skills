---
name: aws-cli
description: "Operate AWS CLI v2 with IAM Identity Center SSO, OIDC/CI roles, and account-scoped S3/EC2/Lambda/IAM/CloudWatch workflows agents routinely mis-target."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["aws", "aws-cli", "iam-identity-center", "sso", "oidc", "s3", "cloudwatch", "sts"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# AWS CLI & Cloud APIs AI Skill Guide (Claude)

## Overview & Engine Architecture

The **AWS CLI v2** is a thin client over AWS service APIs. Auth follows a **credential chain** (CLI flags → env → assume-role / web-identity → IAM Identity Center → shared credentials → EC2/ECS roles). Every mutating call is **account- and region-scoped**. Agents treat identity as a first-class gate: print caller identity before deletes, prefer **SSO / OIDC / instance roles** over long-lived access keys, and never invent or commit credentials.

```
┌─────────────────────────────────────────────────────────────┐
│                 AWS CLI v2 request path                       │
│                                                             │
│  Human / CI                                                 │
│  ├── Profile (--profile) or env (AWS_PROFILE / keys)        │
│  ├── SSO: aws sso login → cached token → STS session        │
│  └── OIDC / instance / task role → temporary creds          │
│                                                             │
│  CLI                                                        │
│  ├── Region: --region | AWS_REGION | profile                │
│  ├── STS get-caller-identity (account gate)                 │
│  └── Service APIs: S3, EC2, Lambda, IAM, Logs, ECR, …       │
│                                                             │
│  Guardrails                                                 │
│  └── Org SCPs · permission boundaries · quotas · CloudTrail │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Imperative inspect/debug beside `@terraform` / `@terraform-aws` / `@pulumi` (logs, sync, invoke, IAM simulate).
- Confirming **which account + role** a laptop or pipeline is acting on before a change.
- One-off safe reads during incidents (`describe`, `get`, `tail`, `ls`).

**Do not use when**

- Durable multi-env infrastructure belongs in IaC → `@terraform-aws` / `@pulumi` / `@terraform`.
- Cluster workload ops after kubeconfig is wired → `@kubernetes` (EKS).
- Someone asks to paste `AWS_SECRET_ACCESS_KEY` into chat/git → refuse; use SSO, OIDC, or `@vault` / Secrets Manager.

---

## Operational Capabilities & Agent Directives

1. **Identity first**: run `aws sts get-caller-identity` and confirm Account / Arn / region before any mutate or delete.
2. **Prefer IAM Identity Center (SSO)** for humans; prefer **OIDC → IAM role** for GitHub Actions / CI; prefer **instance/task roles** on compute. Long-lived IAM user keys are last resort.
3. **Pin profile explicitly** (`--profile` or `AWS_PROFILE`); unset conflicting `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` when SSO should win.
4. **Use `--dry-run` / `--dryrun`** where the API supports it (EC2, many S3 sync paths); `ls`/`describe` before `rm`/`terminate`/`rb --force`.
5. **Never log** secret keys, session tokens, or full pre-signed URL query strings; redact in chat and CI.
6. **Scope IAM** to resources + conditions (`aws:RequestedRegion`, `aws:PrincipalTag`, MFA) when designing policies; pair with CloudTrail for “who changed what”.
7. **Pagination & output**: prefer `--output json` + JMESPath `--query` in scripts; handle `NextToken` / use `--cli-input-json` for large payloads.

---

## Production Example: SSO profile + safe ops loop

`~/.aws/config` (IAM Identity Center session — no secrets in file):

```ini
[sso-session my-org]
sso_start_url = https://my-org.awsapps.com/start
sso_region = us-east-1
sso_registration_scopes = sso:account:access

[profile prod-readonly]
sso_session = my-org
sso_account_id = 111122223333
sso_role_name = ReadOnlyAccess
region = us-east-1
output = json

[profile prod-admin]
sso_session = my-org
sso_account_id = 111122223333
sso_role_name = AdministratorAccess
region = us-east-1
```

Session + validation:

```bash
aws sso login --profile prod-readonly
# Headless / remote: aws sso login --profile prod-readonly --use-device-code

export AWS_PROFILE=prod-readonly
aws sts get-caller-identity
aws configure list

# S3 — inspect before sync delete
aws s3 ls s3://acme-app-artifacts/prod/ --human-readable --summarize
aws s3 sync ./dist s3://acme-app-artifacts/prod/app/ --delete --dryrun

# Logs + Lambda
aws logs tail /aws/lambda/api-prod --follow --since 30m
aws lambda get-function-configuration --function-name api-prod
aws lambda invoke --function-name api-prod --cli-binary-format raw-in-base64-out \
  --payload '{"ping":true}' /tmp/out.json && cat /tmp/out.json

# IAM sanity (CI deploy role)
aws iam get-role --role-name gha-deploy
aws iam simulate-principal-policy \
  --policy-source-arn "$(aws sts get-caller-identity --query Arn --output text)" \
  --action-names s3:PutObject \
  --resource-arns arn:aws:s3:::acme-app-artifacts/prod/*
```

CI (GitHub Actions OIDC — no static keys):

```yaml
permissions:
  id-token: write
  contents: read
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::111122223333:role/gha-deploy
      aws-region: us-east-1
  - run: aws sts get-caller-identity
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `ExpiredToken` / SSO token expired | Cached SSO session expired; CLI will **not** auto-open browser login | `aws sso login --profile <p>` (or `--sso-session`); retry STS |
| `InvalidClientTokenId` / `InvalidAccessKeyId` | Stale env keys override SSO; wrong profile; deleted key | `aws configure list`; unset `AWS_ACCESS_KEY_*` / `AWS_SESSION_TOKEN`; fix profile |
| Wrong account resources “missing” | Ambient profile/region ≠ intended | `get-caller-identity` + `--region`; set `AWS_PROFILE` |
| `AccessDenied` despite “admin” locally | SCP, permission boundary, or session policy | Check Org SCPs; `simulate-principal-policy`; CloudTrail |
| SignatureDoesNotMatch / skew errors | System clock out of sync | Sync NTP; retry |
| Pagination truncated lists | Missing `NextToken` handling | Use `--max-items` carefully or paginate; prefer AWS SDK for long loops |
| Pre-signed URL “leaked” in logs | Full URL logged | Log bucket/key only; shorten TTL; never paste query secrets |

---

## Best Practices

1. Named profiles per **account + role**; never reuse `default` for prod mutates.
2. Tag resources (`Environment`, `Owner`, `Service`) for cost and blast-radius clarity.
3. Prefer ECR digests + `@docker` / `@kubernetes` over “latest” in prod pulls.
4. Keep CLI current (`aws --version`); SSO/PKCE and auth flows improve across v2 releases.
5. For durable changes, author in `@terraform-aws` then use CLI only to verify.

---

## Limitations

- Quotas, SCPs, and permission boundaries can deny valid CLI syntax.
- Dry-run coverage is uneven across services; do not invent a dry-run flag.
- Interactive SSO login is unsuitable for unattended jobs—use OIDC or instance roles.
- Stop and ask if target account ID, region, or approval for destructive ops is missing.

---

## Related Skills

- `@terraform-aws` / `@terraform` — durable AWS infrastructure and state
- `@pulumi` — programmatic IaC alternative
- `@kubernetes` — EKS workloads after `aws eks update-kubeconfig`
- `@docker` — images pushed to ECR
- `@vault` — dynamic secrets instead of long-lived keys
- `@github-actions` — OIDC to IAM roles in CI

---

## Agent Operational Directive

> **MANDATORY**: Run `aws sts get-caller-identity` and confirm account/region before mutating. Prefer SSO, OIDC, or compute roles—never invent or commit access keys. Use describe/ls/dry-run before delete/terminate/force. Never print secret keys or full pre-signed query strings. If identity, account, or blast radius is unclear, stop and ask.

---

## Source anchors (research)

- [AWS CLI authentication options](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html)
- [IAM Identity Center (SSO) with the CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)
- [Troubleshooting CLI errors](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-troubleshooting.html)
- [SSO login does not auto-reauth on expiry](https://github.com/aws/aws-cli/discussions/9237)
