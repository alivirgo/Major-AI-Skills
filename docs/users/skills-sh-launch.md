# Major AI Skills launch kit

## Positioning

Major AI Skills is a library of 392 installable agent playbooks spanning professional applications, development tools, and practical work habits. The useful entry point is a specific task: converting a clip, querying a dataset, testing a browser journey, exporting a design, or automating a CAD operation. The library is independent of the product vendors it documents.

Lead with the demonstrated task and its evidence. The six [featured workflows](spotlight.md) provide focused installation commands and acceptance checks. The [verification record](../../examples/spotlight/VERIFICATION.md) distinguishes three executed portable references from three application walkthroughs. It does not claim that all 392 skills have been behaviorally benchmarked.

## What ranking evidence supports

skills.sh documents installation telemetry as its listing and ranking mechanism. Its API describes deduplicated install counts, recent-growth views, and search over names, sources, and descriptions. Clear task descriptions and accessible install commands are practical adoption improvements; the documentation does not promise a ranking increase from those edits. [Official FAQ](https://skills.sh/docs/faq), [API reference](https://skills.sh/docs/api).

The official badge reports installation counts, while `skills.sh.json` organizes the repository page. Configuration is fetched after telemetry-enabled CLI installs and may remain cached. These are presentation and refresh mechanisms, not a submission or ranking guarantee. [Badge documentation](https://skills.sh/docs), [repository configuration](https://skills.sh/docs/customize).

## Release preparation

Run these commands from the repository root:

```bash
npm ci
npm run validate
npm run index:check
npm test
npx skills add . --list
```

Run the portable examples as described in their README. For the new website catalog, after installing the example dependencies and Chromium, run:

```bash
node tools/tests/discovery-browser.cjs
```

This checks all-skill rendering, search, category filtering, empty results, exact copied commands, clipboard-denied fallback, local screenshot rendering, and desktop/mobile row overflow.

Review the Git diff, include generated registries and assets, and publish the reviewed changes to the repository's default branch (`master`). GitHub Pages currently deploys on a push to that branch. An npm release is a separate action and is not required for GitHub-based `npx skills add` installs. Keep package versioning and release notes consistent if publishing npm too.

After publication, verify remote discovery:

```bash
npx skills add alivirgo/Major-AI-Skills --list
```

Check that a normal install of a needed skill resolves the published content. Respect telemetry preferences and avoid repeated self-installs intended to manufacture counts. A successful local install is not proof that the directory has processed a telemetry event.

## A focused first-day schedule

| Window | Action | Evidence to keep |
| --- | --- | --- |
| Before release | Record the current visible repository listing, featured skill pages, and any available install counts | Timestamped links or screenshots; mark unavailable counts as unknown |
| Release | Publish reviewed files, confirm the Pages deployment, and verify remote CLI discovery | Commit URL, deployment URL, discovery count |
| First announcement | Share one task-focused demonstration through an account and venue you control | The actual artifact, exact install command, and scope of testing |
| Follow-up | Answer questions and collect installation or workflow failures | Reproduction steps, agent and app versions, specific error messages |
| After feedback | Fix reproducible problems and clarify prerequisites or examples | A small reviewed patch and rerun evidence |
| Next day | Compare listing coverage and observable install changes | Counts from the same source and view, with observation times |

This is an execution schedule, not a promise of placement, traffic, installs, or a particular completion time for skills.sh processing. The material below is prepared copy; it has not been posted automatically.

## Ready-to-use release copy

### Release title

Major AI Skills: exact installs and reproducible workflow examples

### Release body

Major AI Skills now gives every catalog entry an exact `npx skills add` command. All 392 descriptions have been rewritten around tasks, and the website adds search, category filtering, and command copying.

Start with a focused example:

- Convert a local video to H.264 MP4 with FFmpeg and verify its stream properties.
- Query an orders CSV with DuckDB and check decimal revenue totals and missing values.
- Run a local Playwright checkout test at desktop and mobile sizes, with screenshots and traces.

These three portable reference implementations passed their recorded checks on Windows. Blender, Figma, and SOLIDWORKS also have detailed application walkthroughs with prerequisites and acceptance criteria; they are not reported as executed tests.

```bash
npx skills add alivirgo/Major-AI-Skills --skill ffmpeg
```

[Featured workflows](https://github.com/alivirgo/Major-AI-Skills/blob/master/docs/users/spotlight.md) | [Verification](https://github.com/alivirgo/Major-AI-Skills/blob/master/examples/spotlight/VERIFICATION.md) | [Full catalog](https://github.com/alivirgo/Major-AI-Skills/blob/master/CATALOG.md)

### Short announcement

Major AI Skills: 392 installable playbooks, now with exact install commands and focused workflow examples. Start with FFmpeg video conversion, DuckDB CSV analysis, or a local Playwright checkout test. Code and verification: https://github.com/alivirgo/Major-AI-Skills

### Longer community introduction

I maintain Major AI Skills, an independent collection of agent playbooks for professional apps and developer workflows. I have made the library easier to try one task at a time: each catalog entry has an install command, and six featured workflows include prerequisites, prompts, expected outputs, and acceptance checks.

The portable references cover FFmpeg conversion with and without audio, DuckDB decimal aggregation with invalid-data checks, and a Playwright checkout fixture at desktop and mobile sizes. Their verification record names the environment and limitations. The application walkthroughs for Blender, Figma, and SOLIDWORKS still require testing in those tools.

If you try a workflow, please report the skill ID, agent and application versions, expected result, actual result, and a minimal non-sensitive reproduction. That feedback will help improve the instructions and examples.

Repository: https://github.com/alivirgo/Major-AI-Skills

### Task-specific hooks

| Audience | Opening | Command |
| --- | --- | --- |
| Video developers | Verify a browser-ready MP4 by codec, pixel format, audio, and faststart metadata, not just file size. | `npx skills add alivirgo/Major-AI-Skills --skill ffmpeg` |
| Analysts | Aggregate a CSV with decimal money values while separating cancelled rows and missing amounts. | `npx skills add alivirgo/Major-AI-Skills --skill duckdb` |
| Web developers | Exercise a local checkout at desktop and mobile sizes and retain the browser trace. | `npx skills add alivirgo/Major-AI-Skills --skill playwright` |
| Technical artists | Try a repeatable Blender scene script and check the rendered frame and duplicate-object behavior. | `npx skills add alivirgo/Major-AI-Skills --skill blender` |
| Design systems | Try a Figma frame-export plugin with empty-selection and duplicate-filename checks. | `npx skills add alivirgo/Major-AI-Skills --skill figma` |
| Mechanical designers | Inspect rebuild status before exporting a test SOLIDWORKS part. | `npx skills add alivirgo/Major-AI-Skills --skill solidworks` |

Use the relevant hook for a relevant audience. Include the direct walkthrough link and its verification scope. Follow each venue's self-promotion rules before posting, and do not repeat the same announcement across unrelated discussions.

## Demonstration recording outline

1. Show the task and input, including the application or runtime version.
2. Show the exact one-skill install command and the canonical instructions.
3. Show the prompt and run the task in a disposable working directory.
4. Show the real output and acceptance checks, including any failures or edits needed.
5. Finish with the reproducible example and a specific request for useful feedback.

Use actual output images such as `assets/spotlight-checkout.png`. Do not label reference-code output as an autonomous agent result. Do not claim time savings without a measured comparison on the same task and environment.

## Measurement sheet

Keep discovery, adoption, and correctness separate:

| Metric | Baseline | Follow-up | Interpretation |
| --- | --- | --- | --- |
| Local CLI discovery | 392 skills in the recorded local check | Recheck after adding skills | Packaging/discovery coverage, not website indexing |
| Remote CLI discovery | Record after publication | Compare against local catalog | Published source availability |
| Visible featured pages | Record each page's state | Inspect after normal installs and processing | Listing coverage; unavailable is unknown until checked |
| skills.sh installs per featured skill | Record actual displayed count or unknown | Compare at a named time using the same source | Adoption signal; deduplication and processing apply |
| Reference checks | Three portable references passed in the recorded environment | Rerun after relevant changes | Narrow executable evidence |
| User-reported task completion | Not yet measured | Record input, environment, and outcome | Actual usability evidence |

GitHub stars, npm downloads, and skills.sh installs are different measurements. Do not substitute one for another or label unobserved counts as zero. No live ranking improvement is established by preparing this kit.
