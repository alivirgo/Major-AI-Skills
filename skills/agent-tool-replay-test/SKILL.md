---
name: agent-tool-replay-test
description: "Replay recorded AI tool calls against deterministic fixtures to test argument validation, error handling, and side-effect boundaries."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "agent-tool-replay-test"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Tool Replay Test

## Scope

Read the tool contracts and identify read-only versus mutating operations. Use the existing test runner and mock interfaces. Record sanitized inputs, expected results, and correlation IDs without credentials.

## Procedure

Build deterministic fixtures for success, timeout, permission denial, malformed output, and partial failure. Replace clocks and random IDs where needed. Prevent fixtures from reaching real networks or production resources.

## Checks

Replay exact arguments through the validation and dispatch layers. Test that unknown fields and invalid identifiers are rejected. For mutating calls, verify authorization checks and idempotency behavior before any side effect.

## Failure Handling

Check bounded retries and distinguish a known failure from an unknown outcome after a timeout. An unknown outcome requires reconciliation; blindly replaying a payment or message send can duplicate it.

## Deliverable

Deliver fixtures, invocation traces, and assertions about calls that must not occur. Label replay coverage separately from end-to-end model behavior because a replay does not test tool selection.

