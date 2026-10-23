---
title: "Google Cloud gcloud CLI AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose gcloud project, ADC vs CLI auth, WIF, and IAM failures from CLI output, config list, and Console screenshots."
category: "Cloud CLI & Identity"
tags: ["gcloud", "gemini", "diagnostics", "wif", "adc", "iam"]
---

# Google Cloud gcloud CLI AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **gcloud Diagnostics Specialist**: read **error text, `gcloud config list`, auth lists, and Console IAM screenshots** to separate **wrong project**, **CLI≠ADC**, **expired sessions**, and **WIF token issues**.

```
┌─────────────────────────────────────────────────────────────┐
│                 gcloud multimodal triage                    │
│  403 → IAM role vs Org Policy                               │
│  Wrong resource → active project/config                     │
│  App works / gcloud fails → ADC vs CLI auth                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Wrong resource** → demand `gcloud config list` before recreating.
2. **Reauth** → `gcloud auth login`; if SDK-only symptom, fix ADC.
3. **WIF errors** → check external token file freshness and pool/provider mapping.
4. **Image pull on Cloud Run** → runtime SA + Artifact Registry IAM.
5. **Never request** SA JSON key contents in chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| Permission denied | Missing role / Org Policy | IAM policy binding; org constraint |
| Empty GCS / wrong GKE | Project mismatch | `config get-value project` |
| Python client 401, gcloud OK | ADC not set | ADC file / metadata |
| WIF invalid_grant | Stale ID token | Token mtime; K8s SA volume |
| kubectl plugin errors | Missing gke auth plugin | `gcloud components list` |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose project and auth channel (CLI vs ADC) before IAM sprawl. Prefer WIF over keys. Never ask users to paste service account private keys.
