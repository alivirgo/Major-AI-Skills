---
title: "Vitest Testing AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to explain order-dependent failures, mock bleed, and pool/isolation tradeoffs from test output."
category: "Testing / Vitest"
tags: ["vitest", "flaky", "isolation", "gemini"]
---

# Vitest Testing AI Skill Guide (Gemini)

## Operational Capabilities & Agent Directives

1. **Passes alone, fails in suite**: Classic shared mock/module cache—check `isolate: false`.
2. **Alphabetical order sensitivity**: Document files A→B failure pattern (Vitest #9499 class).
3. **Timer flakes**: Real timers left on—missing `useRealTimers`.

## Agent Operational Directive

> **MANDATORY**: Treat parallel flakiness as isolation/mock bug until proven otherwise.
