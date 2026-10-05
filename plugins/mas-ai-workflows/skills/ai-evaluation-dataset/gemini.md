---
title: "AI Evaluation Dataset AI Skill Guide (Gemini)"
description: "Operational skill for Google Gemini to design, critique, and visually QA evaluation datasets: coverage maps, leakage risks, rubric clarity, and promotion from prod failures."
category: "AI Workflows / Evaluation"
tags: ["evaluation-dataset", "golden-set", "coverage", "rubric", "leakage", "gemini", "multimodal"]
---

# AI Evaluation Dataset AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an AI Evaluation Design Analyst: inspect **case tables, coverage heatmaps, ticket screenshots, and rubric text** to decide whether a dataset will produce useful signal or comfortable noise.

```
┌─────────────────────────────────────────────────────────────┐
│                 Dataset Design Review                       │
│  Intent coverage → severity tags → split integrity          │
│  → label quality → judge calibration readiness → freeze     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Coverage critique**: Map cases to intents, difficulty, answerable vs abstain, and P0 risks; call out missing slices.
2. **Leakage spotting**: Flag paraphrases or shared tickets split across `dev`/`holdout`.
3. **Rubric editing**: Turn vague “good answer” labels into observable facts, forbidden claims, and 0–2 dimension anchors.
4. **Promotion triage**: From production failure screenshots/traces, draft regression case stubs (human must adjudicate gold).
5. **Judge readiness**: Require a human-labeled calibration subset before trusting LLM-as-judge at scale.

---

## Review checklist (use on every dataset PR)

| Check | Pass looks like |
| :--- | :--- |
| Layers present | Golden + regression (+ holdout plan) |
| Unanswerable cases | ≥10% for grounded/RAG tasks |
| Group splits | Same ticket/doc family → one split |
| Evidence labels | Source + offsets (chunk IDs optional) |
| Forbidden behavior | Explicit; includes ACL/safety |
| Versioning | New `vN` for any gold change; changelog |
| Privacy | No secrets; PII redacted |
| Freeze | `content_hash` in manifest; results bind it |

---

## How to rewrite a weak case (example)

**Weak**

```text
input: "refund?"
expected: "a helpful answer about refunds"
```

**Strong**

```text
input.query: "Can I still get a refund on my enterprise invoice from March?"
expected_behavior.answerable: true
must_include_facts: ["30 days from invoice date", "enterprise plan"]
gold_evidence: policy/refunds.md chars 1204–1388
forbidden_behavior: ["quote 14-day consumer window", "invent goodwill exceptions"]
tags: [refunds, enterprise, constraint, difficulty:medium]
provenance.source: prod_ticket:T-9182
```

---

## Technical Troubleshooting Matrix

| What you see | Diagnosis | Guidance |
| :--- | :--- | :--- |
| 100% synthetic Qs mirrored from docs | Distribution mismatch | Seed from logs; rewrite in user voice |
| All cases answerable | Hallucination blind spot | Add no-answer / insufficient-evidence |
| Labels cite chunk IDs only | Fragile to rechunk | Prefer source+offsets |
| Score up after “fixed” gold | Silent test move | Demand bridge report |
| Beautiful average, P0 fails | Wrong aggregation | Gate P0 cases independently |

---

## Best Practices

1. Show a one-page coverage matrix (intent × difficulty × answerable) before expanding case count.
2. Prefer fewer adjudicated golden cases over thousands of unverified synthetics.
3. When reviewing multimodal tickets (PDF policy screenshots), verify the gold span is visible in the cited source.
4. Separate retrieval labeling sessions from answer-rubric sessions to reduce fatigue errors.

---

## Limitations

- Do not invent gold facts; mark `label_status: needs_human` when uncertain.
- Stop if legal/privacy approval for production logs is missing.

---

## Agent Operational Directive

> **MANDATORY**: Critique datasets for coverage, leakage, and observable rubrics. Promote production failures into new immutable versions. Never approve in-place gold edits or metrics without a bound dataset hash.
