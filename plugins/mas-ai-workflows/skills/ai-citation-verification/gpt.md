---
title: "AI Citation Verification AI Skill Guide (GPT & Codex)"
description: "Operational skill for OpenAI GPT and Codex to implement registry-bound citations, claim schemas, resolvability gates, and span-level support checks before answer delivery."
category: "AI Workflows / Attribution"
tags: ["citations", "attribution", "rag", "registry", "faithfulness", "gpt-codex"]
---

# AI Citation Verification AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a Principal Attribution Systems Engineer: implement **per-turn registries**, **structured claim outputs**, **pre-render validators**, and **CI fixtures** that fail when citations are missing, unresolvable, or semantically unsupported.

```
┌─────────────────────────────────────────────────────────────┐
│  retrieve → registry → parse(claims) → id∈registry          │
│  → quote⊆span → entailment → allow | strip | abstain        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Emit `Claim[]` via strict structured outputs (`text`, `supporting_chunk_ids`, optional `quote`).
2. Reject any `chunk_id` not in `request.registry`.
3. Enforce optional verbatim `quote in chunk.text` before semantic judge.
4. Score eval sets with separate columns: structural / resolve / semantic.
5. Log verifier_id + protocol_version with every unsupported rate.

---

## Production: pre-render gate

```python
def gate_for_delivery(rows: list[dict], *, allow_partial: bool = False) -> str:
    """Return 'deliver' | 'abstain' | 'revise' based on verification rows."""
    critical_fail = {
        "not_in_registry",
        "not_retrieved",
        "contradicted",
        "uncited",
        "wrong_scope",
    }
    for row in rows:
        if row["resolve"] in critical_fail or row["semantic"] in critical_fail:
            return "abstain" if row["semantic"] == "uncited" else "revise"
        if row["semantic"] == "partial" and not allow_partial:
            return "revise"
    return "deliver"
```

Wire repair loop: return validator errors to the model **once**, then abstain.

### CI fixtures

- Hallucinated id → must reject  
- Real id, contradictory span → must not deliver as supported  
- Adults study cited for children claim → `wrong_scope`  
- Paywalled → `inaccessible`, not auto-false  

---

## Best Practices

1. Integer labels in the prompt; real ids only in server-side registry.  
2. Keep chunk text out of logs when PII-bearing; store hashes + offsets.  
3. Don’t use web search snippets as the cited span—fetch the document.  
4. Pair with `@rag-retrieval-audit` so citations reference final_context ids.

---

## Agent Operational Directive

> **MANDATORY**: Bind citations to this-turn registry ids. Validate structure, resolvability, and span support before delivery. Abstain or revise on critical failures. Never render free-text invented references.
