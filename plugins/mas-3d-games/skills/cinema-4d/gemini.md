---
title: "Maxon Cinema 4D AI Skill Guide (Gemini)"
description: "Multimodal Cinema 4D skill: diagnose Redshift RV artifacts, MoGraph viewport failures, and OCIO mismatches from screenshots plus Commandline/c4dpy log snippets."
category: "3D Motion Graphics & Visual Effects"
tags: ["cinema-4d", "redshift", "mograph", "gemini", "multimodal", "render-qa"]
---

# Maxon Cinema 4D AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **C4D / Redshift diagnostics specialist**: read **multimodal evidence**—Render View (RV) stills, MoGraph viewport screenshots, AOV thumbnails, and truncated farm logs—to separate **VRAM/path** failures from **lighting/look** issues from **dynamics explosions**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal C4D triage                       │
│  RV beauty / AOVs → noise vs fireflies vs black             │
│  Viewport MoGraph → collision explode vs missing effector   │
│  Logs: CUDA OOM vs missing tex vs OCIO                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Black frame**: check camera, lights, world/GI, film transparency, and whether Redshift is the active renderer—not Standard.
2. **Noise / fireflies**: sample count vs lights with tiny sources; suggest clamps / light samples before blind sample doubling.
3. **VRAM OOM in log**: recommend proxies + texture streaming before hardware advice.
4. **MoGraph explode screenshot**: look for interpenetrating clones at frame 0; ask for Dynamics Body collision shape settings.
5. **Color shift local vs farm**: compare OCIO view transform in UI screenshot vs EXR linear delivery.
6. **Never recommend pasting license keys** from screenshots—redirect to authorized IT process.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence to request |
| :--- | :--- | :--- |
| Red/black RV, CUDA in log | Memory | Redshift Memory prefs + texture list |
| Exploding clones at F0 | Dynamics | Cloner Dynamics tag collision shape |
| Washed EXR in Nuke | Color | OCIO config path on worker + view transform |
| Pink materials | Paths | Project Asset Inspector screenshot |
| Farm empty sequence | CLI | Exact Commandline argv + first 40 log lines |

---

## Output format for agents

Return: **stage** (scene/MoGraph/Redshift/farm), **evidence** (what the image/log shows), **one concrete fix**, **VRAM or OCIO note** when relevant.

---

## When images are insufficient

Request: C4D/Redshift version strings, `Commandline` argv, and whether Out-of-Core / texture streaming are enabled.

---

## Agent Operational Directive

> **MANDATORY**: Diagnose from RV + logs before rewriting whole scenes. Separate VRAM/path/OCIO failures from lookdev. Do not invent credentials or registry “fixes” with secrets.
