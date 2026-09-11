---
name: ai-human-handoff-contract
description: "Define and test when an AI workflow must hand a task to a human, preserving evidence and preventing unapproved continuation."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "ai-human-handoff-contract"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Human Handoff Contract

## Scope

Identify decision ownership, irreversible actions, required evidence, and the human review channel. Derive handoff triggers from application requirements rather than model confidence alone. Keep thresholds configurable by the authorized owner.

## Procedure

Define states such as active, awaiting_review, approved, rejected, and expired. Specify which actions remain permitted in each state and who may transition it. An agent must not approve its own pending action.

## Checks

Prepare a review packet containing the user's request, relevant evidence, proposed action, uncertainty, and expiry. Minimize personal data and exclude credentials. Link evidence rather than dumping an entire conversation where possible.

## Failure Handling

Test missing evidence, unavailable reviewers, conflicting approvals, expiry, cancellation, and duplicate notifications. Bind approval to the reviewed action and inputs; material changes require renewed review.

## Deliverable

Deliver the state contract, test cases, and a concise reviewer-facing template. A timed-out approval stays pending or expires according to policy; silence is not permission.

