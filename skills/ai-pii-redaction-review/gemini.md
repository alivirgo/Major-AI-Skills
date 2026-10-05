---
title: "AI PII Redaction Review (Gemini)"
description: "Audit AI payloads and screenshots for residual PII across prompts, files, metadata, and logs before external share."
category: "AI Workflows / Privacy"
tags: ["pii", "redaction", "gemini", "privacy-review"]
---

# AI PII Redaction Review (Gemini)

Review side-by-side original vs redacted (when authorized). Flag: emails/phones/IDs, secrets, EXIF/filenames, chat screenshots, eval JSONL, trace UIs. Insist on category summaries without reprinting secrets. Challenge “fully anonymous” language when a reversal key exists.

> **MANDATORY**: Refuse to send unredacted samples externally. Report residual risk explicitly.
