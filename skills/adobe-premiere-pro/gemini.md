---
title: "Adobe Premiere Pro NLE Automation AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Premiere timelines, offline media, Lumetri scopes, and AME queues from screenshots and panel text."
category: "Professional NLE Automation"
tags: ["premiere-pro", "gemini", "lumetri", "media-offline", "ame"]
---

# Adobe Premiere Pro NLE Automation AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an **Editorial QA / Diagnostics Specialist**: read **multimodal evidence**—timeline screenshots, Project panel offline icons, Lumetri scopes, AME queue errors—and separate **media path**, **sequence settings**, **cache**, and **export preset** failures.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal Premiere triage                    │
│  Timeline: red media / wrong rate / marker drift              │
│  Project: offline clip icons vs Productions root              │
│  Scopes: legal-range clip vs intentional look                 │
│  AME: preset mismatch / codec reject / disk full              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Offline media**: Media Linker / question-mark icons → ask for original volume path vs Project Manager collect path.
2. **Sequence mismatch**: Interpreting “interpret footage” warnings — flag mixed 23.976/29.97 before blaming Relink.
3. **Scopes**: Waveform crushing at 0/100 IRE on SDR deliverables → check Lumetri Output / Broadcast Safe vs creative grade.
4. **AME queue**: Red failed jobs → request preset name, source pixel format, and free disk on destination.
5. **Never ask users to paste Adobe passwords** or Team Project invite tokens into chat.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| Red clips in Project | Path / volume offline | Screenshot of Relink dialog + drive letter/UNC |
| Markers early/late vs script | Timebase vs seconds | Sequence settings panel (rate + display format) |
| AME job failed instantly | Preset/container mismatch | AME error text + `.epr` name |
| Stutter on scrub | Cache / proxy | Media Cache prefs + proxy enable state |
| Dynamic Link “needs render” | AE/Premiere desync | Purge cache; refresh Link |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose from offline icons, sequence settings, and AME error text before rewriting scripts. Distinguish media-path failures from export-preset failures. Never solicit Adobe credentials.
---

## Source anchors

- [Premiere UXP](https://developer.adobe.com/premiere-pro/uxp/)
- Studio Media Cache / Relink workflows (Adobe Help)
