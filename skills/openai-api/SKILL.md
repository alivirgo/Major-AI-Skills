---
name: openai-api
description: "Operational skill for the OpenAI API: chat completions/responses, tools, embeddings, retries, and production client hygiene."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["openai", "api", "llm", "embeddings", "python", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# OpenAI API Client AI Skill Guide

## Overview & Engine Architecture

The OpenAI Python/TypeScript SDKs call HTTP APIs for chat/responses, tools, embeddings, and media. Auth uses `OPENAI_API_KEY` (or Azure-specific endpoints). Agents pin model names, set timeouts/retries, bound `max_tokens`, separate system vs user content, and treat tool calls as privileged actions requiring validation.

```
Client (SDK)
   -> Chat/Responses / Embeddings / Images
   -> usage + rate limits
```

## When to use this skill

- Direct model calls without a heavy framework
- Embeddings for `@chromadb` / RAG
- Tool-calling agents with explicit function schemas

## Operational directives

1. Load API keys from the environment - never commit keys.
2. Set request timeouts; retry only idempotent GETs / safe completions with backoff.
3. Pin model ids used in production; log them with each request id.
4. Validate/allowlist tool names and arguments before executing side effects.
5. Redact PII in logs; do not log full prompts when they contain secrets.

## Chat example (Python SDK)

```python
import os
from openai import OpenAI

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"], timeout=60.0)

resp = client.chat.completions.create(
    model="gpt-4.1-mini",
    temperature=0,
    messages=[
        {"role": "system", "content": "Be concise. Cite uncertainty."},
        {"role": "user", "content": "Summarize our refund window in one sentence."},
    ],
)
print(resp.choices[0].message.content)
print(resp.usage)
```

## Embeddings

```python
emb = client.embeddings.create(
    model="text-embedding-3-small",
    input=["Annual refund window is 14 days."],
)
vector = emb.data[0].embedding
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| 401 | missing/wrong key | env var; org access |
| 429 | rate limits | backoff; smaller TPM |
| Truncated answers | low max tokens | raise cap; shorten context |
| Schema errors | bad tool JSON | strict schema; validate |

## Best practices

- Use structured outputs / JSON schema when parsing mechanically.
- Cache embeddings for unchanged documents.
- Track cost via usage fields in `@mlflow` or your metrics stack.
- Prefer official SDKs over raw HTTP for retries and compatibility.

## Limitations

- Model names and API surfaces change - check current docs when pinning.
- Azure OpenAI uses different base URLs/deployment names.
- Compliance (data residency, zero-retention) is account/configuration specific.

## Related skills

- `@anthropic-api` - Claude provider SDK
- `@langchain` / `@llamaindex` - orchestration layers
- `@chromadb` - store embeddings
