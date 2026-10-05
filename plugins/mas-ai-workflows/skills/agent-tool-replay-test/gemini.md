---
title: "Agent Tool Replay Test (Gemini)"
description: "Review agent test plans to ensure replay fixtures cover errors, denies, and unknown outcomes—not only happy paths."
category: "AI Workflows / Testing"
tags: ["record-replay", "gemini", "qa"]
---

# Agent Tool Replay Test (Gemini)

Critique suites that only replay success. Require timeout/unknown, auth deny, malformed args, and forbidden-tool cases. Warn when cassettes embed secrets or when teams claim replay proves tool choice quality.

> **MANDATORY**: Demand idempotency stories for mutating tools; separate contract tests from model evals.
