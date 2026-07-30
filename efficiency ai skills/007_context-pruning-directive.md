---
title: "Context Pruning Directive"
description: "Instructs model to drop historical turn context when switching tasks to save input tokens."
keywords: "efficiency, token reduction, prompt optimization, AI performance, token compression, context-pruning-directive"
category: "Token Efficiency and Performance"
---

# Context Pruning Directive

## Overview
Instructs model to drop historical turn context when switching tasks to save input tokens.

---

## Operational Directives and Agent Execution Rules
When applying **Context Pruning Directive**, the AI agent or LLM runtime MUST adhere to the following rules:

1. **Primary Objective**: Reduce unnecessary input/output tokens while maintaining 100% technical accuracy.
2. **Actionable Standard**: Strip preambles, conversational filler, and redundant repetition.
3. **Target Environment**: Compatible with Claude Code, OpenAI Codex, LM Studio, OpenClaw, Antigravity, and VS Code extensions.

---

## Implementation Example and Syntax

### Non-Efficient (High Token Waste)
```text
Hello! Sure, I would be happy to help you with that task. Here is the detailed explanation and full code file...
```

### Token-Optimized (High Efficiency)
```text
[Action Completed: File Updated] - Lines 45-50 replaced.
```

---

## Efficiency Impact Metric
- **Estimated Token Savings**: 30% to 70% per turn
- **Latency Reduction**: 2x Faster Response Time
- **Context Retention**: Preserves context window capacity for complex reasoning

---
*Part of the Efficiency AI Skills Suite. Designed for high-performance agentic engineering.*
