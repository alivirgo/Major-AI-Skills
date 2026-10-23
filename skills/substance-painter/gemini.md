---
title: "Substance 3D Painter AI Skill Guide (Gemini)"
description: "Multimodal Painter skill: diagnose bake seams, normal Y-flip, UDIM gaps, and export pack errors from screenshots and engine comparison stills."
category: "3D / PBR Texturing"
tags: ["substance-painter", "gemini", "multimodal", "baking", "normals", "pbr-qa"]
---

# Substance 3D Painter AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **texturing QA specialist**: read **bake previews**, **viewport material mode**, **exported map thumbnails**, and **in-engine screenshots** to separate **geo/UV baker issues** from **color-space / pack** issues from **engine material setup**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal Painter triage                   │
│  Bake AO/Normal → seams / cages / naming                    │
│  Exported maps → sRGB misuse / inverted N.g                 │
│  Engine shot → packing vs sampler settings                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Cage spikes / black islands on normal bake**: ray distance or missing `_high` match.
2. **Seam visible only in engine**: check mip padding (infinite) and UV islands.
3. **Green-channel look (inverted lighting)**: DirectX vs OpenGL mismatch.
4. **Metal/rough look wrong**: sRGB flag on ORM channels in engine.
5. **Missing set after reimport**: material slot rename—ask for slot name diff.
6. **Do not prescribe unsolicited registry hacks with credentials**; if TDR is suspected, describe the symptom and ask for IT-approved policy.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| Spiky normals on bake | Baker rays | Frontal/rear + mesh names |
| Fine in Painter, wrong in UE | Export/pack | Preset name + sample flags |
| UDIM tile blank | UV layout | UDIM indices screenshot |
| Driver reset mid-bake | GPU TDR | Resolution/AA + bake one map |

---

## Output format for agents

Return: **stage** (import/bake/paint/export/engine), **evidence**, **one setting change**, **color-space note**.

---

## When images are insufficient

Request: Painter version, target engine, normal format setting, and export preset name.

---

## Agent Operational Directive

> **MANDATORY**: Separate baker geometry issues from export color/pack issues. Match normals to engine API. Never invent Adobe credentials.
