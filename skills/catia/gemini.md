---
title: "Dassault Systèmes CATIA AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Dassault Systèmes CATIA V5 & 3DEXPERIENCE surfaces, DMU clash analysis, and assemblies."
category: "Advanced Surface & Solid Modeling PLM"
tags: ["catia", "cad-diagnostics", "class-a-surfaces", "dmu-clash", "gemini", "zebra-analysis"]
---

# Dassault Systèmes CATIA AI Skill Guide (Gemini)

## Overview & Engine Architecture
Dassault Systèmes CATIA is the premier aerospace and automotive digital prototyping system, renowned for **Class-A Generative Shape Design (GSD)**, **DMU (Digital Mock-Up) kinematics**, and **multi-discipline engineering**. Gemini acts as an AI CAD Quality Lead and Surface Analyst, specializing in **multimodal surface continuity diagnosis (Zebra stripes / Porcupine analysis)**, **DMU interference clash detection**, and **automated CATScript macro validation**.

### CATIA Digital Mockup & Surface Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                 CATIA Digital Mockup Stack                  │
│                                                             │
│  Design & Quality Verification                              │
│  ├── Generative Shape Design (GSD Class-A Curves & Surfaces)│
│  ├── Surface Curvature & Isophote / Zebra Stripe Inspection │
│  └── DMU Space Analysis (Clash, Clearance, Sectioning)      │
│                                                             │
│  Automation & PLM Integration                               │
│  ├── V5 Automation Object Model (VB / COM / Python)         │
│  ├── ENOVIA / 3DEXPERIENCE Collaboration Engine             │
│  └── STEP AP242 Semantic Product & Manufacturing Info (PMI) │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Surface Quality Inspection**: Analyze screenshots of Zebra Stripe (Isophotes) reflections and Porvature curvature combs to detect surface inflections, G0 step breaks, and G1 tangency discontinuities.
2. **DMU Space Analysis & Clash Detection**: Interpret clearance and interference matrix reports, identifying Hard Clashes, Soft Clashes (clearance violations), and kinematic contact penetrations.
3. **Knowledgeware Rule Formulation**: Author CATIA Knowledgeware rules and checks (`if ... then ... else ...`) to enforce corporate design standards (minimum wall thickness, fillet radius limits).
4. **Draft & Thickness Quality Auditing**: Visually evaluate Draft Angle Analysis color maps to ensure injection-molded and cast parts satisfy required tooling draft requirements.

---

## Production CATScript Automation: Automated Bounding Box Calculator

Execute this VBScript/CATScript macro inside CATIA to calculate the minimum axis-aligned bounding box for all parts in an active assembly:

```vb
' CATScript: Automated Assembly Bounding Box & Dimensions
Language="VBSCRIPT"

Sub CATMain()
    Dim oDoc As Document
    Set oDoc = CATIA.ActiveDocument
    
    If TypeName(oDoc) <> "ProductDocument" Then
        MsgBox "Active document must be a CATProduct!", vbCritical, "Error"
        Exit Sub
    End If
    
    Dim oRootProduct As Product
    Set oRootProduct = oDoc.Product
    
    Dim oWorkbench As Workbench
    Set oWorkbench = oDoc.GetWorkbench("InertiaWorkbench")
    
    Dim oInertia As Inertia
    Set oInertia = oWorkbench.CreateInertia(oRootProduct)
    
    Dim aBox(5)
    oInertia.GetBoundingBox aBox
    
    Dim dX, dY, dZ
    dX = aBox(1) - aBox(0)
    dY = aBox(3) - aBox(2)
    dZ = aBox(5) - aBox(4)
    
    MsgBox "Product: " & oRootProduct.PartNumber & vbCrLf & _
           "Length (X): " & FormatNumber(dX, 2) & " mm" & vbCrLf & _
           "Width (Y): " & FormatNumber(dY, 2) & " mm" & vbCrLf & _
           "Height (Z): " & FormatNumber(dZ, 2) & " mm", vbInformation, "Assembly Bounding Box"
End Sub
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Zebra Stripes Break / Jaggies at Surface Boundary** | Surface continuity between adjacent patches is only G0 (positional) rather than G1 (tangent) or G2 (curvature). | 1. In Generative Shape Design, edit the Blend/Connect surface.<br>2. Set **Continuity** to `Curvature` (G2).<br>3. Adjust Tension parameter or rebuild guide curves with matching degree/spans. |
| **Draft Angle Analysis Highlights Red Facets** | Surface draft angle is below the minimum required tooling angle (e.g. $< 1.5^\circ$), causing mold lock. | 1. In Part Design, use **Draft Feature**.<br>2. Select the neutral pulling direction and select faces with zero/negative draft.<br>3. Increase draft angle to exceed minimum tooling specification. |
| **Assembly Shows Yellow 'Needs Update' Flag** | Downstream features depend on modified external geometry or constraints are out of date. | 1. Press `Ctrl + U` (Update).<br>2. If update fails with cyclic dependency error, inspect *Tools $\rightarrow$ Parameter Explorer*.<br>3. Isolate contextual references using *Right-Click $\rightarrow$ Isolate*. |
| **DMU Clash Reports False Positives on Fasteners** | Threaded fasteners modeled at nominal diameter interfere with tapped hole geometry. | 1. In DMU Clash settings, configure **Interference Rules**.<br>2. Filter out designated Fastener standard parts by classification attribute or use **Clearance Analysis** (0mm threshold). |

---

## Command Line Syntax & Configuration

```bash
# Windows CLI: Start CATIA with Dedicated Cache Directory
"C:\Program Files\Dassault Systemes\B32\win_b64\code\bin\CNEXT.exe" -direnv "C:\CATIA_ENV" -env PROD_ENV

# Clean Corrupted CATIA Cache Files via PowerShell
Remove-Item -Path "$env:APPDATA\DassaultSystemes\CATSettings\*" -Recurse -Force
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\DassaultSystemes\CATSettings`
- **Windows System Settings**: `C:\ProgramData\DassaultSystemes\CATSettings`
- **DSLS License Storage**: `C:\ProgramData\DassaultSystemes\Licenses`

---

## Agent Operational Directive
> **MANDATORY**: When assessing surface quality, inspect Zebra stripe continuity across boundary curves. Verify that Class-A exterior surfaces achieve G2 curvature continuity before releasing models for tooling.
