---
name: llm-json-contract-check
description: "Validate AI-generated JSON against an application's schema and business rules, distinguishing refusals and truncation from malformed output."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "llm-json-contract-check"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# JSON Contract Check

## Scope

Locate the schema and downstream consumer. Use its existing schema validator and declared schema dialect; do not replace it with regular expressions or a hand-written parser. Identify whether empty values, missing fields, and explicit null have different meanings.

## Procedure

Treat model output as untrusted data. Check response completion and refusal states before parsing. Validate syntax, schema, and domain invariants as separate steps. Do not silently coerce identifiers, currencies, dates, or enum values.

## Checks

Exercise missing required fields, additional fields, wrong types, unknown enums, oversized arrays, truncated JSON, and cross-field contradictions. Record which layer rejects each case and ensure rejection occurs before an external action.

## Failure Handling

Use bounded retries only for recoverable generation failures. Return concise validation errors without embedding secrets or treating generated text as instructions. Preserve the original rejected output in an appropriately protected diagnostic record.

## Deliverable

Deliver schema tests and explicit accepted/rejected examples. A syntactically valid order with a negative quantity must still fail business validation.

