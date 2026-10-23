---
name: houdini
description: "Automate Houdini with VEX and hou/hython, cook PDG/TOPs graphs, tune Vellum/FLIP/Pyro solvers, and debug Solaris/Karma XPU renders agents routinely miss."
category: 3d
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["houdini", "vex", "hou-python", "hython", "solaris-karma", "pdg-tops", "vellum", "flip", "materialx"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# SideFX Houdini AI Skill Guide (Claude)

## Overview & Engine Architecture

SideFX Houdini is a procedural VFX / USD pipeline DCC. Agents should treat `.hip` files as **graphs of cooks**, caches as **versioned artifacts** (`$HIP/cache/...`), PDG/TOPs as **dependency contracts** (not “hope files appear”), and Karma as a **Hydra delegate** with MaterialX GPU constraints. Automation runs through **`hython` / `hbatch`**, **VEX** in wranglers, and **Solaris LOPs** for USD lighting/render.

```
┌─────────────────────────────────────────────────────────────┐
│                 Houdini cook → cache → render               │
│                                                             │
│  Contexts                                                   │
│  ├── SOPs geometry / modeling                               │
│  ├── DOPs: FLIP, Pyro, Vellum, RBD                          │
│  ├── LOPs / Solaris USD stage                               │
│  └── TOPs / PDG wedges & farm distribute                    │
│                                                             │
│  Code                                                       │
│  ├── VEX (SIMD attrs: @P @v @orient @pscale)                │
│  ├── hou Python 3.x via hython                              │
│  └── hbatch HScript for legacy ROPs                         │
│                                                             │
│  Render                                                     │
│  └── Karma CPU / XPU + MaterialX + AOVs / Cryptomatte       │
└─────────────────────────────────────────────────────────────┘
```

**Version pins:** document Houdini **major.minor.build** (e.g. 20.5.x) and packages JSON in every pipeline README. `$HOUDINI_PATH` / package order breaks farms silently.

---

## When to use / when not to

**Use when**

- Procedural modeling, destruction, fluids, cloth, pyro, or USD lighting in Solaris.
- Headless cache/render via hython, hbatch, or PDG schedulers.
- Wedging parameters and distributing work items with TOPs.

**Do not use when**

- Motion-graphics MoGraph / Redshift hero look is C4D-native → `@cinema-4d`.
- Primary task is game-runtime packaging → Unreal/Unity after export.
- Pure 2D pixel compositing → Nuke/After Effects skills (not this repo’s focus).

---

## Operational Capabilities & Agent Directives

1. **VEX for heavy per-point/prim work**; Python SOPs only for orchestration / I/O.
2. **hython jobs**: `hou.hipFile.load(..., suppress_save_prompt=True)`; catch `hou.Error`; `sys.exit(1)` on failure.
3. **Pin `$HIP`-relative cache paths**; avoid absolute artist home dirs on the farm.
4. **Solver first aid**: substeps, collision thickness/separation, particle separation—before “add more resolution.”
5. **Karma XPU**: MaterialX-only networks; classic VEX VOPs force CPU fallback.
6. **PDG**: verify output file tokens (`$PDG_DIR`, `$HIP`) match downstream expected paths; Dirty & Cook after path fixes.
7. **Log `hou.applicationVersionString()`** at job start for reproducibility.
8. **Never invent license server strings or farm credentials**—use existing `hserver` / scheduler docs from the user.

---

## Production Example: hython ROP baker + VEX orient

`bake_rop.py`:

```python
"""Headless ROP cook.
Usage: hython bake_rop.py <scene.hip> <rop_path> [start] [end]
"""
from __future__ import annotations

import os
import sys

import hou


def bake(hip_path: str, rop_path: str, start: int | None, end: int | None) -> None:
    if not os.path.isfile(hip_path):
        print(f"HOU_PIPELINE_FAIL missing hip: {hip_path}", file=sys.stderr)
        sys.exit(1)

    print("houdini", hou.applicationVersionString())
    hou.hipFile.load(hip_path, suppress_save_prompt=True, ignore_load_warnings=True)
    node = hou.node(rop_path)
    if node is None:
        print(f"HOU_PIPELINE_FAIL missing node: {rop_path}", file=sys.stderr)
        sys.exit(1)

    if start is not None and end is not None:
        node.parm("trange").set(1)
        node.parm("f1").set(start)
        node.parm("f2").set(end)
        node.parm("f3").set(1)

    try:
        node.render(verbose=True, output_progress=True)
    except hou.Error as exc:
        print(f"HOU_PIPELINE_FAIL cook: {exc}", file=sys.stderr)
        sys.exit(1)
    print("bake OK", node.path())


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: hython bake_rop.py <hip> <rop> [start] [end]", file=sys.stderr)
        sys.exit(2)
    s = int(sys.argv[3]) if len(sys.argv) > 3 else None
    e = int(sys.argv[4]) if len(sys.argv) > 4 else None
    bake(sys.argv[1], sys.argv[2], s, e)
```

Point Wrangle (orient instances along curl noise):

```c
vector freq = chv("frequency");
vector offset = chv("offset") + @P * freq;
vector noise_v = curlnoise(offset);
@v = lerp(@v, noise_v * chf("speed"), chf("noise_blend"));

vector up = {0, 1, 0};
if (length(@v) > 1e-3) {
    matrix3 m = maketransform(normalize(@v), up);
    @orient = quaternion(m);
}
float life_ratio = @age / max(@life, 1e-6);
@pscale = chf("base_scale") * (1.0 - smooth(0.7, 1.0, life_ratio));
```

Validation loop:

```bash
hython -c "import hou; print(hou.applicationVersionString())"
hython bake_rop.py shot.hip /out/geometry_cache 1001 1100
hbatch -c "render -Va /out/geometry_cache" shot.hip
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| FLIP explodes F1 | Separation too coarse / divergence | Lower particle separation; Min Substeps 2–4; collision separation |
| Vellum penetrate / stick | Substeps or thickness | Solver substeps 25–40; reduce thickness; Layer Shock Absorber |
| Karma XPU → CPU | Non-MaterialX VOPs | Replace with `mtlxstandard_surface`; check console `XPU_WARNING_*` |
| PDG items hang | Output path tokens wrong | Service Monitor logs; fix `$HIP`/`$PDG_DIR`; Dirty & Cook |
| Missing HDA on farm | `$HOUDINI_PATH` / packages | Sync `packages/*.json`; set `HOUDINI_DSO_ERROR=1` |
| Non-deterministic wedge | Unseeded noise / wall-clock | Seed noise; pin frame; avoid time-based random |

---

## Best Practices

1. Cache sims to bgeo.sc / VDB with explicit frame ranges; never rely on in-RAM DOP history on the farm.
2. Keep TOPs graph readable: one wedge dimension per node where possible.
3. Prefer MaterialX in Solaris for XPU; document CPU-only looks separately.
4. Ship `packages/*.json` with tools—not hand-edited monolithic `houdini.env` when avoidable.
5. Use `@name` / path conventions for USDs so LOP composition stays stable.

---

## Limitations

- Hython still needs valid SideFX licensing on workers.
- Dopnet/solver behavior changes across major versions—pin builds for golden caches.
- XPU hardware/driver constraints are environment-specific; always allow CPU Karma fallback for CI smoke.
- Stop and ask if scheduler credentials, license server hostnames, or proprietary HDAs are missing.

---

## Related Skills

- `@cinema-4d` — MoGraph / Redshift motion design
- `@blender` — bpy / Cycles open pipeline
- `@substance-painter` — texture authoring for exported meshes
- `@unreal-engine` — real-time destination for USD/FBX

---

## Agent Operational Directive

> **MANDATORY**: Prefer vectorized VEX for geometry; use hython with non-zero exits for batch. Pin Houdini build + packages. Fix solver substeps/collisions before resolution blow-ups. Keep Karma XPU on MaterialX. Never invent license or farm credentials.

---

## Source anchors (research)

- [Houdini Python hou module](https://www.sidefx.com/docs/houdini/hom/hou/)
- [VEX language reference](https://www.sidefx.com/docs/houdini/vex/)
- [PDG / TOPs](https://www.sidefx.com/docs/houdini/tops/)
- [Solaris and Karma](https://www.sidefx.com/docs/houdini/solaris/)
- [MaterialX in Houdini](https://www.sidefx.com/docs/houdini/solaris/materialx.html)
