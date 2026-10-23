---
name: openai-api
description: "Integrate OpenAI Responses (preferred) and Chat Completions with structured outputs, tools, embeddings, retries, and store/privacy controls agents routinely miss."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["openai", "responses-api", "chat-completions", "embeddings", "structured-outputs", "tools", "python"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# OpenAI API Client AI Skill Guide (Claude)

## Overview & Engine Architecture

Official **OpenAI Python/TS SDKs** call HTTP APIs for text, tools, embeddings, and media. Prefer the **Responses API** for new work (agentic tools, simpler multi-turn, better cache behavior); **Chat Completions** remains supported for existing integrations. Auth via `OPENAI_API_KEY` (or Azure/base_url overrides). Pin model ids, set timeouts, bound max output tokens, validate tool calls, and treat **`store`** as a privacy control (Responses defaults can retain application state ~30 days unless `store=false` or org ZDR).

```
┌─────────────────────────────────────────────────────────────┐
│                 OpenAI client stack                           │
│                                                             │
│  SDK (timeouts, retries)                                    │
│  ├── Responses  (/v1/responses) — preferred for new apps    │
│  ├── Chat Completions (/v1/chat/completions) — legacy OK    │
│  ├── Embeddings (/v1/embeddings)                            │
│  └── Tools / structured outputs (json_schema / parse)       │
│                                                             │
│  Cross-cutting                                              │
│  ├── Rate limits (RPM/TPM) + Retry-After                    │
│  ├── usage accounting + request ids                         │
│  └── store / ZDR / prompt-cache retention policy            │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Direct model, tool, or embedding calls without a heavy framework.
- Structured JSON extraction with schema adherence.
- Embeddings for `@qdrant` / `@chromadb` / `@llamaindex` / `@langchain`.

**Do not use when**

- Multi-step agent graphs with checkpoints are the product → `@langchain` (LangGraph).
- Document ingestion/RAG UX is primary → `@llamaindex` (still use this skill for the provider call).
- User asks to commit API keys or disable auth “for convenience” → refuse.

---

## Operational Capabilities & Agent Directives

1. **Load keys from the environment** (`OPENAI_API_KEY`); never commit keys or paste into source.
2. **Prefer Responses** (`client.responses.create` / `.parse`) for new code; keep Completions only when migrating incrementally.
3. **Pin model ids** used in production (`gpt-4.1-mini`, `gpt-4.1`, etc.); log model + response/request id with usage.
4. **Set client `timeout`**; honor `Retry-After` on 429; exponential backoff + jitter; **do not retry** billing/quota errors; avoid nested app+SDK retry storms.
5. **Structured outputs** via `responses.parse(..., text_format=Model)` or Completions `.parse` — prefer over “JSON mode” alone.
6. **Privacy**: set `store=false` when product/compliance must not retain Responses application state; confirm org Zero Data Retention if required.
7. **Tools**: allowlist names; validate arguments before side effects; pass schemas via API `tools`, not prompt-injected pseudo-JSON.

---

## Production Example: Responses + structured parse + embeddings

```python
import os
from openai import OpenAI
from pydantic import BaseModel, Field

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    timeout=60.0,
    max_retries=2,  # account for these if you also retry in-app
)


class RefundAnswer(BaseModel):
    window_days: int = Field(description="Refund window in days")
    applies_to: str
    uncertain: bool


resp = client.responses.parse(
    model="gpt-4.1-mini",
    store=False,  # do not retain response state unless product needs it
    input=[
        {"role": "system", "content": "Extract refund policy facts. Set uncertain=true if missing."},
        {"role": "user", "content": "Annual plans: 14-day refund from purchase date."},
    ],
    text_format=RefundAnswer,
)
print(resp.output_parsed)
print(resp.usage)

emb = client.embeddings.create(
    model="text-embedding-3-small",
    input=["Annual plans: 14-day refund from purchase date."],
)
vector = emb.data[0].embedding
assert len(vector) == 1536
```

### Chat Completions (existing codepaths)

```python
completion = client.chat.completions.create(
    model="gpt-4.1-mini",
    temperature=0,
    messages=[
        {"role": "system", "content": "Be concise. Cite uncertainty."},
        {"role": "user", "content": "Summarize our refund window in one sentence."},
    ],
)
print(completion.choices[0].message.content)
print(completion.id, completion.usage)
```

Validation loop:

```bash
python -c "from openai import OpenAI; c=OpenAI(); print(c.models.list().data[0].id)"
# Smoke: one Responses call with store=false; assert usage tokens > 0
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| 401 / invalid_api_key | Missing/wrong key or project | Fix env; verify project access |
| 429 rate_limit | RPM/TPM burst; nested retries | Honor Retry-After; backoff+jitter; pace; raise limits |
| 429 / insufficient_quota | Billing/quota exhausted | Do **not** blind-retry; fix billing |
| Truncated / cut-off output | Low max output tokens / context overflow | Raise output cap; shorten input; summarize history |
| Schema validation errors | Loose prompting without Structured Outputs | Use `.parse` + Pydantic/JSON Schema |
| Tool args invalid / unsafe | Model freestyle | Strict schema; server-side validate; allowlist |
| “Data retained” compliance alarm | Responses `store` default true | Set `store=false` or enable ZDR |
| Azure mismatch | Wrong base_url / deployment name | Azure OpenAI client config; deployment ≠ model nickname |
| Embedding dim mismatch vs vector DB | Model or `dimensions` changed | Recreate collection; re-embed (`@qdrant`) |

---

## Best Practices

1. Prefer Structured Outputs over brittle regex/JSON repair loops.
2. Cache embeddings for unchanged document bytes; version by embed model id.
3. Track `usage` (input/output tokens) in `@mlflow` or your metrics stack; alert on cost spikes.
4. Use official SDKs for retries/compatibility; pin `openai` package.
5. Separate eval prompts (temp=0, fixed models) from prod sampling configs (`@ai-evaluation-dataset`).
6. For agent frameworks, still keep provider calls behind a thin client wrapper for timeouts and redaction.

---

## Limitations

- Model ids and API shapes change—verify against current OpenAI docs when pinning.
- Azure OpenAI and compatible gateways differ in URLs, headers, and deployment names.
- Retention, ZDR, and regional controls are account/org configuration—not SDK defaults alone.
- Stop and ask if compliance retention requirements or production model tier are unspecified.

---

## Related Skills

- `@anthropic-api` — Claude Messages API
- `@langchain` / `@llamaindex` — orchestration / RAG layers
- `@qdrant` / `@chromadb` — embedding stores
- `@mlflow` — usage/cost experiments
- `@ai-evaluation-dataset` — golden evals

---

## Agent Operational Directive

> **MANDATORY**: Keys from environment only. Prefer Responses for new integrations; set `store=false` when retention is not required. Pin models; use Structured Outputs for mechanical parsing; allowlist/validate tools. Honor Retry-After on 429; never retry quota/billing failures in a tight loop. Log usage + ids; redact secrets from logs.

---

## Source anchors (research)

- [Migrate to the Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Rate limits & Retry-After](https://developers.openai.com/api/docs/guides/rate-limits)
- [Data controls / store retention](https://developers.openai.com/api/docs/guides/your-data)
- [GPT-4.1 guide](https://developers.openai.com/api/docs/guides/latest-model/gpt-4.1)
