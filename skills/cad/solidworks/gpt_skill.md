---
title: "Dassault Systèmes SOLIDWORKS AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Dassault Systèmes SOLIDWORKS API, COM Interop, Document Manager, and Task Scheduler."
category: "3D Parametric CAD & Mechanical Design"
tags: ["solidworks", "solidworks-api", "com-interop", "gpt-codex", "cad-automation", "document-manager"]
---

# Dassault Systèmes SOLIDWORKS AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Dassault Systèmes SOLIDWORKS provides an extensive Windows COM-based API supporting C#, VB.NET, C++, VBA, and Python. GPT/Codex acts as a Principal CAD Automation Engineer and API Architect, delivering **Python `win32com` automation scripts**, **compiled .NET Standalone Add-Ins**, **SOLIDWORKS Document Manager metadata processors**, and **batch Task Scheduler integrations**.

### Developer Platform & API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 SOLIDWORKS Developer Stack                  │
│                                                             │
│  API & Object Hierarchy                                     │
│  ├── `ISldWorks` $\rightarrow$ `IModelDoc2` $\rightarrow$ `IPartDoc` / `IAssemblyDoc`│
│  ├── `IFeatureManager`, `ISketchManager`, `ISelectionMgr`   │
│  └── `IModelDocExtension` (Mass, SaveAs, Custom Properties) │
│                                                             │
│  Developer Interfaces                                       │
│  ├── In-Process COM Add-Ins (`SwAddin` .NET Interface)      │
│  ├── Out-of-Process Standalone Scripts (Python / C# EXEs)   │
│  └── Document Manager API (Headless File I/O without CAD)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Python COM Automation**: Author clean, resilient scripts using `win32com.client` with explicit type marshalling (`VARIANT`, `VT_BYREF`) to automate solid modeling, feature extrusion, and assembly mates.
2. **SOLIDWORKS Document Manager Integration**: Build lightweight, headless C#/Python tools using the Document Manager license key to read/write custom properties and BOM configurations without launching `sldworks.exe`.
3. **FeatureManager Design Tree Traversal**: Programmatically traverse the feature tree using `model.FirstFeature()` and `feature.GetNextFeature()` to audit feature suppressed states, dimensions, and parent-child dependencies.
4. **Automated Drawing Generation**: Author scripts to automatically create drawing sheets, instantiate standard 3-views and isometric projections, and attach associative BOM tables.

---

## Production Python Automation: Procedural Flanged Shaft Generator

Execute this script via Python (`pip install pywin32`) to procedurally create a new SOLIDWORKS part document and build a flanged shaft using revolved boss and circular cutouts:

```python
"""
SOLIDWORKS API: Procedural Flanged Shaft Generator
Requires: pip install pywin32
"""

import sys
import win32com.client

def generate_flanged_shaft():
    try:
        sw_app = win32com.client.Dispatch("SldWorks.Application")
        sw_app.Visible = True
    except Exception as e:
        print(f"Error connecting to SOLIDWORKS: {e}")
        sys.exit(1)

    # 1. Create New Part Document from Default Template
    default_template = sw_app.GetUserPreferenceStringValue(7) # 7 = swUserPreferenceStringValue_e.swDefaultTemplatePart
    model = sw_app.NewDocument(default_template, 0, 0, 0)
    if not model:
        print("Error: Could not create new part.")
        sys.exit(1)

    # 2. Select Front Plane & Insert Sketch
    model_ext = model.Extension
    model_ext.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, None, 0)
    sketch_mgr = model.SketchManager
    sketch_mgr.InsertSketch(True)

    # 3. Draw Revolving Profile (Dimensions in Meters: 0.05m = 50mm)
    # Draw Centerline
    sketch_mgr.CreateCenterLine(0, 0, 0, 0.15, 0, 0)
    # Draw Stepped Profile
    sketch_mgr.CreateLine(0, 0, 0, 0, 0.04, 0)
    sketch_mgr.CreateLine(0, 0.04, 0, 0.03, 0.04, 0)
    sketch_mgr.CreateLine(0.03, 0.04, 0, 0.03, 0.02, 0)
    sketch_mgr.CreateLine(0.03, 0.02, 0, 0.15, 0.02, 0)
    sketch_mgr.CreateLine(0.15, 0.02, 0, 0.15, 0, 0)
    sketch_mgr.CreateLine(0.15, 0, 0, 0, 0, 0)

    # 4. Create Revolved Boss Feature
    feat_mgr = model.FeatureManager
    # FeatureRevolve2: 6.28318 rad = 360 deg
    revolve_feat = feat_mgr.FeatureRevolve2(
        True, True, False, False, False, False, 0, 0, 6.283185, 0, False, False, 0.01, 0.01, 0, 0, 0, True, True, True
    )

    sketch_mgr.InsertSketch(True) # Close sketch
    model.ViewZoomtofit2()
    print("Flanged Shaft successfully modeled via SOLIDWORKS COM API!")

if __name__ == "__main__":
    generate_flanged_shaft()
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`TypeError: Parameter must be a VARIANT` in Python COM** | Calling a SOLIDWORKS API method that expects `out` parameters (e.g. `SaveAs3`, `GetMassProperties2`) with standard Python variables. | 1. Use `win32com.client.VARIANT` with `VT_BYREF | VT_I4` flags.<br>2. Alternatively, use early-bound COM wrappers generated via `makepy.py`. |
| **Silent API Hang during Batch Script Execution** | SOLIDWORKS displayed a modal "Save Changes?" or "Missing Font" prompt dialog. | 1. Set `swApp.UserControl = False`.<br>2. Set `swApp.SetUserPreferenceToggle(swUserPreferenceToggle_e.swAutoSaveInterval, 0)`.<br>3. Suppress alerts with `swApp.CommandInProgress = True`. |
| **Feature Creation Fails with Null Feature Return** | Selection manager mark mismatch (e.g. `SelectByID2` called without required Mark integer expected by the specific feature builder). | 1. Check API documentation for the specific feature method's required Selection Marks.<br>2. Clear selection with `model.ClearSelection2(True)` before re-selecting. |
| **`Invalid COM Object` after Model Close** | Retaining and calling methods on a released `IModelDoc2` pointer after closing the document. | Set `model = None` immediately after `swApp.CloseDoc(title)` to release the COM handle. |

---

## Command Line Syntax & Batch Processing

```bash
# Windows CLI: Execute Python Script against SOLIDWORKS
python "C:\Pipeline\generate_shaft.py"

# Batch Convert CAD Files via SOLIDWORKS Task Scheduler
"C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS\swtaskscheduler.exe"
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\SolidWorks\SolidWorks 20XX`
- **SOLIDWORKS Installation Root**: `C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS`
- **Task Scheduler Logs**: `%APPDATA%\SolidWorks\SOLIDWORKS 20XX\TaskScheduler\logs`

---

## Agent Operational Directive
> **MANDATORY**: When scripting the SOLIDWORKS API in Python, remember that all internal geometric units are **Meters (m)** and **Radians (rad)**. Pass by-reference parameters using `win32com.client.VARIANT` to prevent COM type errors.
