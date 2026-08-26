---
title: "Adobe Substance 3D Painter AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Adobe Substance 3D Painter PBR workflows, UDIM painting, and texture baking."
category: "3D PBR Texture Painting & Material Authoring"
tags: ["substance-painter", "pbr-texturing", "udim", "gemini", "texture-baking", "visual-diagnostics"]
---

# Adobe Substance 3D Painter AI Skill Guide (Gemini)

## Overview & Engine Architecture
Adobe Substance 3D Painter is the industry-leading 3D texturing application for interactive entertainment and cinematic production. Gemini operates as an AI Texture Artist and Technical Director, specializing in **multimodal visual defect analysis**, **UDIM multi-tile painting pipelines**, **Smart Material mask generators**, and **PBR shader calibration (Metallic/Roughness)**.

### System Architecture & Viewport Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                 Substance 3D Painter Pipeline               │
│                                                             │
│  Real-Time Viewport & Baking Architecture                   │
│  ├── PBR Shader Viewport (glTF PBR, Adobe Standard Material)│
│  ├── Multi-Tile UDIM UV Layout Management (1001, 1002, ...) │
│  └── Optical & Geometry Baking Engine (Curvature, Normal)   │
│                                                             │
│  Asset & Export Layer                                       │
│  ├── Smart Materials & Dynamic Anchor Point Reference Masks │
│  ├── Custom Channel Packing (ORM: AO / Roughness / Metallic)│
│  └── Automated Python / SAT Headless Tooling                │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal PBR Quality Assurance**: Visually inspect rendered texture maps and 3D viewport screenshots to detect texture stretching, UV distortion, pixel bleeding at UV seams, and metalness map contamination.
2. **Smart Material & Generator Masking**: Configure procedural generators (Curvature, Dirt, Metal Edge Wear) using baked mesh maps and anchor points for non-destructive wear layering.
3. **UDIM Multi-Tile Workflow**: Manage high-resolution multi-tile assets, configuring cross-tile painting, texture set linking, and UDIM export token patterns (`<UDIM>`, `$textureSet`).
4. **Channel Packing & Preset Construction**: Generate JSON export configuration presets that pack Ambient Occlusion, Roughness, and Metallic into packed RGB channels (ORM/RMA).

---

## Production Python Automation: Automatic Project Setup & Bake

Execute this script via Substance Painter's Python Console to automate new project creation from an FBX mesh and trigger automated map baking:

```python
"""
Substance 3D Painter: Automated Project Initializer & Mesh Baker
Creates a new project and bakes standard PBR mesh maps.
"""

import substance_painter.project
import substance_painter.baking

def create_and_bake_project(mesh_path: str, save_path: str):
    # 1. Project Creation Settings
    settings = substance_painter.project.Settings(
        normal_map_format=substance_painter.project.NormalMapFormat.DirectX,
        import_cameras=True
    )

    # 2. Create Project from Low-Poly Mesh
    print(f"Creating project with mesh: {mesh_path}")
    substance_painter.project.create(mesh_path, settings=settings)

    if not substance_painter.project.is_open():
        print("Error: Project creation failed.")
        return

    # 3. Save Project File (.spp)
    substance_painter.project.save_as(save_path)
    print(f"Project saved to: {save_path}")

    # 4. Trigger Automatic Mesh Map Baking
    print("Starting mesh map baking...")
    # Bakes all texture sets using project default bake parameters
    substance_painter.baking.bake_all()
    print("Mesh map baking completed successfully.")

if __name__ == "__main__":
    create_and_bake_project(
        mesh_path="C:/Assets/Hero_Prop_low.fbx",
        save_path="C:/Projects/Hero_Prop.spp"
    )
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Visible Seams Across UV Island Borders in Viewport** | Insufficient texture dilation / padding, or UV islands lack minimum 4-pixel spacing. | 1. In Texture Set Settings, increase **Dilation Width** to 32px or `Infinite`.<br>2. In 3D DCC, repack UVs with at least 8–16px padding at 4K resolution.<br>3. Verify texture filtering is set to Bilinear in viewport. |
| **Metal Surfaces Appear Plastic / Non-Reflective** | Base color is too bright or Metallic channel value is in the intermediate 0.1–0.9 range instead of binary 0 or 1. | 1. In PBR Metallic/Roughness workflow, pure metals must have **Metallic = 1.0** and colored BaseColor.<br>2. Non-metals (dielectrics) must have **Metallic = 0.0**.<br>3. Inspect the Metallic channel view mode (`M` key) for grey value errors. |
| **Smart Mask Generators Return Flat Black** | The required baked mesh maps (Curvature, Ambient Occlusion, World Space Normal) are missing. | 1. Open *Bake Mesh Maps* dialog.<br>2. Ensure **Curvature**, **Ambient Occlusion**, and **World Space Normal** are checked.<br>3. Re-bake all texture sets. |
| **UDIM Tiles Exporting with Overwritten Names** | Export preset lacks the `<UDIM>` or `$textureSet` replacement token. | 1. Open *Export Textures $\rightarrow$ Output Templates*.<br>2. Ensure output filename template ends with `_$textureSet_<UDIM>` (e.g. `T_Hero_BaseColor.1001.png`). |

---

## Command Line Syntax & Batch Processing

```bash
# Windows CLI: Open Project Directly in Painter
"C:\Program Files\Adobe\Adobe Substance 3D Painter\Adobe Substance 3D Painter.exe" "C:\Projects\Character_Armor.spp"

# SAT Tool: Export Textures from SBSAR via sbsrender
sbsrender.exe render --input "C:\Materials\Fabric.sbsar" --output-path "C:\Textures\Export" --output-format "png"

# SAT Tool: Query Substance Archive Parameters
sbsrender.exe info --input "C:\Materials\Fabric.sbsar"
```

### Key Configuration Locations
- **Windows User Shelf**: `%USERPROFILE%\Documents\Adobe\Adobe Substance 3D Painter\assets\shelves`
- **Windows Log Files**: `%LOCALAPPDATA%\Adobe\Adobe Substance 3D Painter\log.txt`
- **macOS Log Files**: `~/Library/Application Support/Adobe/Adobe Substance 3D Painter/log.txt`

---

## Agent Operational Directive
> **MANDATORY**: Inspect the PBR Metallic channel for binary discipline (0.0 for dielectrics, 1.0 for conductors). Ensure baked mesh maps (Curvature, AO, Position) are present before applying procedural Smart Materials.
