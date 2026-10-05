---
title: "Remotion AI Skill Guide (GPT & Codex)"
description: "GPT/Codex skill for Remotion CLI pipelines, Zod props schemas, deterministic render tests, and Lambda deploy scripts."
category: "Video / Remotion"
tags: ["remotion", "react", "render-cli", "gpt-codex", "deterministic"]
---

# Remotion AI Skill Guide (GPT & Codex)

Scaffold **TypeScript** projects with strict props, **CI scripts** in `package.json`, and **golden still** regression.

## package.json scripts

```json
{
  "scripts": {
    "render:promo": "remotion render src/index.ts Promo out/promo.mp4",
    "still:golden": "remotion still src/index.ts Promo out/golden.png --frame=90",
    "compositions": "remotion compositions src/index.ts"
  }
}
```

## Zod props (pattern)

Validate `--props` JSON in `calculateMetadata` or composition `schema` prop when using `@remotion/zod-types`.

## Determinism lint

Flag any `Math.random`, `Date.now`, `performance.now` in `src/` — replace with `random(\`id-${frame}\`)`.

## Lambda

Use official `@remotion/lambda` deploy docs; pin region, memory, `framesPerLambda`; store site bundle hash in CI artifact.
