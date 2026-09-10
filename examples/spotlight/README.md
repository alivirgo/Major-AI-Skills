# Portable reference workflows

These reference implementations exercise small, inspectable FFmpeg, DuckDB, and Playwright workflows described in the [featured guide](../../docs/users/spotlight.md). They are authored examples with assertions, not a model benchmark or certification of the complete skills.

## Setup and run

Use Node.js 22 or newer. Run from this directory:

```bash
npm ci
npm run browser:install
npm test
```

Dependencies are pinned in the lockfile. Setup downloads native media/database binaries and Chromium. On Linux, Playwright may also require system libraries; follow its documented browser setup for your environment. After setup, the reference workloads process only local generated or checked-in fixtures.

The runner creates a unique `output/run-*` directory each time, never overwrites an earlier run, and returns a nonzero exit code if any reference fails. Its report records each result separately so one missing dependency does not hide the other results.

| Reference | Input | Outputs | Checks |
| --- | --- | --- | --- |
| FFmpeg | Generated one-second pattern, with and without audio | MP4s, source clips, ffprobe reports, exact argument arrays | H.264, yuv420p, dimensions, duration, AAC when present, faststart box order, unchanged source hashes |
| DuckDB | `fixtures/orders.csv` | SQL, revenue CSV, results in report | Decimal totals, cancelled-row exclusion, null count, invalid-number failure, CSV round trip, unchanged source hash |
| Playwright | `fixtures/checkout.html` | Desktop/mobile screenshots, trace ZIPs | Cart transition, form submission, confirmation, email, no page errors or external requests |

## Inspect the evidence

Open `report.json` in the printed artifact directory. Inspect each MP4 and screenshot rather than relying only on the process exit code. The revenue CSV should contain A = 30.00 and B = 12.50; the paid row with a missing amount is reported separately.

To inspect a browser trace, pass one of the printed run's trace files to `npx playwright show-trace`. Full errors appear in the JSON report. Generated outputs are ignored by Git and should be reviewed before sharing.

## Repeat with an agent

Install only the skill for the workflow you want to evaluate, then give the agent the corresponding prompt from the featured guide and a fresh fixture copy. Compare its actual result against the same acceptance checks. Record the agent/model, application versions, exact input, changes required, and any failures. Keep that evaluation separate from the reference implementation's result.

Blender, Figma, and SOLIDWORKS are application walkthroughs in the guide; this runner does not execute them.

## Implementation references

- [FFmpeg MOV/MP4 muxer and faststart](https://ffmpeg.org/ffmpeg-formats.html#mov_002c-mp4_002c-ismv)
- [DuckDB Node API](https://github.com/duckdb/duckdb-node-neo)
- [Playwright browser automation](https://playwright.dev/docs/api/class-page)
