---
title: "AI Human Handoff Contract (GPT & Codex)"
description: "Implement handoff state machines, approval hashes, review-packet schemas, and CI tests that prove silence is not approval."
category: "AI Workflows / HITL"
tags: ["handoff", "approval", "state-machine", "gpt-codex"]
---

# AI Human Handoff Contract (GPT & Codex)

Encode states and transition ACLs in code. Schema-validate review packets. Gate mutating tools on `state==approved` and matching `action_hash`. CI: attempt payment while `awaiting_review` → must refuse; expired approval → must not execute; mutated amount → hash mismatch.

> **MANDATORY**: Configurable owner thresholds; no self-approval; timeout ≠ approve.
