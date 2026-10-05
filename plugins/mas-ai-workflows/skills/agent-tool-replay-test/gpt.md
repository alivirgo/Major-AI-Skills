---
title: "Agent Tool Replay Test (GPT & Codex)"
description: "Wire record/replay cassettes, schema assertions, and idempotent mutating-tool tests for agent CI."
category: "AI Workflows / Testing"
tags: ["record-replay", "cassette", "tools", "gpt-codex"]
---

# Agent Tool Replay Test (GPT & Codex)

Implement `CASSETTE_MODE=replay` in CI (fail on miss). Record sanitized trajectories in PRs when prompts/tools change. Assert tool sequences and argument JSON Schema. For payments/messages: simulate timeout then assert reconcile/idempotent retry—not double execute.

```python
# Pseudocode policy
assert "process_refund" not in calls or approval_hash_ok
assert call.args["idempotency_key"]  # mutating tools
```

> **MANDATORY**: No prod credentials in cassettes. Replay ≠ live selection quality.
