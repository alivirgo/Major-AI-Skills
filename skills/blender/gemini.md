---
title: "Blender 4.x AI Skill Guide (Gemini)"
description: "Multimodal Blender skill: compare viewport vs render stills, diagnose color/OCIO mismatches, and review Geometry Nodes graphs from screenshots."
category: "3D / Blender Automation"
tags: ["blender", "multimodal", "color-management", "gemini", "render-qa"]
---

# Blender 4.x AI Skill Guide (Gemini)

Gemini acts as a **Technical Artist reviewer**: use **images** (viewport, render result, node editor) plus **log snippets** to localize failures.

## Visual diagnostics

1. **Black frame**: check film transparent, camera clip, world strength, light energy — compare render vs viewport shading mode.
2. **Color shift**: read `View Transform` / `Look` from Color Management panel screenshot; compare sRGB display vs linear EXR.
3. **Fireflies / noise**: sample count vs denoiser; if farm output differs from local, suspect GPU/CPU device or OIDN.
4. **Geometry Nodes**: trace Group Input → missing attribute (pink mesh) → unlinked socket.

## Output format for agents

Return: **stage** (modeling/materials/render/export), **evidence** (what you see), **one CLI or bpy fix**, **determinism note** (seed/samples).

## When images insufficient

Request: `blender -b file.blend --python -c "import bpy; print(bpy.app.version_string)"` output and last 40 lines of stderr.
