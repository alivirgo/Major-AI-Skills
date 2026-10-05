---
title: "React UI Engineering AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to refactor components for derived state, fix effect deps, and generate Testing Library-friendly markup."
category: "Development / React"
tags: ["react", "hooks", "testing-library", "gpt-codex"]
---

# React UI Engineering AI Skill Guide (GPT & Codex)

## Operational Capabilities & Agent Directives

1. Remove effect-synced state when value is computable in render.
2. Emit components with `<button>`/`<label>` defaults for a11y.
3. Prefer `useId` for label/input pairing in forms.

## Agent Operational Directive

> **MANDATORY**: Fix exhaustive-deps properly; do not blanket-disable eslint. No fetch-in-useEffect for data available from server components.
