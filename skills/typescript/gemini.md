---
title: "TypeScript AI Skill Guide (Gemini)"
description: "Operational skill for Gemini to diagnose TypeScript module-resolution, strictness, assertion abuse, and runtime-vs-type gaps from tsc errors and stack traces."
category: "TypeScript"
tags: ["typescript", "gemini", "diagnostics", "tsconfig", "nodenext"]
---

# TypeScript AI Skill Guide (Gemini)

## Overview & Engine Architecture

Gemini acts as a **TypeScript Diagnostics Specialist**: read **`tsc` diagnostics, tsconfig snippets, and runtime stacks** to separate **NodeNext extension mistakes**, **unchecked index access**, **`as`-induced runtime crashes**, and **strictness forks**.

```
┌─────────────────────────────────────────────────────────────┐
│                 TS multimodal triage                        │
│  Cannot find module → NodeNext vs Bundler / .js ext         │
│  possibly undefined → noUncheckedIndexedAccess              │
│  Runtime TypeError, types green → assertion / no validate   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Cannot find module `./x`** → check `moduleResolution` and whether relative import needs `.js`.
2. **possibly undefined** on `arr[i]` → explain indexed access; add guards—not `!` by default.
3. **Crash with clean `tsc`** → hunt `as` / missing Zod at HTTP/JSON edge.
4. **`strict: false` pain with modern libs** → recommend enabling strict package-by-package.
5. **Never request** pasting secrets from `.env` into chat.

---

## Diagnostic playbook

| User shows | Likely cause | Next evidence |
| :--- | :--- | :--- |
| TS2307 relative import | NodeNext extensions | tsconfig module + import path |
| TS2532 on `[0]` | noUncheckedIndexedAccess | guard / length |
| Runtime undefined property | Lied with `as` | parse site |
| Works in IDE, fails CI | Different tsconfig/version | CI `tsc -p` log |

---

## Agent Operational Directive

> **MANDATORY**: Diagnose module mode and boundary validation before suggesting `any`. Never silence entire projects. Never ask for credentials.
