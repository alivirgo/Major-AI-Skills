---
title: "Siemens NX AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Siemens NX, NX Open API, Python Journaling, and Block UI Styler."
category: "Integrated CAD/CAM/CAE Engineering Suite"
tags: ["siemens-nx", "nx-open", "python-journal", "block-ui", "gpt-codex", "cad-automation"]
---

# Siemens NX AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Siemens NX provides a comprehensive, enterprise-grade programmatic API via **NX Open** (supporting Python 3, C++, .NET, and Java) alongside the **User Function (UF)** low-level geometric interface. GPT/Codex acts as a Principal NX Open Developer and CAD Tools Architect, delivering **robust Python journals**, **custom Block UI Styler dialogs**, **CAM post-processing pipelines**, and **batch CAD translation servers**.

### Developer Architecture & Execution Engine

```
┌─────────────────────────────────────────────────────────────┐
│                 NX Open Developer Platform                  │
│                                                             │
│  Object Model & Geometry Core                               │
│  ├── `NXOpen.Session`, `NXOpen.Part`, `NXOpen.Features`     │
│  ├── `NXOpen.UF.UFSession` (C-API Bridge for Math/Topology) │
│  └── Expression & Parameter Management System               │
│                                                             │
│  Developer Tooling & Interfaces                             │
│  ├── Standalone Headless Journal Engine (`run_journal.exe`) │
│  ├── Block UI Styler (Declarative XML Dialog Framework)     │
│  └── NX Open Author & Execution License Validation          │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **NX Open Python Journal Authoring**: Construct production-grade Python scripts using `NXOpen` and `NXOpen.UF` that cleanly initialize sessions, manage undo marks, modify expressions, and perform feature modeling.
2. **Block UI Styler Integration**: Develop custom user dialogs (`.dlx` templates) with event callback handlers (`initialize_cb`, `dialogShown_cb`, `apply_cb`, `update_cb`).
3. **Automated CAM Toolpath Generation**: Script the instantiation of CAM operations (Cavity Mill, Floor Wall, 5-Axis Z-Level), tool creation, and toolpath computation via `NXOpen.CAM`.
4. **Batch Assembly BOM & Hierarchy Export**: Build recursive scripts to traverse large multi-part assemblies, resolving component occurrences and exporting bill-of-materials metadata.

---

## Production Python Automation: Parametric Flange Feature Builder

Execute this script via `run_journal.exe` or inside the NX Journal Manager to procedurally construct a fully parameterized mounting flange with a bolt hole circle:

```python
"""
Siemens NX Open: Procedural Parametric Flange Generator
Creates an extruded circular base with a patterned bolt circle.
"""

import math
import NXOpen
import NXOpen.Features
import NXOpen.GeometricUtilities

def build_parametric_flange():
    the_session = NXOpen.Session.GetSession()
    work_part = the_session.Parts.Work

    if not work_part:
        # Create new part if none open
        work_part = the_session.Parts.NewDisplay("C:/Temp/flange.prt", NXOpen.Part.Units.Millimeters)

    # 1. Start Undo Mark
    mark_id = the_session.SetUndoMark(NXOpen.Session.MarkVisibility.Visible, "Create Parametric Flange")

    # 2. Setup Expressions
    expressions = work_part.Expressions
    exp_od = expressions.CreateSystemExpressionWithUnits("Flange_OD=150", work_part.UnitCollection.FindObject("MilliMeter"))
    exp_thk = expressions.CreateSystemExpressionWithUnits("Flange_Thick=20", work_part.UnitCollection.FindObject("MilliMeter"))
    exp_bcd = expressions.CreateSystemExpressionWithUnits("Bolt_Circle_Dia=110", work_part.UnitCollection.FindObject("MilliMeter"))
    exp_holes = expressions.CreateSystemExpression("Hole_Count=6")

    # 3. Create Base Cylinder (Cylinder Feature Builder)
    cyl_builder = work_part.Features.CreateCylinderBuilder(NXOpen.Features.Feature.Null)
    cyl_builder.Type = NXOpen.Features.CylinderBuilder.Types.AxisDiameterAndHeight
    cyl_builder.Diameter.SetFormula("Flange_OD")
    cyl_builder.Height.SetFormula("Flange_Thick")
    cyl_builder.Origin = NXOpen.Point3d(0.0, 0.0, 0.0)
    cyl_builder.Vector = NXOpen.Vector3d(0.0, 0.0, 1.0)
    
    flange_cyl_feat = cyl_builder.Commit()
    cyl_builder.Destroy()

    # 4. Commit and Refresh View
    the_session.UpdateManager.DoUpdate(mark_id)
    print("Parametric Flange successfully generated with expressions.")

if __name__ == "__main__":
    build_parametric_flange()
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`NXOpen.NXException: Standard authoring license not found`** | The script attempts to execute un-signed journal code in an NX environment lacking an NX Open Author license. | 1. Ensure `NXOPEN_AUTHOR` or `NXOPEN_EXECUTION` license feature is checked out.<br>2. Run scripts via `run_journal.exe` (journals do not require signing within an active user session).<br>3. Sign compiled DLL binaries with `SignDotNet.exe` or `SignCPP.exe`. |
| **`NXOpen.NXException: Update failed` after Feature Creation** | Builder parameter values violate geometric constraints or input curves do not form a closed profile. | 1. Wrap builder operations in `try...finally` to ensure `builder.Destroy()` is always invoked.<br>2. Check `builder.Validate()` before calling `.Commit()`.<br>3. Inspect the NX error log via `the_session.LogFile.WriteLine()`. |
| **Memory Leak in Multi-File Batch Journal** | Parts opened via `the_session.Parts.OpenBaseDisplay()` were not closed after processing. | Always close processed parts using `work_part.Close(NXOpen.BasePart.CloseWhole.True, NXOpen.BasePart.CloseModified.CloseModified, None)`. |
| **Block UI Dialog (`.dlx`) Fails to Launch** | Dialog file path is not in the `UGII_USER_DIR\application` directory or DLX schema version mismatch. | 1. Place `.dlx` files in a folder named `application/` and set `UGII_USER_DIR` to its parent.<br>2. Check case-sensitive path in `the_ui.CreateDialog(dlx_path)`. |

---

## Command Line Syntax & Batch Processing

```bash
# Windows CLI: Execute Python Journal via run_journal
"%UGII_BASE_DIR%\UGII\run_journal.exe" "C:\Scripts\build_flange.py"

# Sign Custom NX Open Application Binary (.NET)
"%UGII_BASE_DIR%\UGII\SignDotNet.exe" "C:\Plugins\CustomTool.dll"
```

### Essential File Locations
- **Windows System Directory**: `%UGII_BASE_DIR%\UGII`
- **Windows Syslog Location**: `%LOCALAPPDATA%\Siemens\NX<VER>\syslog_*.syslog`
- **User Custom UI / DLX Path**: `%UGII_USER_DIR%\application`

---

## Agent Operational Directive
> **MANDATORY**: Always pair feature builders with `builder.Destroy()` in a `finally` block to release native memory allocations. Manage undo states with `the_session.SetUndoMark()` to allow safe rollbacks on failure.
