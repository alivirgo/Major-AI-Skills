---
title: "ChromaDB Vector Store AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose empty RAG hits, dimension mismatches, and filter failures from logs, persist paths, and collection metadata screenshots."
category: "Vector Store & RAG Persistence"
tags: ["chromadb", "gemini", "rag-diagnostics", "dimension-mismatch", "metadata-filter"]
---

# ChromaDB Vector Store AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **retrieval diagnostics specialist**: read logs, `list_collections` output, distance histograms, and UI/path screenshots to separate **wrong collection**, **embedding skew**, and **filter type bugs**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal Chroma triage                      │
│  Path → collection → EF/dim → where types → distances       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. On `InvalidDimensionException`, ask for **ingest model vs query model** and collection create time—not random EF swaps on the same name.
2. Empty hits: verify **persist path** and `col.count()` before blaming the LLM.
3. Large L2 distances: suspect **unnormalized custom vectors** or wrong space.
4. Never recommend pasting API keys into notebook cells visible in screenshots—redirect to env/secrets.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| Dim 1536 vs 384 | Framework EF override | LangChain/LlamaIndex embedder config |
| Hits only after second run | Non-persistent Client() | Switch to PersistentClient path |
| Filter always empty | str/int metadata mismatch | Sample `col.get(limit=5)` metadatas |
| Duplicate answers | Random ids each ingest | Show id scheme; move to hash upsert |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose dimension and path before rewriting RAG chains. Treat EF + space as immutable per collection. Flag secret leakage in logged documents.
