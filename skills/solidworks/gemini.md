---
title: "Dassault Systèmes SOLIDWORKS AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Dassault Systèmes SOLIDWORKS FEA simulation contours, Assembly Interferences, and FeatureManager trees."
category: "3D Parametric CAD & Mechanical Design"
tags: ["solidworks", "cad-diagnostics", "fea-simulation", "interference-detection", "gemini", "rebuild-errors"]
---

# Dassault Systèmes SOLIDWORKS AI Skill Guide (Gemini)

## Overview & Engine Architecture
Dassault Systèmes SOLIDWORKS combines parametric solid modeling, integrated FEA simulation (SOLIDWORKS Simulation), and multi-component assembly design. Gemini acts as an AI Mechanical Design Reviewer and FEA Analyst, specializing in **multimodal FEA stress contour interpretation (von Mises)**, **assembly interference clash detection**, **FeatureManager rebuild error diagnosis**, and **automated VBA/Python script generation**.

### SOLIDWORKS Engineering & Simulation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 SOLIDWORKS Engineering Stack                │
│                                                             │
│  Design & Simulation Engine                                 │
│  ├── FeatureManager Tree (Parent-Child Dependency History)  │
│  ├── Assembly Interference & Dynamic Clearance Detection    │
│  └── SOLIDWORKS Simulation (Mesh Generation, Von Mises FEA) │
│                                                             │
│  Automation & Production Output                             │
│  ├── VBA Macro Engine & COM Automation API                  │
│  ├── 2D Generative Drawings & Automated BOM Tables          │
│  └── Sheet Metal Flat Pattern Unfolding & DXF Export        │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal FEA Stress & Deflection Analysis**: Evaluate screenshots of SOLIDWORKS Simulation von Mises stress contours and factor-of-safety (FOS) plots to identify stress concentrations, mesh singularity points, and yield threshold exceedances.
2. **Assembly Interference & Clearance Auditing**: Analyze assembly clash detection views to differentiate between functional clearances, press fits, and geometric interferences.
3. **What's Wrong Rebuild Triage**: Inspect screenshots of the FeatureManager "What's Wrong?" dialog to provide targeted fix procedures for broken sketch relations and missing faces.
4. **Automated VBA/Python Macro Authoring**: Generate clean macros for batch renaming, custom property insertion, and mass export.

---

## Production VBA Macro Automation: Automated Custom Property Inserter

Run this VBA macro inside SOLIDWORKS (*Tools $\rightarrow$ Macro $\rightarrow$ Run*) to automatically inject standard manufacturing metadata (Part Number, Material, Author, Date) into the active model:

```vb
' SOLIDWORKS VBA Macro: Inject Standard Custom Properties
Dim swApp As SldWorks.SldWorks
Dim swModel As SldWorks.ModelDoc2
Dim swModelExt As SldWorks.ModelDocExtension
Dim swCustPropMgr As SldWorks.CustomPropertyManager

Sub main()
    Set swApp = Application.SldWorks
    Set swModel = swApp.ActiveDoc
    
    If swModel Is Nothing Then
        MsgBox "Please open a SOLIDWORKS Part or Assembly first!", vbCritical, "Error"
        Exit Sub
    End If
    
    Set swModelExt = swModel.Extension
    Set swCustPropMgr = swModelExt.CustomPropertyManager("")
    
    ' Inject Standard Manufacturing Properties
    swCustPropMgr.Add3 "PartNumber", swCustomInfoText, swModel.GetTitle(), swCustomPropertyReplaceValue
    swCustPropMgr.Add3 "Material", swCustomInfoText, """SW-Material""", swCustomPropertyReplaceValue
    swCustPropMgr.Add3 "Weight_kg", swCustomInfoText, """SW-Mass""", swCustomPropertyReplaceValue
    swCustPropMgr.Add3 "ReviewedBy", swCustomInfoText, "AI Systems Quality Lead", swCustomPropertyReplaceValue
    swCustPropMgr.Add3 "ReleaseDate", swCustomInfoText, Format(Date, "YYYY-MM-DD"), swCustomPropertyReplaceValue
    
    MsgBox "Custom properties successfully injected into: " & swModel.GetTitle(), vbInformation, "Success"
End Sub
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **FEA Stress Hotspot at Sharp Re-entrant Corner** | Geometric singularity caused by theoretical zero-radius internal corner (stress approaches infinity as mesh refines). | 1. Apply a physical fillet radius (e.g. $R=2-5\text{ mm}$) to the internal corner.<br>2. Re-mesh using **Curvature-based Mesh** with local mesh control.<br>3. Verify stress levels normalize across successive mesh refinements. |
| **Interference Detection Reports Hundreds of Clashes** | Standard hardware components (screws, bolts) threaded into tapped holes. | 1. In Interference Detection property manager, check **Treat threads as faceted** or uncheck standard fastener folders.<br>2. Enable **Create sub-folder for fasteners**.<br>3. Focus strictly on non-fastener rigid body interferences. |
| **Sketch Shows Red & Yellow Entities (Over-Defined)** | Multiple conflicting dimensions or redundant constraints applied to the same sketch entity. | 1. Click **Over-Defined** status in the bottom status bar.<br>2. Launch the **SketchXpert** diagnostic solver.<br>3. Click *Diagnose* and cycle through valid resolution states to delete conflicting constraints. |
| **FEA Simulation Solver Fails: `Excessive Displacements`** | The model contains unconstrained rigid-body degrees of freedom or contact sets are unbonded. | 1. Run **Simulation $\rightarrow$ Diagnostics $\rightarrow$ Underconstrained Bodies**.<br>2. Check boundary fixtures (Fixed Geometry / Roller Slider).<br>3. Add **Bonded Component Contacts** between interacting bodies. |

---

## Command Line Syntax & Configuration

```bash
# Windows CLI: Execute Macro via Command Line
"C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS\sldworks.exe" /m "C:\Macros\InjectProps.swp"

# Clean Corrupted Registry Scheme via PowerShell
Remove-Item -Path "HKCU:\Software\SolidWorks\SOLIDWORKS 20XX\User Interface" -Recurse -Force
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\SolidWorks\SolidWorks 20XX`
- **Windows Template Directory**: `C:\ProgramData\SolidWorks\SOLIDWORKS 20XX\templates`
- **SOLIDWORKS Journal File**: `%APPDATA%\SolidWorks\SolidWorks 20XX\swxJrn.swj`

---

## Agent Operational Directive
> **MANDATORY**: In FEA simulation evaluations, ensure that sharp internal corners have stress-relieving fillets to prevent mesh singularities. Use SketchXpert to resolve over-constrained sketch geometries.
