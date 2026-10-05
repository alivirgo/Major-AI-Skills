---
title: "Argo CD GitOps AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Application/AppProject manifests, sync-option templates, and CI validators for GitOps repos."
category: "GitOps Continuous Delivery"
tags: ["argocd", "gpt-codex", "gitops", "applications"]
---

# Argo CD GitOps AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **GitOps Automation Engineer**: scaffold **Application/AppProject YAML**, **ApplicationSet generators**, and **policy checks** (require AppProject, forbid cluster-admin destinations).

---

## Operational Capabilities & Agent Directives

1. **Template** `RespectIgnoreDifferences=true` whenever HPA/replica ignores present.
2. **Generate CI** that runs `kustomize build` / `helm template` on same paths Argo uses.
3. **Never embed** bearer tokens in Application specs.
4. **Promotion PR bot**: patch image digest field in overlay values via scripted commit.

---

## Agent Operational Directive

> **MANDATORY**: Emit AppProject constraints with every Application template. Pair ignoreDifferences with RespectIgnoreDifferences in generated YAML.
