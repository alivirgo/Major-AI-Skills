---
title: "CryEngine AAA Real-Time Engine AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot CryEngine Sandbox Editor viewports, PBR Material shaders, SVOGI visual noise, and Track View cinematics."
category: "AAA Game Engine & Real-Time Rendering"
tags: ["cryengine", "sandbox-editor", "pbr-materials", "gemini", "track-view", "svogi-visuals"]
---

# CryEngine AAA Real-Time Engine AI Skill Guide (Gemini)

## Overview & Engine Architecture
CryEngine delivers state-of-the-art real-time visuals, procedural terrain sculpting, and cinematic storytelling. Gemini acts as an AI Technical Artist and Real-Time Rendering Auditor, specializing in **multimodal Sandbox Editor viewport inspection**, **PBR Material Editor roughness/normal map validation**, **SVOGI indirect lighting artifact triage**, and **Cinematic Track View cutscene sequencing**.

### Visual Analytics & Rendering Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 CryEngine Visual Operations                 │
│                                                             │
│  Viewport & Environmental Presentation                      │
│  ├── Sandbox 3D Viewport (Real-Time SVOGI Raymarcher)       │
│  ├── Time of Day (TOD) Editor (Sun Color, Rayleigh, Mie)    │
│  └── Procedural Terrain & Multi-Layer Splat Map Sculpting   │
│                                                             │
│  Materials & Cinematic Authoring                            │
│  ├── PBR Material Editor (Albedo, Smoothness, Normal, Metal)│
│  ├── Particle Editor (GPU Dynamic Fluid & Spark Emitters)   │
│  └── Track View (Timeline Keyframe Camera & Audio Director) │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Sandbox Viewport Triage**: Analyze screenshots of Sandbox Editor viewports to detect shadow aliasing, over-exposed bloom, volumetric fog banding, and texture streaming mipmap blurriness.
2. **PBR Material Channel Inspection**: Validate PBR textures (Metallic, Smoothness/Roughness, Normal map gloss inversion) to ensure physical accuracy and eliminate metallic glare on dielectric surfaces.
3. **Time of Day (TOD) & Sky Diagnostics**: Review Time of Day curves for smooth daylight-to-night transitions without abrupt ambient lighting pops.
4. **Cinematic Cutscene Sequencing in Track View**: Sequence camera nodes, field-of-view (FOV) transitions, depth-of-field (DOF) focal planes, and skeletal animation tracks.

---

## Production Python Automation: Automated Material Descriptor (`.mtl`) XML Generator

Execute this standalone script to generate validated CryEngine `.mtl` PBR material files from an asset texture directory:

```python
"""
CryEngine PBR Material (.mtl) XML File Generator
Generates CryEngine-compliant XML material definitions with PBR texture mappings.
"""

import sys
import os

MTL_TEMPLATE = """<Material MtlFlags="524544" vertModifType="0" Shader="Illum" GenMask="2080000000000" StringGenMask="%ALLOW_SILHOUETTE_POM%NORMAL_MAP%SPECULAR_MAP" SurfaceType="mat_metal" MatTemplate="" Diffuse="1,1,1" Specular="1,1,1" Opacity="1" Shininess="255">
  <Textures>
    <Texture Map="Diffuse" File="{albedo_path}"/>
    <Texture Map="Bumpmap" File="{normal_path}"/>
    <Texture Map="Specular" File="{smoothness_path}"/>
  </Textures>
  <PublicParams EmittanceMapGamma="1" DetailDiffuseRamp="0" SSSIndex="0"/>
</Material>"""

def create_cryengine_material(material_name: str, texture_dir: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, f"{material_name}.mtl")

    albedo = f"{texture_dir}/{material_name}_diff.tif"
    normal = f"{texture_dir}/{material_name}_ddna.tif" # CryEngine DDNA Normal+Gloss map
    smooth = f"{texture_dir}/{material_name}_spec.tif"

    content = MTL_TEMPLATE.format(
        albedo_path=albedo,
        normal_path=normal,
        smoothness_path=smooth
    )

    with open(out_file, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Generated CryEngine Material File: {out_file}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python create_mtl.py <MaterialName> <TextureSubDir> <OutputDir>")
        sys.exit(1)
    create_cryengine_material(sys.argv[1], sys.argv[2], sys.argv[3])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Specular Highlights Appear White / Plastic on Metals** | Material has `MatTemplate` set to dielectric or Smoothness map gloss channel inverted. | 1. In Material Editor, ensure **Shader** is set to `Illum`.<br>2. Check texture format: Normal maps must be encoded as **DDNA** (Normal RGB + Gloss Alpha).<br>3. Verify texture preset in RC (Resource Compiler). |
| **SVOGI Viewport Shows Speckled Grainy Noise** | Cone tracing sampling count is too low for the current scene geometry complexity. | 1. In Console, set `e_svoTI_ConeRays = 16` (or 24 for clean production renders).<br>2. Increase `e_svoTI_TemporalFiltering = 1` to blend noise across frames. |
| **Vegetation Pops In Abruptly When Moving Camera** | Vegetation LOD distance ratio is configured too aggressively for distant viewing. | 1. In Terrain $\rightarrow$ Vegetation Editor, select plant group.<br>2. Increase **ViewDistanceRatio** (e.g. from 50 to 150).<br>3. Adjust console variable: `e_ViewDistRatioVegetation = 100`. |
| **Track View Camera Motion is Jittery / Non-Smooth** | Keyframe interpolation mode set to `Linear` or `Step` rather than `Bezier` / `Spline`. | Select all camera position keyframes in Track View $\rightarrow$ Right-click $\rightarrow$ Change Tangent to **Spline / Smooth**. |

---

## Command Line Syntax & Server Control

```bash
# Toggle Wireframe Debug Overlay in Engine Console
r_Wireframe 1

# Capture 4K High-Resolution Screenshots
e_Screenshot 1; e_ScreenShotWidth 3840; e_ScreenShotHeight 2160
```

### Key Configuration Locations
- **Project Assets**: `<ProjectRoot>\assets\`
- **Materials Directory**: `<ProjectRoot>\assets\materials\`

---

## Agent Operational Directive
> **MANDATORY**: CryEngine normal maps must be exported using the Resource Compiler (RC) with the `_ddna.tif` suffix (Normal map in RGB, Smoothness/Gloss in Alpha channel) to prevent visual PBR shading inversion errors.
