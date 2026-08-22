---
title: "Altium Designer PCB Engineering AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Altium Designer PCB layout, 3D clearance violations, schematic cross-probing, and DRC."
category: "PCB Design & ECAD Engineering"
tags: ["altium-designer", "pcb-layout", "3d-clearance", "gemini", "drc-violations", "schematic-capture"]
---

# Altium Designer PCB Engineering AI Skill Guide (Gemini)

## Overview & Engine Architecture
Altium Designer combines interactive multi-layer PCB routing, unified schematic capture, 3D mechanical clearance checking, and high-density interconnect (HDI) design. Gemini acts as an AI PCB Design Reviewer and Hardware QA Engineer, specializing in **multimodal PCB layout and 3D mechanical clearance inspection**, **schematic-to-PCB cross-probing error diagnosis**, **DRC violation marker triage**, and **ActiveBOM component lifecycle validation**.

### Visual Verification & PCB Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Altium Visual Verification Stack            │
│                                                             │
│  2D / 3D Layout & Mechanical Verification                   │
│  ├── 2D Multi-Layer Viewport (Top/Bottom Copper, Silk, Mask)│
│  ├── Native 3D Raytraced PCB Viewport (Component Collisions)│
│  └── Differential Pair Phase & Accordion Waveform Visualizer│
│                                                             │
│  Integrity & Rule Enforcement                               │
│  ├── Online DRC Marker Engine (Green Highlight Violations)  │
│  ├── Schematic Cross-Probe Synchronizer (ECO Engine)        │
│  └── Layer Stack Manager (Dielectric & Impedance Profiles)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal 2D/3D PCB Inspection**: Evaluate screenshots of 2D copper layers and 3D rendered boards to detect trace neckdowns, thermal relief starvations, acid traps (acute trace angles $<90^\circ$), and tall component collisions with chassis enclosures.
2. **DRC Violation Marker Triage**: Analyze bright green DRC error overlays, identifying specific clearance rule breaches between high-voltage nets, solder mask slivers, and unplated through-holes.
3. **Engineering Change Order (ECO) Diagnostics**: Troubleshoot schematic-to-PCB synchronization failures (*Update PCB Document*), resolving mismatched net names and missing component designators.
4. **ActiveBOM Component Lifecycle Auditing**: Review BOM tables to detect End-of-Life (EOL) components, lead time supply chain risks, and non-stocked supplier parts.

---

## Production Python Automation: Automated Pick and Place / BOM Coordinate Normalizer

Execute this standalone Python script on an exported Altium Pick-and-Place (`.txt`/`.csv`) file to normalize component rotations and coordinates for automated SMT assembly machines:

```python
"""
Altium Pick & Place (Centroid Data) Normalizer
Standardizes component rotation angles (0°, 90°, 180°, 270°) and units for SMT line feeders.
"""

import sys
import os
import csv

def normalize_pick_and_place(input_csv: str, output_csv: str):
    if not os.path.exists(input_csv):
        print(f"Error: Centroid file '{input_csv}' not found.")
        return

    normalized_rows = []
    
    with open(input_csv, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fieldnames = ["Designator", "Footprint", "Mid_X_mm", "Mid_Y_mm", "Layer", "Rotation", "Comment"]

        for row in reader:
            designator = row.get("Designator", "").strip()
            footprint = row.get("Footprint", "").strip()
            mid_x = float(row.get("Mid X", row.get("Center-X(mm)", 0.0)))
            mid_y = float(row.get("Mid Y", row.get("Center-Y(mm)", 0.0)))
            layer = row.get("Layer", "TopLayer").strip()
            rotation = float(row.get("Rotation", 0.0)) % 360.0
            comment = row.get("Comment", "").strip()

            # Normalize rotation for bottom layer components
            if "bottom" in layer.lower():
                rotation = (360.0 - rotation) % 360.0

            normalized_rows.append({
                "Designator": designator,
                "Footprint": footprint,
                "Mid_X_mm": f"{mid_x:.3f}",
                "Mid_Y_mm": f"{mid_y:.3f}",
                "Layer": "TOP" if "top" in layer.lower() else "BOTTOM",
                "Rotation": f"{rotation:.1f}",
                "Comment": comment
            })

    os.makedirs(os.path.dirname(os.path.abspath(output_csv)), exist_ok=True)
    with open(output_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(normalized_rows)

    print(f"Normalized {len(normalized_rows)} component placements to: {output_csv}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python normalize_pnp.py <altium_pnp.csv> <output_normalized.csv>")
        sys.exit(1)
    normalize_pick_and_place(sys.argv[1], sys.argv[2])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Bright Green Highlight Overlay on Multiple Traces** | Active Design Rule Check (DRC) violation (Clearance, Width, Short Circuit). | 1. Open the **PCB Rules And Violations** panel (bottom right).<br>2. Double-click the specific violation to zoom to the error coordinate.<br>3. Adjust trace spacing or modify design rule clearance matrix (*Design $\rightarrow$ Rules*). |
| **Acute Angle (<90°) Trace Junctions (Acid Traps)** | Traces routed with acute corners that can trap etching acid during board fabrication, causing open circuits. | 1. Use the **Gloss** or **Retrace** tool (*Route $\rightarrow$ Gloss Selected*).<br>2. Enforce 45-degree or rounded corner routing mode (Press `Shift + Space` to cycle corner modes). |
| **ECO Fails: `Cannot add footprint: Footprint not found`** | Schematic component references a footprint name not present in the loaded project PCB libraries. | 1. In Schematic, select component $\rightarrow$ Open Properties.<br>2. Verify Footprint name matches exact spelling in the PCB library.<br>3. Run *Validate Changes* before executing ECO. |
| **Thermal Relief Pads Have Too Few Spokes** | Polygon pour clearance rule or pad thermal relief connection rule setting spoke count to $<4$. | In *Design $\rightarrow$ Rules $\rightarrow$ Plane $\rightarrow$ Polygon Connect Style*, set **Connect Style** to `Relief Connect` with **Conductor Width** and **4 Spokes**. |

---

## Command Line Syntax & Configuration

```bash
# Launch Altium Designer with Specific Workspace
"C:\Program Files\Altium\AD24\X2.exe" "C:\Projects\Hardware.PrjPcb"

# Check Active Altium 365 Cloud Workspace Connection via CLI
a365.exe status
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\Altium\Altium Designer {GUID}`
- **PCB Footprint Libraries**: `*.PcbLib` / `*.IntLib`

---

## Agent Operational Directive
> **MANDATORY**: Inspect PCB copper layouts to eliminate acute trace angles ($<90^\circ$) that cause acid trap fabrication defects. Always execute *Tools -> Polygon Pours -> Repour All* before evaluating DRC green violation highlights.
