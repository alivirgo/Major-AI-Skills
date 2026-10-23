---
title: "AWS CLI & Cloud APIs AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose AWS CLI auth, wrong-account, and AccessDenied failures from CLI output, configure list, and CloudTrail snippets."
category: "Cloud CLI & Identity"
tags: ["aws-cli", "gemini", "diagnostics", "sso", "sts", "iam"]
---

# AWS CLI & Cloud APIs AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an **AWS CLI Diagnostics Specialist**: read **error text, `aws configure list`, STS identity JSON, and CloudTrail snippets** to separate **expired SSO**, **env-key shadowing**, **wrong profile/region**, and **SCP/boundary denials**.

```
┌─────────────────────────────────────────────────────────────┐
│                 AWS CLI multimodal triage                   │
│  Error + configure list → which cred source wins?           │
│  STS Account/Arn → intended target?                         │
│  AccessDenied → IAM vs SCP vs wrong resource ARN            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **ExpiredToken / SSO** → recommend `aws sso login` (device-code if remote); do not invent keys.
2. **InvalidClientTokenId** → demand `aws configure list`; look for env overrides.
3. **Resource missing** → verify Account + `--region` before suggesting recreate.
4. **AccessDenied** → ask for action + resource ARN; consider SCP/permission boundary.
5. **Never request** pasting `AWS_SECRET_ACCESS_KEY` or full pre-signed URLs into chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| ExpiredToken after idle day | SSO session expired | `aws sso login --profile …` |
| InvalidClientTokenId with “valid” keys | Env/profile mismatch | `aws configure list` + STS |
| S3 ls empty / NoSuchBucket | Wrong account or region | `get-caller-identity` + region |
| Works locally, fails in CI | Missing OIDC / wrong role | GHA permissions + role trust |
| Signature errors | Clock skew | System time / NTP |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose identity and credential precedence before IAM policy rewrites. Prefer SSO/OIDC fixes over creating access keys. Never ask users to paste secret keys into chat.
