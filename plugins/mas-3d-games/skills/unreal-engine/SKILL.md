---
name: unreal-engine
description: "Operational skill for Claude to automate Unreal Engine 5 with Blueprints, C++ modules, Python Editor scripting, BuildCookRun, and Unreal Automation Tool."
category: game-engines
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["unreal-engine", "ue5", "unreal-python", "blueprints", "uat", "buildcookrun", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Unreal Engine 5 Editor & Pipeline AI Skill Guide (Claude)

## Overview & Engine Architecture
Unreal Engine 5 is a high-fidelity real-time engine centered on **UObject reflection**, **Blueprints**, **C++ gameplay modules**, and editor extensibility via **Editor Utility Widgets**, **Python Editor scripting**, and **Unreal Automation Tool (UAT)**. Rendering pillars include **Nanite**, **Lumen**, and the **Niagara** VFX system. Claude operates as a Principal UE Technical Director, specializing in **Python editor automation**, **module/target.cs hygiene**, **asset migration**, and **BuildCookRun packaging**.

### Unreal Engine 5 Core Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Unreal Engine 5 Architecture                │
│                                                             │
│  Gameplay Framework                                         │
│  ├── UObject / AActor / APawn / ACharacter / UActorComponent│
│  ├── GameMode / GameState / PlayerController                │
│  └── Blueprints + C++ (REFLECTION UCLASS/UFUNCTION)         │
│                                                             │
│  Editor & Automation                                        │
│  ├── Python Editor Scripting (`unreal` module)              │
│  ├── Editor Utility Blueprints / Widgets                    │
│  └── UAT / BuildCookRun / Gauntlet                          │
│                                                             │
│  Rendering & Content                                        │
│  ├── Nanite / Lumen / Virtual Shadow Maps                   │
│  ├── Niagara / Chaos Physics                                │
│  └── Asset Registry / DataLayers / World Partition          │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Python for Editor Ops**: Use `import unreal` for batch renaming, material assignment, level validation - not for shipping game runtime.
2. **C++ Module Discipline**: Keep public headers minimal; use `UCLASS`, `UPROPERTY`, `UFUNCTION` correctly for GC and Blueprint exposure.
3. **World Partition Awareness**: Prefer Data Layers and streaming-safe actor placement over monolithic persistent levels for large worlds.
4. **Cook/Package Automation**: Drive packaging through UAT `BuildCookRun` with explicit `-platform`, `-clientconfig`, and `-archivedirectory`.
5. **Never Block the Game Thread**: Move heavy I/O and procedural work off the game thread; respect Slate/editor tick constraints in tools.

---

## Production Python: Batch Rename Static Meshes in Content Browser

Run from Output Log / Editor Python, or `UnrealEditor-Cmd.exe` with `-ExecutePythonScript=`:

```python
# ==============================================================================
# UE5 Editor Python: prefix-rename selected Static Mesh assets
# ==============================================================================
import unreal

PREFIX = "SM_Hero_"
asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
editor_util = unreal.EditorUtilityLibrary
system_lib = unreal.SystemLibrary
editor_asset_lib = unreal.EditorAssetLibrary

selected = editor_util.get_selected_assets()
if not selected:
    unreal.log_warning("No assets selected.")
else:
    rename_data = []
    for asset in selected:
        if not isinstance(asset, unreal.StaticMesh):
            unreal.log(f"Skip non-static-mesh: {asset.get_name()}")
            continue
        old_name = asset.get_name()
        if old_name.startswith(PREFIX):
            continue
        path = asset.get_path_name()
        package_path = path.rsplit("/", 1)[0]
        new_name = PREFIX + old_name
        rename_data.append(
            unreal.AssetRenameData(asset, package_path, new_name)
        )
        unreal.log(f"Queue rename: {old_name} -> {new_name}")

    if rename_data:
        asset_tools.rename_assets(rename_data)
        unreal.log(f"Renamed {len(rename_data)} assets.")
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Python `unreal` import fails outside Editor** | Module only exists in Editor/Cmd editor builds. | Run via Editor Python or `UnrealEditor-Cmd` with ExecutePythonScript. |
| **Packaging fails on missing maps** | Maps not in Project Settings → Packaging → List of maps. | Add maps / use `-allmaps` carefully; verify Asset Registry. |
| **Blueprint compile errors after C++ change** | Hot reload / Live Coding mismatch. | Restart editor or rebuild target; fix UPROPERTY breakage. |
| **Nanite mesh looks wrong** | Unsupported features or fallback mesh. | Check Nanite settings; validate material domain and WPO usage. |

---

## Essential CLI Patterns

```bash
# UAT BuildCookRun (example Windows)
RunUAT.bat BuildCookRun ^
  -project="C:\work\MyGame\MyGame.uproject" ^
  -platform=Win64 -clientconfig=Development ^
  -build -cook -stage -pak -archive ^
  -archivedirectory="C:\work\MyGame\Dist"
```

### Essential Paths
- **Project**: `*.uproject`, `Source/`, `Content/`, `Config/`
- **Engine**: `Engine/Build/BatchFiles/RunUAT.bat`
- **Saved logs**: `Saved/Logs/`

---

## Agent Operational Directive
> **MANDATORY**: Use Python/`unreal` for editor automation only. For packaging, prefer UAT BuildCookRun with explicit platform and config. Preserve UObject reflection macros when exposing C++ to Blueprints.
