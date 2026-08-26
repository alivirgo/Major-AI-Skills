---
name: llamaindex
description: "Operational skill for LlamaIndex: indexes, retrievers, query engines, ingestion pipelines, and RAG evaluation basics."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["llamaindex", "rag", "retrieval", "llm", "python", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# LlamaIndex RAG AI Skill Guide

## Overview & Engine Architecture

LlamaIndex focuses on connecting LLMs to private data via document loaders, node parsing/chunking, indexes (vector, keyword, knowledge graph), and query/chat engines. Ingestion builds nodes + embeddings into a vector store; query time retrieves nodes and synthesizes answers. Agents tune chunking and metadata filters before swapping models, and evaluate retrieval quality separately from generation style.

```
Documents -> NodeParser / ingest pipeline
      -> VectorStoreIndex
          -> Retriever -> Response synthesizer
```

## When to use this skill

- Document QA and knowledge-base chat
- Structured ingestion from PDFs, Notion, SQL, APIs
- Hybrid retrieval experiments with citations

## Operational directives

1. Fix chunk size/overlap using retrieval metrics, not only vibes.
2. Attach metadata (source, date, ACL tags) for filtered retrieval.
3. Persist indexes; rebuild intentionally when embeddings/models change.
4. Return source nodes to users when factual claims matter.
5. Keep API keys in env vars; never embed them in notebooks committed to git.

## Minimal index + query

```python
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

Settings.llm = OpenAI(model="gpt-4.1-mini")
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")

docs = SimpleDirectoryReader("data/policies").load_data()
index = VectorStoreIndex.from_documents(docs)
index.storage_context.persist(persist_dir="storage/policies")

engine = index.as_query_engine(similarity_top_k=4)
resp = engine.query("What is the refund window for annual plans?")
print(resp)
for n in resp.source_nodes:
    print(n.metadata, n.score)
```

## Reload persisted index

```python
from llama_index.core import StorageContext, load_index_from_storage

storage = StorageContext.from_defaults(persist_dir="storage/policies")
index = load_index_from_storage(storage)
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Irrelevant context | chunks too big/small | retune splitter; metadata filters |
| Empty answers | bad paths / failed load | verify readers; count docs |
| Embedding mismatch | rebuilt with new model | re-embed entire corpus |
| Token blowups | stuffing too many nodes | lower top_k; compress |

## Best practices

- Evaluate hit-rate@k on a labeled question set before prompt gymnastics.
- Separate ingestion jobs (`@prefect`) from online query paths.
- Use `@chromadb` or managed vector DBs for multi-process serving.
- Cite filenames/page numbers in the synthesizer prompt.

## Limitations

- PDF parsing quality varies; complex layouts need specialized loaders.
- Framework APIs evolve - pin `llama-index` packages.
- Access control must be enforced via metadata filters + app auth, not hope.

## Related skills

- `@langchain` - alternative orchestration style
- `@chromadb` - vector persistence
- `@openai-api` / `@anthropic-api` - underlying model providers
