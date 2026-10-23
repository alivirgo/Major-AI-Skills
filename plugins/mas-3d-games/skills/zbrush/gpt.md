---
title: "Maxon ZBrush AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to author ZScript batch macros, decimation/export pipelines, and map-extraction checklists with version-safe UI paths and no invented credentials."
category: "3D / Digital Sculpting"
tags: ["zbrush", "zscript", "decimation-master", "zremesher", "gpt-codex", "goz"]
---

# Maxon ZBrush AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Sculpt Pipeline TD**: emit **ZScript macros** with `[IFreeze]` loops, **parameterized export roots**, and **checklists** for 32-bit map extraction. Prefer `.txt` sources checked into git; compile to `.zsc` in the pinned ZBrush build.

```
┌─────────────────────────────────────────────────────────────┐
│                 ZBrush automation stack                     │
│  ZScript → SubTool loop → Decimate/Export/Maps              │
│  GoZ path config → DCC validate                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Parameterize export directory** via `[FileNameSetNext]` using studio-provided roots only.
2. **Guard visibility** with `SubToolGetStatus` before processing.
3. **Re-record UI paths** when targeting a new ZBrush year—do not assume 2023 menu strings.
4. **Emit map SOP**: bit depth, mid value, SDiv high/low, UDIM on/off.
5. **No license keys** or activation workarounds in macros.

---

## Production ZScript: rename-safe export stub

```zscript
// Export active SubTool OBJ to a caller-set next filename
[IButton, "ZPlugin:Pipeline:ExportActiveOBJ", "Export active SubTool as OBJ",
    [VarSet, name, [IGetTitle, "Tool:ItemInfo"]]
    [FileNameSetNext, [StrMerge, "D:/Export/", name, ".obj"]]
    [IPress, "Tool:Export"]
    [Note, [StrMerge, "Exported ", name], , 1]
]
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Fix |
| :--- | :--- | :--- |
| Button not found | UI path | Rebind to current ZPlugin menu |
| Empty OBJ | Hidden / wrong SubTool | Select + status check |
| Displacement banding | Bit depth | Force 32-bit EXR in MME settings |

---

## Best Practices

1. Keep macros small and composable (decimate ≠ map extract).
2. Log SubTool names with `[Note]` for farm operators.
3. Pair every proxy export with archive of full-res tool.

---

## Limitations

- ZScript cannot replace a true headless geometry API.
- GoZ targets must already have plugins installed.

---

## Agent Operational Directive

> **MANDATORY**: Freeze redraws in loops, pin ZBrush version for UI paths, require 32-bit displacement for hero maps. Never invent credentials or serial numbers.
