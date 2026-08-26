---
name: typescript
description: "Operational skill for TypeScript: strict typing, narrowing, generics, tsconfig, migrating JavaScript safely, and eliminating any-typed boundaries."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["typescript", "types", "generics", "tsconfig", "javascript", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# TypeScript Type-Safe JavaScript AI Skill Guide

## Overview & Engine Architecture

TypeScript adds a structural type system on top of JavaScript that erases at compile time. The compiler (`tsc`) and language service power editor checks; `tsconfig.json` controls strictness and module emission. Agents prefer precise types over `any`, use discriminated unions for state machines, and fix errors at API boundaries instead of silencing them.

```
.ts / .tsx
   -> TypeScript compiler / language service
       -> typecheck (no emit or emit)
           -> JS + .d.ts (as configured)
```

## When to use this skill

- Adding types to new or existing JS codebases
- Designing public function/interfaces for libraries
- Tightening `tsconfig` strictness
- Typing fetch/API responses without lying to the compiler

## Operational directives

1. Enable `strict` (and ideally `noUncheckedIndexedAccess`) for application code.
2. Prefer `unknown` over `any` at boundaries; narrow before use.
3. Model closed states with discriminated unions (`type: 'loading' | 'ok' | 'err'`).
4. Do not use `as` assertions unless you can state why the compiler cannot prove the truth.
5. Keep `skipLibCheck` as a pragmatism flag - still type your own code correctly.

## Discriminated union example

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function readUser(json: unknown): Result<{ id: string }> {
  if (typeof json !== "object" || json === null) {
    return { ok: false, error: "not an object" };
  }
  const id = (json as { id?: unknown }).id;
  if (typeof id !== "string") return { ok: false, error: "id missing" };
  return { ok: true, value: { id } };
}
```

## tsconfig starter (apps)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
  ,
  "include": ["src"]
}
```

## Commands

```bash
npx tsc --noEmit
npx tsc -p tsconfig.json
```

## Best practices

- Export types (`export type`) separately from runtime values when it helps tree-shaking clarity.
- Prefer `satisfies` for checking object literals without widening.
- Generate types from OpenAPI when APIs change often.
- In React, type props explicitly; avoid `FC` if the team style forbids it.

## Limitations

- Type correctness does not prove runtime correctness (validation still required).
- Declaration files for untyped deps may be incomplete.
- Emit target and module settings must match the runtime (Node/browser/bundler).

## Related skills

- `@react` - typing components and hooks
- `@nodejs` - runtime modules TypeScript compiles to
- `@prisma` - generated client types for DB access
