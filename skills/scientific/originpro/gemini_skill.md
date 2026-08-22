---
title: "OriginLab OriginPro Scientific Graphing & Analysis AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot OriginPro Graph windows, Plot Details formatting, Peak Analyzer baselines, and Worksheet column structures."
category: "Scientific Graphing & Data Analysis"
tags: ["originpro", "scientific-graphing", "plot-details", "gemini", "peak-analyzer-ui", "graph-layers", "origin-workbooks"]
---

# OriginLab OriginPro Scientific Graphing & Analysis AI Skill Guide (Gemini)

## Overview & Engine Architecture
OriginLab OriginPro provides an advanced scientific visualization workspace featuring the **Graph Window with Multi-Layer plotting architecture**, the **Plot Details dialog (Symbol, Line, Fill, Grouping, Pattern customization)**, the **Peak Analyzer interactive baseline & peak fitting wizard**, and **Worksheet column designation tables**. Gemini acts as an AI Scientific Publishing Reviewer and Technical Data Auditor, specializing in **multimodal Graph Window layout inspection**, **multi-panel plot alignment review**, **Peak Analyzer baseline anchor point diagnostics**, and **scientific publication figure formatting**.

### Visual Analytics & Scientific Graphing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 OriginPro Visual Operations                 │
│                                                             │
│  Graph & Multi-Layer Viewports                              │
│  ├── Multi-Layer Graph Canvas (Linked Right/Top Secondary X/Y│
│  ├── 2D/3D Plot Elements (Scatter, Spline, Box Plots, Ternary│
│  └── Publication Aesthetics (Journal Presets: Nature, IEEE) │
│                                                             │
│  Interactive Analytical Wizards                             │
│  ├── Peak Analyzer Wizard (Asymmetric Least Squares Baseline│
│  ├── NLFit Interface (Fitted Curve Overlays, Confidence Band│
│  └── Quick Fit Gadgets (Rise Time, Integration, Peak Find)  │
│                                                             │
│  Data Management & Workbooks                                │
│  ├── Worksheet Grids (Long Name, Units, Comments, Sparklines│
│  └── Matrix Viewports (2D Heatmaps, Surface 3D Wireframes)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Graph Window Inspection**: Analyze screenshots of OriginPro graphs to verify axis break alignments, major/minor tick marks, logarithmic decade spacing, error bar caps, and legend consistency across multi-panel figures.
2. **Plot Details Formatting Review**: Audit Plot Details settings to ensure color palettes adhere to colorblind-safe standards (e.g. Viridis, ColorBrewer) and symbol sizes remain visible at reduced print column widths.
3. **Peak Analyzer Baseline Diagnostics**: Review baseline subtraction curves in the Peak Analyzer to ensure anchor points capture true background noise without cutting into spectral peak tails.
4. **Journal Publication Compliance**: Verify that exported figures conform to standard publisher criteria (e.g. minimum $300\text{ DPI}$, 85mm single-column width, Arial/Helvetica fonts).

---

## Production Python Automation: Automated OriginLab Project (`.opju`) File Inspector

OriginPro `.opju` files are zip-based project archives containing XML metadata and binary worksheet data. Run this script to inspect books and graphs inside an `.opju` file:

```python
"""
OriginPro Project (.opju) Archive Inspector
Inspects project archives, listing contained worksheets, matrix books, and graph windows.
"""

import sys
import os
import zipfile
import xml.etree.ElementTree as ET

def inspect_opju_project(opju_path: str):
    if not os.path.exists(opju_path):
        print(f"Error: Project file '{opju_path}' not found.")
        return

    print(f"--- [INSPECTING ORIGINPRO PROJECT: {opju_path}] ---")
    
    if not zipfile.is_zipfile(opju_path):
        print("Notice: File is legacy binary .opj format or encrypted. Use OriginPro API to read.")
        return

    try:
        with zipfile.ZipFile(opju_path, "r") as z:
            file_list = z.namelist()
            print(f"• Total Embedded Assets: {len(file_list)}")

            # Scan for Workbooks and Graphs
            workbooks = [f for f in file_list if f.endswith((".ogwu", ".ogw"))]
            graphs = [f for f in file_list if f.endswith((".oggu", ".ogg"))]
            matrices = [f for f in file_list if f.endswith((".ogmu", ".ogm"))]

            print(f"• Workbooks (Worksheets): {len(workbooks)}")
            print(f"• Graph Windows:          {len(graphs)}")
            print(f"• Matrix Books:           {len(matrices)}\n")

            if graphs:
                print("Sample Graph Windows:")
                for g in graphs[:5]:
                    print(f"  • {os.path.basename(g)}")

        print("\n✅ OPJU project archive validated successfully.")

    except Exception as e:
        print(f"Failed to parse OPJU archive: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 inspect_opju.py <Project.opju>")
        sys.exit(1)
    inspect_opju_project(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Graph Layer 2 Right-Y Axis Misaligned with Layer 1** | Axis linking is disabled or layer dimensions are independent. | In Plot Details $\rightarrow$ Select Layer 2 $\rightarrow$ **Link Axes Scales** $\rightarrow$ Set X-Axis Link to `Straight (1:1)` and align layer unit dimensions. |
| **Peak Analyzer Cuts Off Low-Intensity Peak Tails** | Baseline anchor points placed too close to peak inflection points. | In Peak Analyzer $\rightarrow$ Baseline Mode $\rightarrow$ Select **User Defined** $\rightarrow$ Click **Modify** to drag anchor points away from peak shoulders. |
| **Worksheet Sparkline Missing from Column Header** | Sparklines disabled in worksheet performance preferences for large datasets. | Right-click column header $\rightarrow$ Select **Sparklines** $\rightarrow$ Click **Add Sparklines**. |
| **Exported Vector Graph Crops Out Axis Titles** | Export margin setting configured to `Border` instead of `Tight`. | In File $\rightarrow$ Export Graph dialog $\rightarrow$ Set **Margin Control** to `Tight` or `Clip Border`. |

---

## Command Line Syntax & Server Control

```bash
# Launch OriginPro with Project
"C:\Program Files\OriginLab\OriginPro 2025\Origin64.exe" "C:\Projects\Spectroscopy.opju"

# Query Installed Python in OriginPro
# In Origin Script Window: run -py "import sys; print(sys.version)"
```

### Key Configuration Locations
- **Project Archives**: `*.opju` (Unicode Project), `*.opj` (Legacy)
- **Origin User Files**: `%USERPROFILE%\Documents\OriginLab\User Files\`

---

## Agent Operational Directive
> **MANDATORY**: When publishing multi-layer graphs in OriginPro, always link secondary X-axes with a $1:1$ scale to the primary layer to ensure physical data alignment remains invariant upon resizing.
