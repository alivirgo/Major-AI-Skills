---
title: "Flux CD GitOps AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Flux reconcile failures from Ready tables, controller logs, HelmRelease events, and Git path screenshots."
category: "Kubernetes GitOps"
tags: ["flux", "fluxcd", "gemini", "diagnostics", "helmrelease", "kustomization"]
---

# Flux CD GitOps AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **GitOps Diagnostics Specialist**: read **`flux get` tables, condition messages, and controller error logs** to separate **source auth**, **build/apply**, and **workload health** failures.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal Flux triage                      │
│  Ready=False row → which kind? source vs applier            │
│  Helm “not ready” → chart vs repo vs wait/health            │
│  Unknown/Reconciling long → Helm action vs CrashLoop wait   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Start with** `flux get all -A --status-selector ready=false` before rewriting manifests.
2. **HelmChart not ready** → check HelmRepository URL/index, then chart name/version.
3. **HealthCheckFailed / retries exhausted** → inspect Deployment/Pod events, not only Flux YAML.
4. **Drift spam / constant configured events** → look for null/empty optional fields in Git YAML.
5. **Never ask** for GitHub PATs or deploy key private material in chat—point to existing Secret names.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| GitRepository False | Auth / URL / ref | Secret exists? `flux logs` clone error |
| Kustomization build error | Path / patch | Repo tree at `spec.path` |
| HelmRelease False, chart OK | values / CRDs / wait | `kubectl describe helmrelease` events |
| Stuck Ready Unknown | Long wait / crashloop | Pod status + helm-controller logs |
| kubectl helmcharts empty | Wrong CRD | `flux get sources chart` |

---

## Agent Operational Directive

> **MANDATORY**: Walk source → applier → workload. Distinguish chart fetch failures from install health waits. Never solicit Git credentials in chat.
