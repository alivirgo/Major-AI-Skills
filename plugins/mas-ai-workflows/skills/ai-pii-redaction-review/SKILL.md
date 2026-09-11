---
name: ai-pii-redaction-review
description: "Prepare a privacy-reviewed AI input using field-aware redaction, stable placeholders, and leakage checks before external submission."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "ai-pii-redaction-review"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# PII Redaction Review

## Scope

Establish the destination, permitted data classes, task requirements, and retention expectations before preparing a payload. Inspect a local sample only within the user's authorization. Do not send original records to an external redaction service without approval.

## Procedure

Inventory direct identifiers, credentials, sensitive free text, and combinations that could identify a person. Use existing local detection tooling plus field-aware review. Pattern matching alone does not prove anonymization.

## Checks

Remove fields not needed for the task. Use consistent placeholders when relationships matter, but keep any reversal map separate from the outgoing data. Preserve required types and document whether dates or locations were generalized.

## Failure Handling

Inspect attachments, filenames, metadata, logs, and error messages as well as the main prompt. Scan the final payload for known identifiers and secrets. Review false positives that would make the intended task impossible.

## Deliverable

Deliver only the redacted artifact, a category-level change summary, and residual risks. Do not place removed values in the report. Describe the result as redacted or pseudonymized, not guaranteed anonymous.

