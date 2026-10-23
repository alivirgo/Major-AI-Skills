---
title: "MLflow Tracking & Registry AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose empty UIs, artifact permission errors, metric compare failures, and registry stage/alias confusion from screenshots and server logs."
category: "Experiment Tracking & Model Registry"
tags: ["mlflow", "gemini", "artifacts", "tracking-uri", "aliases", "diagnostics"]
---

# MLflow Tracking & Registry AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an **ML tracking diagnostics specialist**: read UI screenshots, artifact error banners, and trainer logs to separate **URI mismatch**, **artifact proxy misconfig**, and **promotion policy** issues.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal MLflow triage                      │
│  Tracking URI → experiment → artifacts → registry alias     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Empty UI → compare trainer `MLFLOW_TRACKING_URI` to the URL in the browser.
2. Artifact list errors → check proxied `--artifacts-destination` / boto3 / MinIO endpoint shape; remind that fixes often need a **new experiment**.
3. Stage-based load failures → migrate guidance to `models:/name@champion`.
4. Never ask for raw cloud secret values in chat—confirm env var **names** only.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| No runs visible | URI / experiment name | `mlflow.get_tracking_uri()` print |
| Unable to list artifacts | Proxy / IAM / MinIO | server start flags + server logs |
| Compare button useless | Metric name drift | two run metric panels |
| Production stage missing | deprecation | aliases on model version page |

---

## Agent Operational Directive

> **MANDATORY**: Verify tracking URI and artifact mode before rewriting training code. Prefer aliases over stages. Flag credential leakage in UI env screenshots.
