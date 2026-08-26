---
title: "Cadence Virtuoso IC Design AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Cadence Virtuoso layout viewports, ViVA waveform eye diagrams, DRC markers, and LVS trees."
category: "Analog & Mixed-Signal IC Design"
tags: ["cadence-virtuoso", "ic-layout", "viva-waveforms", "gemini", "drc-markers", "analog-design"]
---

# Cadence Virtuoso IC Design AI Skill Guide (Gemini)

## Overview & Engine Architecture
Cadence Virtuoso provides deep-level visual analysis across transistor-level schematics, complex sub-micron polygon layouts, and interactive simulation waveforms in **ViVA (Virtuoso Visualization & Analysis)**. Gemini acts as an AI IC Design Reviewer and Waveform Specialist, specializing in **multimodal layout polygon inspection**, **ViVA waveform transient / eye diagram triage**, **DRC error marker diagnosis**, and **LVS cross-probing**.

### Visual Verification & IC Analysis Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Virtuoso Visual Analysis Stack              │
│                                                             │
│  Layout & Waveform Visualization                            │
│  ├── Multi-Layer Sub-Micron Layout Viewport (Metal/Via/Poly)│
│  ├── ViVA Waveform Viewer (Eye Diagrams, FFT, Histograms)   │
│  └── ADE Assembler / Explorer (Corner & Spec Dashboards)    │
│                                                             │
│  Physical Verification Overlay                              │
│  ├── Interactive DRC Marker Browser (Highlighting Breaches) │
│  ├── LVS Schematic-to-Layout Cross-Probe Highlight Engine   │
│  └── Parasitic RC Network Overlay (Quantus QRC Net Views)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Layout & DRC Inspection**: Analyze screenshots of Virtuoso Layout Suite to detect minimum width/spacing violations, antenna ratio breaches, electromigration metal width risks, and missing substrate tap connections.
2. **ViVA Waveform & Eye Diagram Analysis**: Interpret analog/mixed-signal waveform plots, analyzing clock jitter, eye height/width, transient overshoot, and phase noise degradation.
3. **LVS Discrepancy Cross-Probing**: Diagnose mismatched devices, swapped drain/source terminals on multi-finger MOSFETs, and shorted power rails across schematic-to-layout cross-probe trees.
4. **ADE Testbench Spec Verification**: Review ADE Explorer simulation tables to identify failing temperature corners and yield loss.

---

## Production Python Automation: Spectre PSF Raw Data Waveform Parser

Execute this Python script (requires `pip install libpsf` or standard NumPy) to extract transient simulation node voltages from Spectre raw simulation output directories without GUI overhead:

```python
"""
Spectre PSF Raw Simulation Data Extractor
Parses Spectre simulation output directories to extract transient waveforms.
"""

import sys
import os
import struct

def parse_simple_csv_waveform(csv_waveform_path: str):
    if not os.path.exists(csv_waveform_path):
        print(f"Error: Waveform CSV file '{csv_waveform_path}' not found.")
        return

    time_pts = []
    voltages = []

    with open(csv_waveform_path, "r") as f:
        for line in f:
            parts = line.strip().split(",")
            if len(parts) >= 2:
                try:
                    t = float(parts[0])
                    v = float(parts[1])
                    time_pts.append(t)
                    voltages.append(v)
                except ValueError:
                    continue

    if not voltages:
        print("No valid numerical data points extracted.")
        return

    v_max = max(voltages)
    v_min = min(voltages)
    v_pp = v_max - v_min

    print(f"--- [WAVEFORM ANALYSIS SUMMARY: {len(time_pts)} POINTS] ---")
    print(f"Time Range:    {time_pts[0]*1e9:.2f} ns -> {time_pts[-1]*1e9:.2f} ns")
    print(f"Max Voltage:   {v_max:.4f} V")
    print(f"Min Voltage:   {v_min:.4f} V")
    print(f"Peak-to-Peak:  {v_pp:.4f} V")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_waveform.py <waveform_export.csv>")
        sys.exit(1)
    parse_simple_csv_waveform(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **ViVA Waveform Displays Ringing & Severe Overshoot** | Phase Margin in feedback loop is $<45^\circ$ or load capacitance caused secondary pole shift. | 1. Check AC stability response (Bode Plot) in ViVA.<br>2. Increase Miller compensation capacitor ($C_c$) or insert nulling resistor in series.<br>3. Verify phase margin $\ge 60^\circ$ for clean step response. |
| **DRC Error: `Min Area Violation on Metal1`** | Metal polygon area is below process minimum required for chemical-mechanical planarization (CMP). | 1. In Layout, select highlighted metal polygon.<br>2. Increase length or add dummy copper padding to satisfy minimum area rule.<br>3. Re-run DRC check. |
| **LVS Error: `Parallel Devices Merged Incorrectly`** | Number of fingers or multipliers ($M$-factor) in schematic does not match layout instance count. | 1. In Schematic, check transistor property `Total Width` and `Multiplier (M)`.<br>2. In Layout, verify MOSFET finger count matches schematic parameters.<br>3. Re-extract netlist. |
| **ViVA Eye Diagram Collapsed (Zero Eye Opening)** | Heavy inter-symbol interference (ISI) or high parasitic RC line attenuation. | 1. Check high-speed trace parasitic extraction in Quantus QRC.<br>2. Enable transmitter pre-emphasis / de-emphasis or continuous-time linear equalization (CTLE). |

---

## Command Line Syntax & Server Control

```bash
# Launch Virtuoso with Specific Technology Library
virtuoso -cdsarchive my_project.cdsarchive &

# Launch Cadence ViVA Waveform Viewer in Standalone Mode
viva &
```

### Essential File Locations
- **Cadence Environment**: `~/.cdsenv`
- **Library Defs**: `<project_path>/cds.lib`

---

## Agent Operational Directive
> **MANDATORY**: When inspecting transient step responses in ViVA, ensure ringing settles within $5\%$ of steady-state voltage. Verify that all analog differential pairs have symmetric layout routing with dummy guard rings.
