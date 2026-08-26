---
name: playwright-ci
description: "CI-focused Playwright skill: flake control, retries/traces, sharding, blob reports, artifact upload, and deterministic auth/data in pipelines."
category: testing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["playwright", "ci", "sharding", "traces", "flakes", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Playwright CI Reliability AI Skill Guide

## Overview & Engine Architecture

This skill complements `@playwright` with pipeline-first patterns. CI runs browsers headlessly under time pressure; flakes usually come from shared state, network races, or insufficient isolation - not "bad CI luck." Agents configure retries + trace-on-first-retry, shard large suites, merge blob reports, and upload HTML/trace artifacts for every failing job.

```
CI job matrix (shards)
        |
 playwright test --shard=i/n
        |
 blob report per shard
        |
 merge-reports -> HTML
        |
 upload traces / videos on failure
```

## When to use this skill

- Stabilizing Playwright suites on GitHub Actions/GitLab/etc.
- Adding sharding and report merging
- Capturing traces for intermittent failures
- Designing auth/storageState reuse for CI speed

## Operational directives

1. Fail on flakes intentionally: fix root cause; do not raise retries forever.
2. `trace: 'on-first-retry'` (or on) so failures are debuggable without huge happy-path artifacts.
3. Shard by time (`--shard=x/y`) when wall clock exceeds budget; merge blob reports.
4. Seed deterministic data; never point CI at mutable production.
5. Install browsers in CI with `npx playwright install --with-deps` (or image cache).

## `playwright.config.ts` CI sketch

```ts
import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [["blob"], ["github"]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: isCI ? "on-first-retry" : "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
```

## GitHub Actions shard sketch

```yaml
strategy:
  fail-fast: false
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]
steps:
  - run: npx playwright install --with-deps
  - run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
  - uses: actions/upload-artifact@v4
    if: always()
    with:
      name: blob-report-${{ matrix.shardIndex }}
      path: blob-report
```

Merge job:

```bash
npx playwright merge-reports --reporter html ./all-blob-reports
```

## Flake triage checklist

```
- [ ] Test uses web-first assertions (no raw sleep)
- [ ] No shared mutable user across parallel workers
- [ ] storageState generated once per shard/job, not per test UI login
- [ ] Network to third parties mocked or stubbed when unstable
- [ ] Trace from retry inspected in Trace Viewer
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Unlimited retries | Hides real bugs | Cap retries; fix flakes |
| No artifacts on failure | Unactionable CI red | Upload trace/html |
| One giant serial suite | Slow feedback | Parallel + shard |
| Hitting prod APIs | Non-deterministic | Ephemeral env + seeds |

## Best practices

- Tag smoke vs full suite; run smoke on every PR, full on main/nightly.
- Quarantine known flakes with an expiry issue - do not leave forever.
- Keep browsers version-locked via Playwright package version.
- Prefer `getByRole` locators so refactors break loudly, not flakily.

## Limitations

- Some third-party widgets remain nondeterministic even with good practices.
- GPU/video codec differences across CI images can affect screenshots.
- Extremely large traces need retention policies to control storage cost.

## Related skills

- `@playwright` - locators, fixtures, local debugging
- `@vercel` - testing preview deployment URLs from CI
- `@github-actions` - broader workflow authoring when present
