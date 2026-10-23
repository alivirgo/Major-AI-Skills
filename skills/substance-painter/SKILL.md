---
name: substance-painter
description: "Automate Substance 3D Painter texturing with the Python API, bake mesh maps safely, pack PBR exports for Unreal/Unity, and debug UDIM, TDR, and color-space failures agents routinely miss."
category: 3d
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["substance-painter", "pbr", "mesh-baking", "udim", "substance-api", "sbsrender", "unreal", "unity"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Adobe Substance 3D Painter AI Skill Guide (Claude)

## Overview & Engine Architecture

Adobe Substance 3D Painter is a PBR texture-painting DCC. Agents should treat `.spp` projects as **layer stacks bound to texture sets / UDIMs**, bakes as **high→low ray contracts** (`_low`/`_high` or cages), and exports as **engine-specific channel packs** with explicit **color spaces** (sRGB vs linear). Automation runs through the in-app **`substance_painter` Python API** and, for Designer graphs, the **Substance Automation Toolkit** (`sbscooker` / `sbsrender`)—not the same binary.

```
┌─────────────────────────────────────────────────────────────┐
│                 Painter bake → paint → export               │
│                                                             │
│  Mesh I/O                                                   │
│  ├── Texture sets from materials / UDIMs                    │
│  └── Low / high / cage naming for baker                     │
│                                                             │
│  Authoring                                                  │
│  ├── Fill / Paint layers, masks, anchor points              │
│  └── Triplanar / UV / Projection                            │
│                                                             │
│  Pipeline                                                   │
│  ├── substance_painter Python (in-app)                      │
│  ├── Export presets (UE5 packed, Unity, Arnold, USD)        │
│  └── SAT: sbscooker / sbsrender (Designer .sbs/.sbsar)      │
└─────────────────────────────────────────────────────────────┘
```

**Version pins:** document Painter major version and export preset name in the asset README. Preset URLs and Python module shapes drift—resolve presets by search, do not hardcode fragile internal IDs when a name lookup exists.

---

## When to use / when not to

**Use when**

- Baking mesh maps, painting PBR stacks, packing ORM/MRA maps for Unreal/Unity.
- Scripting project open/export, resolution changes, or batch export of texture sets.
- Diagnosing normal Y-flip, UDIM gaps, or baker ray misses.

**Do not use when**

- Authoring procedural .sbs graphs end-to-end without Painter → Designer + SAT (`sbsrender`) is primary.
- High-res sculpt primary → `@zbrush` then retopo/UV before Painter.
- Full lookdev lighting in-engine → Unreal/Unity material skills after export.

---

## Operational Capabilities & Agent Directives

1. **Color roles**: BaseColor/Emissive → sRGB; Normal/Roughness/Metallic/Height/AO → linear/raw.
2. **Normal convention**: DirectX (Y−) for Unreal; OpenGL (Y+) for Unity/Blender—set project + preset together.
3. **Bake naming**: `*_low` / `*_high` + Match by Mesh Name; or supply an explicit cage.
4. **Export scripts**: require an open project; resolve presets via `ResourceSearch`; check `ExportStatus`.
5. **Padding**: infinite padding for mip-friendly game exports unless packing atlases deliberately.
6. **TDR on Windows**: long 4K/8K bakes can trip GPU TDR—bake maps individually or raise delay via **authorized IT policy** (do not invent registry credentials; document the DWORD only when the user asks for the known OS knob).
7. **Never invent Adobe IDs, license tokens, or cloud credentials.**

---

## Production Example: batch export via Python API

Run inside Painter’s Python environment (Plugins / Scripts):

```python
"""Export all texture sets with a named preset."""
from __future__ import annotations

import os

import substance_painter.export
import substance_painter.project
import substance_painter.resource
import substance_painter.textureset


def batch_export(
    output_dir: str,
    preset_name: str = "Unreal Engine 5 (Packed)",
    resolution: int = 2048,
) -> None:
    if not substance_painter.project.is_open():
        raise RuntimeError("PAINTER_PIPELINE_FAIL: no project open")

    os.makedirs(output_dir, exist_ok=True)
    search = substance_painter.resource.ResourceSearch(preset_name)
    preset = next(search, None)
    if preset is None:
        raise RuntimeError(f"PAINTER_PIPELINE_FAIL: preset not found: {preset_name}")

    preset_url = preset.as_url()
    export_list = []
    for texture_set in substance_painter.textureset.all():
        export_list.append(
            {
                "rootPath": texture_set.name(),
                "exportPreset": preset_url,
                "exportParameters": [
                    {
                        "parameters": {
                            "padding": "infinite",
                            "dithering": True,
                            "resolution": [resolution, resolution],
                        }
                    }
                ],
            }
        )

    config = {
        "exportShaderParams": False,
        "exportPath": output_dir,
        "defaultExportPreset": preset_url,
        "exportList": export_list,
    }
    result = substance_painter.export.export_project_textures(config)
    if result.status != substance_painter.export.ExportStatus.Success:
        raise RuntimeError(f"PAINTER_PIPELINE_FAIL: {result.message}")
    print(f"exported {len(result.textures)} maps → {output_dir}")


# Example call — paths supplied by artist/pipeline, not invented secrets
# batch_export(r"D:\Project\Exported_Textures", resolution=4096)
```

SAT (Designer assets, separate toolkit):

```bash
sbscooker --inputs "D:\Materials\metal_damaged.sbs" --output-path "D:\Materials\Compiled" --output-name "metal_damaged"
sbsrender render --input "D:\Materials\Compiled\metal_damaged.sbsar" --output-path "D:\Textures\Batch" --set-value "$outputsize@11,11"
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Normal bake seams / ray misses | Ray distance or name mismatch | Match by Mesh Name; raise frontal/rear; add cage |
| UE normals look inverted | OpenGL vs DirectX | Project normal format DirectX; invert G in preset if needed |
| Unity looks too glossy/metallic | Wrong pack / sRGB on data maps | Linear for R/M/AO; verify ORM swizzles |
| Texture set missing after reimport | Material slot rename | Preserve slot names; Re-project Layer Stack |
| GPU TDR mid-bake | Long kernel vs Windows TDR | Bake per-map; lower AA; IT-approved TdrDelay if needed |
| UDIM gaps | Missing tiles / wrong UV | Verify UDIM layout in DCC; per-tile texture sets |

---

## Best Practices

1. Lock texel density and resolution per asset class (hero 4K, prop 2K) in the naming README.
2. Bake once, paint on stable mesh maps; re-bake only when geo changes.
3. Keep export presets in version control (JSON) for studio-standard packs.
4. Name exports `{asset}_{set}_{channel}` for engine importers.
5. Document engine target (UE5 Packed vs Unity) on the `.spp` shot note.

---

## Limitations

- In-app Python is not a headless farm daemon; batch still expects Painter (or SAT for .sbsar).
- Baker quality depends on cage/UV integrity from the upstream DCC.
- Stop and ask if Adobe login, floating license servers, or proprietary presets are missing.

---

## Related Skills

- `@zbrush` — sculpt source for high poly
- `@blender` / `@cinema-4d` / `@houdini` — mesh/UV upstream
- `@unreal-engine` / `@unity` — consume packed maps

---

## Agent Operational Directive

> **MANDATORY**: Match normal map API (DirectX vs OpenGL) to the target engine. Export non-color data as linear. Resolve export presets by name and fail loudly on `ExportStatus` errors. Never invent Adobe credentials or unauthorized registry changes.

---

## Source anchors (research)

- [Substance 3D Painter Python API](https://helpx.adobe.com/substance-3d-painter/scripting.html)
- [Baking documentation](https://helpx.adobe.com/substance-3d-painter/painting/baking.html)
- [Export and channel packing](https://helpx.adobe.com/substance-3d-painter/export.html)
- [Substance Automation Toolkit](https://helpx.adobe.com/substance-3d-automation-toolkit.html)
