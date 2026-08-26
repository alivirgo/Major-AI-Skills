---
title: "Maxon ZBrush AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, script, automate, and troubleshoot Maxon ZBrush sculpt topology, DynaMesh density, and Polypaint workflows."
category: "Digital Sculpting & High-Poly Modeling"
tags: ["zbrush", "digital-sculpting", "gemini", "topology-diagnostics", "zremesher", "polypaint"]
---

# Maxon ZBrush AI Skill Guide (Gemini)

## Overview & Engine Architecture
Maxon ZBrush is the global standard for character concepting, organic modeling, and micro-surface detail sculpting. Gemini functions as an AI Sculpting Supervisor and Pipeline TD, specializing in **multimodal mesh topology evaluation**, **DynaMesh resolution scaling**, **Polypaint color density validation**, and **SubTool organization**.

### System Topology & Geometry Subsystems

```
┌─────────────────────────────────────────────────────────────┐
│                 ZBrush Sculpting Architecture               │
│                                                             │
│  Sculpting & Surface Tessellation Core                      │
│  ├── Multi-Resolution Mesh Pyramid (SDiv 1 to SDiv 7)       │
│  ├── Dynamic Sculpting (Sculptris Pro Local Adaptive Mesh) │
│  └── Voxel Re-meshing (DynaMesh Density Grid)               │
│                                                             │
│  Surface Data & Projection Layer                            │
│  ├── Polypaint Vertex Color Buffers (RGBA per-vertex)       │
│  ├── Spotlight Image Projection & Texture Maps              │
│  └── Vector Displacement & 32-bit Floating Point Extraction │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Mesh Inspection**: Evaluate wireframe screenshots to diagnose edge flow pinching, non-quad polygons, surface poles ($>5$ edges at a single vertex), and UV stretching.
2. **DynaMesh & Sculptris Pro Diagnostics**: Balance voxel density against hardware memory limits to avoid mesh freezing or fine-detail loss during boolean operations.
3. **Polypaint to Texture Conversion**: Troubleshoot vertex color baking onto UV maps, ensuring UV island resolution matches Polypaint vertex density.
4. **SubTool Structure Optimization**: Group, rename, and organize complex 100+ SubTool projects into logical PolyGroup folders.

---

## Production ZScript Automation: PolyGroup By Normal & Auto-DynaMesh

Execute this macro to clean non-manifold boolean artifacts, assign PolyGroups by surface angle, and re-DynaMesh geometry:

```zscript
// ZScript: Clean Boolean & Auto-Group by Surface Angle
[IButton, "ZPlugin:Pipeline:CleanPolyGroupDynaMesh", "Cleans boolean meshes, polygroups by normal, and runs DynaMesh",
    [IFreeze,
        // 1. Close Holes in Geometry
        [IPress, "Tool:Geometry:Close Holes"]
        
        // 2. Group by Normal with 45 Degree Threshold
        [ISet, "Tool:Polygroups:Group Normal", 45]
        [IPress, "Tool:Polygroups:Group By Normals"]
        
        // 3. Enable DynaMesh with 256 Resolution
        [ISet, "Tool:Geometry:DynaMesh:Resolution", 256]
        [If, [IGet, "Tool:Geometry:DynaMesh:DynaMesh"] == 0,
            [IPress, "Tool:Geometry:DynaMesh:DynaMesh"]
        ]
        
        // 4. Force DynaMesh Re-evaluation (Ctrl+Drag equivalent)
        [IPress, "Tool:Geometry:DynaMesh:ReDynaMesh"]
    ]
    [Note, "Mesh Cleaned and PolyGrouped successfully!", , 2]
]
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **DynaMesh Re-meshing Creates Webbed / Fused Fingers** | Voxel resolution too low for narrow negative space gaps between meshes. | 1. Increase **DynaMesh Resolution** slider from 128 $\rightarrow$ 512–1024.<br>2. Scale the tool up using *Tool $\rightarrow$ Deformation $\rightarrow$ Size* (ZBrush voxel grid is world-space scaled).<br>3. Mask and pull fingers further apart before re-meshing. |
| **Polypaint Appears Pixelated / Low Resolution** | Polypaint is bound to mesh vertices; the active subdivision level has insufficient point count. | 1. Subdivide the mesh (`Ctrl+D`) to at least 4–8 million points.<br>2. Alternatively, enable **Sculptris Pro mode** for dynamic vertex tessellation under brush strokes.<br>3. Convert to UV texture map with 4K resolution. |
| **Mesh Has Dark Artifacts / Inverted Facets in Viewport** | Flipped surface normals or internal geometry created during Boolean mesh operations. | 1. Enable *Tool $\rightarrow$ Display Properties $\rightarrow$ Double* to verify flipped faces.<br>2. Click *Tool $\rightarrow$ Display Properties $\rightarrow$ Flip* to orient normals correctly.<br>3. Run *Tool $\rightarrow$ Geometry $\rightarrow$ MeshIntegrity $\rightarrow$ Fix Mesh*. |
| **ZRemesher Ignores Hard Edges / Crushes Corners** | Boundary creases were not protected before retopology pass. | 1. Apply **Crease PolyGroups** (*Tool $\rightarrow$ Geometry $\rightarrow$ Crease*).<br>2. In ZRemesher, enable **Keep Creases** and set **Adaptive Size** to 50–75.<br>3. Enable **Target Polygon Count** override. |

---

## Command Line Syntax & File Paths

```bash
# Windows CLI: Execute ZBrush with Command Script
"C:\Program Files\Maxon ZBrush 2025\ZBrush.exe" "C:\Scripts\CleanPolyGroupDynaMesh.txt"

# Open ZBrush with Target Tool
"C:\Program Files\Maxon ZBrush 2025\ZBrush.exe" "C:\Projects\Character_High.ztl"
```

### Essential File Locations
- **Windows ZBrush Plugins**: `C:\Program Files\Maxon ZBrush 2025\ZStartup\ZPlugs64`
- **Windows User Textures**: `C:\Users\Public\Pixologic\GoZBrush\GoZ_Materials`
- **macOS ZBrush Plugins**: `/Applications/Maxon ZBrush 2025/ZStartup/ZPlugs64`

---

## Agent Operational Directive
> **MANDATORY**: When diagnosing high-poly mesh issues, verify that subdivision levels match required detail density. Use `MeshIntegrity -> Fix Mesh` to repair non-manifold topology before running ZRemesher or DynaMesh operations.
