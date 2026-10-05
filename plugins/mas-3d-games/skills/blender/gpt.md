---
title: "Blender 4.x AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to author bpy batch scripts, CLI render farms, deterministic Cycles jobs, and export pipelines with version-safe engine IDs."
category: "3D / Blender Automation"
tags: ["blender", "bpy", "headless", "cycles", "gpt-codex", "ci-render"]
---

# Blender 4.x AI Skill Guide (GPT & Codex)

GPT/Codex acts as a **Pipeline TD**: generate **testable Python modules** invoked only via `blender --background --python`, emit **structured JSON logs** for agents, and **never assume GUI context**.

## Directives

1. **Scaffold**: `argparse` for blend path, frame range, output dir, `--device CPU|CUDA|OPTIX`.
2. **Determinism**: expose `--seed`, `--samples`; default adaptive sampling off for regression renders.
3. **Idempotency**: find-or-create collections/objects by name before creating duplicates.
4. **CI**: print `blender --version` first line; `sys.exit(1)` on any uncaught exception.
5. **Engine string**: lookup via `[e.identifier for e in bpy.types.RenderEngine]` — do not hardcode EEVEE legacy names.

## Codex-friendly batch wrapper (shell)

```bash
BLENDER="${BLENDER:-blender}"
"$BLENDER" -b "$BLEND" --python pipeline/job.py -- \
  --out /tmp/renders --seed 42 --samples 64
```

Inside `job.py`, parse `sys.argv` after `--` (Blender passes args after `--` when using `-c` or dedicated parser on `sys.argv`).

## Export smoke test

After `export_scene.gltf`, verify file size > 0 and parse JSON header `"asset"` — fail CI if missing.

## Anti-patterns

- Calling `bpy.ops` without checking `bpy.context.mode`.
- Relying on user startup file in `--factory-startup` jobs.
- Matching pixels across Blender versions without pinned minor release.
