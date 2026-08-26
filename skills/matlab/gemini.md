---
title: "MathWorks MATLAB Numerical Computing & Algorithm AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot MATLAB Figure plots, Live Editor notebooks, App Designer UI layouts, and Simulink block diagrams."
category: "Numerical Computing & Algorithm Development"
tags: ["matlab", "matlab-figure", "live-editor-ui", "app-designer", "simulink-diagrams", "gemini", "scientific-plotting"]
---

# MathWorks MATLAB Numerical Computing & Algorithm AI Skill Guide (Gemini)

## Overview & Engine Architecture
MATLAB provides an interactive scientific visualization ecosystem featuring publication-quality **Figure Windows (2D/3D graphics with OpenGL hardware acceleration)**, **Live Editor (`.mlx`) interactive notebooks**, **App Designer drag-and-drop GUI canvas (`uifigure`)**, and **Simulink Model-Based block diagram canvases**. Gemini acts as an AI Scientific Visualization Specialist and Algorithm Interface Auditor, specializing in **multimodal MATLAB Figure plot inspection**, **App Designer responsive UI layout validation**, **Live Editor rich-media equation review**, and **Simulink signal flow diagnostics**.

### Visual Analytics & Technical Computing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 MATLAB Visual Operations                    │
│                                                             │
│  Plotting & Figure Windows                                  │
│  ├── 2D Line, Scatter & Bar Plots (Subplot Grids, Legends)  │
│  ├── 3D Surface, Mesh & Volumetric Isosurface Viewports     │
│  └── Colormap Visualizers (Parula, Turbo, Magma, Hot)       │
│                                                             │
│  Interactive Development Environments                       │
│  ├── Live Editor Notebooks (`.mlx` Inline Plots & LaTeX Math│
│  ├── App Designer (UIFigure, UIAxes, Sliders, Dropdowns)   │
│  └── Variable Editor (2D/3D Matrix Spreadsheets & Heatmaps) │
│                                                             │
│  Model-Based Design & Simulation                            │
│  ├── Simulink Canvas (Continuous/Discrete Blocks, Bus Lines)│
│  └── Scope Viewport (Multi-Signal Oscilloscope Traces)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal MATLAB Figure Inspection**: Analyze screenshots of MATLAB plots to verify axis scaling (linear vs logarithmic), scientific unit labels, legend entries, tick intervals, and high-DPI rasterization quality.
2. **App Designer UI Layout Validation**: Review custom App Designer layouts to ensure UI components (buttons, text areas, axes) maintain proportional auto-reflow across varying screen resolutions.
3. **Simulink Block Diagram Diagnostics**: Inspect Simulink models to detect broken signal lines (red dashed wires), sample rate conflicts (color-coded sample times), and algebraic loop warnings.
4. **Publication-Quality Graphics Export**: Guide users in utilizing `exportgraphics()` with vector output formats (PDF/EPS) and specified DPI targets ($300-600\text{ DPI}$).

---

## Production Python Automation: Automated MATLAB MAT-File Binary Inspector (`scipy.io`)

Run this script to inspect variable names, data types, and array shapes stored inside MATLAB `.mat` binary files without needing a MATLAB license:

```python
"""
MATLAB .mat Binary File Structure Inspector (scipy.io)
Parses Level 5 and HDF5-based MAT-files to extract variable arrays, dimensions, and types.
"""

import sys
import os
import numpy as np

def inspect_mat_file(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: MAT file '{file_path}' not found.")
        return

    print(f"--- [INSPECTING MATLAB .MAT FILE: {file_path}] ---")
    
    # Attempt Level 5 MAT-File read via scipy.io
    try:
        import scipy.io as sio
        mat_data = sio.loadmat(file_path)
        print("Format: Level 5 MAT-File (v7 / v6)\n")

        print("--- [WORKSPACE VARIABLES DETECTED] ---")
        for key, val in mat_data.items():
            if not key.startswith("__"):
                shape_str = str(val.shape) if hasattr(val, "shape") else "Scalar"
                dtype_str = str(val.dtype) if hasattr(val, "dtype") else type(val).__name__
                print(f"• Variable: {key:<20} | Shape: {shape_str:<14} | Type: {dtype_str}")

        print("\n✅ Level 5 MAT-file successfully parsed.")
        return

    except NotImplementedError:
        print("Notice: Detected MATLAB v7.3 HDF5 MAT-file format. Using h5py...")
    except Exception as e:
        print(f"Standard parser notice: {e}. Trying h5py...")

    # Attempt v7.3 HDF5 MAT-File read via h5py
    try:
        import h5py
        with h5py.File(file_path, "r") as f:
            print("Format: MATLAB v7.3 (HDF5 Architecture)\n")
            print("--- [HDF5 DATASETS DETECTED] ---")
            for key in f.keys():
                ds = f[key]
                print(f"• Dataset:  {key:<20} | Shape: {str(ds.shape):<14} | Type: {ds.dtype}")
            print("\n✅ v7.3 HDF5 MAT-file parsed successfully.")

    except ImportError:
        print("Install 'h5py' to inspect MATLAB v7.3 format files (run: pip install h5py).")
    except Exception as e:
        print(f"Failed to read file: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 inspect_mat.py <Data.mat>")
        sys.exit(1)
    inspect_mat_file(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Figure Text Renders Pixelated / Blurry in PDF Export** | Used `saveas(gcf, 'plot.png')` or low-resolution raster snapshot. | Use modern vector export: `exportgraphics(gcf, 'plot.pdf', 'ContentType', 'vector')`. |
| **Simulink Shows "Algebraic loop detected" Error** | Direct feedthrough in a feedback loop without an intervening unit delay block. | Insert a **Unit Delay ($z^{-1}$)** block into the feedback path or enable algebraic loop solver in Model Settings. |
| **App Designer UI Distorts on Resizing** | Components positioned with absolute pixel coordinates rather than inside a Grid Layout. | Select UI elements $\rightarrow$ Right-click $\rightarrow$ **Group into Grid Layout** $\rightarrow$ Configure row/column sizing to `1x` (flexible). |
| **Live Editor LaTeX Formula Displays Red Syntax Error** | Malformed LaTeX math syntax inside Live Editor equation block. | Check equation delimiters (e.g. `\frac{a}{b}` rather than invalid syntax). |

---

## Command Line Syntax & Server Control

```bash
# Launch MATLAB with GUI
matlab

# Export High-Resolution Plot from Headless M-Script
# (exportgraphics(gcf, 'output.png', 'Resolution', 300))
```

### Key Configuration Locations
- **MATLAB Figures**: `*.fig`
- **Live Scripts**: `*.mlx`
- **Simulink Models**: `*.slx`

---

## Agent Operational Directive
> **MANDATORY**: For publication figures in MATLAB, always utilize `exportgraphics(gcf, 'figure.pdf', 'ContentType', 'vector')` rather than `print` or `saveas` to guarantee lossless vector typography and crisp line art.
