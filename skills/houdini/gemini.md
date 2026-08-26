---
title: "SideFX Houdini AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, script, automate, and troubleshoot SideFX Houdini simulations, Karma XPU rendering, and PDG networks."
category: "Procedural VFX & Simulation"
tags: ["houdini", "solaris-karma", "materialx", "pdg-tops", "gemini", "sim-diagnostics", "vex"]
---

# SideFX Houdini AI Skill Guide (Gemini)

## Overview & Engine Architecture
SideFX Houdini provides procedural visual effects, large-scale destruction, fluid dynamics, and USD lighting (Solaris). Gemini operates as an AI VFX Supervisor and Pipeline TD, specializing in **visual simulation artifact diagnosis**, **MaterialX shader network construction**, **Karma XPU hybrid rendering**, and **PDG/TOPs task-graph execution**.

### Procedural Data Flow & Solaris Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                 Houdini Procedural Data Pipeline            │
│                                                             │
│  SOP / DOP Procedural Layer                                 │
│  ├── Geometry Generation & VEX Point Transformations        │
│  ├── Dynamic Solvers (Pyro, FLIP, Vellum, Bullet RBD)       │
│  └── Point Clouds & OpenVDB Volume Grids (density, vel)     │
│                                                             │
│  Solaris USD & Karma Subsystem (LOPS)                       │
│  ├── Hydra Stage Composition & Sublayer References          │
│  ├── MaterialX Shading Networks (Standard Surface, Mtlx)    │
│  └── Karma XPU Engine (OptiX / Metal GPU Acceleration)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Visual Simulation Triage**: Analyze screenshots of viewport simulation flipbooks to diagnose volume stair-stepping, collision shearing, mesh pinching in Vellum, and pyro dissipation rate issues.
2. **MaterialX Shader Authoring**: Construct declarative MaterialX node networks in Solaris LOPs, wiring PBR albedo, roughness, normal, and displacement components for Karma XPU.
3. **VEX Geometry Wrangling**: Generate vectorized VEX expressions to calculate surface curvature, voronoi fracture clustering, and ambient occlusion point colors (`@Cd`).
4. **PDG Dependency Graph Diagnostics**: Troubleshoot stalled work items, missing wedge attributes, and farm submission failures in TOP networks.

---

## Production VEX Snippet: Surface Curvature & Wear Masking

Use this snippet in a **Point Wrangle** to procedurally compute surface curvature and edge wear for dynamic procedural shading:

```c
// Measure average distance to neighboring points to calculate curvature
int neighbors[] = neighbours(0, @ptnum);
int count = len(neighbors);
vector avg_pos = {0, 0, 0};

for (int i = 0; i < count; i++) {
    avg_pos += point(0, "P", neighbors[i]);
}

avg_pos /= float(max(count, 1));
vector diff = @P - avg_pos;

// Project difference onto surface normal
float curvature = dot(diff, @N) * chf("curvature_intensity");

// Modulate with 3D Simplex Noise
float noise_val = snoise(@P * chf("noise_freq"));
float wear = clamp(curvature + noise_val * chf("noise_amount"), 0.0, 1.0);

// Assign wear mask to point color and export custom attribute
@Cd = lerp(chv("base_color"), chv("edge_wear_color"), wear);
f@edge_wear = wear;
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Pyro Volume Stair-Stepping / Blocky Voxels** | Voxel resolution (Division Size) is too coarse, or smoke volume interpolation is set to linear. | 1. In Smoke Object / Pyro Solver, decrease **Division Size** (e.g. 0.05 $\rightarrow$ 0.02).<br>2. Enable **Dual Rest Fields** for continuous high-res advection.<br>3. Set Volume Filter to *Catmull-Rom* or *Mitchell* in render settings. |
| **Karma Render Grain / Fireflies in Indirect Light** | Insufficient indirect diffuse/specular samples or missing variance thresholding. | 1. Enable **Variance Anti-Aliasing** in Karma LOP (set threshold to `0.01`).<br>2. Increase **Max Secondary Ray Samples**.<br>3. Attach an **NVIDIA OptiX or Intel OIDN Denoise** pass in the render output settings. |
| **Vellum Pinching / Inverted Tet Meshes** | Extreme external forces or rapid collisions inverted tetrahedron geometry. | 1. In Vellum Solver, increase **Constraint Iterations** (default 100 $\rightarrow$ 250).<br>2. Enable **Inverted Tetrahedron Restorer** on the Vellum Constraint node.<br>3. Check collision mesh for non-manifold edges. |
| **USD Asset Missing Materials in Solaris Stage** | Target MaterialX primitive path binding is incorrect or sublayer was muted. | 1. Open Scene Graph Tree in Solaris.<br>2. Inspect `/materials/` scope and ensure target geometry has `material:binding` attribute pointing to valid prim.<br>3. Use **Assign Material LOP** to explicitly enforce binding. |

---

## Command Line Syntax & Batch Execution

```bash
# Windows CLI: Cook TOP Network via Hython
"C:\Program Files\Side Effects Software\Houdini 20.5.278\bin\hython.exe" -c "import hou; top = hou.node('/obj/topnet1'); top.dirtyAllWorkItems(True); top.cookWorkItems(True)"

# Linux CLI: Batch Render Karma USD Frames
husk -o "/renders/frame.exr" --usd-input "/usd/stage.usd" --frame 1 --frame-count 100 --renderer KarmaXPU

# Headless HScript Batch Tool
hbatch -c "render /out/mantra_fx" "C:\VFX\shot_040.hip"
```

### Key Configuration Locations
- **Windows User Preferences**: `%USERPROFILE%\Documents\houdini20.5`
- **Linux User Preferences**: `$HOME/houdini20.5`
- **Karma Cache Path**: `%LOCALAPPDATA%\SideFX\Karma`

---

## Agent Operational Directive
> **MANDATORY**: When diagnosing simulation artifacts, check voxel division sizes, substepping parameters, and normal orientations. Construct Solaris shading pipelines using standard MaterialX nodes for full Karma XPU GPU acceleration.
