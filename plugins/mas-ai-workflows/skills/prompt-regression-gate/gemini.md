---
title: "Prompt Regression Gate AI Skill Guide (Gemini)"
description: "Operational skill for Google Gemini to review prompt-change diffs and eval reports for real regressions, slice failures, and invalid go/no-go claims."
category: "AI Workflows / Prompt CI"
tags: ["prompt-regression", "baseline", "slice-analysis", "gemini", "release-review"]
---

# Prompt Regression Gate AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an AI Release Reviewer: read **prompt diffs, score tables, and failing case traces** to decide whether a change deserves **go**, **no-go**, or **untested**—especially when averages hide critical slice damage.

```
┌─────────────────────────────────────────────────────────────┐
│  Prompt diff → paired score table → slice/P0 scan → verdict │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Diff discipline**: Confirm only one intentional system variable changed.
2. **Table reading**: Flag aggregate green + P0/refusal red as automatic no-go.
3. **Claim control**: Reject “significant improvement” language without decisive N / paired wins.
4. **Provenance check**: Dataset hash, prompt hashes, judge pin present?
5. **Rollback clarity**: Require a one-line revert path in every no-go summary.

---

## Review checklist

| Question | Fail if |
| :--- | :--- |
| Thresholds pre-registered? | Bars moved after scores |
| Baseline from main? | Baseline is this PR or an ablation |
| Held-out untouched? | Cases edited to pass the gate |
| Provider errors separated? | Timeouts counted as wrong answers |
| Blind rubric? | Author scored their own candidate knowingly |
| Runs executed? | “GO” without artifacts |

---

## How to narrate a verdict

**NO-GO example**

> Aggregate +1.2pp, but `p0` slice −8pp (3 cases: `eval-012`, `eval-044`, `eval-091`). Refusal slice tied. Thresholds forbid any P0 regression. Roll back candidate system prompt to `prompts/support.system.md@a3f2…`.

**UNTESTED example**

> Gate config present; provider key missing in CI—no paired runs. Do not merge on review-only approval.

---

## Best Practices

1. Prefer showing side-by-side answer snippets for top regressions over debating mean scores.
2. When screenshots of dashboards are provided, extract tolerance and N before opining.
3. Push teams to add the failing prod ticket as a regression case in a **new** dataset version after the incident—not by mutating the frozen gate set mid-PR.

---

## Limitations

- Cannot invent missing run artifacts.
- Stop if thresholds or baseline provenance are unspecified.

---

## Agent Operational Directive

> **MANDATORY**: Prioritize slice/P0 regressions over average wins. Demand hashed paired runs. Never convert untested into go. Always include rollback.
