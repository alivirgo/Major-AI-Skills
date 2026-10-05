---
title: "Remotion AI Skill Guide (Gemini)"
description: "Gemini skill for visual regression on Remotion stills, diagnosing flicker, font, and color issues from frame captures."
category: "Video / Remotion"
tags: ["remotion", "gemini", "visual-regression", "fonts"]
---

# Remotion AI Skill Guide (Gemini)

Compare **golden PNG** vs **candidate render** at same `--frame` and `--scale`. Classify:

- **Text weight/layout shift** → font loading / fallback family
- **Random particle drift** → unseeded randomness
- **Color shift** → missing sRGB embed on PNG source; CSS filter
- **Edge shimmer** → subpixel animation not snapped to integer pixels

Request `npx remotion still ... --log=verbose` excerpt if timeout suspected.
