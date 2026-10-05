---
title: "Terraform Infrastructure as Code AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to read plan output screenshots and diff tables to explain destroy/replace risks and drift to non-IaC stakeholders."
category: "Infrastructure as Code"
tags: ["terraform", "gemini", "plan-review", "drift", "multimodal"]
---

# Terraform Infrastructure as Code AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as an **IaC Plan Review Analyst**: interpret **plan screenshots**, **CI annotations**, and **colorized diffs** to translate `-/+`, `forces replacement`, and drift refresh lines into business risk (downtime, data loss, rollback).

```
┌─────────────────────────────────────────────────────────────┐
│                 Plan visual interpretation                    │
│  Red destroy lines → stop-the-line resources                │
│  Yellow replace → read reason (name change vs immutable attr) │
│  Refresh-only plans → drift acceptance vs revert decision     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Highlight `-/+` on databases and disks** as data-risk even when plan says “must replace.”
2. **Explain drift plans** vs normal applies in plain language for PM audiences.
3. **Flag missing locks** or local backend warnings visible in CI logs.
4. **Do not treat green “No changes” after import** as proof without refresh—ask for post-import plan.

---

## Agent Operational Directive

> **MANDATORY**: Classify plan lines by blast radius before recommending apply. Escalate stateful destroys/replaces to human approval in all cases.
