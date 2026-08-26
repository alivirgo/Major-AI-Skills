---
name: langchain
description: "Operational skill for LangChain: chains/LCEL, tools, memory boundaries, retrieval, and production LLM app structure."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["langchain", "llm", "agents", "rag", "python", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# LangChain LLM Apps AI Skill Guide

## Overview & Engine Architecture

LangChain composes prompts, models, retrievers, and tools into runnable chains (LCEL). LCEL pipes (`|`) build DAGs of `Runnable` steps with batch/stream/async support. Agents keep prompts versioned, constrain tool permissions, ground answers with retrieval when facts matter, and treat model I/O as untrusted until validated.

```
Prompt -> Model -> OutputParser
           ^
           |
     Retriever / Tools
```

## When to use this skill

- RAG chat and tool-calling assistants in Python
- Rapid composition of prompt + model + parser pipelines
- Glue between `@openai-api` / `@anthropic-api` and vector stores

## Operational directives

1. Prefer LCEL runnables over legacy LLMChain patterns for new code.
2. Bound agent tool sets; never expose shell/FS tools without review.
3. Separate system instructions, retrieved context, and user text clearly.
4. Log prompts/completions with redaction - do not leak secrets into traces.
5. Pin package extras (`langchain-openai`, etc.) and model names explicitly.

## LCEL RAG sketch

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer using only the context. If unknown, say you do not know.\n\n{context}"),
    ("human", "{question}"),
])

llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0)

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

print(chain.invoke("What is our refund window?"))
```

## Tool calling hygiene

```python
# Expose only pure, side-effect-reviewed callables
# Validate tool args; set timeouts; deny network where unused
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Hallucinated citations | weak retrieval / no grounding rule | tighter prompt; cite chunks |
| Import errors | split packages | install provider extras |
| Runaway agents | unlimited tool loops | max iterations; allowlists |
| Flaky evals | temperature > 0 | temp=0 for tests; golden sets |

## Best practices

- Evaluate with fixed question sets before UX polish.
- Store embeddings/docs in `@chromadb` / cloud vector DBs with metadata filters.
- Stream tokens for UX; batch for offline jobs.
- Keep business logic in plain Python modules - chains should stay thin.

## Limitations

- APIs churn across LangChain majors; pin versions.
- Not a substitute for proper authZ on tools and data sources.
- Complex agents still need product-level guardrails and human escalation.

## Related skills

- `@llamaindex` - retrieval-first alternative framework
- `@chromadb` - local vector store
- `@openai-api` / `@anthropic-api` - provider SDKs
