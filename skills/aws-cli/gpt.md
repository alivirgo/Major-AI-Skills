---
title: "AWS CLI & Cloud APIs AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate SSO profiles, OIDC CI auth, identity-gated shell wrappers, and safe AWS CLI runbooks without long-lived keys."
category: "Cloud CLI & Identity"
tags: ["aws-cli", "sso", "oidc", "sts", "gpt-codex", "iam"]
---

# AWS CLI & Cloud APIs AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Cloud Ops Automation Engineer**: emit **SSO/`sso-session` profiles**, **OIDC GitHub Actions steps**, **identity-first shell wrappers**, and **dry-run-before-delete** scripts—never static access keys.

```
┌─────────────────────────────────────────────────────────────┐
│                 AWS CLI automation                          │
│  sts get-caller-identity gate → profile/OIDC → service ops  │
│  CI: configure-aws-credentials → scoped IAM role            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate wrappers that **fail closed** unless `aws sts get-caller-identity` matches expected account ID.
2. Emit IAM Identity Center `sso-session` + profile blocks; document `aws sso login` (device-code for remote).
3. For CI, emit **OIDC** (`id-token: write` + role-to-assume)—never `AWS_ACCESS_KEY_ID` literals.
4. Prefer `--dryrun`/`--dry-run` + describe/ls before sync-delete, terminate, or `rb --force`.
5. Redact secrets in any logged command output; never print session tokens.

---

## Production Bash: account gate wrapper

```bash
#!/usr/bin/env bash
set -euo pipefail
EXPECTED_ACCOUNT="${EXPECTED_ACCOUNT:?set EXPECTED_ACCOUNT}"
PROFILE="${AWS_PROFILE:-}"
ARGS=( )
[[ -n "$PROFILE" ]] && ARGS+=(--profile "$PROFILE")

IDENT="$(aws "${ARGS[@]}" sts get-caller-identity --output json)"
ACCOUNT="$(echo "$IDENT" | jq -r .Account)"
ARN="$(echo "$IDENT" | jq -r .Arn)"
if [[ "$ACCOUNT" != "$EXPECTED_ACCOUNT" ]]; then
  echo "refusing: account $ACCOUNT != $EXPECTED_ACCOUNT (arn=$ARN)" >&2
  exit 1
fi
echo "ok: $ARN"
exec aws "${ARGS[@]}" "$@"
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| ExpiredToken in CI/scripts | Probe STS before job body | Re-run `aws sso login` or refresh OIDC role |
| Wrong account mutate | Account gate fails | Fix `AWS_PROFILE` / role ARN |
| Env keys shadow SSO | `aws configure list` shows env | Unset `AWS_ACCESS_KEY_*` / `AWS_SESSION_TOKEN` |
| AccessDenied after SSO | Simulate policy / SCP | Narrow role or fix Org SCP |

---

## Agent Operational Directive

> **MANDATORY**: Gate every mutate path on `get-caller-identity`. Prefer SSO/OIDC/roles. Never emit access key literals. Dry-run/describe before destructive S3/EC2 ops.
