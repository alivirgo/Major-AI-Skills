---
title: "Adobe After Effects Motion Graphics AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose AE comps, expression errors, Render Queue statuses, and Essential Graphics panels from screenshots."
category: "Motion Graphics Automation"
tags: ["after-effects", "gemini", "expressions", "render-queue", "mogrt"]
---

# Adobe After Effects Motion Graphics AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Motion QA / Diagnostics Specialist**: read **comp viewers**, **expression error banners**, **Render Queue status columns**, and **Essential Graphics** panels to separate **expression**, **font**, **template**, and **cache** failures.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal AE triage                          │
│  Viewer: missing font / wrong safe margins                    │
│  Timeline: expression bang / disabled layer                   │
│  RQ: NEEDS_OUTPUT / ERR_STOPPED / QUEUED                      │
│  Essential Graphics: exposed props vs mogrt expectations      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Yellow expression banner** → request expression text + layer/property path screenshot.
2. **RQ NEEDS_OUTPUT** → confirm Output Module path includes container extension.
3. **Font fallback** → Character panel font name vs studio list.
4. **mogrt mismatch in Premiere** → verify exposed control types (text/slider/color/checkbox only).
5. **Never solicit Adobe passwords** or ask to paste license keys.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| Expression bang icon | Bad path / syntax | Expression editor contents |
| RQ item gray / needs output | Missing file path | Output Module settings |
| Render stops mid-way | Disk full / codec | RQ error text + free space |
| Premiere mogrt not editable | Prop not exposed | Essential Graphics panel |
| Dynamic Link checkerboard | Cache / link stale | Purge + refresh Link |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose from RQ status and expression banners before rewriting comps. Distinguish missing templates from missing output paths. Never request Adobe credentials.
---

## Source anchors

- [Render Queue statuses](https://ae-scripting.docsforadobe.dev/renderqueue/renderqueue/)
- Adobe Help — Essential Graphics / mogrt
