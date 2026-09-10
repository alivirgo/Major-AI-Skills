# skills.sh discovery and maintenance

Major AI Skills stores canonical instructions in `skills/<id>/SKILL.md`, with optional `gpt.md` and `gemini.md` variants beside them. `tools/scripts/generate_index.js` builds the JSON registries, Markdown catalog, and root `skills.sh.json` from canonical frontmatter. `tools/bin/install.js` is this project's independent npm installer. These are separate distribution paths: skills.sh's documented listing mechanism is installation telemetry from Vercel's `skills` CLI. [1]

## How discovery works

The CLI accepts GitHub `owner/repo` sources and explicit skill paths. Its discovery implementation searches `skills/` among its priority locations and parses each `SKILL.md`. Both `name` and `description` must parse as strings. Invalid YAML is skipped, internal skills are hidden by default, and duplicate names are deduplicated. A root `SKILL.md` can cause early return unless full-depth discovery is requested. This repository's flat canonical layout avoids needing that option. Model variants are supporting files, not separate discoverable skills. [2][3]

Installing a selected skill produces an install event containing the source, skill identifiers, agents, and optionally skill-file paths. `DISABLE_TELEMETRY` or `DO_NOT_TRACK` disables telemetry when set. Network failures are silently tolerated, so installation success alone cannot prove the directory received an event. CI events are marked as CI. [4]

The official FAQ says skills appear automatically through installs. It does not document a separate submission file or guaranteed indexing deadline. A local-path discovery check, a GitHub push, npm downloads, README visits, and the project's own installer should not be treated as proof of a skills.sh listing. Each skill needs to be observed through the supported installation flow; installing one selected skill does not prove the whole catalog is listed. [1][3]

## Repository page configuration

`npm run index` generates `skills.sh.json`, placing each canonical ID in its category. The file belongs at the root of the public repository's default branch. It controls display for skills the service has already seen. Unknown entries are ignored. The documented limits are 50 groups and 500 skills per group, with ungrouped entries shown separately. [5]

A telemetry-enabled install triggers a background check of this configuration on the default branch. Merely visiting the page does not refresh it. Processing and page caches can delay visible changes; the documentation provides no fixed refresh interval. [5]

## Maintainer workflow

For tested examples, announcement drafts, and a measurement schedule, see the [launch kit](skills-sh-launch.md) and [featured workflows](spotlight.md).

1. Add or update `skills/<id>/SKILL.md`, keeping the folder and frontmatter name identical. Use a useful product-specific description.
2. Run `npm run validate` and `npm run index`. Commit the generated files with the skill changes.
3. Check parsing and discovery without installing into watched agent folders:

   ```bash
   npx skills add . --list
   ```

4. Publish the reviewed changes to the GitHub default branch. Check remote discovery:

   ```bash
   npx skills add alivirgo/Major-AI-Skills --list
   ```

5. Users install the exact skills they need through the supported CLI:

   ```bash
   npx skills add alivirgo/Major-AI-Skills --skill blender --agent codex -y
   ```

   Respect existing telemetry preferences. This command installs into the current project; add `-g` only for an intended global install. Repeat with other exact IDs as they are needed. Do not run scheduled reinstall loops to manufacture counts.

6. After processing, inspect the [repository page](https://skills.sh/alivirgo/Major-AI-Skills) and individual pages such as [blender](https://skills.sh/alivirgo/Major-AI-Skills/blender). Compare visible IDs against `skills_index.json`; configuration coverage and live listing coverage are different checks.

The CLI supports `--skill '*'` for an intentional full-library install to a specified agent, but exact sets remain this repository's recommended workflow. `--all` also targets all agents, so it is unsuitable as a routine indexing check. [3]

## Troubleshooting missing entries

| Symptom | Check |
| --- | --- |
| Missing from local CLI list | YAML parse warnings, string name/description, unique ID, internal metadata, canonical file location |
| Local list works, remote list differs | Confirm the canonical files are on GitHub's default branch |
| Remote list works, website entry missing | Confirm an actual telemetry-enabled install of that ID; allow for processing and network failures |
| Listing exists, groups are stale | Publish the config on the default branch, then a normal CLI install triggers its refresh |
| Variants absent as individual listings | Expected: only canonical SKILL.md files define skills |

The public CLI exposes discovery and event delivery, while the cited website documentation describes listing behavior. Backend ingestion, deduplication, ranking filters, and processing guarantees cannot be fully established from these sources. No local configuration can guarantee inclusion or ranking.

## Sources

Official sources reviewed September 11, 2026. Source links on `main` can change.

1. Vercel, [Skills FAQ: getting listed](https://skills.sh/docs/faq).
2. Vercel Labs, [CLI discovery implementation](https://github.com/vercel-labs/skills/blob/main/src/skills.ts).
3. Vercel Labs, [CLI README and options](https://github.com/vercel-labs/skills).
4. Vercel Labs, [Telemetry implementation](https://github.com/vercel-labs/skills/blob/main/src/telemetry.ts).
5. Vercel, [Customize repository pages](https://skills.sh/docs/customize).
