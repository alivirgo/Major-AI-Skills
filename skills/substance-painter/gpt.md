---
title: "Substance 3D Painter AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to author Painter Python exporters, bake naming validators, and engine-specific PBR pack configs without inventing Adobe credentials."
category: "3D / PBR Texturing"
tags: ["substance-painter", "pbr", "python-api", "udim", "gpt-codex", "unreal", "unity"]
---

# Substance 3D Painter AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Technical Artist / Pipeline TD**: emit **Painter Python export modules**, **low/high naming checkers**, and **preset JSON** for Unreal/Unity packs. Prefer deterministic export parameters (resolution, padding, dithering).

```
┌─────────────────────────────────────────────────────────────┐
│                 Painter automation stack                    │
│  open project → validate sets → export preset → status      │
│  optional SAT: sbscooker → sbsrender for .sbsar             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Guard `project.is_open()`**; raise `PAINTER_PIPELINE_FAIL` on missing preset.
2. **Parameterize** engine (`unreal`|`unity`), resolution, output dir—no hardcoded client paths unless user-provided.
3. **Emit naming rules**: `asset_low` / `asset_high` validation scripts for DCC side.
4. **Document color roles** in export README (sRGB vs linear per channel).
5. **SAT ≠ Painter API**—do not mix `substance_painter` imports into `sbsrender` CLI jobs.
6. **No Adobe credentials** in scripts or sample env files.

---

## Production Python: texture-set inventory

```python
"""Print texture sets and resolutions; fail if any below min_res."""
import substance_painter.project
import substance_painter.textureset


def assert_min_resolution(min_res: int = 2048) -> None:
    if not substance_painter.project.is_open():
        raise RuntimeError("PAINTER_PIPELINE_FAIL: no project")
    for ts in substance_painter.textureset.all():
        res = ts.get_resolution()
        w, h = res.width, res.height
        print(ts.name(), w, h)
        if min(w, h) < min_res:
            raise RuntimeError(f"PAINTER_PIPELINE_FAIL: {ts.name()} {w}x{h} < {min_res}")


# assert_min_resolution(2048)
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Fix |
| :--- | :--- | :--- |
| Preset `None` | Name typo / locale | List resources; match exact preset title |
| Empty `exportList` | No texture sets | Mesh import / material slots |
| Engine look wrong | Pack swizzle | Ship preset JSON with ORM/MRA mapping |

---

## Best Practices

1. Version-control studio export presets beside the tool script.
2. Fail CI when normal format ≠ declared engine target.
3. Keep UDIM tile lists explicit in job manifests.

---

## Limitations

- Painter Python runs in-app; schedule GUI/automation workers accordingly.
- Cannot bypass Adobe licensing from code.

---

## Agent Operational Directive

> **MANDATORY**: Resolve presets by search, assert export status, document engine normal/color conventions. Never invent credentials or silent path defaults to privileged locations.
