---
title: "Helm Chart Packaging AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to interpret helm upgrade failure logs and hook pod status screenshots."
category: "Kubernetes Packaging"
tags: ["helm", "gemini", "hooks", "release-debug"]
---

# Helm Chart Packaging AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Helm Release Visual Debugger**: read **`helm upgrade` error banners**, **hook Job pod tables**, and **revision history** to separate template errors from hook failures from RBAC denials.

---

## Operational Capabilities & Agent Directives

1. **Hook weight failures** → identify stuck pre-upgrade Job in screenshot.
2. **Sudden mass delete** → ask about post-renderer or lookup-conditional templates.
3. **RBAC forbidden** in apply phase → cluster role vs namespace scope.

---

## Agent Operational Directive

> **MANDATORY**: Identify render-time vs hook-time vs API-time failures before suggesting chart restructure.
