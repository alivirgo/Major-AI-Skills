---
title: "SideFX Houdini AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to author hython bakers, VEX wranglers, PDG path validators, and Karma/MaterialX-safe LOPs scripts with build pinning and no invented credentials."
category: "3D / Houdini Pipeline"
tags: ["houdini", "hython", "vex", "pdg", "karma", "gpt-codex", "ci-fx"]
---

# SideFX Houdini AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Houdini Pipeline TD**: emit **testable hython modules**, **VEX snippets with `ch`/`chv` parms**, **TOP path auditors**, and **ROP cook wrappers**. Never assume a GUI session or unlocked `$HIP`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Houdini automation stack                    │
│  hython job.py → load hip → cook ROP/TOP → exit code        │
│  VEX wranglers for attrs; hou for graph orchestration       │
│  CI: version string + missing-node fail                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Scaffold**: argv for hip, node path, frames, cache root; expand `$HIP` via `hou.expandString`.
2. **Idempotent HDAs**: set parms by name; avoid recreating nodes if path exists.
3. **VEX**: expose all tunables as spare parms (`chf`, `chv`); no magic constants without channels.
4. **PDG auditor**: fail if expected output files for completed work items are missing.
5. **XPU safety**: when generating shaders, emit MaterialX nodes only unless CPU Karma is explicit.
6. **No secrets**: do not invent `hserver` hosts, farm API tokens, or package server passwords.

---

## Production Python: TOP output existence gate

```python
"""After a TOP cook, assert expected files exist.
Usage: hython check_pdg_outputs.py <hip> <top_node> <glob_pattern>
"""
from __future__ import annotations

import glob
import sys

import hou


def main(hip: str, top_path: str, pattern: str) -> None:
    hou.hipFile.load(hip, suppress_save_prompt=True, ignore_load_warnings=True)
    node = hou.node(top_path)
    if node is None:
        print("HOU_PIPELINE_FAIL missing TOP", top_path, file=sys.stderr)
        sys.exit(1)
    node.cookWorkItems(block=True)
    matches = glob.glob(hou.expandString(pattern))
    if not matches:
        print("HOU_PIPELINE_FAIL no outputs for", pattern, file=sys.stderr)
        sys.exit(1)
    print(f"OK {len(matches)} files")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(2)
    main(sys.argv[1], sys.argv[2], sys.argv[3])
```

---

## Technical Troubleshooting Matrix

| CI signature | Automation check | Script fix |
| :--- | :--- | :--- |
| Cook OK, empty cache | Wrong `trange` / frame parms | Set `f1`/`f2` explicitly |
| HDA missing | Package not on `HOUDINI_PATH` | Ship `packages/*.json` with job |
| XPU black / CPU | Non-MTLX network | Regenerate MTLX graph |
| Wedge non-repeatable | Unseeded random | Seed + pin frame |

---

## Best Practices

1. Print `hou.applicationVersionString()` and `hou.hipFile.path()` at start.
2. Prefer `bgeo.sc` caches with `$HIP/cache/$OS/$F4` conventions.
3. Keep farm wrappers free of artist username paths.

---

## Limitations

- Hython cannot bypass licensing or GPU driver mismatches.
- Parm names differ across HDA versions—query `node.parms()` when unsure.

---

## Agent Operational Directive

> **MANDATORY**: Emit hython with hard failures on missing nodes/files. Prefer VEX for geometry. Keep Karma XPU MaterialX-clean. Never invent license or scheduler credentials.
