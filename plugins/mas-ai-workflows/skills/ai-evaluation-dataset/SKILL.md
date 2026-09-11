---
name: ai-evaluation-dataset
description: "Build a versioned JSONL evaluation dataset for an AI workflow, with acceptance criteria, held-out cases, and leakage checks."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-09-11"
tags: ["ai-workflows", "evaluation", "ai-evaluation-dataset"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Evaluation Dataset

## Scope

Ask for the target task, deployment population, known failures, and which errors are unacceptable. Reuse the project's evaluator and data format when present; otherwise propose JSONL records with id, input, expected_behavior, forbidden_behavior, rubric, source, and split.

## Procedure

Separate training examples, prompt-development examples, and held-out evaluation cases. Split by originating document, user, or conversation rather than individual rows when rows share information. Keep near-duplicates in the same split. Remove secrets and obtain permission before including private user content.

## Checks

Include ordinary cases, boundary cases, ambiguous inputs, and explicit abstention cases. Label expected behavior before viewing candidate model outputs. For subjective outputs, use observable rubric criteria instead of a single preferred phrasing.

## Failure Handling

Report case counts by split and slice, provenance, duplicate findings, and unresolved label disagreements. Freeze a dataset version and content hash before comparing models. Never report evaluation accuracy without actually running the evaluator.

## Deliverable

Given several paraphrases of one support ticket, keep them in a single split; a random row split would leak the answer.

