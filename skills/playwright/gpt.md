---
title: "Playwright E2E AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate playwright.config.ts, worker-scoped auth fixtures, CI install steps, and role-based specs."
category: "Testing / Playwright"
tags: ["playwright", "e2e", "fixtures", "ci", "gpt-codex"]
---

# Playwright E2E AI Skill Guide (GPT & Codex)

## Operational Capabilities & Agent Directives

1. Emit `playwright.config.ts` with `trace: 'on-first-retry'` when `CI` set.
2. Generate worker-scoped `storageState` fixture using `parallelIndex` for mutating suites.
3. CI step: `npx playwright install --with-deps`.
4. Ban `page.waitForTimeout` in generated specs—use `expect` auto-wait.

## Fixture skeleton

```typescript
export const test = base.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  workerStorageState: [async ({ browser }, use) => {
    const id = test.info().parallelIndex;
    const file = path.join(test.info().project.outputDir, `.auth/${id}.json`);
    // login once per worker, save storageState
    await use(file);
  }, { scope: "worker" }],
});
```

## Agent Operational Directive

> **MANDATORY**: Parallel mutating tests get unique accounts per worker. No sleep-based waits in generated code.
