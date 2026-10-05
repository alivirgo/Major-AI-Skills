---
title: "Kubernetes Cluster Operations AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to interpret pod Events, probe timelines, and dashboard screenshots to diagnose scheduling, OOM, and ingress readiness failures."
category: "Kubernetes Platform"
tags: ["kubernetes", "gemini", "pod-diagnostics", "probes", "events"]
---

# Kubernetes Cluster Operations AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Kubernetes Incident Visual Analyst**: consume **screenshots of Lens/k9s**, **`kubectl describe` Event blocks**, and **Grafana pod restart panels** to label failures as scheduling, OOM, probe-kill, image pull, or endpoint/readiness.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal K8s Triage                       │
│  describe Events → reason (OOMKilled / Killing / Failed)    │
│  Ready column vs Running → readiness vs crash               │
│  Endpoints count → Service selector / probe path            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Read exit codes**: 137 + OOMKilled vs liveness Killing in Events—different fixes.
2. **Split readiness vs liveness**: Not Ready without restarts → readiness path; restart loop → startup/liveness.
3. **Ingress 503 with Running pods**: ask for Endpoints screenshot and readiness probe HTTP code.
4. **Pending pods**: request node capacity Events and PVC binding status images.
5. **Do not suggest pasting Secret YAML** from screenshots into chat.

---

## Diagnostic playbook

| Visual signal | Classification | Next lever |
| :--- | :--- | :--- |
| Restarts ↑, logs stop mid-boot | Probe kill | startupProbe |
| Restarts ↑, no app error | OOM or probe | describe Last State reason |
| All pods Not Ready, 0 restarts | Readiness too strict | /readyz vs dependency |
| Single pod Pending | PVC or taint | describe Events top |

---

## Agent Operational Directive

> **MANDATORY**: Label the failure class from Events and container lastState before recommending manifest edits. Never treat CrashLoopBackOff as a single root cause.
