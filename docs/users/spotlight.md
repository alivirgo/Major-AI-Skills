# Featured Workflows

Six focused ways to try Major AI Skills. Choose one that matches your work; each includes an exact install command, prerequisites, a prompt, and acceptance criteria.

The portable FFmpeg, DuckDB, and Playwright examples are reference implementations with assertions. They test the demonstrated operations, not whether an AI model follows every skill instruction. Blender, Figma, and SOLIDWORKS are guided workflows requiring their respective applications. A passing reference is not a quality certification for the complete skill.

## Run the portable references

From a clone of this repository, with Node.js 22 or newer:

```bash
cd examples/spotlight
npm ci
npm run browser:install
npm test
```

The runner creates a fresh directory under `examples/spotlight/output/` containing a JSON report, video files, a revenue CSV, browser screenshots, and traces. A failed check returns a nonzero exit code. Dependencies and browser binaries require network access during setup; reference workloads use local fixtures. See the [reference README](../../examples/spotlight/README.md) and [recorded verification](../../examples/spotlight/VERIFICATION.md).

CLI installs below default to the current project and prompt for agent selection. Append `--agent codex` or `--agent claude-code` for an explicit target; use `-g` only for an intended global install. Installing a skill does not install its target application.

## ffmpeg

**Make a browser-ready video**

Transcode and compress video with FFmpeg, inspect streams with ffprobe, build filtergraphs and HLS outputs, and diagnose codec or hardware-encoder failures.

Video editors and developers preparing clips for web delivery.

[Read the skill](../../skills/ffmpeg/SKILL.md) | [skills.sh page](https://skills.sh/alivirgo/Major-AI-Skills/ffmpeg)

```bash
npx skills add alivirgo/Major-AI-Skills --skill ffmpeg
```

### Prerequisites

- FFmpeg and ffprobe, or the bundled binaries in the reference example.
- A local input clip you have permission to process; the reference generates a synthetic clip.

### Try This Prompt

```text
Use the ffmpeg skill to inspect my input video and create a browser-ready MP4 in a new output directory. Use H.264 video, yuv420p, AAC audio when audio exists, and faststart. Preserve the input file. Report the original and output stream properties, the exact command, and any unsupported encoder. Verify the output with ffprobe; do not assume a smaller file means success.
```

### Expected Outputs

- An MP4 with H.264 video and broadly supported pixel format.
- A stream report covering dimensions, duration, video codec, and audio presence.
- The exact conversion command and a clear failure if encoding or probing fails.

### Acceptance Checks

- [ ] Input hash is unchanged.
- [ ] Output codec is H.264, pixel format is yuv420p, and duration is within tolerance.
- [ ] The moov atom precedes mdat for progressive playback.
- [ ] Audio is retained when present; a video-only input remains supported.

### Verification Scope

The reference tests small synthetic inputs with software encoding. It does not validate HDR color transforms, GPU encoders, every source codec, or the skill's HLS recipe.

## duckdb

**Turn CSV orders into a revenue report**

Query local CSV and Parquet files with DuckDB SQL, aggregate and join datasets, export analytical results, and troubleshoot schema drift or memory limits.

Analysts and engineers investigating local tabular data without a database server.

[Read the skill](../../skills/duckdb/SKILL.md) | [skills.sh page](https://skills.sh/alivirgo/Major-AI-Skills/duckdb)

```bash
npx skills add alivirgo/Major-AI-Skills --skill duckdb
```

### Prerequisites

- DuckDB or the Node API included in the reference example.
- A CSV with order_id, customer_id, amount, and status fields; synthetic data is included.

### Try This Prompt

```text
Use the duckdb skill to inspect orders.csv and calculate paid revenue by customer. Treat amount as a decimal, exclude cancelled orders, report null amounts separately, and reject invalid numeric values instead of silently dropping them. Write the query and a result CSV into a new output directory. Verify the totals against the input rows and leave the source unchanged.
```

### Expected Outputs

- A reproducible SQL aggregation with explicit decimal handling and status filtering.
- A revenue CSV ordered by customer plus a null-amount quality count.
- A verification result based on the supplied fixture.

### Acceptance Checks

- [ ] The supplied fixture produces customer A = 30.00 and customer B = 12.50.
- [ ] Cancelled revenue is excluded and a null paid amount is counted separately.
- [ ] An invalid numeric amount causes an explicit conversion failure.
- [ ] The source fixture remains unchanged.

### Verification Scope

The fixture validates a local aggregation, not warehouse-scale performance, production accounting accuracy, or all DuckDB integrations.

## playwright

**Test a checkout journey without a live payment**

Write and debug Playwright end-to-end tests using role and label locators, isolated fixtures, authentication state, and traces for failed browser workflows.

Developers adding repeatable browser checks to a web application.

[Read the skill](../../skills/playwright/SKILL.md) | [skills.sh page](https://skills.sh/alivirgo/Major-AI-Skills/playwright)

```bash
npx skills add alivirgo/Major-AI-Skills --skill playwright
```

### Prerequisites

- Node.js and a Playwright Chromium browser installed through the reference setup.
- The local checkout fixture included with the example; no payment account is needed.

### Try This Prompt

```text
Use the playwright skill to test this local checkout fixture on desktop and mobile. Add an item, open the cart, fill the email field, and confirm the demo order with role and label locators. Verify the confirmation and email, capture a screenshot and trace, and fail clearly if the expected state is absent. Do not call a real payment service or use fixed sleeps.
```

### Expected Outputs

- A browser check that exercises the complete local journey.
- Desktop and mobile screenshots showing the confirmation state.
- A trace archive for inspection.

### Acceptance Checks

- [ ] Cart state changes only after adding an item.
- [ ] The form displays the entered email in the confirmation.
- [ ] Desktop and mobile complete the same journey without JavaScript errors.
- [ ] The reference test makes no external network request.

### Verification Scope

This checks a deterministic local fixture in Chromium. It is not a payment integration test or evidence of Firefox/WebKit coverage.

## blender

**Render a repeatable product scene**

Automate Blender scenes with the bpy Python API, build Geometry Nodes workflows, configure Cycles or EEVEE renders, and troubleshoot headless batch jobs.

Technical artists building repeatable Blender scene and rendering workflows.

[Read the skill](../../skills/blender/SKILL.md) | [skills.sh page](https://skills.sh/alivirgo/Major-AI-Skills/blender)

```bash
npx skills add alivirgo/Major-AI-Skills --skill blender
```

### Prerequisites

- A compatible Blender installation with its bpy Python runtime.
- A new project or a disposable copy of a scene, plus an empty output directory.

### Try This Prompt

```text
Use the blender skill to create a small product scene in a new project: a beveled object, ground plane, two area lights, and a camera aimed at the object. Use bpy data APIs where practical. Render a 640 by 360 PNG with a low-sample Cycles configuration, save the blend file, and make the script repeatable without duplicate objects. Run it headlessly if Blender is available. Report the Blender version, command, outputs, and any failures.
```

### Expected Outputs

- A scene-generation Python script, saved .blend project, and rendered PNG.
- A short environment and render report including engine, dimensions, and samples.

### Acceptance Checks

- [ ] The render contains a visible, correctly framed object rather than a blank image.
- [ ] Running the script twice does not duplicate named scene objects.
- [ ] The saved project reopens with the intended camera and materials.
- [ ] The original working scene is preserved.

### Verification Scope

Guided workflow only. Blender rendering has not been executed by the portable reference suite; verify on the intended Blender version before claiming a successful demonstration.

## figma

**Export selected frames with a small plugin**

Build Figma plugins, export selected frames, audit components, and map variables to design tokens using the Plugin and REST APIs.

Designers and design-system engineers preparing predictable image exports.

[Read the skill](../../skills/figma/SKILL.md) | [skills.sh page](https://skills.sh/alivirgo/Major-AI-Skills/figma)

```bash
npx skills add alivirgo/Major-AI-Skills --skill figma
```

### Prerequisites

- A Figma file with test frames and access to development plugins.
- A plugin manifest, main script, and UI that handles the exported byte payload.

### Try This Prompt

```text
Use the figma skill to build a development plugin that exports only selected FRAME nodes as 2x PNGs. Handle an empty selection, ignore other node types with a clear count, and sanitize output filenames while avoiding duplicate-name collisions. Provide the manifest, main code, and UI download handler. Keep the canvas unchanged and report which frames were exported.
```

### Expected Outputs

- A complete development plugin with a UI download handler.
- PNG exports of the selected frames and a concise export summary.

### Acceptance Checks

- [ ] An empty selection produces a useful message without an exception.
- [ ] Mixed selections export only frames.
- [ ] Two identically named frames produce distinct download filenames.
- [ ] The design remains unchanged and images use the requested scale.

### Verification Scope

Guided workflow only. Requires execution in Figma; the portable suite does not establish plugin compatibility, REST access, or successful exports.

## solidworks

**Audit a part before batch export**

Automate SOLIDWORKS parts and assemblies with COM, Python, and VBA; inspect FeatureManager rebuild errors, configure mates, and batch-export CAD files.

Mechanical designers preparing a repeatable CAD export with rebuild checks.

[Read the skill](../../skills/solidworks/SKILL.md) | [skills.sh page](https://skills.sh/alivirgo/Major-AI-Skills/solidworks)

```bash
npx skills add alivirgo/Major-AI-Skills --skill solidworks
```

### Prerequisites

- A licensed SOLIDWORKS installation on Windows and a compatible COM automation environment.
- A disposable copy of a small test part and a new output directory.

### Try This Prompt

```text
Use the solidworks skill to inspect this test part through the SOLIDWORKS COM API. Confirm the document type, report feature rebuild errors, rebuild the model, and export a STEP copy only when the checks pass. Preserve the original file. Capture API error and warning codes, output paths, and units. Validate the exported copy by reopening it if the installed application supports the operation.
```

### Expected Outputs

- A scoped automation script and report of document type, units, and rebuild status.
- A STEP export or an explicit explanation of why export was stopped.

### Acceptance Checks

- [ ] A wrong document type fails before export.
- [ ] Rebuild and export return codes are checked and reported.
- [ ] The source file remains unchanged.
- [ ] The exported geometry opens and matches the intended model and units.

### Verification Scope

Guided workflow only. Requires licensed application testing; no successful CAD export or engineering suitability is claimed by the portable suite.
