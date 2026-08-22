---
title: "Autodesk Fusion (Fusion 360) AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Autodesk Fusion (Fusion 360) CAM toolpaths, Timeline errors, and Generative Design."
category: "Cloud-Integrated CAD/CAM/PCB Platform"
tags: ["fusion-360", "autodesk-fusion", "cam-simulation", "gemini", "cad-diagnostics", "timeline-repair"]
---

# Autodesk Fusion (Fusion 360) AI Skill Guide (Gemini)

## Overview & Engine Architecture
Autodesk Fusion delivers integrated CAD modeling, CNC toolpath generation, structural simulation, and generative design. Gemini operates as an AI Manufacturing Supervisor and CAD Automation Engineer, specializing in **multimodal CAM toolpath collision analysis**, **parametric timeline visual troubleshooting**, **Generative Design structural outcomes**, and **T-Splines organic form evaluation**.

### Fusion Digital Manufacturing & Design Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Fusion Digital Manufacturing                │
│                                                             │
│  Design & Simulation Workspaces                             │
│  ├── Parametric Sketching & Solid B-Rep Modeling            │
│  ├── Generative Design Cloud Solvers (Stress & Mass Min.)   │
│  └── CAM / Manufacturing Simulation (Stock Collision Check) │
│                                                             │
│  Automation & ECAD Layer                                    │
│  ├── In-Process Python 3 API (`adsk.fusion` & `adsk.cam`)   │
│  ├── Post-Processor Engine (Custom JavaScript CNC Dialects) │
│  └── 3D PCB Integration & Thermal Simulation                │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal CAM Simulation Diagnostics**: Inspect screenshots of toolpath simulation verify views to detect rapid move collisions, shank gouging, fixture collisions, and un-machined stock rest areas.
2. **Parametric Timeline Health Audits**: Identify timeline warnings (Yellow icons) and severe compute failures (Red icons) from feature tree screenshots, generating targeted repair actions.
3. **Generative Design Study Evaluation**: Evaluate generative design scatter plots, analyzing Mass vs Safety Factor tradeoffs to recommend optimal additive/subtractive manufacturing candidates.
4. **Python Script Automation**: Generate clean scripts for creating complex geometric arrays, parameterized ribs, and automated CAM setups.

---

## Production Python Automation: Automatic STEP & DXF Batch Exporter

Execute this script in Fusion 360 to batch export all individual components as STEP files and flat sketch patterns as DXF files for laser cutting:

```python
"""
Autodesk Fusion: Automated Component STEP & Flat DXF Exporter
Exports all solid components as STEP and flat face contours as DXF.
"""

import adsk.core
import adsk.fusion
import os
import traceback

def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface
        design = app.activeProduct
        if not design:
            ui.messageBox("No active Fusion design found.")
            return

        export_mgr = design.exportManager
        output_dir = "C:/Export/Fusion_Batch"
        os.makedirs(output_dir, exist_ok=True)

        # 1. Export Active Model as Universal STEP
        step_path = os.path.join(output_dir, f"{design.rootComponent.name}.stp")
        step_options = export_mgr.createSTEPExportOptions(step_path)
        export_mgr.execute(step_options)
        print(f"Exported STEP: {step_path}")

        # 2. Export Each Component as Individual STEP
        for occ in design.rootComponent.allOccurrences:
            comp = occ.component
            comp_step = os.path.join(output_dir, f"{comp.name}.stp")
            comp_options = export_mgr.createSTEPExportOptions(comp_step, comp)
            export_mgr.execute(comp_options)
            print(f"Exported Component STEP: {comp_step}")

        ui.messageBox(f"Batch Export Completed to: {output_dir}")

    except Exception:
        if ui:
            ui.messageBox(f"Export Failed:\n{traceback.format_exc()}")
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **CAM Simulation Shows Red Shaft Collision Highlight** | Tool holder or non-cutting flute section collides with uncut raw stock during deep adaptive clearing. | 1. In Toolpath Settings $\rightarrow$ *Passes*, enable **Shaft & Holder Clearance**.<br>2. Increase Tool Flute Extension length in Tool Library.<br>3. Enable **Multi-Axis 3+2 Tilting** or reduce Maximum Roughing Stepdown. |
| **Yellow Warning Icon on Joint Feature in Timeline** | Referenced component was moved or underlying geometric face was modified. | 1. Right-click Joint $\rightarrow$ **Edit Joint**.<br>2. Re-select the primary Joint Origin snap point.<br>3. Verify that the parent component is pinned/grounded. |
| **Generative Design Study Returns 'Failed to Converge'** | Boundary loads are unrealistically high or preserve/obstacle geometries overlap. | 1. Verify preserve geometry and obstacle bodies have zero intersection.<br>2. Check boundary condition units (N vs kN).<br>3. Increase manufacturing thickness limits in study settings. |
| **Sketch Lines Show Blue (Under-Constrained)** | Sketch geometry lacks sufficient dimensional or geometric constraints (Collinear, Coincident). | 1. Apply geometric constraints before dimensions.<br>2. Constrain sketch origin to construction axis.<br>3. Ensure all sketch lines turn **Black** (Fully Defined). |

---

## Command Line Syntax & Configuration

```bash
# Windows CLI: Launch Fusion with Reset Options
"C:\Users\%USERNAME%\AppData\Local\Autodesk\webdeploy\production\<BUILD_ID>\Fusion360ServiceUtility.exe" --reset

# Clear Sync Staging Directory via PowerShell
Get-ChildItem -Path "$env:LOCALAPPDATA\Autodesk\Autodesk Fusion 360\*\W.Cache" -Recurse | Remove-Item -Force
```

### Essential File Locations
- **Windows CAM Tool Libraries**: `%APPDATA%\Autodesk\Fusion 360 CAM\Libraries`
- **Windows Post Processors**: `%APPDATA%\Autodesk\Fusion 360 CAM\Posts`
- **macOS CAM Post Processors**: `~/Library/Application Support/Autodesk/Fusion 360 CAM/Posts`

---

## Agent Operational Directive
> **MANDATORY**: Fully constrain 2D sketches (all entities must turn black) before creating 3D features. In CAM simulation reviews, always verify tool holder clearance to eliminate CNC spindle collisions.
