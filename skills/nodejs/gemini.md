---
title: "Node.js Runtime AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose event-loop stalls, memory spikes, and middleware-order webhook failures from logs and metrics."
category: "Development / Node.js"
tags: ["nodejs", "diagnostics", "gemini"]
---

# Node.js Runtime AI Skill Guide (Gemini)

## Operational Capabilities & Agent Directives

1. **Latency cliffs**: Sync fs/crypto in request path → event loop blocked.
2. **Signature failures**: Look for JSON parser middleware before webhook route.
3. **Heap growth**: Unbounded in-memory caches on hot paths.

## Agent Operational Directive

> **MANDATORY**: Recommend middleware order fixes before disabling webhook verification.
