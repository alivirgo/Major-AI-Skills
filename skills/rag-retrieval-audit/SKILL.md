---
name: rag-retrieval-audit
description: "Diagnose missing evidence in a retrieval-augmented generation pipeline using labeled queries, chunk inspection, and retrieval metrics."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "rag-retrieval-audit"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# RAG Retrieval Audit

## Scope

Obtain a bounded query set, reference documents, index revision, filters, and access-control rules. Inspect the existing retriever before changing embeddings or chunking. Keep experiments in a test index unless production changes are authorized.

## Procedure

For each query, record eligible relevant document IDs and retrieved chunk IDs, ranks, scores, filters, and source offsets. Separate ingestion omissions, permission filtering, chunk boundary problems, ranking failures, and generation failures.

## Checks

Calculate recall at the application's retrieval cutoff only where relevance labels exist. Inspect zero-result queries and relevant documents excluded by filters. Do not compare raw similarity scores between different embedding models as if calibrated.

## Failure Handling

Change one variable at a time, preserving the baseline. Test whether the answer-bearing passage survives chunking and appears in the final model context. Report retrieval metrics separately from answer quality, latency, and cost.

## Deliverable

Deliver a per-query failure table, reproducible configuration, and before/after evidence. Exclude inaccessible documents from the relevance denominator rather than recommending an authorization bypass.

