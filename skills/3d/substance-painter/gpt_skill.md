---
title: "Adobe Substance 3D Painter AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Adobe Substance 3D Painter PBR pipelines, Python API plugins, and SAT batch tasks."
category: "3D PBR Texture Painting & Material Authoring"
tags: ["substance-painter", "python-api", "pbr-pipeline", "sat", "gpt-codex", "channel-packing"]
---

# Adobe Substance 3D Painter AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Adobe Substance 3D Painter is the industry benchmark for real-time and cinematic PBR texture painting, mesh map baking, and multi-format material compilation. GPT/Codex acts as a Principal Tools Developer and Pipeline TD, delivering **`substance_painter` Python 3 plugin scripts**, **custom export preset generators (JSON)**, **Substance Automation Toolkit (SAT) batch execution scripts**, and **asset preflight checkers**.

### Pipeline Architecture & Developer Layer

```
┌─────────────────────────────────────────────────────────────┐
│                 Substance Painter Pipeline Stack            │
│                                                             │
│  Core Painting & Shading Stack                              │
│  ├── Multi-Channel PBR Pipeline (BaseColor, Rough, Metal)   │
│  ├── Layer Graph & Procedural Mask Generators               │
│  └── Hardware-Accelerated Mesh Map Baker (OptiX / DXR)      │
│                                                             │
│  Developer Interfaces                                       │
│  ├── `substance_painter` In-Process Python 3 API            │
│  ├── Substance Automation Toolkit (SAT - CLI Pipeline SDK)  │
│  └── JSON Channel Packing & Output Template Schema          │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Python API Plugin Development**: Author robust, event-driven Python plugins for Substance Painter using `substance_painter.event`, adding custom toolbar actions, shelf browser integrations, and automated texture validators.
2. **Channel Packing Configuration**: Generate structured JSON export presets that pack multiple greyscale channels (e.g. Red: Ambient Occlusion, Green: Roughness, Blue: Metallic, Alpha: Smoothness) for game engines.
3. **Automated Asset Preflight Checks**: Build validation scripts to verify UV winding order, detect overlapping UV islands, check texture set resolution compliance, and verify material slot naming.
4. **SAT Headless Batch Pipelines**: Script CLI workflows integrating `sbscooker` and `sbsrender` into continuous integration (CI/CD) art pipelines.

---

## Production Python Automation: Custom Channel Packing Preset Generator

Run this script to programmatically create an Unreal Engine 5 Packed Export Preset (BaseColor, ORM Packed, DirectX Normal) in Substance Painter:

```python
"""
Substance 3D Painter: Custom Export Preset Installer
Creates a custom JSON export preset for Unreal Engine 5 ORM Channel Packing.
"""

import json
import os
import substance_painter.resource

def install_ue5_orm_preset():
    preset_data = {
        "name": "Custom_UE5_ORM_Packed",
        "description": "Standard UE5 Preset: BaseColor (sRGB), Normal_DX (Linear), ORM (AO=R, Roughness=G, Metallic=B)",
        "maps": [
            {
                "fileName": "$textureSet_BaseColor",
                "channels": [
                    {"destChannel": "R", "srcChannel": "R", "srcMapType": "documentMap", "srcMapName": "basecolor"},
                    {"destChannel": "G", "srcChannel": "G", "srcMapType": "documentMap", "srcMapName": "basecolor"},
                    {"destChannel": "B", "srcChannel": "B", "srcMapType": "documentMap", "srcMapName": "basecolor"}
                ]
            },
            {
                "fileName": "$textureSet_ORM",
                "channels": [
                    {"destChannel": "R", "srcChannel": "L", "srcMapType": "documentMap", "srcMapName": "ambientocclusion"},
                    {"destChannel": "G", "srcChannel": "L", "srcMapType": "documentMap", "srcMapName": "roughness"},
                    {"destChannel": "B", "srcChannel": "L", "srcMapType": "documentMap", "srcMapName": "metallic"}
                ]
            },
            {
                "fileName": "$textureSet_Normal",
                "channels": [
                    {"destChannel": "R", "srcChannel": "R", "srcMapType": "documentMap", "srcMapName": "normal"},
                    {"destChannel": "G", "srcChannel": "G", "srcMapType": "documentMap", "srcMapName": "normal"},
                    {"destChannel": "B", "srcChannel": "B", "srcMapType": "documentMap", "srcMapName": "normal"}
                ]
            }
        ]
    }

    # Locate Shelf Presets Path
    shelf_path = os.path.expanduser("~/Documents/Adobe/Adobe Substance 3D Painter/assets/export-presets")
    os.makedirs(shelf_path, exist_ok=True)
    
    preset_file = os.path.join(shelf_path, "Custom_UE5_ORM_Packed.spexp")
    with open(preset_file, "w", encoding="utf-8") as f:
        json.dump(preset_data, f, indent=2)

    print(f"Successfully installed export preset to: {preset_file}")

if __name__ == "__main__":
    install_ue5_orm_preset()
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`substance_painter.export.ExportError: Export failed`** | Target directory is write-protected or disk space is exhausted during 8K EXR generation. | 1. Verify directory write permissions using `os.access(path, os.W_OK)`.<br>2. Ensure at least 15GB free disk space for 8K texture set cache generation.<br>3. Check Substance Painter log for exact file locking handles. |
| **Bake Distortion along Mesh Creases** | High-poly to low-poly vertex normal smoothing group mismatch. | 1. In 3D DCC, place UV seams along all hard/smoothing group edges.<br>2. Re-export FBX with explicit vertex normals enabled.<br>3. Re-bake with **Average Normals** enabled in Baker settings. |
| **Python Plugin Fails to Load on Startup** | Syntax error in `plugin.py` or script is missing `start_plugin()` / `close_plugin()` lifecycle entry points. | 1. Ensure plugin folder contains `__init__.py` or `plugin.py`.<br>2. Verify top-level defines `def start_plugin():` and `def close_plugin():`.<br>3. Check `log.txt` in `%LOCALAPPDATA%\Adobe\Adobe Substance 3D Painter\`. |
| **Texture Set Resolution Changes Reset Painted Layers** | Procedural fills re-evaluate correctly, but bitmap paint strokes scale with slight pixel interpolation. | 1. Always author details using **Fill Layers with Mask Generators** and Anchor Points rather than manual painting where possible.<br>2. Use SVG or vector resource brushes for resolution independence. |

---

## Command Line Syntax & Batch Execution

```bash
# Windows CLI: Launch Substance Painter with Custom Plugin Path
"C:\Program Files\Adobe\Adobe Substance 3D Painter\Adobe Substance 3D Painter.exe" --enable-python --plugin-path "C:\Studio\PainterPlugins"

# SAT Tool: Batch Cook SBSAR Files
sbscooker.exe --inputs "C:\Art\Materials" --output-path "C:\Art\Compiled" --includes "C:\Art\Dependencies"

# SAT Tool: Export Mesh Map Bakes via Command Line
sbsbaker.exe ambient-occlusion --highdef-mesh "C:\Meshes\hero_high.obj" --lowdef-mesh "C:\Meshes\hero_low.obj" --output-path "C:\Bakes"
```

### Essential File Locations
- **Windows Export Presets**: `%USERPROFILE%\Documents\Adobe\Adobe Substance 3D Painter\assets\export-presets`
- **Windows Plugin Directory**: `%USERPROFILE%\Documents\Adobe\Adobe Substance 3D Painter\python\plugins`
- **macOS Export Presets**: `~/Library/Application Support/Adobe/Adobe Substance 3D Painter/assets/export-presets`

---

## Agent Operational Directive
> **MANDATORY**: Python plugins must implement `start_plugin()` and `close_plugin()` lifecycles with safe event cleanup. Pack greyscale channels into RGB textures (e.g. ORM) to conserve GPU sampler slots in real-time game engines.
