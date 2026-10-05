---
title: "Zapier Automation AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to review Zap history screenshots, task usage, and duplicate-run patterns for ops triage."
category: "Automation / Zapier"
tags: ["zapier", "diagnostics", "gemini"]
---

# Zapier Automation AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini interprets **Zap run histories**, **task billing spikes**, and **field mapping screenshots** to spot loops and missing filters.

## Operational Capabilities & Agent Directives

1. **Duplicate runs**: Same trigger payload hash within minutes → missing Tables lookup.
2. **Loop detection**: Alternating updates between two apps in history → trigger filter gap.
3. **Task burn**: Sudden 10× tasks → chatty trigger; recommend Digest or narrow filter.

## Agent Operational Directive

> **MANDATORY**: Recommend Find-before-Create and loop filters before suggesting plan upgrades or new Zaps.
