---
name: remotion
description: "Create React video compositions with Remotion, parameterize timelines with props, and configure CLI or server-side rendering."
category: video-editing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["remotion", "react-video", "render-cli", "deterministic", "lambda", "color"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Remotion React Video Framework AI Skill Guide (Claude)

## Overview & Engine Architecture

Remotion (pin **`@remotion/*` version** in `package.json`, e.g. **4.x**) renders **React components per frame** via headless Chromium (`@remotion/renderer`), stitched to MP4/WebM. Claude acts as Programmatic Video Engineer: **frame-based animation**, **deterministic renders**, **CLI/Lambda**, **props schema**.

**Determinism rule:** Output = f(`useCurrentFrame()`, props, `useVideoConfig()`) — no `Math.random()`, `Date.now()`, or unawaited async without `delayRender` / `calculateMetadata`.

```
┌─────────────────────────────────────────────────────────────┐
│  <Composition> registry → bundle → npx remotion render        │
│  random('seed') not Math.random(); loadFont + delayRender     │
│  --props JSON; --concurrency; --timeout for delayRender       │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when:** templated promos, data-driven video, batch MP4 from JSON/CSV props, Lambda scale-out.

**Do not use when:** Long-form NLE editorial; GPU 3D scenes (use Blender/Unreal); non-deterministic live capture.

---

## Operational Capabilities & Agent Directives

1. **Time:** `useCurrentFrame()` + `interpolate()` / `spring()`; structure with `<Sequence>` / `<Series>` (child frames relative to sequence start).
2. **Randomness:** `import { random } from 'remotion'` with string seeds; include `frame` in seed when values must animate.
3. **Async:** Prefer `calculateMetadata` for fetch-before-render; in-component use `useDelayRender()` + `continueRender(handle)`; CLI `--timeout=120000` for slow fonts.
4. **Fonts/media:** `loadFont()` / `@remotion/fonts`; wait `document.fonts.ready` before first paint; assets via `staticFile()`.
5. **Color:** sRGB canvas; embed images in same color profile; for CSS filters document gamma assumptions — compare golden stills at `--scale=0.25` for CI cost.
6. **Export:** H.264 `-c:v libx264 -pix_fmt yuv420p` in `remotion.config.ts` or codec override; match fps/durationInFrames in Composition registration.
7. **Lambda limits:** AWS concurrency, memory, timeout — separate from per-frame `--timeout`; pin Chromium version via Remotion lockfile.

---

## Composition + render

```tsx
import { Composition } from "remotion";
import { Promo, PromoProps } from "./Promo";

export const RemotionRoot = () => (
  <Composition
    id="Promo"
    component={Promo}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{ title: "Hello", subtitle: "World" } satisfies PromoProps}
  />
);
```

```bash
npx remotion compositions src/index.ts
npx remotion still src/index.ts Promo out/golden.png --frame=75 --scale=0.5
npx remotion render src/index.ts Promo out/promo.mp4 --props='{"title":"A","subtitle":"B"}' --timeout=120000
```

---

## Failure taxonomy

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| Flicker between workers | Nondeterministic code | Seed random; no Date |
| Timeout error | Font/network | delayRender + --timeout |
| Missing composition | Root not registered | Export RemotionRoot |
| Text blank frame 0 | Font late | fonts.ready gate |
| Slow render | Concurrency too high/low | Tune `--concurrency` |

---

## Agent Operational Directive

> **MANDATORY**: Frame-driven animation only. `random('seed')` never `Math.random()`. Golden still in CI. Pin Remotion package versions across render farm and Lambda.
