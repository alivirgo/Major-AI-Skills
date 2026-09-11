# skills.sh visibility audit

Checked September 11, 2026. This is a dated observation, not a live counter.

- The [repository listing](https://skills.sh/alivirgo/major-ai-skills) showed 2 skills and 2 total installs: Blender and Houdini, one install each.
- The [FFmpeg URL](https://skills.sh/alivirgo/major-ai-skills/ffmpeg) returned HTTP 200 but rendered a 404 / unavailable message. HTTP status alone is not proof of indexing.
- The repository contains 392 canonical skills. The listing therefore did not show 390 of them at the time of inspection.
- CLI discovery and repository validation cover all 392 skills. The root skills.sh.json groups all 392 unique IDs within documented limits. These are readiness checks, not proof of platform ingestion or exhaustive skill-quality testing.

## Discovery versus ranking

The [official FAQ](https://skills.sh/docs/faq) says listings and ranking use anonymous installation telemetry from the skills CLI. Genuine users installing a specific skill are the relevant adoption signal. There is no documented overnight ranking guarantee.

The [customization documentation](https://skills.sh/docs/customize) says skills.sh.json only affects presentation. Telemetry-enabled installs trigger default-branch configuration checks, and caching can delay visible updates. Visiting a page is not a refresh trigger.

The generated [web catalog](https://alivirgo.github.io/Major-AI-Skills/catalog.html) exposes every skill description, source link, exact command, and stable anchor without JavaScript. It is linked from the website, README, llms.txt, and same-site sitemap. This supports ordinary web discovery; it does not register skills on skills.sh.

## Recheck

1. Run `npm run validate`, `npm run index:check`, and `npm test`.
2. Use `npx skills add alivirgo/Major-AI-Skills --list` to check remote CLI discovery. Listing is not installation telemetry.
3. Inspect the rendered repository listing and individual skill pages. Reject pages containing a 404 or unavailable message, even with HTTP 200.
4. Record the timestamp, visible skill IDs, and installation counts. Do not manufacture installs or claim unobserved indexing.
