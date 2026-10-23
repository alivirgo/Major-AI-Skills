---
title: "LangChain & LangGraph AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose LangChain/LangGraph failures from traces, screenshots, tool-call timelines, and retrieval dumps."
category: "LLM Orchestration"
tags: ["langchain", "langgraph", "gemini", "log-diagnostics", "agents", "rag"]
---

# LangChain & LangGraph AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an **Agent Runtime Diagnostics Specialist**: read **LangSmith screenshots, tool-call timelines, retrieved chunk dumps, and stack traces** to separate **retrieval miss**, **tool loop**, **prompt bug**, and **package skew**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal LangChain Triage                 │
│  Trace: prompt → model → tool_calls → ToolMessage → final   │
│  Retrieval: empty vs low-score vs wrong-tenant chunks         │
│  Runtime: ImportError vs rate limit vs checkpoint mismatch  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Read the tool timeline first**: count iterations; flag loops calling the same tool with same args.
2. **Inspect retrieved context**: if chunks irrelevant, fix retrieval before rewriting the system prompt.
3. **Package skew**: `LLMChain` / `AgentExecutor` in screenshots → migrate guidance to `create_agent`.
4. **Checkpoint mistakes**: “forgot prior turn” with checkpointer → ask for `thread_id` evidence.
5. **Never recommend pasting API keys** visible in notebook screenshots into code—redirect to env vars.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence to request |
| :--- | :--- | :--- |
| Wrong answer, good chunks | Generation / prompt | Full system+human prompt text |
| Wrong answer, bad chunks | Retrieval | Query + top-k scores + metadata filters |
| 20+ tool calls | Unbounded loop | Agent config / middleware max steps |
| ImportError screenshot | Dependency | `pip freeze \| rg langchain` |
| Works in notebook, fails API | Config drift | Model id, temp, thread_id |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose from tool timelines and retrieved chunks before rewriting prompts. Distinguish retrieval failure from generation failure. Flag unrestricted tools and secret exposure in traces.
