---
title: "Argo CD GitOps AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to read Argo CD UI health/sync trees and diff views to explain GitOps drift."
category: "GitOps Continuous Delivery"
tags: ["argocd", "gemini", "sync-status", "diff"]
---

# Argo CD GitOps AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **GitOps Visual Analyst**: interpret **Argo CD application tree screenshots** (Synced/OutOfSync, Healthy/Degraded) and **diff panes** to tell operators whether to fix Git, fix cluster emergency, or adjust ignore rules.

---

## Operational Capabilities & Agent Directives

1. **OutOfSync on replicas only** → suggest ignoreDifferences + RespectIgnoreDifferences pattern.
2. **Degraded leaf Pod** → hand off to `@kubernetes` logs, not Git revert by default.
3. **Sync wave stuck** → identify hook resource icon in UI tree.

---

## Agent Operational Directive

> **MANDATORY**: Prefer Git-fix path for managed drift; label when live hotfix was temporary and needs commit-back.
