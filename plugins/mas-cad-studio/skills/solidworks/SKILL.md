---
name: solidworks
description: "Comprehensive operational skill specification for Anthropic Claude to automate, script, troubleshoot, and optimize Dassault Systèmes SOLIDWORKS, COM/VBA API, FeatureManager trees, and assembly mates."
category: cad
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["solidworks", "sldworks-api", "parametric-cad", "win32com", "assembly-mates", "claude", "cad-automation"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Dassault Systèmes SOLIDWORKS AI Skill Guide (Claude)

## Overview & Engine Architecture
Dassault Systèmes SOLIDWORKS is the global standard for mechanical engineering, product design, sheet metal fabrication, and finite element analysis (FEA). Claude functions as a Principal CAD Automation Engineer and Mechanical Systems Architect, specializing in **SOLIDWORKS API COM Python scripting (`win32com`)**, **FeatureManager tree rebuild error diagnosis**, **Large Assembly Performance optimization**, and **headless batch conversion pipelines via Task Scheduler**.

### SOLIDWORKS System Architecture & Parasolid Engine

```
┌─────────────────────────────────────────────────────────────┐
│                 SOLIDWORKS Core Architecture                │
│                                                             │
│  Mechanical Design Subsystems                               │
│  ├── Parasolid B-Rep Modeling Kernel & FeatureManager Tree  │
│  ├── Assembly Mate Constraint Solver (D-Cubed 3D DCM Engine)│
│  ├── Sheet Metal Unfolding (K-Factor, Bend Tables, Flat Srf)│
│  └── SOLIDWORKS Simulation (COSMOS FEA / Flow CFD Engine)   │
│                                                             │
│  Automation & Development Stack                             │
│  ├── Windows COM Type Library (`SldWorks.Application`)      │
│  ├── VBA Macro Engine (`.swp`) & Standalone .NET Interop    │
│  └── Document Manager API (Headless Metadata Extraction)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Python COM Automation (`win32com.client`)**: Write deterministic scripts to interface with `SldWorks.Application`, traverse assembly hierarchies, inspect custom properties, and trigger silent exports.
2. **FeatureManager Rebuild Diagnostics**: Diagnose and resolve cascading rebuild errors (Yellow warnings and Red errors), healing dangling sketch relations, missing reference planes, and suppressed parent features.
3. **Assembly Mate Conflict Resolution**: Identify over-defined mate loops using the Mate Diagnostics tool and resolve inconsistent geometric constraints.
4. **Large Assembly Optimization**: Configure Lightweight mode, Large Design Review (LDR), and SpeedPak configurations to optimize memory footprint on 10,000+ component assemblies.

---

## Production Python Automation: Batch Mass Evaluator & STEP AP214 Exporter

Save and run this script via Python (`pip install pywin32`) to connect to an active SOLIDWORKS session, compute the mass and center of gravity, and export a STEP file:

```python
"""
SOLIDWORKS Automation: Mass Evaluator & STEP AP214 Exporter
Requires: pip install pywin32
"""

import sys
import os
import win32com.client

# SOLIDWORKS Document Type Constants
swDocPART = 1
swDocASSEMBLY = 2
swDocDRAWING = 3

def process_active_solidworks_document(output_step_path: str):
    try:
        # 1. Connect to Active SOLIDWORKS Application
        sw_app = win32com.client.Dispatch("SldWorks.Application")
        sw_app.Visible = True
    except Exception as e:
        print(f"Error: Could not connect to SOLIDWORKS instance: {e}")
        sys.exit(1)

    # 2. Get Active Model Document
    model = sw_app.IActiveDoc2
    if not model:
        print("Error: No active document found in SOLIDWORKS.")
        sys.exit(1)

    doc_title = model.GetTitle()
    doc_type = model.GetType()
    print(f"Active Document: {doc_title} (Type: {doc_type})")

    # 3. Calculate Mass & Center of Gravity (Extension.CreateMassProperty)
    model_ext = model.Extension
    mass_prop = model_ext.CreateMassProperty()
    if mass_prop:
        mass_kg = mass_prop.Mass
        volume_m3 = mass_prop.Volume
        cg = mass_prop.CenterOfMass # Array of [X, Y, Z] in meters
        print(f"Physical Analysis -> Mass: {mass_kg:.4f} kg | Volume: {volume_m3:.6f} m^3")
        print(f"Center of Gravity -> X: {cg[0]*1000:.2f}mm, Y: {cg[1]*1000:.2f}mm, Z: {cg[2]*1000:.2f}mm")

    # 4. Export to STEP AP214
    os.makedirs(os.path.dirname(os.path.abspath(output_step_path)), exist_ok=True)
    # SaveAs3: 0 = swSaveAsCurrentVersion, 2 = swSaveAsCopy
    errors = win32com.client.VARIANT(win32com.client.pythoncom.VT_BYREF | win32com.client.pythoncom.VT_I4, 0)
    warnings = win32com.client.VARIANT(win32com.client.pythoncom.VT_BYREF | win32com.client.pythoncom.VT_I4, 0)
    
    success = model_ext.SaveAs3(output_step_path, 0, 2, None, None, errors, warnings)
    if success:
        print(f"Successfully exported STEP file: {output_step_path}")
    else:
        print(f"Export failed with error code: {errors.value}")

if __name__ == "__main__":
    process_active_solidworks_document("C:/Export/Validated_Assembly.step")
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Cascading Rebuild Errors (`Yellow & Red Feature Tree Icons`)** | A parent sketch plane or edge was modified/deleted, leaving child sketches with dangling references. | 1. Right-click the top red feature $\rightarrow$ **What's Wrong?**.<br>2. Edit the sketch $\rightarrow$ Open **Display/Delete Relations**.<br>3. Filter by **Dangling**; click *Replace* to re-attach to new geometry or delete obsolete relations.<br>4. Force rebuild using `Ctrl + Q`. |
| **Assembly Over-Defined Mate Error (`Red Mate Folder`)** | Two or more mates enforce conflicting geometric degrees of freedom (e.g. Coincident + Distance on parallel faces). | 1. Click **Mate Diagnostics** in the Assembly toolbar.<br>2. Identify the over-constraining mate loop.<br>3. Suppress mates one by one to locate the conflicting constraint.<br>4. Replace rigid coincident mates with flexible slots or width mates. |
| **Large Assembly Freezes During Viewport Rotation** | Heavy assemblies loaded fully resolved in GPU RAM with high display image quality settings. | 1. In *Options $\rightarrow$ Performance*, enable **Large Assembly Settings**.<br>2. Set components to **Lightweight Mode**.<br>3. Open sub-assemblies and create a **SpeedPak** configuration to simplify geometry. |
| **Sheet Metal Flat Pattern Fails to Unfold** | Formed feature or non-planar bend exceeds the material bend allowance limit or contains overlapping corners. | 1. In Flat Pattern feature, verify **Corner Relief** settings (change to *Obround* or *Tear*).<br>2. Check bend table or K-Factor ($0.33-0.50$).<br>3. Ensure all non-planar faces are created using standard sheet metal tools. |

---

## Command Line Syntax & Batch Processing

```bash
# Windows CLI: Launch SOLIDWORKS with Macro Execution
"C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS\sldworks.exe" /m "C:\Macros\batch_export.swp"

# Launch SOLIDWORKS in Safe Mode (Bypass Tools & Add-Ins)
"C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS\sldworks.exe" /r

# Run Standalone SOLIDWORKS Rx Diagnostic Suite
"C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS\sldrx.exe"
```

### Essential File Locations & Registry Keys
- **Windows User Settings**: `%APPDATA%\SolidWorks\SolidWorks 20XX`
- **SOLIDWORKS System Settings Registry**: `HKCU\Software\SolidWorks\SOLIDWORKS 20XX`
- **SOLIDWORKS Document Manager Registry**: `HKLM\Software\SolidWorks\SOLIDWORKS Document Manager`

---

## Agent Operational Directive
> **MANDATORY**: Force full geometric rebuilds using `Ctrl + Q` rather than `Ctrl + B` after modifying sketches and equations. When automating SOLIDWORKS via COM, always check `model_ext.SaveAs3` error codes to verify file export integrity.
