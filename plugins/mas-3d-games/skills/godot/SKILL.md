---
name: godot
description: "Build Godot 4 scenes and GDScript workflows, inspect physics behavior, and configure headless project exports."
category: game-engines
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["godot", "godot4", "gdscript", "headless", "export", "deterministic"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Godot Engine 4.x Game Development AI Skill Guide (Claude)

## Overview & Engine Architecture

Godot **4.3+ / 4.4** (pin in `project.godot` `config/features`) uses **SceneTree**, **GDScript 2.0**, optional **C# .NET**, renderers **Forward+**, **Mobile**, **Compatibility (GL)**. Claude acts as Principal Game Developer: **headless export CI**, **GUT tests**, **deterministic simulation**, **Dedicated server** builds.

```
┌─────────────────────────────────────────────────────────────┐
│  godot --headless --export-release "Preset" out.exe         │
│  godot --headless -s addons/gut/gut_cmdln.gd -gexit           │
│  Physics: _physics_process; ProjectSettings physics FPS       │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when:** 2D/3D indie pipelines, tool-first games, lightweight server builds, scripted batch export.

**Do not use when:** AAA Nanite-scale content; console cert without export platform docs.

---

## Operational Capabilities & Agent Directives

1. **Static typing:** GDScript `@export`, typed arrays, `class_name` — avoid cyclic `class_name` deps.
2. **Determinism:** Fixed `Engine.time_scale` in tests; seed `RandomNumberGenerator` with `seed=hash`; disable physics jitter tests unless **Physics Interpolation** configured consistently.
3. **Headless CI:** `--headless --display-driver headless` (platform-dependent); export requires **export templates** installed matching editor version.
4. **Export presets:** `export_presets.cfg` names are case-sensitive in CLI; run `godot --headless --export-release "Windows Desktop" path.exe`.
5. **Web:** COOP/COEP for threads; or single-threaded export preset — blank page otherwise.
6. **Color/render:** Forward+ vs Compatibility changes lighting; golden screenshots only on pinned renderer + same GPU driver class.

---

## Headless export + test

```bash
godot --headless --path . --export-release "Windows Desktop" "build/game.exe"
godot --headless --path . -s addons/gut/gut_cmdln.gd -gdir=res://test -gexit
```

Dedicated server example: project main scene server-only; `-- --port=7777` after `--` passes user args to `OS.get_cmdline_args()`.

---

## Failure taxonomy

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| Export failed: templates | Missing export templates | Install via Editor |
| Blank WebGL | Missing COOP/COEP | Headers or single-thread |
| Camera stutter | `_process` vs `_physics_process` | Move camera to physics tick |
| class_name cycle | Circular typing | Decouple interfaces |
| Vulkan crash | Old GPU | Compatibility renderer |

---

## Agent Operational Directive

> **MANDATORY**: Pin Godot version + export templates. Use `--headless` in CI. Seed RNG for reproducible tests. Match renderer preset across dev and CI golden captures.
