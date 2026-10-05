---
title: "Stripe Payments AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to triage Dashboard events, webhook delivery logs, and duplicate fulfillment from timelines."
category: "Development / Stripe"
tags: ["stripe", "webhooks", "diagnostics", "gemini"]
---

# Stripe Payments AI Skill Guide (Gemini)

## Operational Capabilities & Agent Directives

1. **Dashboard timeline**: Match `checkout.session.completed` to internal order state.
2. **Webhook 400**: Signature/body—check middleware order in user's stack.
3. **Double fulfill**: Two 200s for same `event.id` without UNIQUE constraint.

## Agent Operational Directive

> **MANDATORY**: Redirect-only fulfillment is a defect—webhook must drive paid state.
