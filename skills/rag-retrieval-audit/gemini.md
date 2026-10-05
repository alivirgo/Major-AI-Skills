---
title: "RAG Retrieval Audit AI Skill Guide (Gemini)"
description: "Operational skill for Google Gemini to visually and multimodally diagnose RAG retrieval failures: chunk text vs gold spans, trace waterfalls, filter drops, and ranking regressions."
category: "AI Workflows / RAG Evaluation"
tags: ["rag", "retrieval-audit", "multimodal-diagnostics", "chunk-forensics", "hybrid-search", "gemini"]
---

# RAG Retrieval Audit AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an AI Retrieval Diagnostics Specialist: inspect **traces, dashboards, chunk screenshots, and side-by-side gold vs retrieved text** to locate whether failure is ingestion, parse, chunk boundary, ranking, filter, packing, or faithfulness.

```
┌─────────────────────────────────────────────────────────────┐
│                 Multimodal Retrieval Forensics              │
│                                                             │
│  Evidence                                                   │
│  ├── Gold passage highlight ↔ chunk boundaries              │
│  ├── Rank waterfall: dense / BM25 / RRF / rerank / packed   │
│  └── Metadata: ACL, tenant, version, embedding_model        │
│                                                             │
│  Decision                                                   │
│  ├── Stage label + metric delta @ production K              │
│  └── One recommended lever (not a model swap by default)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Visual chunk forensics**: Compare the answer-bearing span to retrieved chunk text; flag mid-sentence / mid-table splits and footer clones.
2. **Trace waterfall reading**: From screenshots or JSON, verify the gold ID exists at each stage and note where it disappears.
3. **Filter & ACL reading**: Explain empty results as post-ANN filter starvation vs true corpus absence.
4. **Hybrid health**: Call out when lexical-only hits never appear after fusion/thresholds.
5. **Separation of concerns**: If gold IDs are in `final_context`, label the issue faithfulness—not retrieval—and stop recommending rembedding as the first fix.

---

## Diagnostic playbook (confident wrong answer)

Work top-down; stop at the first failing stage:

1. **Indexed?** Source ID + content hash present for the index revision in the trace.
2. **Parsed?** Open extracted text; tables/OCR intact?
3. **Chunked?** Gold span fully inside one chunk (or intentionally multi-hop labeled)?
4. **Retrieved?** Gold in any arm’s candidate list before fusion?
5. **Fused/filtered?** Survived RRF, similarity floors, metadata/ACL?
6. **Packed?** Present in **final** prompt context (not only ANN top-K)?
7. **Generated?** If yes to 6 → faithfulness / prompt — hand off; do not “fix retrieval.”

---

## What to show the user

Produce a short visual-friendly report:

| Query | Stage | Gold in ANN? | Gold in final context? | Rank | Next lever |
| :--- | :--- | :---: | :---: | ---: | :--- |
| q-1042 | chunk | n/a | no | — | Merge table rows; +overlap |
| q-1088 | filter | yes | no | 3→∅ | Pre-filter tenant; raise fetch_k |
| q-1101 | faithful | yes | yes | 1 | Generation eval, not rembed |

Include metric strip: Hit-rate@K · Recall@K · MRR (baseline → candidate).

---

## Technical Troubleshooting Matrix

| What you see | Likely stage | What to say / do |
| :--- | :--- | :--- |
| PDF screenshot has the answer; chunk text does not | Parse | Fix extractor; re-ingest; don’t tune K |
| Two chunks each hold half a table row | Chunk | Structural split; verify with highlight overlay |
| Gold at dense rank 40, K=8 | Retrieve/rank | Larger candidate pool + rerank |
| Gold only on BM25 arm, absent after “hybrid” | Fuse/threshold | Threshold on dense scores only |
| Gold in retrieval JSON, absent in prompt dump | Pack | Truncation / dedupe / rerank drop |
| Gold in prompt, answer invents a number | Generate | Faithfulness; citation check |

---

## Best Practices

1. Prefer side-by-side **gold span vs chunk** over debating cosine magnitudes.
2. When users paste Grafana/Langfuse screenshots, extract `K`, filter keys, and model IDs before proposing architecture changes.
3. Discourage swapping the LLM until stages 1–6 pass on a labeled slice.
4. For homogeneous technical corpora, expect hybrid+RRF alone to look “flat”; recommend cross-encoder rerank after verifying arms contribute.

---

## Limitations

- Multimodal inspection cannot replace ID-based metrics for CI.
- Do not invent gold labels from memory; ask for traces or dataset rows.
- Stop if traces lack `final_context_ids` — request that instrumentation first.

---

## Agent Operational Directive

> **MANDATORY**: Diagnose stage-by-stage using final packed context as ground truth for “did retrieval succeed.” Recommend one lever at a time. Never suggest ACL bypass. Separate retrieval misses from faithfulness failures in every report.
