---
name: playwright
description: "Operational skill for Claude to automate Playwright Test with locators, fixtures, tracing, CI browsers, and resilient end-to-end specs."
category: testing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["playwright", "e2e", "trace-viewer", "locators", "fixtures", "ci", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Playwright End-to-End Testing AI Skill Guide (Claude)

## Overview & Engine Architecture
Playwright is a modern browser automation framework with **first-class Test Runner** (`@playwright/test`), auto-waiting **locators**, multi-browser projects (Chromium/Firefox/WebKit), and rich debugging via **trace**, **video**, and **HTML report**. Claude operates as a Principal QA Automation Engineer, specializing in **resilient locators**, **fixtures**, **storageState auth**, **trace-on-failure CI**, and **parallel project matrices**.

### Playwright Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Playwright Architecture                     │
│                                                             │
│  Test Runner                                                │
│  ├── playwright.config.ts projects/workers/retries          │
│  ├── Fixtures (page, context, custom)                       │
│  └── Reporters (list, html, github, blob)                   │
│                                                             │
│  Automation Engine                                          │
│  ├── Browser / Context / Page                               │
│  ├── Locators + auto-wait + web-first assertions            │
│  └── Network interception / routing                         │
│                                                             │
│  Diagnostics                                                │
│  ├── Trace Viewer / screenshots / video                     │
│  ├── UI mode / codegen / inspector                          │
│  └── CI artifacts                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Role/Label Locators First**: Prefer `getByRole`, `getByLabel`, `getByTestId` over CSS/XPath soup.
2. **Web-First Assertions**: Use `expect(locator).toBeVisible()` - not manual sleeps.
3. **Isolate Auth**: Reuse `storageState` for logged-in projects; avoid UI login in every test.
4. **Trace on Retry**: Capture traces for failed/retried tests in CI.
5. **Deterministic Data**: Seed test users/data; do not depend on volatile production content.

---

## Production Spec + Config Snippets

`tests/checkout.spec.ts`:

```typescript
// ==============================================================================
// Playwright Test: resilient checkout smoke with role locators
// ==============================================================================
import { test, expect } from "@playwright/test";

test.describe("checkout", () => {
  test("adds item and shows confirmation", async ({ page }) => {
    await page.goto("/products/demo-sku");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();

    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByLabel("Email").fill("qa+playwright@example.com");
    await page.getByLabel("Card number").fill("4242424242424242");
    await page.getByRole("button", { name: "Pay now" }).click();

    await expect(
      page.getByRole("heading", { name: /order confirmed/i })
    ).toBeVisible();
  });
});
```

`playwright.config.ts` excerpt:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

CLI:

```bash
npx playwright install --with-deps
npx playwright test
npx playwright show-report
npx playwright test --ui
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Strict mode violation** | Locator resolved multiple nodes. | Narrow with role+name; use `.nth` sparingly. |
| **Flaky timeouts** | Animation/network race. | Prefer auto-wait assertions; wait for response/URL. |
| **Auth expired mid-suite** | Stale storageState. | Refresh setup project; shorten token TTL handling. |
| **CI browsers missing** | Install step skipped. | `npx playwright install --with-deps` in pipeline. |

---

## Best Practices

1. One assertion intent per test; share journeys via fixtures.
2. Use `test.step` for readable traces.
3. Keep selectors in page objects only if they reduce duplication - don't over-abstract early.

### Essential Paths
- `playwright.config.ts`
- `tests/`
- `test-results/` / `playwright-report/` (artifacts)

---

## Agent Operational Directive
> **MANDATORY**: Prefer role/label locators and web-first assertions. No hard-coded `waitForTimeout` sleeps. Enable trace-on-retry in CI and keep tests deterministic with seeded data.
