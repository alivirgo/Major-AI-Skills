---
title: "LangChain & LangGraph AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate LCEL pipelines, create_agent graphs, middleware, lockfile pins, and CI golden-eval harnesses with tool allowlists."
category: "LLM Orchestration"
tags: ["langchain", "langgraph", "lcel", "agents", "gpt-codex", "ci-automation"]
---

# LangChain & LangGraph AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **LLM Platform Automation Engineer**: emit **parameterized chains/agents**, **pyproject pins**, **tool schema validators**, and **eval CI jobs** that bind model id + prompt hash + dataset hash.

```
┌─────────────────────────────────────────────────────────────┐
│                 LangChain Automation Stack                  │
│  LCEL templates → create_agent factory → lockfile pins        │
│  tool allowlist linter → golden JSONL → CI gate               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Scaffold** `my_agent/{agent,tools,state}.py` + `langgraph.json` when deploying graphs.
2. **Generate tool wrappers** with Pydantic/arg schemas and deny-lists for `subprocess`, raw SQL, unrestricted HTTP.
3. **Emit version pins** for `langchain`, `langgraph`, provider packages—never unpinned `latest`.
4. **Wire CI**: temperature=0 invoke over golden questions; fail on missing citations / unexpected tool calls.
5. **Never hardcode API keys**; read from env / secret managers only.

---

## Production Python: tool-name allowlist auditor

```python
"""Fail CI if agent tools are outside the approved allowlist."""
from __future__ import annotations

import ast
import sys
from pathlib import Path

ALLOW = {"lookup_order", "search_policies", "get_account_tier"}


def tool_names_from_file(path: Path) -> set[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"))
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and ast.get_docstring(node):
            # Heuristic: top-level functions passed to create_agent(tools=[...])
            names.add(node.name)
    return names


def main(agent_py: Path) -> None:
    found = tool_names_from_file(agent_py)
    # Prefer explicit TOOLS = [...] constant in real projects
    extras = found - ALLOW
    if extras:
        print(f"Unapproved tool candidates: {sorted(extras)}")
        raise SystemExit(1)
    print("tool surface OK")


if __name__ == "__main__":
    main(Path(sys.argv[1] if len(sys.argv) > 1 else "my_agent/tools.py"))
```

---

## Technical Troubleshooting Matrix

| CI/runtime signature | Automation check | Script fix |
| :--- | :--- | :--- |
| Import errors on provider | Lockfile missing extras | Add `langchain-openai` / anthropic |
| Eval flake | Temp not forced 0 | Inject `temperature=0` in factory |
| Unbounded agent cost | No max-steps middleware | Patch middleware list in generator |
| Trace leaks keys | Callback dumps env | Strip `Authorization` / `.env` fields |

---

## Agent Operational Directive

> **MANDATORY**: Automate package pins, tool allowlists, and golden-eval gates. Generate `create_agent` / LCEL—not legacy AgentExecutor. Never emit credential literals.
