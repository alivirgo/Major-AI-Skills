---
title: "Anthropic API Client AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Anthropic Messages clients, tool loops, prompt-cache breakpoints, and max_tokens/CI smoke checks."
category: "LLM Provider SDKs"
tags: ["anthropic", "claude", "messages-api", "prompt-caching", "tools", "gpt-codex"]
---

# Anthropic API Client AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Claude Integration Automation Engineer**: emit **Messages clients**, **strict tool loops**, **cache_control placement**, and **CI smokes** that fail if `max_tokens` is missing or tools are unrestricted.

```
┌─────────────────────────────────────────────────────────────┐
│                 Anthropic Automation                        │
│  client factory → tools schemas → cache breakpoints         │
│  tool_use loop runner → usage/cache assertions → CI smoke   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate `get_anthropic_client()` reading `ANTHROPIC_API_KEY` only.
2. **Lint** every `messages.create` for explicit `max_tokens` and pinned `model`.
3. Emit tool runners that **reject** unknown tool names and validate JSON Schema inputs.
4. Place `cache_control` on the **last tool** and large system blocks; log cache read tokens.
5. Never hardcode keys; never generate computer-use/shell tools without an explicit product gate.

---

## Production Python: stop_reason / max_tokens guard

```python
"""Fail closed when the model hits max_tokens unexpectedly."""
from __future__ import annotations

from anthropic import Anthropic
from anthropic.types import Message


def assert_complete(msg: Message, *, allow_tool_use: bool = True) -> None:
    if msg.stop_reason == "max_tokens":
        raise RuntimeError("truncated: raise max_tokens or reduce prompt")
    if msg.stop_reason == "tool_use" and not allow_tool_use:
        raise RuntimeError("unexpected tool_use")
    if msg.stop_reason not in {"end_turn", "tool_use", "stop_sequence"}:
        raise RuntimeError(f"unexpected stop_reason={msg.stop_reason}")


def smoke() -> None:
    client = Anthropic()
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=64,
        messages=[{"role": "user", "content": "Reply with the word pong."}],
    )
    assert_complete(msg, allow_tool_use=False)
    print(msg.id, msg.usage)


if __name__ == "__main__":
    smoke()
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Silent truncations | No stop_reason assert | Add `assert_complete` |
| Cache miss always | Prefix < minimum / mutating tools | Stabilize tools; enlarge system |
| Tool loop hang | Missing tool_result | Shared loop helper with id wiring |
| Deprecated model in CI | Pin file outdated | Sync with deprecation table |

---

## Agent Operational Directive

> **MANDATORY**: Automate env-only keys, required `max_tokens`, allowlisted tool loops, and cache breakpoint placement. Pin non-deprecated model ids. Never emit credential literals.
