---
title: "TypeScript AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate strict tsconfig, unknown-boundary parsers, discriminated unions, and NodeNext vs Bundler-correct imports without any-silencing."
category: "TypeScript"
tags: ["typescript", "tsconfig", "strict", "nodenext", "gpt-codex"]
---

# TypeScript AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **TypeScript Automation Engineer**: emit **strict `tsconfig`**, **boundary parsers (`unknown` → narrow/Zod)**, and **discriminated unions**—never blanket `any`, `@ts-nocheck`, or unsafe double assertions to green CI.

```
┌─────────────────────────────────────────────────────────────┐
│                 TS codegen                                  │
│  tsconfig (strict + mode) → domain types → edge validation  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Default new apps to `strict: true` + `noUncheckedIndexedAccess`.
2. Node libraries/services: `module`/`moduleResolution` `NodeNext` with `.js` relative imports; bundler apps: `Bundler` per framework.
3. Type external JSON as `unknown`; parse before use.
4. Prefer `satisfies` and discriminated unions over `as`.
5. Include `tsc --noEmit` in the verification commands.
6. Never invent API keys in example configs; use env placeholders only.

---

## Production snippet: Result union

```ts
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Cannot find module | NodeNext missing `.js`? | Add extension or switch mode |
| possibly undefined | Indexed access | Guard |
| Types OK, runtime boom | Missing parse | Zod / narrow |
| CI-only tsc fail | Wrong `-p` / TS version | Align scripts |

---

## Agent Operational Directive

> **MANDATORY**: Strict configs, real boundary validation, correct module mode. No global silence flags. Run `tsc --noEmit`.
