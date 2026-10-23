---
name: cinema-4d
description: "Script Cinema 4D scenes with c4dpy and the Maxon API, wire MoGraph/Fields systems, and debug Redshift GPU renders, AOVs, and headless Commandline farm jobs agents routinely miss."
category: 3d
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["cinema-4d", "mograph", "redshift", "c4dpy", "python-sdk", "commandline", "aces", "usd"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Maxon Cinema 4D AI Skill Guide (Claude)

## Overview & Engine Architecture

Maxon Cinema 4D (C4D 2024/2025+) is a motion-design and VFX DCC. Agents should treat scenes as **versioned project packages** (assets + caches + render settings), MoGraph as **procedural contracts** (cloners + effectors + fields), and Redshift as a **GPU memory budget** problem—not “turn samples up.” Automation runs through **`c4dpy`**, the classic **`c4d`** API, the **`maxon`** graph API (Scene Nodes / Neutron), and headless **`Commandline`** renders.

```
┌─────────────────────────────────────────────────────────────┐
│                 C4D build → cache → render loop               │
│                                                             │
│  Authoring                                                  │
│  ├── Classic OM + Scene Nodes / Neutron                     │
│  ├── MoGraph: Cloner → Effectors → Fields                   │
│  └── Unified Sim: Pyro / Cloth / Soft / Rigid               │
│                                                             │
│  Automation                                                 │
│  ├── c4dpy (headless Python 3)                              │
│  ├── c4d + maxon APIs                                       │
│  └── Commandline.exe farm flags (-render -frame -oimage)    │
│                                                             │
│  Redshift                                                   │
│  ├── GPU VRAM + Out-of-Core + texture streaming             │
│  └── ACEScg OCIO, AOVs / Cryptomatte, .rs proxies           │
└─────────────────────────────────────────────────────────────┘
```

**Version pins:** document Cinema 4D **year + build** and Redshift build in every pipeline README. Plugin IDs and Python APIs drift across major releases—never assume R20 snippets still compile.

---

## When to use / when not to

**Use when**

- Authoring or debugging MoGraph systems, Takes, and Redshift materials/AOVs.
- Headless batch export (USD/Alembic/FBX) or farm renders via Commandline / c4dpy.
- Packaging projects, fixing missing textures, or remapping asset paths for a render node.

**Do not use when**

- Heavy procedural FX / USD LOPs / Karma is the center of the pipeline → `@houdini`.
- Organic high-poly sculpt primary → `@zbrush` then bring mesh into C4D.
- Real-time game runtime packaging → Unreal/Unity skills after export.

---

## Operational Capabilities & Agent Directives

1. **Pin C4D + Redshift builds** in CI/farm docs; log `c4dpy` / Commandline version at job start.
2. **Prefer data API** (`documents`, `BaseObject`, tags) over GUI-only ops in headless scripts; call `c4d.EventAdd()` only when a GUI session needs refresh.
3. **Always `KillDocument(doc)`** after headless work to avoid batch memory leaks.
4. **Redshift VRAM first**: proxies (`.rs`), texture streaming / TX, Out-of-Core—before raising samples.
5. **Color**: ACEScg / OCIO must match farm workers; linear EXR for comp, display transforms only for preview.
6. **MoGraph dynamics**: fix collision shape + steps-per-frame before blaming effectors.
7. **Exit non-zero** on failed LoadDocument / SaveDocument / render so farm schedulers fail the task.
8. **Never invent license servers, registry keys, or credentials**—ask for authorized farm paths and existing env.

---

## Production Example: headless USD export + Redshift still gate

`batch_export_usd.py` — run via `c4dpy`:

```python
"""Cinema 4D headless USD export.
Usage: c4dpy batch_export_usd.py <scene.c4d> <output_dir>
"""
from __future__ import annotations

import os
import sys

import c4d
from c4d import documents

USD_EXPORT_ID = 1040540  # verify against installed C4D build


def export_usd(scene_path: str, output_dir: str) -> None:
    if not os.path.isfile(scene_path):
        print(f"C4D_PIPELINE_FAIL missing scene: {scene_path}", file=sys.stderr)
        sys.exit(1)

    doc = documents.LoadDocument(
        scene_path,
        c4d.SCENEFILTER_OBJECTS | c4d.SCENEFILTER_MATERIALS,
    )
    if doc is None:
        print(f"C4D_PIPELINE_FAIL LoadDocument: {scene_path}", file=sys.stderr)
        sys.exit(1)

    documents.SetActiveDocument(doc)
    os.makedirs(output_dir, exist_ok=True)
    stem = os.path.splitext(os.path.basename(scene_path))[0]
    usd_path = os.path.join(output_dir, f"{stem}.usd")

    ok = documents.SaveDocument(
        doc,
        usd_path,
        c4d.SAVEDOCUMENTFLAGS_DONTADDTORECENTLIST,
        USD_EXPORT_ID,
    )
    documents.KillDocument(doc)
    if not ok:
        print(f"C4D_PIPELINE_FAIL USD export: {usd_path}", file=sys.stderr)
        sys.exit(1)
    print(f"exported {usd_path}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: c4dpy batch_export_usd.py <scene.c4d> <output_dir>", file=sys.stderr)
        sys.exit(2)
    export_usd(sys.argv[1], sys.argv[2])
```

Validation / farm render loop:

```bash
# Version gate
"C:\Program Files\Maxon Cinema 4D 2025\c4dpy.exe" -c "import c4d; print(c4d.GetC4DVersion())"

# Asset export
"C:\Program Files\Maxon Cinema 4D 2025\c4dpy.exe" pipeline\batch_export_usd.py scene.c4d out\

# Headless Redshift stills (paths are install-local — do not invent farm credentials)
"C:\Program Files\Maxon Cinema 4D 2025\Commandline.exe" -render "D:\Jobs\scene.c4d" -frame 1 1 -oimage "D:\Renders\beauty_####"
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `CUDA_ERROR_OUT_OF_MEMORY` / Redshift abort | Textures + tessellation exceed VRAM | Out-of-Core + texture streaming; convert heavy meshes to `.rs` proxies; lower subdivision |
| Alembic/FBX materials missing | Face sets / selection names do not match | Match Polygon Selection Tags to Alembic part names; reassign RS materials to tags |
| MoGraph dynamics explode frame 0 | Overlapping cloners / bad collision shape | Multi-Box or Convex Hull; raise collision margin + Project Dynamics steps |
| `AttributeError` on `c4d.*` | Deprecated R20 API vs 2024/2025 | Prefer current docs; use `maxon` for graph/node work |
| Farm black frames | Missing camera, lights, or texture paths | Assert active camera; Project Asset Inspector; relative paths + collect assets |
| OCIO / ACES mismatch local vs farm | Different OCIO config | Pin OCIO path in env on all workers; compare EXR linear vs preview LUT |
| Commandline ignores frame/output | Wrong flag order / wrong binary | Use `Commandline.exe` (not GUI); verify `-render` `-frame` `-oimage` |

---

## Best Practices

1. Collect assets before farm submit; prefer relative project paths.
2. Cache MoGraph / sims to disk before long renders; do not recook on every frame if unchanged.
3. Name Takes and cameras explicitly; pass `-camera` / take flags on the farm.
4. Export multi-pass EXR AOVs + Cryptomatte for comp—not flattened preview PNG as hero deliverable.
5. Keep Python scripts idempotent: find objects by name before creating duplicates.
6. Document required env (Redshift cache dir, OCIO) in the shot README.

---

## Limitations

- Scene Nodes / Neutron Python surfaces differ from classic OM—verify against the installed build’s Maxon API.
- Redshift feature parity and VRAM behavior depend on GPU vendor/driver; CPU fallback is not a free farm substitute.
- Plugin IDs (USD export, etc.) can change—resolve via `plugins.FindPlugin` when uncertain.
- Stop and ask if license/farm credentials, proprietary plugin paths, or client color policies are missing.

---

## Related Skills

- `@houdini` — heavy FX, Solaris/Karma, PDG wedging
- `@blender` — open-source bpy / Cycles automation
- `@zbrush` — high-res organic sculpt → retopo into C4D
- `@substance-painter` — PBR texturing after mesh export
- `@unreal-engine` / `@unity` — real-time destinations after USD/FBX

---

## Agent Operational Directive

> **MANDATORY**: Pin C4D and Redshift builds. In headless scripts always `KillDocument` and exit non-zero on failure. Fix Redshift VRAM (proxies, streaming, Out-of-Core) before cranking samples. Match OCIO/ACES on every farm worker. Never invent licenses, registry secrets, or credentialed paths.

---

## Source anchors (research)

- [Cinema 4D Python documentation](https://developers.maxon.net/docs/py/2024_4_0/)
- [Maxon Command Line rendering](https://developers.maxon.net/docs/Manuals/CommandLine/)
- [Redshift documentation (memory, AOVs, color)](https://help.maxon.net/r3d/)
- [USD in Cinema 4D](https://developers.maxon.net/docs/Manuals/)
