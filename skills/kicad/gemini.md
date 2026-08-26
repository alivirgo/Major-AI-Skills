---
title: "KiCad Open-Source ECAD AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot KiCad 3D Raytraced board renders, Pcbnew DRC markers, and Eeschema schematics."
category: "Open Source PCB Design & EDA"
tags: ["kicad", "pcbnew", "3d-raytracing", "gemini", "drc-markers", "eeschema"]
---

# KiCad Open-Source ECAD AI Skill Guide (Gemini)

## Overview & Engine Architecture
KiCad delivers modern, open-source PCB hardware development, pairing intuitive schematic design with an interactive layout environment and high-fidelity 3D raytraced visualization. Gemini acts as an AI PCB Quality Assurance Lead and Hardware Reviewer, specializing in **multimodal 3D PCB render inspection**, **Pcbnew DRC violation marker triage**, **Eeschema hierarchical bus diagnostics**, and **interactive HTML BOM generation**.

### Visual Analytics & Verification Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 KiCad Visual Inspection Stack               │
│                                                             │
│  2D / 3D Layout & Mechanical Verification                   │
│  ├── 2D Multi-Layer Canvas (OpenGL / Cairo Accelerated)     │
│  ├── 3D Raytraced Board Viewer (Shadows, Refractions, STEP) │
│  └── Differential Pair Length Matching Waveform Ruler       │
│                                                             │
│  Integrity & Rule Enforcement                               │
│  ├── Real-Time DRC Error Arrow Overlays & Warning Badges    │
│  ├── Electrical Rules Check (ERC) Pin Matrix Validator      │
│  └── Interactive HTML BOM (iBOM Component Placement Map)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal 3D PCB Inspection**: Evaluate screenshots of KiCad 3D board renders to detect component package misalignment, solder joint starvation, polarization orientation errors (*e.g. Diode / Electrolytic Capacitor flipped*), and header pin collisions.
2. **DRC Error Marker Triage**: Analyze red/purple DRC violation arrows in Pcbnew, diagnosing track-to-pad clearance, silk-over-copper slivers, and unplated edge clearance breaches.
3. **Eeschema ERC Pin Conflict Diagnostics**: Inspect Electrical Rules Check matrices to resolve conflicts between Output pins, Power Out flags (`PWR_FLAG`), and unconnected passive components.
4. **Interactive HTML BOM Generation**: Generate self-contained interactive web BOM tools to aid manual prototype hand-assembly and PCB inspection.

---

## Production Python Automation: Automated Interactive HTML BOM Generator

Run this script to compile an interactive HTML BOM inspection dashboard from any KiCad PCB file:

```python
"""
KiCad Interactive HTML BOM Generator Tool
Generates a visual browser dashboard highlighting component placement locations.
"""

import sys
import os
import subprocess

def generate_interactive_bom(pcb_file: str, output_dir: str):
    if not os.path.exists(pcb_file):
        print(f"Error: PCB file '{pcb_file}' does not exist.")
        return

    os.makedirs(output_dir, exist_ok=True)
    print(f"Generating Interactive BOM for: {pcb_file}...")

    cmd = [
        "generate_interactive_bom.py",
        pcb_file,
        "--dest-dir", output_dir,
        "--name-format", "ibom_assembly",
        "--highlight-pin1", "all",
        "--show-fields", "Value,Footprint,MPN"
    ]

    try:
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"Interactive HTML BOM generated successfully in: {output_dir}")
        else:
            print(f"Warning: Interactive BOM tool returned:\n{res.stderr}")
    except FileNotFoundError:
        print("InteractiveHtmlBom plugin script not found in system PATH. Install via KiCad Plugin Manager.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python run_ibom.py <board.kicad_pcb> <output_dir>")
        sys.exit(1)
    generate_interactive_bom(sys.argv[1], sys.argv[2])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **ERC Warning: `Pin connected to other pins, but not driven by any pin`** | A power input pin (`VCC`, `GND`) is connected to a power net without a driving source symbol. | 1. In Eeschema, place a **`PWR_FLAG`** symbol on the `+5V` / `+3.3V` and `GND` power rails.<br>2. Re-run Electrical Rules Checker (ERC). |
| **Pcbnew Shows Red X Marker on Board Outline** | Board outline on `Edge_Cuts` layer is not a closed polygon, or contains self-intersecting lines. | 1. In Pcbnew, select all lines on the `Edge_Cuts` layer.<br>2. Right-click $\rightarrow$ *Create Polygons from Selection*.<br>3. Check for disconnected endpoints or overlapping segments. |
| **Silkscreen Text Overlapping Solder Pads** | Component reference designator text placed directly over exposed copper pads, causing text clipping during fabrication. | 1. Select text $\rightarrow$ Move outside pad boundaries.<br>2. Enable *Subtract solder mask from silkscreen* in Plot settings.<br>3. Run DRC to detect text-to-mask violations. |
| **3D Model Renders with Distorted Scale / Position** | VRML/STEP model unit mismatch ($1:2.54$ scaling vs metric millimeters). | In Footprint Properties $\rightarrow$ *3D Models*, adjust scale to `X=1.0, Y=1.0, Z=1.0` or `1/2.54` if originally modeled in inches. |

---

## Command Line Syntax & Server Control

```bash
# Render High-Resolution Raytraced 3D Render via CLI
kicad-cli pcb render --output board_render.png --zoom 1.5 "C:\Hardware\board.kicad_pcb"

# Export SVG Schematic Images for Documentation
kicad-cli sch export svg --output "C:\Docs\schematic.svg" "C:\Hardware\design.kicad_sch"
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\kicad\8.0`
- **Linux User Config**: `~/.config/kicad/8.0`

---

## Agent Operational Directive
> **MANDATORY**: Verify that all power rails have `PWR_FLAG` symbols in Eeschema to satisfy ERC rules. Ensure board outlines on the `Edge_Cuts` layer form a 100% closed, continuous loop without gaps or self-intersections.
