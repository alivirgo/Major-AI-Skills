---
name: unreal-engine
description: "Build Unreal Engine workflows with Blueprints, C++, editor Python, and Unreal Automation Tool build or packaging jobs."
category: game-engines
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["unreal-engine", "ue5", "unreal-python", "uat", "buildcookrun", "headless", "deterministic"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Unreal Engine 5 Editor & Pipeline AI Skill Guide (Claude)

## Overview & Engine Architecture

Unreal Engine 5.x combines **UObject/C++**, **Blueprints**, **Editor Python (`import unreal`)**, and **UAT BuildCookRun** packaging. Rendering: **Nanite, Lumen, Niagara**. Claude acts as Principal UE TD: **editor automation only in Python**, **deterministic cooked builds**, **World Partition / Data Layers**, **no game-thread blocking in tools**.

**Version pin:** Engine association in `.uproject` (e.g. `5.4`, `5.5`) — CI must build with matching `EngineAssociation` and `-engine=` path.

```
┌─────────────────────────────────────────────────────────────┐
│  Editor Python / UBT  →  Cook  →  Stage  →  Pak  →  Archive │
│  UnrealEditor-Cmd.exe -ExecutePythonScript=...              │
│  RunUAT.bat BuildCookRun -project=... -platform=Win64       │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when:** batch asset fixes, validation, packaging, render queue via Movie Render Queue (MRQ), commandlet-style automation.

**Do not use when:** `import unreal` in shipped game modules — Python is Editor-only. Do not assume Python works in packaged game.

---

## Operational Capabilities & Agent Directives

1. **Python scope**: Run via Editor, `UnrealEditor-Cmd`, or `-ExecutePythonScript=` — never in runtime game code.
2. **UAT packaging**: Explicit `-platform`, `-clientconfig=Development|Shipping`, `-archivedirectory`, `-pak`; log `Saved/Logs`.
3. **Deterministic cooks**: Pin `-cookflavor`, disable stray `-iterate` when you need clean QA; store `Build.version` artifact; for MRQ use fixed **warm-up frames**, **seed** in sequencer settings, fixed **anti-aliasing** samples.
4. **Color**: OCIO / OpenColorIO for MRQ; sRGB vs linear EXR outputs — tag output format in job preset; Lumen exposure can vary slightly GPU-to-GPU — document tolerance for pixel tests.
5. **Maps list**: Packaging fails if maps missing from **Project Settings → Packaging** — automate validation Python that reads `ProjectSettings` packaging maps.
6. **Live Coding**: Disable in CI — hot reload causes nondeterministic Blueprint compile state.

---

## Production Python: validate packaging maps

```python
import unreal

settings = unreal.get_default_object(unreal.ProjectPackagingSettings)
maps = list(settings.get_editor_property("maps_to_cook"))
unreal.log(f"Maps to cook: {len(maps)}")
for m in maps:
    if not unreal.EditorAssetLibrary.does_asset_exist(m):
        raise RuntimeError(f"Missing map asset: {m}")
unreal.log("Packaging map validation OK")
```

Run: `UnrealEditor-Cmd.exe "Game.uproject" -ExecutePythonScript=validate_maps.py -stdout -unattended -nop4 -nosplash`

---

## UAT BuildCookRun (Windows)

```bat
Engine\Build\BatchFiles\RunUAT.bat BuildCookRun ^
  -project="C:\Game\Game.uproject" ^
  -noP4 -platform=Win64 -clientconfig=Shipping ^
  -build -cook -stage -pak -archive ^
  -archivedirectory="C:\Game\Dist"
```

**Headless:** `-unattended -stdout` on Cmd editor; `-NullRHI` for some commandlets — not for GPU MRQ.

---

## Failure taxonomy

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `unreal` import fails | Running outside Editor | Use Editor-Cmd |
| Cook missing asset | Never saved / redirector | Resave content; fix up redirectors |
| Shader compile storm | New RHI / clean DDC | Warm DDC cache in CI |
| MRQ flicker | Temporal AA / Lumen | Fixed sample count; disable temporal for golden |
| Python rename silent fail | Asset registry not refreshed | `unreal.EditorAssetLibrary.save_directory` |

GitHub/community: BuildCookRun `-clean` when upgrading engine minor — stale `DerivedDataCache` causes obscure cook failures.

---

## Agent Operational Directive

> **MANDATORY**: Editor Python only. Pin engine version. Validate maps before UAT. For pixel-regression renders, fix MRQ warm-up, exposure, and output color space; document GPU variance.
