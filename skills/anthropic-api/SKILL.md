---
name: anthropic-api
description: "Operational skill for the Anthropic API: Messages, system prompts, tool use, streaming, and production Claude client hygiene."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["anthropic", "claude", "api", "llm", "python", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Anthropic API Client AI Skill Guide

## Overview & Engine Architecture

The Anthropic SDK talks to the Messages API for Claude models. Requests include `model`, `max_tokens`, optional `system`, and alternating user/assistant messages; tool use returns `tool_use` blocks the client must execute and continue with `tool_result`. Agents pin model ids, always set `max_tokens`, stream when UX needs tokens early, and keep tools allowlisted.

```
messages.create
   -> content blocks (text / tool_use)
   -> client executes tools
   -> messages continues with tool_result
```

## When to use this skill

- Direct Claude integrations in apps/backends
- Tool-calling workflows with strict schemas
- Streaming assistants and batch analysis jobs

## Operational directives

1. Use `ANTHROPIC_API_KEY` from the environment only.
2. Always pass `max_tokens`; do not rely on implicit defaults for prod.
3. Put durable instructions in `system`; keep user turns free of secret keys.
4. On `tool_use`, execute only allowlisted tools with validated input.
5. Record `message.id` / usage for debugging and cost attribution.

## Messages example

```python
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

msg = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=512,
    system="Answer briefly. If context is missing, say what you need.",
    messages=[
        {"role": "user", "content": "Give two risks of skipping data validation in ETL."},
    ],
)
for block in msg.content:
    if block.type == "text":
        print(block.text)
print(msg.usage)
```

## Streaming

```python
with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=256,
    messages=[{"role": "user", "content": "Outline a dbt testing plan."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| 401/403 | key/permission | check env + workspace |
| stop_reason=max_tokens | cap too low | raise max_tokens |
| Tool loop errors | missing tool_result | continue conversation correctly |
| High latency | huge context | trim; cache prompts when available |

## Best practices

- Prefer tools with JSON schemas over free-form function strings.
- Separate evaluation prompts (temp-like sampling controls) from prod configs.
- Use prompt caching features when supported for large stable system contexts.
- Pair with `@langchain` only when orchestration complexity justifies it.

## Limitations

- Exact model ids rotate; verify against current Anthropic docs.
- Bedrock/Vertex exposures differ slightly from the public API.
- Safety filters and rate limits are account-specific.

## Related skills

- `@openai-api` - alternate provider
- `@langchain` / `@llamaindex` - app frameworks
- `@chromadb` - retrieval backing store
