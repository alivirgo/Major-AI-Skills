---
title: "Google Cloud gcloud CLI AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate named gcloud configurations, WIF CI auth, project-gated scripts, and Cloud Run/GKE runbooks without SA JSON keys."
category: "Cloud CLI & Identity"
tags: ["gcloud", "gcp", "wif", "adc", "gpt-codex", "cloud-run"]
---

# Google Cloud gcloud CLI AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **GCP Ops Automation Engineer**: emit **named configurations**, **project/region-gated wrappers**, **WIF credential wiring**, and **Cloud Run/GKE** scripts—never committed service account JSON keys.

```
┌─────────────────────────────────────────────────────────────┐
│                 gcloud automation                            │
│  config list gate → --project/--region → API ops            │
│  CI: WIF cred-file / impersonation → short-lived tokens     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Scripts assert `gcloud config get-value project` equals `EXPECTED_PROJECT`.
2. Prefer named configurations; pass `--project`/`--region` on mutates.
3. Document CLI auth vs ADC (`auth login` vs `application-default login`).
4. CI: Workload Identity Federation or impersonation—not JSON keys in secrets if avoidable.
5. Cloud Run: dedicated runtime SA + Artifact Registry reader binding.

---

## Production Bash: project gate

```bash
#!/usr/bin/env bash
set -euo pipefail
EXPECTED_PROJECT="${EXPECTED_PROJECT:?set EXPECTED_PROJECT}"
CUR="$(gcloud config get-value project 2>/dev/null)"
if [[ "$CUR" != "$EXPECTED_PROJECT" ]]; then
  echo "refusing: project $CUR != $EXPECTED_PROJECT" >&2
  exit 1
fi
gcloud "$@"
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Wrong bucket/cluster | Project gate fails | Activate config; pass `--project` |
| Reauth required | auth list expired | `gcloud auth login` |
| SDK vs CLI mismatch | ADC file missing | Configure ADC separately |
| WIF invalid_grant | Stale external token | Refresh token source / pod |

---

## Agent Operational Directive

> **MANDATORY**: Gate on project ID. Prefer WIF/impersonation over SA keys. Keep CLI auth and ADC distinct. Never emit service account private keys.
