---
title: "Flux CD GitOps AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Flux GitRepository/Kustomization/HelmRelease pipelines, reconcile scripts, and Ready-condition CI gates."
category: "Kubernetes GitOps"
tags: ["flux", "fluxcd", "gitops", "helmrelease", "kustomization", "gpt-codex"]
---

# Flux CD GitOps AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **GitOps Pipeline Engineer**: emit **source + applier YAMLs**, **pin chart/image versions**, and **shell/CI gates** that fail when any Flux object is `Ready=False`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Flux automation                             │
│  bootstrap path → GitRepository → Kustomization/HelmRelease │
│  CI: flux get --status-selector ready=false must be empty   │
│  Incident: suspend → Git fix → resume                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Always emit **both** Source and Applier CRs with matching `sourceRef`.
2. Pin Helm chart `version` and prefer image digests in overlays.
3. Generate debug scripts: `flux get all -A --status-selector ready=false` then kind-specific logs.
4. Include `prune: true` only with a comment to review inventory on first enable.
5. Never hardcode deploy keys / PAT / registry passwords—`secretRef` names only.

---

## Production bash: Ready gate for CI

```bash
#!/usr/bin/env bash
set -euo pipefail
# Fail if any Flux object is not Ready (run after sync window)
bad="$(flux get all -A --status-selector ready=false --no-header 2>/dev/null | wc -l | tr -d ' ')"
if [[ "${bad}" != "0" ]]; then
  echo "Flux objects not Ready:"
  flux get all -A --status-selector ready=false
  exit 1
fi
echo "All Flux objects Ready"
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| HelmChart not ready | `flux get sources chart` | Fix chart name/version/repo URL |
| Kustomization False | `flux logs --kind=Kustomization` | Fix path/patches in Git |
| Install retries exhausted | describe HelmRelease events | Fix workload; raise timeout |
| CRD collision | use FQDN get | `helmcharts.source.toolkit.fluxcd.io` |

---

## Agent Operational Directive

> **MANDATORY**: Generate source→applier chains with pins and Ready gates. Suspend/resume for incidents. Never emit credential literals—only Secret names.
