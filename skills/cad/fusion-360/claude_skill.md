---
title: "Autodesk Fusion (Fusion 360) AI Skill Guide (Claude)"
description: "Comprehensive operational skill specification for Anthropic Claude to automate, script, troubleshoot, and optimize Autodesk Fusion (Fusion 360), Python API (adsk.fusion), Parametric Timeline, and CAM toolpaths."
category: "Cloud-Integrated CAD/CAM/PCB Platform"
tags: ["fusion-360", "autodesk-fusion", "adsk-python", "parametric-cad", "cam-toolpaths", "claude"]
---

# Autodesk Fusion (Fusion 360) AI Skill Guide (Claude)

## Overview & Engine Architecture
Autodesk Fusion (formerly Fusion 360) is a cloud-integrated parametric and direct modeling CAD/CAM/CAE/ECAD ecosystem. Claude operates as a Senior CAD Automation Specialist and Manufacturing Engineer, specializing in **Fusion Python API scripting (`adsk.core`, `adsk.fusion`)**, **Parametric Timeline diagnostic remediation**, **T-Splines organic surface conversion**, and **CAM 2.5D/3D adaptive toolpath optimization**.

### Fusion 360 Cloud-Hybrid Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Fusion 360 Architecture Core                │
│                                                             │
│  Design & Manufacturing Workspaces                          │
│  ├── Parametric B-Rep Timeline & Direct Modeling Modes      │
│  ├── T-Splines Form Workspace (Subdivision to Solid B-Rep)  │
│  ├── CAM / Manufacturing (Adaptive Clearing & Post-Process) │
│  └── Electronics (Eagle PCB & 3D Component Packaging)       │
│                                                             │
│  Developer & Cloud Subsystems                               │
│  ├── In-Process Python 3.11 Execution Engine (`adsk` APIs)  │
│  ├── Autodesk Fusion Team Cloud Data Hub (Versioned F3D/F3Z)│
│  └── Offline Storage & Local Cache Sync Daemon              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Fusion Python API Development**: Write robust, modular Python add-ins and standalone scripts utilizing `adsk.core` and `adsk.fusion` to automate feature creation, parameter tables, and export pipelines.
2. **Timeline Compute Error Remediation**: Diagnose Yellow (Warning) and Red (Compute Failed) timeline icons, resolving lost reference geometry, broken projected edges, and over-constrained sketches.
3. **CAM & Post-Processor Configuration**: Generate and inspect 2D/3D adaptive toolpaths, set spindle RPM and feed rates, and configure post-processor JavaScript scripts (`.cps`) for CNC controllers (Haas, Fanuc, GRBL).
4. **Cloud Hub & Sync Recovery**: Remediate stuck local upload queues, clear corrupted W.Cache stores, and manage multi-user team hub branching.

---

## Production Python Automation: Parametric Enclosure Box Generator

Run this script inside Fusion 360 Script Manager (*Utilities $\rightarrow$ Scripts and Add-Ins*) to procedurally generate a parametric electronic enclosure box with a shell cavity and rounded corner fillets:

```python
"""
Autodesk Fusion: Parametric Enclosure Box Generator
Creates a fully constrained parametric box with Shell and Fillet features.
"""

import adsk.core
import adsk.fusion
import traceback

def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui  = app.userInterface
        doc = app.documents.add(adsk.core.DocumentTypes.FusionDesignDocumentType)
        design = app.activeProduct
        root_comp = design.rootComponent

        # 1. Setup User Parameters
        user_params = design.userParameters
        p_len = user_params.add("BoxLength", adsk.core.ValueInput.createByString("120 mm"), "mm", "Length")
        p_wid = user_params.add("BoxWidth", adsk.core.ValueInput.createByString("80 mm"), "mm", "Width")
        p_hgt = user_params.add("BoxHeight", adsk.core.ValueInput.createByString("40 mm"), "mm", "Height")
        p_thk = user_params.add("WallThickness", adsk.core.ValueInput.createByString("3 mm"), "mm", "Thickness")

        # 2. Create Base Sketch on XY Plane
        sketches = root_comp.sketches
        xy_plane = root_comp.xYConstructionPlane
        sketch = sketches.add(xy_plane)

        # Draw Center Rectangle
        lines = sketch.sketchCurves.sketchLines
        rec = lines.addCenterPointRectangle(adsk.core.Point3D.create(0, 0, 0), adsk.core.Point3D.create(6, 4, 0))

        # Add Dimensions
        sketch.sketchDimensions.addDistanceDimension(
            rec.item(0).startSketchPoint, rec.item(0).endSketchPoint,
            adsk.fusion.DimensionOrientations.HorizontalDimensionOrientation,
            adsk.core.Point3D.create(0, 5, 0)
        ).parameter.expression = "BoxLength"

        sketch.sketchDimensions.addDistanceDimension(
            rec.item(1).startSketchPoint, rec.item(1).endSketchPoint,
            adsk.fusion.DimensionOrientations.VerticalDimensionOrientation,
            adsk.core.Point3D.create(7, 0, 0)
        ).parameter.expression = "BoxWidth"

        # 3. Create Extrude Feature
        prof = sketch.profiles.item(0)
        extrudes = root_comp.features.extrudeFeatures
        ext_input = extrudes.createInput(prof, adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
        distance = adsk.core.ValueInput.createByString("BoxHeight")
        ext_input.setDistanceExtent(False, distance)
        extrude_feat = extrudes.add(ext_input)
        body = extrude_feat.bodies.item(0)

        # 4. Create Shell Feature (Hollow top face)
        top_face = None
        for face in body.faces:
            if face.geometry.normal.z > 0.9:
                top_face = face
                break

        if top_face:
            shell_faces = adsk.core.ObjectCollection.create()
            shell_faces.add(top_face)
            shells = root_comp.features.shellFeatures
            shell_input = shells.createInput(shell_faces, False)
            shell_input.insideThickness = adsk.core.ValueInput.createByString("WallThickness")
            shells.add(shell_input)

        ui.messageBox("Parametric Enclosure Box Created Successfully!")

    except Exception:
        if ui:
            ui.messageBox(f"Execution Failed:\n{traceback.format_exc()}")

```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Timeline Compute Failed (`Red Warning Icon`) on Extrude** | The underlying sketch profile lost its closed boundary or a referenced projected edge was deleted. | 1. Right-click the red Timeline feature $\rightarrow$ **Review Warnings**.<br>2. Right-click $\rightarrow$ **Edit Sketch**.<br>3. Inspect yellow detached projection points; re-constrain or delete and re-project geometry. |
| **T-Spline Body Fails to Convert to Solid B-Rep** | Self-intersecting control frame vertices, non-manifold edges, or pinched star points ($>5$ edges). | 1. In Form workspace, run *Utilities $\rightarrow$ Repair Body*.<br>2. Set mode to **Auto Repair** to remove degenerate faces.<br>3. Toggle *Box View (`Alt + 1`)* to locate self-intersecting T-Spline faces. |
| **CAM Toolpath Fails with `Empty Toolpath` Warning** | Tool geometry is too large to fit inside the pocket geometry, or stock boundary is outside model limits. | 1. In CAM Setup, verify Stock dimensions.<br>2. Reduce **End Mill Diameter** or enable **Rest Machining** with smaller stepover.<br>3. Lower the **Minimum Cutting Radius** in toolpath Passes settings. |
| **Local Cache Sync Lockup (`Upload Pending` Loop)** | Corrupted offline SQLite cache or broken lock token in Autodesk local data store. | 1. Close Fusion 360.<br>2. Navigate to `%LOCALAPPDATA%\Autodesk\Autodesk Fusion 360\<ID>\W.Cache` and delete `.dirty` or lock files.<br>3. Relaunch Fusion with active internet connection. |

---

## Command Line Syntax & Configuration

```bash
# Windows CLI: Launch Fusion 360 with Clean Cache / Safe Mode
"C:\Users\%USERNAME%\AppData\Local\Autodesk\webdeploy\production\<BUILD_ID>\Fusion360.exe" -safeMode

# Launch Service Utility to Repair / Reset Fusion Installation
"C:\Users\%USERNAME%\AppData\Local\Autodesk\webdeploy\production\<BUILD_ID>\Fusion360ServiceUtility.exe"

# macOS Launch Command
open /Applications/Autodesk\ Fusion\ 360.app --args -safeMode
```

### Essential File & Directory Paths
- **Windows Python Add-Ins**: `%APPDATA%\Autodesk\Autodesk Fusion 360\API\AddIns`
- **Windows Python Scripts**: `%APPDATA%\Autodesk\Autodesk Fusion 360\API\Scripts`
- **Windows Local Offline Cache**: `%LOCALAPPDATA%\Autodesk\Autodesk Fusion 360\<USER_ID>\W.Cache`
- **macOS Python Add-Ins**: `~/Library/Application Support/Autodesk/Autodesk Fusion 360/API/AddIns`

---

## Agent Operational Directive
> **MANDATORY**: Python automation in Fusion must always check for valid geometry selections, wrap code in `try...except` blocks with `traceback.format_exc()`, and parameterize dimensions through `design.userParameters` rather than hardcoding magic numbers.
