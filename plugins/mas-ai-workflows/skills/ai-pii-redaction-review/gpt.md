---
title: "AI PII Redaction Review (GPT & Codex)"
description: "Automate in-perimeter PII gates, typed placeholders, leakage scanners, and metadata-only audit hooks before LLM egress."
category: "AI Workflows / Privacy"
tags: ["pii", "redaction", "dlp", "gpt-codex"]
---

# AI PII Redaction Review (GPT & Codex)

Automate a **pre-egress gate**: detect → placeholder → deny-on-secret → hash-log. Keep reversal maps in encrypted session memory; restore only for authorized UX. CI: plant canary emails/keys in fixtures; fail if they appear in outbound request captures. Never commit reversal maps. Pair with `@llm-json-contract-check` for structured field allowlists.

> **MANDATORY**: Block credentials outright. Log policy decisions + SHA-256, not raw prompts, in regulated environments.
