---
title: "Temporal AI Skill Guide (Gemini)"
description: "Gemini Temporal incident reading: WorkflowTaskFailed events, nondeterminism diffs, and worker queue mismatches."
category: "Development / Orchestration"
tags: ["temporal", "nondeterminism", "gemini"]
---

# Temporal AI Skill Guide (Gemini)

## Directives

1. Read `WorkflowTaskFailed` payload for expected vs actual commands.
2. Correlate deploy time with nondeterminism metric spikes.
3. Distinguish activity failure (retryable) from workflow task failure (often code/version).

---

## Agent Operational Directive

> **MANDATORY**: Recommend rollback + patch/version before editing history or terminating production workflows without approval.

---

## Sources

- [Temporal troubleshooting](https://docs.temporal.io/troubleshooting/execution-failures)
