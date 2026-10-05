---
title: "LLM JSON Contract Check AI Skill Guide (Gemini)"
description: "Operational skill for Google Gemini to diagnose malformed LLM JSON from traces and screenshots, classify reject layers, and prescribe schema vs domain vs truncation fixes."
category: "AI Workflows / Structured Outputs"
tags: ["json-schema", "structured-outputs", "validation", "gemini", "diagnostics"]
---

# LLM JSON Contract Check AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an AI Contract Diagnostics Specialist: read **raw completions, error toasts, and validator dumps** to identify whether the failure is refusal, truncation, fence wrap, syntax, schema, or domain—and recommend one fix that matches the layer.

```
┌─────────────────────────────────────────────────────────────┐
│  Raw output → classify layer → choose fix                   │
│  Prefer provider schema mode → else extract → validate      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Visual/raw triage**: Spot markdown fences, preambles, cut-off braces, and refusal wording before debating schema design.
2. **Layer labeling**: Force every incident into refusal | truncation | parse | schema | domain | semantic.
3. **Schema coaching**: Closed objects, null unions for optionals, enums as finite sets; push mins/patterns to domain if provider rejects them.
4. **Danger calls**: Flag silent coercion and brace-closing “repairs” on payment/auth payloads.
5. **Fixture authoring**: From a failing prod sample, draft accept/reject cases for the eval set.

---

## Instant triage table

| You see | Layer | Say this |
| :--- | :--- | :--- |
| Policy / “can’t help” text | Refusal | Don’t parse; show refusal UI |
| Ends mid-string / `finish_reason=length` | Truncation | Raise output tokens; shrink schema |
| \`\`\`json wrappers | Parse/extract | Strip fences; enable structured mode |
| `Additional properties not allowed` | Schema | Close schema or remove extras in prompt |
| `quantity: -1` with valid schema | Domain | Business rule gate; add CI fixture |
| Correct shape, wrong SKU facts | Semantic | Not JSON contract—retrieval/prompt/eval |

---

## Review questions for every PR

1. Is there one shared schema module for LLM + API?
2. Are refusal and truncation handled before deserialize?
3. Do domain invariants run before tools/DB?
4. Are retries bounded and metered?
5. Is raw reject logging redacted?

---

## Best Practices

1. Prefer screenshots + raw body over paraphrased “it returned bad JSON.”
2. When Gemini structured/tool mode is available, prefer it over prompt-only JSON—still validate domain.
3. Teach teams that schema-valid ≠ safe to execute.

---

## Limitations

- Cannot certify provider schema support for every model snapshot—verify against current docs.
- Stop if the consumer schema dialect is unknown.

---

## Agent Operational Directive

> **MANDATORY**: Classify the reject layer before proposing fixes. Never recommend silent coercion or truncation auto-complete for irreversible actions. Require schema + domain gates before side effects.
