---
title: "Kubernetes Cluster Operations AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate validated manifests, CI kubeconform gates, rollout scripts, and probe-safe Deployment templates."
category: "Kubernetes Platform"
tags: ["kubernetes", "kubectl", "gpt-codex", "kubeconform", "rollouts", "probes"]
---

# Kubernetes Cluster Operations AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Kubernetes Platform Automation Engineer**: produce **schema-valid YAML**, **Helm-free base manifests**, **CI validation pipelines**, and **idempotent rollout scripts** with pinned images and probe templates.

```
┌─────────────────────────────────────────────────────────────┐
│                 K8s Manifest Automation                     │
│  Template → kubeconform/kube-score → policy (optional)      │
│  CI: dry-run apply + image digest pin check                 │
│  Scripts: rollout wait + automatic undo on failed health    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Emit complete probe triples** (startup/readiness/liveness) with distinct paths when apps support it.
2. **Generate CI jobs** running `kubeconform -kubernetes-version <pin>` on every manifest path.
3. **Script rollouts**: `kubectl rollout status --timeout=5m || kubectl rollout undo`.
4. **Never generate** cluster-admin ClusterRoleBindings or Secret literals with real base64.
5. **Parameterize** image repo/tag/digest via env for GitOps bump PRs.

---

## Production bash: guarded rollout

```bash
#!/usr/bin/env bash
set -euo pipefail
NS="${1:?namespace}"
DEP="${2:?deployment}"
kubectl -n "$NS" rollout status "deployment/$DEP" --timeout=300s || {
  kubectl -n "$NS" rollout undo "deployment/$DEP"
  kubectl -n "$NS" rollout status "deployment/$DEP" --timeout=300s
  exit 1
}
```

---

## Technical Troubleshooting Matrix

| CI failure | Automation fix |
| :--- | :--- |
| Invalid schema | Pin kubeconform k8s version to cluster minor |
| Duplicate labels | Centralize labels in kustomize or helm helper |
| Image floating tag | Fail if image lacks `@sha256:` in prod overlay |

---

## Agent Operational Directive

> **MANDATORY**: Gate manifest changes with schema validation and rollout scripts that undo on timeout. Template startupProbe for any container with boot >30s. Pin digests in generated prod overlays.
