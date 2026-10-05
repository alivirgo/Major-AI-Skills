---
title: "Unreal Engine 5 AI Skill Guide (Gemini)"
description: "Gemini skill for reading UAT/cook logs, MRQ output review, and Nanite/Lumen visual regression from screenshots."
category: "Game Engines / Unreal"
tags: ["unreal-engine", "gemini", "cook-logs", "mrq", "packaging"]
---

# Unreal Engine 5 AI Skill Guide (Gemini)

Parse **Saved/Logs/Log.txt** slices and **Output Log** screenshots for cook errors (`Error:`, `Ensure condition failed`, `LogShaderCompilers`).

## Visual checks

- **Nanite fallback**: wireframe overlay vs high-poly — check Nanite enabled on static mesh
- **Exposure pumping**: MRQ vs PIE — compare exposure compensation in post process volume
- **Black MRQ output**: wrong **Output Directory**, GPU timeout, or missing sequence camera cut

## Classification output

| Bucket | Examples |
| :--- | :--- |
| Content | Missing reference, bad redirector |
| Cook | Shader compile, platform mismatch |
| Packaging | Map not in list, staging path |
| Render | MRQ settings, color space |

Recommend one UAT flag or Project Setting path per finding.
