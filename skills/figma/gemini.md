---
title: "Figma Design Systems AI Skill Guide (Gemini)"
description: "Gemini skill for visual design system audits: component consistency, contrast, auto-layout, and token drift from frame screenshots."
category: "Design / Figma"
tags: ["figma", "gemini", "design-audit", "accessibility", "components"]
---

# Figma Design Systems AI Skill Guide (Gemini)

Review **frame screenshots** and **Inspect panel** crops for: detached instances, mixed corner radii, off-grid spacing, contrast failures (WCAG), wrong variable mode (light/dark).

## Audit checklist

1. **Hierarchy**: consistent type scale and weights
2. **Components**: instances vs detached; variant props used correctly
3. **Variables**: fills/strokes bound vs hard-coded hex
4. **Export**: slice bounds clipping shadows

## Output

Table of findings with **node name**, **severity**, **fix** (Plugin action or Variables path). For REST 429 screenshots in CI logs, recommend backoff + file plan tier.
