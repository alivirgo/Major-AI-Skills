---
name: vitest
description: "Configure Vitest with fork/thread pool isolation, mock lifecycle, fake timers, coverage gates, and CI-friendly concurrency. Use for unit and component tests in Vite/Next projects; diagnose parallel flakiness from shared module state."
category: testing
risk: safe
source: self
source_type: self
date_added: "2026-09-13"
tags: ["vitest", "testing", "unit-test", "vite", "isolation", "mocks", "coverage", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Vitest High-Performance Testing AI Skill Guide (Claude)

## Overview & Engine Architecture

Vitest reuses **Vite's transform pipeline** for fast ESM/TS tests. Tests run in a **pool** (`forks` default in Vitest 2+, or `threads`) with **per-file isolation** by default—each file gets a clean module registry unless `isolate: false`.

Claude operates as a Principal Quality Engineer: **mock reset discipline**, **fork isolation vs speed tradeoffs**, **fake timers**, and **coverage thresholds in CI**.

```
vitest.config.ts
  → pool (forks | threads | vmThreads)
  → per-file isolation (default true)
  → happy-dom/jsdom for components
  → v8 coverage + thresholds
```

---

## When to use / when not to

**Use when**

- Vite, Vitest-native, or Next.js projects already on Vite tooling.
- Fast watch mode and ESM-native mocking.

**Do not use when**

- Jest is mandated with custom transformers the team won't migrate—don't dual-run without reason.

---

## Operational Capabilities & Agent Directives

1. **Default `pool: 'forks'`** for stability; switch to `threads` only after green CI with isolation on.
2. **`isolate: false` is opt-in speed**—requires `restoreMocks`, no leaking `vi.mock` across files; expect order-dependent bugs if careless (GitHub #9499, #11152).
3. **`clearMocks` / `mockReset` / `restoreMocks`** in config or `afterEach`; call `vi.useRealTimers()` after fake timers.
4. **No real sleeps**—`vi.useFakeTimers()` + `vi.advanceTimersByTime`.
5. **Path aliases** must match Vite (`resolve.alias` or `vite-tsconfig-paths`).
6. **CI cores**: cap `poolOptions.forks.maxThreads` on 2-core runners.
7. **`process.nextTick` mocking** incompatible with `pool: forks`—use threads if you must mock it.

---

## Production config sketch

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    environment: "happy-dom",
    pool: "forks",
    isolate: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      thresholds: { lines: 85, branches: 80 },
    },
  },
});
```

Mock + timers:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});
afterEach(() => {
  vi.useRealTimers();
});
```

---

## Technical Troubleshooting Matrix

| Issue | Root cause | Fix |
| :--- | :--- | :--- |
| **`document is not defined`** | No DOM env | `environment: 'happy-dom'` |
| **Flaky parallel failures** | Shared module mock with `isolate: false` | Re-enable isolation or fix mock scope |
| **Wrong mock in unrelated file** | Module cache + `isolate: false` | `pool: forks` + `isolate: true` |
| **Can't find `@/`** | Missing alias | vitest `resolve.alias` |
| **CI OOM / slow** | Too many threads | Lower `maxThreads` |

---

## Best practices

- Share Vite plugins with app config via merged `defineConfig`.
- Prefer `vi.spyOn` for partial mocks when factories leak across files.
- Component tests: Testing Library + roles.
- Run `vitest run --coverage` in CI; watch locally.

---

## Limitations

- Not a browser E2E runner—pair with `@playwright`.
- Native modules may require forks over threads.
- Snapshot churn—review intentionally, don't blind `-u` in CI.

---

## Related skills

- `@react` — component behavior under test
- `@nextjs` — vitest + Next monorepo setup
- `@playwright` — E2E layer above unit tests

---

## Agent Operational Directive

> **MANDATORY**: Keep default file isolation unless the suite proves clean teardown. Reset mocks and timers between tests. Never use real `setTimeout` sleeps for assertions. Treat `isolate: false` flakiness as a test design bug, not "Vitest randomness."

---

## Sources

- [Vitest improving performance / isolation](https://vitest.dev/guide/improving-performance)
- [Vitest 2 migration — default pool forks](https://vitest.dev/guide/migration)
- GitHub: [#9499 test sequence mocks](https://github.com/vitest-dev/vitest/issues/9499), [#11152 isolate false mock bleed](https://github.com/vitest-dev/vitest/issues/11152)
