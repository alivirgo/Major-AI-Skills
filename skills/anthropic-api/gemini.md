---
title: "Anthropic API Client AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose Claude Messages failures from stop_reason, usage/cache fields, tool_use timelines, and error screenshots."
category: "LLM Provider SDKs"
tags: ["anthropic", "claude", "gemini", "diagnostics", "prompt-caching", "tools"]
---

# Anthropic API Client AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **Claude API Diagnostics Specialist**: read **message JSON, stop_reason, usage cache fields, tool_use timelines, and dashboard screenshots** to separate **truncation**, **tool wiring**, **cache miss**, and **auth** failures.

```
┌─────────────────────────────────────────────────────────────┐
│                 Claude multimodal triage                    │
│  stop_reason → content blocks → tool_result continuity      │
│  → cache_creation/read tokens → 401/429                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Always read `stop_reason`** before rewriting prompts (`max_tokens` vs `tool_use` vs `end_turn`).
2. **Tool timelines**: match each `tool_use.id` to a later `tool_result`; flag missing results.
3. **Cache diagnostics**: both cache fields 0 → below minimum or unstable prefix—not “caching broken”.
4. **Model id screenshots**: flag deprecated Sonnet/Opus tutorial strings and suggest current pins.
5. **Never collect raw API keys** from screenshots; instruct rotation if exposed.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| Cut-off mid-sentence | max_tokens | Full message JSON stop_reason |
| “Model called tool then stopped” | Missing tool_result continue | Conversation messages array |
| High bill, no cache hits | Prefix too short / changing | usage cache_* fields |
| 401 | Key/env | Which env var; no key paste |
| Works on API, fails Bedrock | Id/header mismatch | Platform + model id |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose from stop_reason, tool_use continuity, and cache usage fields before prompt rewrites. Flag deprecated model ids and unrestricted tools. Never request raw API keys.
