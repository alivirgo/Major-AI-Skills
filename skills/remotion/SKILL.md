---
name: remotion
description: "Operational skill for Claude to automate Remotion React video compositions, render CLI, server-side renders, and programmatic timeline props."
category: video-editing
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["remotion", "react-video", "composition", "render-cli", "remotion-lambda", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Remotion React Video Framework AI Skill Guide (Claude)

## Overview & Engine Architecture
Remotion renders real MP4/WebM videos from **React compositions** using a frame-accurate runtime (`useCurrentFrame`, `useVideoConfig`), bundling via Webpack/ESBuild, and rendering through the **Remotion CLI** or cloud runners (e.g. **Lambda**). Claude operates as a Principal Programmatic Video Engineer, specializing in **composition props**, **sequence timelines**, **deterministic animations**, and **CLI/SSR render pipelines**.

### Remotion Render Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Remotion Architecture                       │
│                                                             │
│  Authoring (React)                                          │
│  ├── <Composition> registry in Root                         │
│  ├── useCurrentFrame / interpolate / Sequence / Series      │
│  └── Props schema (zod) for parameterized videos            │
│                                                             │
│  Bundle & Preview                                           │
│  ├── remotion studio / webpack bundle                       │
│  ├── Player for interactive previews                        │
│  └── calculateMetadata for dynamic length                   │
│                                                             │
│  Render                                                     │
│  ├── @remotion/renderer / `npx remotion render`             │
│  ├── Still frames / audio / codecs                          │
│  └── Remotion Lambda (scale-out)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Frame Math First**: Animate with `interpolate(frame, ...)` — never wall-clock timers.
2. **Determinism**: Avoid nondeterministic randomness unless seeded; renders must be reproducible.
3. **Props Contracts**: Type composition props; pass JSON via CLI `--props`.
4. **Sequence Composition**: Prefer `<Sequence>` / `<Series>` for timeline structure.
5. **Codec Choices**: Pick H.264/WebM intentionally; match fps/resolution to platform targets.

---

## Production React Composition + Render CLI

`src/Promo.tsx`:

```tsx
// ==============================================================================
// Remotion: parameterized promo title card composition
// ==============================================================================
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type PromoProps = {
  title: string;
  subtitle: string;
};

export const Promo: React.FC<PromoProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, fps * 0.5], [24, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B1220",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
        <h1 style={{ fontSize: 72, margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 32, opacity: 0.85 }}>{subtitle}</p>
      </div>
    </AbsoluteFill>
  );
};
```

Register in `src/Root.tsx` and render:

```bash
npx remotion compositions
npx remotion render Promo out/promo.mp4 --props='{"title":"Launch","subtitle":"Ship faster"}'
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Composition not listed** | Missing `<Composition>` registration. | Register id, component, durationInFrames, fps, size in Root. |
| **Flicker / non-deterministic** | `Math.random` / network fetch mid-render. | Seed randomness; prefetch via `delayRender`/`continueRender`. |
| **Fonts missing in render** | Font not loaded before paint. | `loadFont` / ensure `@font-face` ready with delayRender. |
| **Slow renders** | Oversized assets / no concurrency. | Optimize media; tune `--concurrency`; consider Lambda. |

---

## Best Practices

1. Keep side effects out of render path; use Remotion data-loading helpers.
2. Validate props with Zod + `schema` on `<Composition>`.
3. Commit a golden still (`remotion still`) for visual regression smoke checks.

### Essential Commands
- `npx remotion studio`
- `npx remotion render <id> <out>`
- `npx remotion still <id> <out.png>`

---

## Agent Operational Directive
> **MANDATORY**: Drive animation from `useCurrentFrame` only. Keep renders deterministic. Pass typed `--props` and register every composition explicitly in Root.
