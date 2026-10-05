---
title: "Agent Injection Boundary Test (GPT & Codex)"
description: "Automate paired clean/poison RAG fixtures, canary assertions, and tool-call allow-list checks in CI sandboxes."
category: "AI Workflows / Security"
tags: ["prompt-injection", "owasp", "canary", "gpt-codex"]
---

# Agent Injection Boundary Test (GPT & Codex)

CI job: load paired fixtures → run agent with mocked tools → assert `CANARY` absent from outputs/args → assert disallowed tools not called → assert clean task score ≥ floor. Separate planner (tools) from reader (untrusted text) when implementing fixes. Destination allow-list for any egress tool.

> **MANDATORY**: Replay mode offline; never hit real payment/email. Document suite limits in the report.
