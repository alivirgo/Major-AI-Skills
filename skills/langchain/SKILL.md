---
name: langchain
description: "Build production LangChain LCEL pipelines and LangGraph agents with create_agent, bounded tools, checkpointing, middleware guardrails, and retrieval grounding agents routinely skip."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["langchain", "langgraph", "lcel", "agents", "rag", "tools", "python", "middleware"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# LangChain & LangGraph AI Skill Guide (Claude)

## Overview & Engine Architecture

LangChain v1 composes **Runnables** (LCEL) for linear prompt → model → parser graphs, and **LangGraph** for stateful tool loops. Prefer **`langchain.agents.create_agent`** for agents (returns a compiled graph); keep LCEL for RAG and ETL-style chains. Provider packages (`langchain-openai`, `langchain-anthropic`) own model clients; core stays thin. Treat tool I/O and retrieved context as **untrusted** until validated.

```
┌─────────────────────────────────────────────────────────────┐
│              LangChain / LangGraph runtime                    │
│                                                             │
│  LCEL (linear)                                              │
│  Prompt | Model | Parser  (+ Retriever / RunnableParallel)  │
│                                                             │
│  Agents (create_agent → CompiledStateGraph)                 │
│  ├── model node ↔ tools node (tool_calls loop)              │
│  ├── middleware: retries, summarization, human approval     │
│  ├── checkpointer / store (thread_id persistence)           │
│  └── response_format / structured output strategies         │
│                                                             │
│  Observability                                              │
│  └── LangSmith traces (redact secrets); pin package majors  │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Composing prompt + model + parser + retriever pipelines in Python.
- Building tool-calling agents that need checkpoints, interrupts, or middleware.
- Gluing `@openai-api` / `@anthropic-api` to `@qdrant` / `@chromadb` with shared Runnable interfaces.

**Do not use when**

- A single provider SDK call with structured output is enough → `@openai-api` / `@anthropic-api` only.
- You need retrieval-first ingestion/eval UX and doc pipelines → prefer `@llamaindex`.
- Someone asks for unrestricted shell/FS/network tools without review → refuse; allowlist + timeouts only.

---

## Operational Capabilities & Agent Directives

1. **LCEL for chains; `create_agent` for tool loops** — do not revive legacy `LLMChain` / `AgentExecutor` in new code.
2. **Pin provider extras and majors**: `langchain`, `langgraph`, `langchain-openai` (or anthropic) in lockfiles; model ids explicit in config, not scattered string literals.
3. **Bound tools**: allowlist names; validate args with schemas; set timeouts; deny shell/network unless product-approved.
4. **Separate system / context / user**: never concatenate retrieved chunks into the system prompt without clear delimiters and “cite or abstain” rules.
5. **Checkpoint with `thread_id`** for multi-turn agents; never persist secrets in checkpoint state.
6. **Middleware for guardrails** (max iterations, PII filters, human-in-the-loop) — keep each middleware single-purpose and tested alone.
7. **Trace with redaction**: LangSmith/local callbacks must scrub API keys, tokens, and PII before logging.

---

## Production Example: LCEL RAG + bounded agent

### LCEL retrieval chain

```python
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

client = QdrantClient(url="http://localhost:6333")
vectorstore = QdrantVectorStore(
    client=client,
    collection_name="policies",
    embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "Answer using ONLY the context. If missing, say you do not know.\n"
     "Cite source filenames from metadata.\n\nContext:\n{context}"),
    ("human", "{question}"),
])

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)

def format_docs(docs):
    return "\n\n".join(
        f"[{d.metadata.get('source', '?')}]\n{d.page_content}" for d in docs
    )

rag = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

print(rag.invoke("What is the refund window for annual plans?"))
```

### Tool agent with `create_agent`

```python
from langchain.agents import create_agent

def lookup_order(order_id: str) -> str:
    """Return order status for a verified order_id (read-only)."""
    # Call your service with validated order_id only
    return f"order {order_id}: shipped"

agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[lookup_order],
    system_prompt=(
        "You are a support assistant. Use lookup_order only for real order ids. "
        "Never invent refunds or PII."
    ),
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "Status of order ORD-1042?"}]}
)
```

Validation loop:

```bash
python -c "from my_agent.agent import agent; print(agent.get_graph().draw_mermaid())"
# Run fixed golden questions with temperature=0; assert citations / abstain
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `ModuleNotFoundError: langchain_openai` | Split packages; only `langchain` installed | `pip install langchain-openai` (or anthropic) extras |
| Agent loops forever / burns tokens | No iteration cap / recursive tools | Middleware max steps; shrink tool set; require confirmation for writes |
| Hallucinated “citations” | Weak retrieval or no grounding rule | Raise retriever k quality; force “unknown”; return source nodes |
| Import of deprecated `AgentExecutor` | Stale tutorials | Migrate to `create_agent` / LangGraph |
| Flaky CI evals | `temperature>0` or unpinned model | Pin model id; temp=0; golden set (`@ai-evaluation-dataset`) |
| Checkpoint restores wrong user | Missing / reused `thread_id` | Pass unique `configurable.thread_id` per conversation |
| Secrets in LangSmith | Full prompt logging | Redact callbacks; exclude `.env` from traces |
| Qdrant filter ignored | Metadata not in payload / wrong key | Align metadata keys; pair with `@qdrant` payload indexes |

---

## Best Practices

1. Keep business logic in plain Python modules; chains/agents stay thin adapters.
2. Stream for UX (`astream_events` / graph stream); batch for offline jobs.
3. Evaluate retrieval hit-rate@k separately from answer style.
4. Version prompts in code or a prompt registry; never hot-edit prod strings silently.
5. Prefer structured `response_format` / Pydantic over brittle regex parses.
6. For multi-actor workflows (approval gates, long jobs), use LangGraph checkpoints explicitly.

---

## Limitations

- Majors churn (v0 → v1); pin versions and read upgrade notes before bumping.
- Framework ≠ authZ: tool allowlists do not replace app-level ACLs on data.
- LangSmith and Deployment are optional products—local graphs work without them.
- Stop and ask if tool side effects, tenancy filters, or eval datasets are unspecified.

---

## Related Skills

- `@llamaindex` — retrieval/ingestion-first alternative
- `@openai-api` / `@anthropic-api` — direct provider SDKs
- `@qdrant` / `@chromadb` — vector backends
- `@ai-evaluation-dataset` — golden sets and hash-bound metrics
- `@fastapi` — serving agents behind HTTP
- `@mlflow` — experiment / cost tracking

---

## Agent Operational Directive

> **MANDATORY**: Use LCEL for linear pipelines and `create_agent` (LangGraph) for tool loops. Allowlist and validate tools; never ship unrestricted shell/FS tools. Pin provider packages and model ids. Ground factual answers with retrieval + abstain rules. Redact secrets from traces. Validate with temperature-0 golden questions before declaring success.

---

## Source anchors (research)

- [create_agent reference](https://reference.langchain.com/python/langchain/agents/create_agent)
- [LangChain / LangGraph 1.0](https://www.langchain.com/blog/langchain-langgraph-1dot0)
- [Application structure](https://docs.langchain.com/oss/python/langgraph/application-structure)
- [Agents docs](https://docs.langchain.com/oss/python/langchain/agents)
- [Custom middleware](https://docs.langchain.com/oss/python/langchain/middleware/custom)
