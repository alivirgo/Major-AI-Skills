---
name: typescript
description: "Ship strict TypeScript with sound tsconfig (NodeNext/Bundler), unknown-at-boundaries narrowing, discriminated unions, satisfies, and runtime validation—without silencing errors with any or unsafe assertions."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["typescript", "tsconfig", "strict", "nodenext", "generics", "narrowing", "zod"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# TypeScript Type-Safe JavaScript AI Skill Guide (Claude)

## Overview & Engine Architecture

TypeScript adds a **structural type system** that **erases at compile time**. The compiler (`tsc`) and language service enforce contracts; **`tsconfig.json`** chooses module resolution, emit, and strictness. Agents prefer precise types over `any`, model closed states with **discriminated unions**, validate untrusted input at runtime (types do not exist at runtime), and fix errors at **API boundaries** instead of silencing them with assertions.

```
┌─────────────────────────────────────────────────────────────┐
│                 TypeScript check → run path                   │
│                                                             │
│  .ts / .tsx                                                 │
│  ├── tsc / IDE language service (types only)                │
│  └── emit or noEmit → JS (+ .d.ts) as configured            │
│                                                             │
│  Module mode                                                │
│  ├── Node apps: module NodeNext (+ .js extensions in src)   │
│  └── Bundler apps: module bundler / preserve (Next/Vite)    │
│                                                             │
│  Boundaries                                                 │
│  └── unknown → narrow / Zod → typed domain                  │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Adding or tightening types in app/library code; designing public function/API surfaces.
- Choosing `tsconfig` (`strict`, `NodeNext` vs `Bundler`, `noUncheckedIndexedAccess`).
- Typing fetch/API payloads without lying to the compiler; migrating JS → TS incrementally.

**Do not use when**

- The task is purely runtime Node HTTP wiring with no type work → `@nodejs` / `@express`.
- Schema/DB generation is the center of gravity → `@prisma` (consume generated types here).
- Someone asks to blanket `// @ts-nocheck`, global `any`, or `as unknown as T` to “make CI green” without fixing the boundary → refuse the silencing; fix or isolate with a typed adapter.

---

## Operational Capabilities & Agent Directives

1. Enable **`strict: true`** for application code; add **`noUncheckedIndexedAccess`** for arrays/records (index → `T | undefined`).
2. Prefer **`unknown` over `any`** at boundaries; narrow before use (or parse with Zod/Valibot).
3. Model closed states with **discriminated unions** (`type: 'loading' | 'ok' | 'err'`).
4. Avoid `as` assertions unless you can state why the compiler cannot prove the truth; prefer `satisfies` for literal checking without widening.
5. Match **module mode to runtime**: Node → `module`/`moduleResolution` **NodeNext** (relative imports need `.js` extensions in source); Vite/Next bundlers → **Bundler** (do not mix conflicting modes).
6. Keep `skipLibCheck: true` as pragmatism for deps; still type **your** code correctly.
7. Gate with `npx tsc --noEmit` (and project references in monorepos) before calling typed work done.

---

## Production Example: boundary parse + app tsconfig

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function readUser(json: unknown): Result<{ id: string }> {
  if (typeof json !== "object" || json === null) {
    return { ok: false, error: "not an object" };
  }
  if (!("id" in json) || typeof (json as { id: unknown }).id !== "string") {
    return { ok: false, error: "id missing" };
  }
  return { ok: true, value: { id: (json as { id: string }).id } };
}

// Prefer: Zod parse at HTTP edge, then trust inferred type inward
// const User = z.object({ id: z.string().min(1) });
// const user = User.parse(await req.json());
```

`tsconfig.json` (Node app — typecheck only):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

Bundler / `@nextjs` apps: use the framework’s generated config; typically `moduleResolution: "bundler"`—do not force `NodeNext` relative `.js` rules into a Webpack/Turbopack graph unless the project already did.

Commands:

```bash
npx tsc --noEmit
npx tsc -p tsconfig.json
# monorepo: tsc -b
```

Pair with `@nodejs` for runtime ESM/CJS, `@express`/`@nextjs` for HTTP frameworks, `@prisma` for generated DB types.

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `Cannot find module './foo'` under NodeNext | Missing `.js` extension in relative import | Import `./foo.js` (points at emit); or switch to Bundler mode for bundler apps |
| `X is possibly undefined` on `arr[0]` | `noUncheckedIndexedAccess` | Guard / optional chain / definite length check |
| Runtime crash, types green | Trusted `as` / no runtime parse | Validate `unknown` at edge (Zod); stop lying with assertions |
| Library types “broken” with `strict: false` | Forked TS expectations | Turn `strict` on; fix incrementally with `paths` allowlist if needed |
| Dual package hazard / CJS default import | Wrong interop settings | Align `module` with package `"type"`; prefer named ESM exports |
| Emit works locally, Node fails | `module`/`target` ≠ runtime | Match Node version; use NodeNext for native ESM |
| CI only fails on `tsc` | IDE using different tsconfig | Pin `-p` in scripts; same TS version in CI |

---

## Best Practices

1. `export type` for type-only exports; with `verbatimModuleSyntax`, use `import type`.
2. Prefer `satisfies` for config objects: check shape without widening inferred type.
3. Generate types from OpenAPI/GraphQL when APIs change often (`@graphql-apis`).
4. In React (`@react`), type props explicitly; follow team stance on `React.FC`.
5. Incremental strictness: enable flags per package rather than drowning a legacy tree in `any`.

---

## Limitations

- Type correctness ≠ runtime correctness—validation still required at trust boundaries.
- Declaration files for untyped deps may be incomplete or wrong.
- `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` catch real bugs but increase friction—adopt deliberately.
- Path aliases (`paths`) need runtime mirrors (bundler/Node loaders) or they typecheck-only.

---

## Related Skills

- `@nodejs` — runtime modules TypeScript compiles to
- `@express` / `@nextjs` — common app hosts and their tsconfig conventions
- `@react` — component/hook typing
- `@prisma` — generated client types for DB access
- `@graphql-apis` — schema-driven types and codegen

---

## Agent Operational Directive

> **MANDATORY**: Keep `strict` on for new app code. Prefer `unknown` + narrowing (or Zod) over `any`/`as`. Align `module`/`moduleResolution` with Node vs bundler. Run `tsc --noEmit` before declaring typed work complete. Do not “fix” CI by disabling checks globally.

---

## Source anchors (research)

- [TSConfig: moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution)
- [Modules: choosing compiler options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options)
- [Total TypeScript: configuring strictness / NodeNext](https://www.totaltypescript.com/books/total-typescript-essentials/configuring-typescript)
