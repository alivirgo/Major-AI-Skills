---
name: anthropic-api
description: "Integrate Anthropic Messages API with pinned Claude models, required max_tokens, tool_use loops, streaming, and prompt caching agents routinely miswire."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["anthropic", "claude", "messages-api", "tools", "prompt-caching", "streaming", "python"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Anthropic API Client AI Skill Guide (Claude)

## Overview & Engine Architecture

The **Anthropic SDK** talks to the **Messages API** (`messages.create` / stream). Requests require `model` and **`max_tokens`**; optional `system`, alternating user/assistant turns, tools, and `cache_control` breakpoints. Tool use returns `tool_use` content blocks; the client must execute allowlisted tools and continue with `tool_result`. Prompt caching prefixes follow **`tools → system → messages`**. Pin current model ids (verify deprecations); never invent keys.

```
┌─────────────────────────────────────────────────────────────┐
│                 Anthropic Messages runtime                    │
│                                                             │
│  messages.create / messages.stream                          │
│  ├── system (+ optional cache_control)                      │
│  ├── tools[] (cache breakpoint on last tool)                │
│  └── messages[] (user / assistant / tool_result)            │
│                                                             │
│  Response                                                   │
│  ├── content blocks: text | tool_use | ...                  │
│  ├── stop_reason: end_turn | tool_use | max_tokens | ...    │
│  └── usage: input/output + cache_creation/read tokens       │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Direct Claude integrations in backends, CLIs, and workers.
- Tool-calling assistants with JSON Schema tool definitions.
- Streaming UX or long stable system/tool prefixes that benefit from prompt caching.

**Do not use when**

- OpenAI-only stack is mandated → `@openai-api`.
- Full RAG ingestion product → `@llamaindex` (still use this skill for Claude calls).
- User wants unrestricted computer/shell tools without review → refuse; allowlist + human approval.

---

## Operational Capabilities & Agent Directives

1. **`ANTHROPIC_API_KEY` from environment only** — never commit or hardcode.
2. **Always set `max_tokens`** explicitly for production; treat `stop_reason=max_tokens` as a bug until raised or input trimmed.
3. **Pin model ids** (e.g. `claude-sonnet-4-6` for balanced prod; `claude-haiku-4-5` for high-volume). Check deprecation tables before copying old tutorial ids (`claude-sonnet-4-5` EOL paths exist).
4. **System vs user**: durable instructions in `system`; never put secrets in user turns that get logged.
5. **Tool loop correctness**: on `tool_use`, execute only allowlisted tools with schema-validated input; append `tool_result` and continue until `end_turn`.
6. **Prompt caching**: place `cache_control: {"type": "ephemeral"}` on the last tool and/or large system blocks; confirm hits via `cache_read_input_tokens` (short prompts below model minimum silently skip cache).
7. **Record `message.id` + usage** for cost and debugging; redact PII in logs.

---

## Production Example: Messages, tools, caching, streaming

```python
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

TOOLS = [
    {
        "name": "lookup_order",
        "description": "Read-only order status by order_id",
        "input_schema": {
            "type": "object",
            "properties": {"order_id": {"type": "string"}},
            "required": ["order_id"],
        },
        "cache_control": {"type": "ephemeral"},
    }
]

ALLOWED = {"lookup_order"}


def lookup_order(order_id: str) -> str:
    return f"order {order_id}: shipped"


msg = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "Support assistant. Use tools for facts. Never invent refunds.",
            "cache_control": {"type": "ephemeral"},
        }
    ],
    tools=TOOLS,
    messages=[{"role": "user", "content": "Status of ORD-1042?"}],
)

messages = [{"role": "user", "content": "Status of ORD-1042?"}]
while msg.stop_reason == "tool_use":
    tool_results = []
    for block in msg.content:
        if block.type != "tool_use":
            continue
        if block.name not in ALLOWED:
            raise PermissionError(block.name)
        result = lookup_order(**block.input)
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": result,
        })
    messages.append({"role": "assistant", "content": msg.content})
    messages.append({"role": "user", "content": tool_results})
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=[{"type": "text", "text": "Support assistant. Use tools for facts.", "cache_control": {"type": "ephemeral"}}],
        tools=TOOLS,
        messages=messages,
    )

for block in msg.content:
    if block.type == "text":
        print(block.text)
print(msg.usage)  # inspect cache_creation_input_tokens / cache_read_input_tokens
```

### Streaming

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=512,
    messages=[{"role": "user", "content": "Outline a dbt testing plan in 5 bullets."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Validation loop:

```bash
python -c "from anthropic import Anthropic; print(Anthropic().messages.create(model='claude-sonnet-4-6', max_tokens=16, messages=[{'role':'user','content':'ping'}]).id)"
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| 401 / 403 | Bad key or workspace permission | Fix `ANTHROPIC_API_KEY`; check org access |
| `stop_reason=max_tokens` | Cap too low (or thinking uses budget) | Raise `max_tokens`; shorten context |
| Tool loop errors / stalled | Missing `tool_result` or wrong `tool_use_id` | Continue conversation with matching ids |
| Cache never hits (0 read tokens) | Below minimum cacheable tokens; unstable prefix | Enlarge cached prefix; stabilize tools/system order |
| Cache invalidated every turn | Tool defs or system changing; `tool_choice` churn | Freeze tool schemas; put breakpoint before varying turns |
| High latency | Huge context; no cache | Trim; enable prompt caching on stable prefix |
| Bedrock/Vertex mismatch | Different model ids / headers | Use platform-specific clients and ids |
| Deprecated model errors | Old tutorial id past EOL | Migrate per Anthropic deprecation table |

---

## Best Practices

1. Prefer JSON Schema tools over free-form “call this function” prose.
2. Use streaming for interactive UX; non-stream for batch jobs with clear timeouts.
3. Cache large stable system + tool definitions; verify with usage cache fields.
4. Separate eval configs (deterministic, pinned model) from prod (`@ai-evaluation-dataset`).
5. Pair with `@langchain` only when graph/checkpoint complexity justifies it.
6. For long contexts, combine caching with explicit “cite or abstain” instructions when RAG is involved.

---

## Limitations

- Exact model ids rotate and deprecate—verify against current Anthropic docs.
- Bedrock / Vertex / Foundry exposures differ slightly from the public Claude API.
- Safety filters and rate limits are account-specific.
- Stop and ask if tool side effects, model tier, or retention requirements are unspecified.

---

## Related Skills

- `@openai-api` — alternate provider
- `@langchain` / `@llamaindex` — frameworks
- `@qdrant` / `@chromadb` — retrieval backends
- `@ai-evaluation-dataset` — golden evals
- `@model-tier-routing` — route Haiku vs Sonnet vs Opus

---

## Agent Operational Directive

> **MANDATORY**: Always pass `max_tokens`. Keys from environment only. Pin current non-deprecated model ids. Allowlist and validate tools; complete `tool_use` → `tool_result` loops correctly. Use prompt caching on stable tool/system prefixes and confirm cache reads in usage. Redact secrets from logs.

---

## Source anchors (research)

- [Messages API](https://platform.claude.com/docs/en/api/messages)
- [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Tool use with prompt caching](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-use-with-prompt-caching)
- [API usage primer](https://platform.claude.com/docs/en/claude_api_primer)
