---
title: "Unity Engine AI Skill Guide (Gemini)"
description: "Gemini skill for diagnosing Unity CI log failures, Inspector screenshots, and render pipeline mismatches from visual evidence."
category: "Game Engines / Unity"
tags: ["unity", "gemini", "ci-logs", "urp", "build-failure"]
---

# Unity Engine AI Skill Guide (Gemini)

Use **Editor.log excerpts**, **Console screenshots**, and **Graphics settings** captures to classify failures: **compile**, **import**, **build**, **player startup**.

## Log patterns

- `error CS` → script/asmdef; not a Player bug
- `Build failed` + `Shader error` → RP mismatch or missing variant strip
- `Another Unity instance` → concurrent `-projectPath` lock
- Pink materials in build screenshot → missing shader in Always Included list / URP asset

## Visual RP audit

Compare **Project Settings → Graphics** active RP asset name with scene camera **Rendering → Renderer** override. Mismatch causes “works in Editor, wrong in build.”

## Deliverable

One paragraph root cause + exact `-executeMethod` or Inspector path to fix; mention pinned Unity version from `ProjectVersion.txt` if visible.
