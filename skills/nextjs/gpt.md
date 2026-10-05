---
title: "Next.js App Router AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to scaffold App Router routes, Cache Components migration notes, raw webhook handlers, and server-only module boundaries."
category: "Development / Next.js"
tags: ["nextjs", "app-router", "caching", "route-handlers", "gpt-codex"]
---

# Next.js App Router AI Skill Guide (GPT & Codex)

## Operational Capabilities & Agent Directives

1. **Boundary lint**: Flag any `import` of DB/env modules from `"use client"` files.
2. **Version gate**: Read `next` from package.json before emitting `dynamic`/`revalidate`/`fetchCache`.
3. **Webhook routes**: `export async function POST(req: Request) { const raw = await req.text(); … }`
4. **Cache Components**: Prefer `"use cache"` + `cacheLife` over deprecated segment exports when on Next 16+.

## Codemod-friendly checklist

- [ ] Secrets only in server modules (`server-only`)
- [ ] Suspense around `cookies()`/`headers()` when `cacheComponents` enabled
- [ ] Stripe route registered without global JSON body middleware

## Agent Operational Directive

> **MANDATORY**: Confirm Next major version before caching advice. Webhook handlers must use raw body strings/buffers pre-verify.
