---
title: "FastAPI Python APIs AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to interpret OpenAPI diffs, 422 validation errors, and webhook verify failures from logs."
category: "Development / FastAPI"
tags: ["fastapi", "openapi", "diagnostics", "gemini"]
---

# FastAPI Python APIs AI Skill Guide (Gemini)

## Operational Capabilities & Agent Directives

1. **422 tables**: Map Pydantic field errors to user-facing fixes.
2. **401 vs 403**: Dependency auth vs business rule—don't conflate.
3. **Webhook 400**: Almost always body parsing order—highlight raw body requirement.

## Agent Operational Directive

> **MANDATORY**: Distinguish validation errors from auth and signature failures in triage reports.
