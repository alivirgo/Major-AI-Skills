---
name: zbrush
description: "Automate ZBrush with ZScript macros, run ZRemesher and Decimation Master safely, extract 32-bit displacement/normals, and debug GoZ and multi-million-poly viewport failures agents routinely miss."
category: 3d
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["zbrush", "zscript", "zremesher", "decimation-master", "displacement", "goz", "sculpting", "udim"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Maxon ZBrush AI Skill Guide (Claude)

## Overview & Engine Architecture

Maxon ZBrush is a high-density sculpting DCC (often tens of millions of polygons). Agents should treat tools as **SubTool hierarchies + SDiv levels**, Dynamesh/Sculptris as **topology regenerators**, ZRemesher as a **quad-flow contract**, and Multi Map Exporter as a **32-bit displacement pipeline**—not 8-bit previews. Automation is primarily **ZScript** (`.txt` / compiled `.zsc`), plus **GoZ** bridges to Maya/C4D/Blender.

```
┌─────────────────────────────────────────────────────────────┐
│                 ZBrush sculpt → retopo → maps               │
│                                                             │
│  Geometry                                                   │
│  ├── SubTools + PolyGroups                                  │
│  ├── SDiv multi-res / Dynamesh / Sculptris Pro              │
│  └── ZRemesher + Decimation Master                          │
│                                                             │
│  Pipeline                                                   │
│  ├── ZScript macros ([IFreeze] loops)                       │
│  ├── Multi Map Exporter (32-bit EXR displacement)           │
│  └── GoZ interchange cache                                  │
└─────────────────────────────────────────────────────────────┘
```

**Version pins:** document ZBrush year/build and plugin paths (`ZStartup/ZPlugs64`). UI path strings in ZScript break across versions—prefer documented plugin menu paths the studio actually ships.

---

## When to use / when not to

**Use when**

- Organic/hard-surface sculpt, retopo via ZRemesher, decimation for game proxies.
- Extracting displacement/normal maps for downstream renderers.
- Batch SubTool export / GoZ handoff macros.

**Do not use when**

- Primary need is procedural FX sims → `@houdini`.
- Final PBR layer painting → `@substance-painter` after UVs.
- Full scene lighting/ MoGraph → `@cinema-4d` / `@blender`.

---

## Operational Capabilities & Agent Directives

1. **Wrap long macros in `[IFreeze, ...]`** to suppress redraw thrash.
2. **Decimate only after Pre-process**; target % must match delivery (e.g. 20% proxy ≠ hero sculpt).
3. **Displacement**: 32-bit float EXR/TIFF, mid 0.0 when using that convention; generate from lowest SDiv vs high.
4. **ZRemesher**: guides + Keep Groups; fix spiral flows on cylinders before blaming the tool.
5. **Viewport lag**: Solo / hide SubTools / Group Split—do not “just add RAM” as first advice.
6. **GoZ**: repair path prefs + clear public cache files when send fails silently.
7. **Paths in macros**: use studio-provided export roots; never invent privileged or credentialed shares.
8. **No invented serials / license servers.**

---

## Production Example: batch Decimate + OBJ export

Save under `ZStartup/ZPlugs64/` (adjust export root to the user’s project path):

```zscript
// Batch decimate visible SubTools and export OBJ
[IButton, "ZPlugin:Pipeline:BatchDecimate", "Decimate visible SubTools to 20% and export OBJ",
    [VarSet, totalSubTools, [SubToolGetCount]]
    [VarSet, activeIdx, 0]
    [IFreeze,
        [Loop, totalSubTools,
            [SubToolSelect, activeIdx]
            [If, [SubToolGetStatus, activeIdx] == 1,
                [IPress, "ZPlugin:Decimation Master:Pre-process Current"]
                [ISet, "ZPlugin:Decimation Master:% of decimation", 20]
                [IPress, "ZPlugin:Decimation Master:Decimate Current"]
                [VarSet, subToolName, [IGetTitle, "Tool:ItemInfo"]]
                [FileNameSetNext, [StrMerge, "C:/Export/Decimated_", subToolName, ".obj"]]
                [IPress, "Tool:Export"]
            ]
            [VarInc, activeIdx]
        ]
    ]
    [Note, "Batch Decimation and Export Completed", , 2]
]
```

CLI launch (install path local to machine):

```bash
"C:\Program Files\Maxon ZBrush 2025\ZBrush.exe" -zscript "D:\Pipeline\auto_setup.zsc"
```

**Map extraction checklist:** Multi Map Exporter → 32Bit displacement → lowest SDiv active → OpenEXR → verify UDIM tiles if used.

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Canvas freeze >30M polys | All SubTools drawn | Solo; hide; Group Split |
| ZRemesher spiral cylinders | Missing guides / groups | ZRemesher Guides; Keep Groups; Detect Edges |
| GoZ silent fail | Bad app path / cache | Preferences → GoZ paths; clear `GoZ_ObjectList.txt` |
| Stair-step displacement | 8/16-bit map | 32-bit EXR; correct SDiv pair |
| Holes after Dynamesh | Open mesh / non-manifold | Close Holes; Dynamesh resolution pass |
| Macro clicks wrong button | UI path drift | Re-record paths on pinned ZBrush build |

---

## Best Practices

1. PolyGroup early; split heavy heroes into SubTools by material/region.
2. Keep a non-decimated sculpt archive; export proxies separately.
3. Document mid-value and tangent space for map consumers (Maya/C4D/Blender/Unreal).
4. Prefer GoZ or FBX/OBJ with scale notes (ZBrush scale traps are common).
5. Store macros in version control as `.txt` sources; compile `.zsc` in-tool.

---

## Limitations

- ZScript is UI-automation fragile across versions and locales.
- True headless farm sculpt is limited—expect interactive or scripted GUI sessions.
- Stop and ask if license activation, network ZStartups, or client export roots are missing.

---

## Related Skills

- `@substance-painter` — PBR texturing after UVs
- `@blender` / `@cinema-4d` — downstream mesh/lookdev
- `@houdini` — procedural secondary FX on exported geo
- `@unreal-engine` — game displacement/normal consumption

---

## Agent Operational Directive

> **MANDATORY**: Use `[IFreeze]` for batch SubTool loops. Export hero displacement as 32-bit float. Fix GoZ paths/cache before rewriting meshes. Never invent Maxon serials or credentialed export URLs.

---

## Source anchors (research)

- [ZBrush documentation (Maxon)](https://help.maxon.net/zbr/)
- [ZScript command reference](https://help.maxon.net/zbr/)
- [Decimation Master / Multi Map Exporter](https://help.maxon.net/zbr/)
- [GoZ workflows](https://help.maxon.net/zbr/)
