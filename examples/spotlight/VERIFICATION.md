# Reference verification

Recorded September 11, 2026 (Asia/Karachi); run timestamp `2026-09-10T21:17:38.742Z` in UTC.

Environment: Windows x64, Node.js 24.18.0. Command: `npm test` from `examples/spotlight` after installing the locked dependencies and Chromium.

| Reference | Result | Observed evidence |
| --- | --- | --- |
| FFmpeg 6.1.1 | Passed | Both audio-present and video-only cases; H.264/yuv420p, 320x180, duration tolerance, AAC when present, faststart box order, unchanged input hashes |
| DuckDB 1.5.5 | Passed | A = 30.00, B = 12.50; one missing paid amount; cancelled amount excluded; malformed numeric input rejected; CSV round trip and input hash checked |
| Playwright 1.63.0 / Chromium 153.0.8010.12 | Passed | Checkout completed at 1280x800 and 390x844; expected email displayed; no page errors or external requests; screenshots and traces saved |
| Blender | Not executed | Requires a Blender runtime; guided prompt and acceptance checks are provided |
| Figma | Not executed | Requires a Figma development-plugin session; guided prompt and acceptance checks are provided |
| SOLIDWORKS | Not executed | Requires licensed Windows application testing; guided prompt and acceptance checks are provided |

The [published screenshot](../../assets/spotlight-checkout.png) is the actual desktop output from the Playwright reference. Complete local artifacts are written under the ignored `output/` directory; a new run produces its own report and files.

These results establish the behavior of the supplied small reference implementations in this environment. They do not establish model adherence, the quality of every example in a full SKILL.md, speed improvements over a baseline, ranking changes, or successful operation on other application versions.

## Repository discovery checks

- The Vercel CLI's local discovery found all 392 canonical skills after the description updates.
- Repository validation and generated-output consistency checks passed.
- Browser checks passed at 1440px and 390px widths: all 392 entries, six featured workflows, search, category filtering, empty results, copy success, clipboard-denied selection fallback, loaded reference image, and skill-row overflow.
- The npm package dry run included the skills.sh configuration, featured guide, example sources, fixtures, lockfile, and verification image. Local output directories and installed dependency trees were excluded.

These local checks do not prove that all individual skill pages are live on skills.sh.
