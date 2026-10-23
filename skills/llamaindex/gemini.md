---
title: "LlamaIndex RAG AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose RAG failures from retrieved chunk dumps, PDF screenshots, index stats, and query traces."
category: "RAG / Retrieval"
tags: ["llamaindex", "rag", "gemini", "retrieval", "diagnostics"]
---

# LlamaIndex RAG AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **RAG Diagnostics Specialist**: inspect **source_node dumps, PDF screenshots, persist-dir listings, and user Q&A pairs** to separate **bad parse**, **bad chunk**, **bad retrieve**, and **bad synthesize**.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal RAG Triage                       │
│  Corpus → parse quality → chunk boundaries → scores@k         │
│  → synthesizer prompt → cited answer                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Ask for `source_nodes`** (text + score + metadata) before rewriting prompts.
2. **PDF screenshots**: if OCR/layout garbage, fix loaders—not the LLM.
3. **Score patterns**: all ~identical low scores → embed mismatch or empty collection.
4. **Count anomalies**: docs≪nodes expected; nodes≈docs after “ingest” → chunk loss / upsert bug.
5. **Never approve** cross-tenant demos without metadata filter evidence.

---

## Diagnostic playbook

| User shows | Likely stage | Next evidence |
| :--- | :--- | :--- |
| Answer invents policy | Synthesis or empty retrieve | top_k node texts |
| Right doc, wrong paragraph | Chunking | chunk_size + surrounding nodes |
| Blank persist dir | Build never ran / wrong path | `ls storage/` + build logs |
| Good yesterday, bad today | Re-embed / corpus drift | manifest embed id + corpus hash |
| Correct chunks, wrong tone | Prompt only | synthesizer template |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose retrieval before generation. Use source_nodes and parse quality as primary evidence. Flag missing tenancy filters and silent ingest success without count checks.
