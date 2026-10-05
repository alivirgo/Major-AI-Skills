---
name: playwright
description: "Write resilient Playwright E2E tests with role locators, worker-scoped auth storageState, test isolation for shared DB data, trace-on-retry CI, and web-first assertions. Use for checkout flows, multi-user scenarios, and flaky test diagnosis."
category: testing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["playwright", "e2e", "trace-viewer", "locators", "fixtures", "test-isolation", "ci", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Playwright End-to-End Testing AI Skill Guide (Claude)

## Overview & Engine Architecture

Playwright Test runs specs in **parallel workers**. Each test gets an isolated **BrowserContext** (cookies/storage isolated), but **server-side state** (DB rows, shared test accounts) is not—isolation requires fixtures keyed by `parallelIndex` or `workerIndex`.

Claude operates as a Principal QA Automation Engineer: **getByRole/getByLabel**, **no sleep-based waits**, **worker-scoped `storageState`**, **trace on retry**, and **deterministic seed data**.

```
playwright.config.ts → projects/workers/retries
        │
   fixtures (test / worker scope)
        │
   Browser → Context → Page → locators + expect()
        │
   artifacts: trace, screenshot, video, HTML report
```

---

## When to use / when not to

**Use when**

- Validating critical user journeys (auth, checkout, onboarding).
- Regression-proofing UI that unit tests cannot cover.
- CI gates with artifacts on failure.

**Do not use when**

- Pure logic—use `@vitest`.
- Tests depend on production data or live payments without test mode.

---

## Operational Capabilities & Agent Directives

1. **Locators**: `getByRole`, `getByLabel`, `getByTestId`—avoid brittle CSS/XPath.
2. **Assertions**: Web-first `expect(locator).toBeVisible()`—no `waitForTimeout`.
3. **Auth**:
   - **Read-only tests**: one-time `globalSetup` → shared `storageState` file.
   - **Mutating tests**: **one account per parallel worker** via worker-scoped fixture (`parallelIndex`).
4. **Test isolation**: Never share mutable DB users across workers without unique IDs per worker.
5. **CI**: `trace: 'on-first-retry'`, `npx playwright install --with-deps`, shard large suites.
6. **Payment tests**: Stripe test mode + test cards only; assert webhook side effects via API/DB, not redirect alone.

---

## Spec + config excerpts

```typescript
import { test, expect } from "@playwright/test";

test("checkout smoke", async ({ page }) => {
  await page.goto("/products/demo-sku");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

Worker-scoped auth (mutating tests)—see Playwright docs `auth` multi-worker pattern with `.auth/${parallelIndex}.json`.

---

## Technical Troubleshooting Matrix

| Issue | Root cause | Fix |
| :--- | :--- | :--- |
| **Strict mode violation** | Locator matches multiple | Narrow role+name; filter |
| **Flaky timeout** | Race on network/animation | `expect` auto-wait; `waitForResponse` |
| **Auth works locally, fails CI** | Single shared account mutated | Per-worker accounts |
| **storageState ignored intermittently** | Context reuse bugs (fixed 1.53+) | Upgrade Playwright; fresh context per user |
| **Parallel collisions** | Same SKU/user/email | Worker-scoped fixtures + unique data |

---

## Best practices

- `test.step` for readable traces.
- Page objects only when they reduce duplication—not premature.
- Seed data via API before UI steps.
- Quarantine flaky tests; fix isolation before raising retries.

---

## Limitations

- E2E is slower and flakier than unit tests—keep suite lean.
- Visual regression needs separate tooling/strategy.
- Cross-browser matrix costs CI time—prioritize Chromium smoke + weekly full matrix.

---

## Related skills

- `@vitest` — component/unit layer beneath E2E
- `@stripe` — test mode checkout + webhook fulfillment checks
- `@nextjs` — `webServer` dev command and baseURL

---

## Agent Operational Directive

> **MANDATORY**: No hard-coded sleeps. Use role/label locators. For parallel suites that mutate server state, authenticate with per-worker accounts and storageState. Enable trace-on-retry in CI. Never run payment tests against live keys.

---

## Sources

- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Parallelism & isolation](https://playwright.dev/docs/test-parallel)
- GitHub: [storageState context reuse #36563](https://github.com/microsoft/playwright/issues/36563)
