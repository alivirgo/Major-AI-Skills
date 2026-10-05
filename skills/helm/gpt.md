---
title: "Helm Chart Packaging AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to scaffold charts, JSON schemas, CI helm template/kubeconform pipelines, and ban unsafe lookup patterns."
category: "Kubernetes Packaging"
tags: ["helm", "gpt-codex", "charts", "ci", "kubeconform"]
---

# Helm Chart Packaging AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Chart Automation Engineer**: generate **chart scaffolds**, **values.schema.json**, **GitHub Actions** running `helm lint`, `helm template | kubeconform`, and **dependency pin checks**.

---

## Operational Capabilities & Agent Directives

1. **Always generate `_helpers.tpl`** with standard labels.
2. **CI fails** if `Chart.lock` out of date vs `Chart.yaml` dependencies.
3. **Lint rule**: reject templates containing `lookup` unless file includes WARNING comment approved by user.
4. **Emit multi-env values** `values.dev.yaml` / `values.prod.yaml` without secrets.

---

## Production CI snippet

```yaml
- run: helm dependency build ./chart
- run: helm lint ./chart
- run: helm template rel ./chart -f values.ci.yaml | kubeconform -kubernetes-version 1.29.0 -
```

---

## Agent Operational Directive

> **MANDATORY**: Automate lint+template+kubeconform on every chart PR. Never commit prod passwords in values files.
