---
title: "Zapier Automation AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to document Zap step maps, Find-before-Create patterns, Tables idempotency rows, and loop-safe trigger filters."
category: "Automation / Zapier"
tags: ["zapier", "zaps", "idempotency", "gpt-codex"]
---

# Zapier Automation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex produces **Zap specifications** (trigger → filter → find → update/create) and **Tables schemas** for dedupe—implementation stays in Zapier UI unless using Zapier Platform CLI (out of scope unless requested).

## Operational Capabilities & Agent Directives

1. **Step manifest**: Number each step; map fields as `source.path → dest.field`.
2. **Dedupe table**: Columns `event_id` (PK), `status`, `processed_at`.
3. **Loop guard**: Document trigger filter excluding integration user/bot.
4. **Payments**: Redirect fulfillment to server webhook skill `@stripe`—Zap is notification only.

## Agent Operational Directive

> **MANDATORY**: Every webhook-triggered Zap spec includes Find/lookup on stable external ID before Create. Document error notification enabled.
