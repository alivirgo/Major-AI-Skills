---
name: prompt-regression-gate
description: "Compare prompt revisions on a frozen AI evaluation set with paired runs, slice-level regressions, and explicit release thresholds."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "prompt-regression-gate"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Prompt Regression Gate

## Scope

Capture baseline and candidate prompts, model identifiers, tool schemas, retrieval revision, and generation settings. Agree on acceptance thresholds before running the comparison. Reuse a held-out evaluation set rather than tuning against final test failures.

## Procedure

Run paired cases with equivalent context. If outputs are stochastic, repeat cases enough to expose variability within the agreed budget. Record missing runs and provider errors rather than treating them as ordinary wrong answers.

## Checks

Use deterministic assertions for structured tasks and rubric-based review for subjective ones. Blind human reviewers to candidate identity where practical. Never use the candidate model's self-confidence as the sole quality metric.

## Failure Handling

Compare aggregate results and important slices, including refusals, ambiguous requests, and high-cost mistakes. Report uncertainty and sample size; a small average gain must not hide a critical regression.

## Deliverable

Deliver a go/no-go recommendation tied to predefined thresholds, failing examples, and rollback instructions. Without executed runs, provide the gate configuration and mark the result untested.

