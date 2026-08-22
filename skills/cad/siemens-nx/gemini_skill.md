---
title: "Siemens NX AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Siemens NX CAD/CAM models, Examine Geometry reports, and Synchronous Technology."
category: "Integrated CAD/CAM/CAE Engineering Suite"
tags: ["siemens-nx", "parasolid", "synchronous-technology", "gemini", "examine-geometry", "cam-diagnostics"]
---

# Siemens NX AI Skill Guide (Gemini)

## Overview & Engine Architecture
Siemens NX provides end-to-end CAD/CAM/CAE engineering built upon the **Parasolid modeling kernel**. Gemini acts as an AI Manufacturing Engineer and Quality Assurance Lead, specializing in **multimodal Examine Geometry diagnosis**, **Synchronous Technology face recognition**, **CAM 5-axis toolpath gouge verification**, and **automated NX Open Python scripting**.

### Siemens NX Modeling & Manufacturing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Siemens NX Engineering Stack                │
│                                                             │
│  Parasolid Geometry & Quality Layer                         │
│  ├── Parasolid B-Rep Kernel & Dual Modeling Architecture    │
│  ├── Examine Geometry Engine (Self-Intersection, Slivers)   │
│  └── Synchronous Technology (Coplanar, Tangent, Offset Grps)│
│                                                             │
│  Manufacturing & Digital Mockup                             │
│  ├── Machine Tool Simulation (ISV - Integrated Simulation)  │
│  ├── 5-Axis Gouge & Excess Material Color Mapping           │
│  └── 3D Semantic Product and Manufacturing Info (PMI)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Examine Geometry Analysis**: Evaluate screenshots of Examine Geometry defect tables to isolate faulty bodies, pinpointing self-intersecting faces, non-manifold vertices, and boundary spikes.
2. **Synchronous Technology Face Selection**: Formulate rule-based face collections (*Coplanar*, *Coaxial*, *Tangent*, *Symmetric*) for automated geometry modifications without history rollbacks.
3. **ISV Machine Tool Simulation Triage**: Analyze CNC simulation screenshots to detect spindle head collisions, axis over-travel limit violations, and rapid-traverse stock gouges.
4. **NX Open Python Automation**: Write clean Python journals to automate repetitive CAD modeling, expression updates, and drawing sheet exports.

---

## Production Python Automation: Automated Geometry Health Checker

Run this journal script via `run_journal.exe` to inspect an NX part, run Parasolid Examine Geometry tests, and print diagnostic failure reports:

```python
"""
Siemens NX Open: Automated Examine Geometry Health Checker
Runs Parasolid surface and body consistency checks.
"""

import sys
import NXOpen
import NXOpen.UF

def audit_geometry_health():
    the_session = NXOpen.Session.GetSession()
    the_uf_session = NXOpen.UF.UFSession.GetUFSession()
    work_part = the_session.Parts.Work

    if not work_part:
        print("Error: No active work part found in session.")
        return

    print(f"Auditing Geometry for: {work_part.Leaf}")
    bodies = work_part.Bodies.ToArray()
    
    for idx, body in enumerate(bodies):
        body_tag = body.Tag
        # Test 1: Check Body Consistency
        status = the_uf_session.Modl.AskBodyState(body_tag)
        print(f"Body [{idx+1}/{len(bodies)}] ({body.JournalIdentifier}) -> Solid Status: {status}")

        # Test 2: Examine Geometry Flags
        # 1 = Tiny Faces, 2 = Misaligned Faces, 3 = Self-Intersections
        results = the_uf_session.Modl.CheckBody(body_tag)
        print(f"Examine Geometry Result Code: {results}")

    print("Geometry audit completed successfully.")

if __name__ == "__main__":
    audit_geometry_health()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Examine Geometry Highlights Red Dots on Surface** | Micro-faces (sliver faces with width $< 0.001\text{ mm}$) or self-intersecting spline knots. | 1. In Modeling, select **Delete Face** (*Heal Type: Automatic*).<br>2. Use **Optimize Face** to simplify complex B-spline surfaces into planes/cylinders.<br>3. Run **Heal Geometry** to tighten edge tolerances. |
| **Synchronous Move Fails with `Cannot Find Solution`** | Adjacent connected faces cannot adapt to the new moved position without self-intersecting. | 1. Select the moved faces and include adjacent **Blend / Fillet faces** in the selection.<br>2. Uncheck *Automatic Dimension / Constraint Solver*.<br>3. Use **Replace Face** or **Offset Face** as an alternative. |
| **ISV CAM Simulation Shows Yellow Axis Over-Travel** | 5-axis rotary table ($A/C$ axis) reached physical rotational limits ($>+120^\circ / -120^\circ$). | 1. In NX CAM, open Operation settings $\rightarrow$ *Tool Axis*.<br>2. Select **Lead / Lag and Tilt Angles** to bias tool orientation.<br>3. Enable **Interpolate Vector** to smooth rotary transitions. |
| **PMI Annotations Disappear in 2D Drafting Sheet** | 3D PMI was not inherited into the specific drawing view configuration. | 1. Right-click Drawing View boundary $\rightarrow$ **Settings**.<br>2. Under *Common $\rightarrow$ PMI*, set **Inherit PMI** to `All (Display Mode: 3D)`.<br>3. Update drawing view (`F5`). |

---

## Command Line Syntax & Configuration

```bash
# Windows CLI: Run Geometry Audit Journal Headless
"%UGII_BASE_DIR%\UGII\run_journal.exe" "C:\Automation\audit_health.py"

# Open NX with Part in Diagnostic Mode
"%UGII_BASE_DIR%\UGII\ugraf.exe" -prt "C:\Models\Engine.prt"
```

### Essential File Locations
- **Windows User Cache**: `%LOCALAPPDATA%\Siemens\NX<VER>`
- **Windows System Config**: `%UGII_BASE_DIR%\UGII\ugii_env.dat`
- **Siemens License Settings**: `%UGII_BASE_DIR%\UGII\license_options.exe`

---

## Agent Operational Directive
> **MANDATORY**: Run *Examine Geometry* to detect and heal micro-faces on third-party CAD imports. When editing imported models, group fillet/blend faces into Synchronous collections to prevent topological solve failures.
