---
title: "NI LabVIEW Graphical Dataflow & DAQ AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot LabVIEW Front Panel controls, Block Diagram wire tunnels, Probe Watch tables, and Execution Highlighting."
category: "Visual Instrument Control & Data Acquisition"
tags: ["labview", "front-panel-ui", "block-diagram", "gemini", "probe-watch", "execution-highlighting", "daq-waveforms"]
---

# NI LabVIEW Graphical Dataflow & DAQ AI Skill Guide (Gemini)

## Overview & Engine Architecture
NI LabVIEW provides a visual G-dataflow engineering workspace featuring the **Front Panel (Knobs, Digital Displays, Waveform Charts, XY Graphs)**, the **Block Diagram (SubVIs, Structures, Tunnels, Shift Registers, Wires)**, **Execution Highlighting (animated data bubble flow)**, and real-time **Probe Watch Windows**. Gemini acts as an AI Automated Test Reviewer and G-Language Specialist, specializing in **multimodal Front Panel UI inspection**, **Block Diagram wire race condition analysis**, **Shift Register state propagation audits**, and **Probe data validation**.

### Visual Analytics & G-Language Development Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 LabVIEW Visual Operations                   │
│                                                             │
│  UI Presentation & Front Panel Viewports                    │
│  ├── Front Panel Controls (Numeric Inputs, Booleans, Rings) │
│  ├── Waveform Charts & Graphs (Multi-Plot Legends, Autoscale│
│  └── Tab Controls & SubPanel Dynamic Ingestion Windows      │
│                                                             │
│  Block Diagram & Dataflow Engine                            │
│  ├── While / For Loops (Shift Registers & Loop Tunnels)     │
│  ├── Case Structures & Event Structures (Dynamic UI Events) │
│  └── Wire Color Matrix (Orange=Float, Blue=Int, Green=Bool) │
│                                                             │
│  Debugging & Interactive Telemetry                          │
│  ├── Execution Highlighting HUD (Lightbulb Animation Bubble)│
│  ├── Custom Floating Probes & Probe Watch Window            │
│  └── Error List Window (Broken Wire Diagnostics)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Front Panel Inspection**: Analyze screenshots of the LabVIEW Front Panel to verify graph axis scaling, plot legends, engineering unit labels ($\text{V, mA, }^\circ\text{C, kPa}$), and LED alarm color mappings (Red=Trip, Green=Nominal).
2. **Block Diagram Wire & Tunnel Auditing**: Review G-code diagrams to detect unwired shift registers, indexing tunnels in While loops causing memory leaks, and excessive sequence structures (coercing architectures into state machines).
3. **Execution Highlighting & Probe Diagnostics**: Guide engineers through placing Probe Points on intermediate wire segments to isolate NaN/Inf numerical overflows.
4. **Coercion Dot Remediation**: Identify red coercion dots on block diagram inputs (indicating implicit data type conversions like Double to Int32) and recommend explicit type casting.

---

## Production Python Automation: Automated LabVIEW TDMS Binary File Inspector

NI LabVIEW applications commonly log sensor telemetry to National Instruments Technical Data Management Streaming (TDMS) binary files. Run this script to parse and audit `.tdms` files:

```python
"""
NI LabVIEW TDMS Binary Data File Inspector
Parses National Instruments .tdms files, lists channel groups, channels, and sample counts.
"""

import sys
import os

def inspect_tdms_file(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return

    print(f"--- [INSPECTING NI LABVIEW TDMS ARCHIVE: {file_path}] ---")
    try:
        from nptdms import TdmsFile

        tdms_file = TdmsFile.read(file_path)
        groups = tdms_file.groups()
        print(f"Detected {len(groups)} Channel Group(s) in TDMS archive:\n")

        for grp in groups:
            print(f"• Group: '{grp.name}' ({len(grp.channels())} channels)")
            for ch in grp.channels():
                data_len = len(ch)
                unit = ch.properties.get("unit_string", "No Unit")
                print(f"   - Channel: {ch.name:<22} | Samples: {data_len:>6} | Unit: {unit}")

        print("\n✅ TDMS binary structure validated successfully.")

    except ImportError:
        print("Notice: 'nptdms' library not installed (run: pip install nptdms).")
    except Exception as e:
        print(f"Failed to read TDMS file: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 inspect_tdms.py <DataLog.tdms>")
        sys.exit(1)
    inspect_tdms_file(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Front Panel Waveform Chart Freezes / Lags** | Chart update rate exceeds display refresh rate ($>60\text{Hz}$) or chart buffer has millions of points. | Use **Decimation** or batch array updates to redraw chart every $50-100\text{ms}$ rather than point-by-point. |
| **Block Diagram Shows Black Coercion Dots on Terminals** | Data type mismatch (e.g. DBL floating point passed to I32 integer terminal), consuming CPU cycles in type casting. | Match data types explicitly using numeric conversion functions (e.g. `To Double Precision Float`). |
| **While Loop Memory Grows Continuously** | An indexing tunnel is enabled on a While Loop border, accumulating an unbounded array in RAM. | Right-click tunnel on While loop edge $\rightarrow$ Select **Disable Indexing** (Tunnel mode $\rightarrow$ Last Value). |
| **Event Structure Freezes Entire VI** | Event structure configured inside a loop without handling the "Timeout" event, causing an indefinite wait. | In Event Structure, add a **Timeout** event case configured to $100\text{ms}$ or ensure events are triggered from the UI. |

---

## Command Line Syntax & Server Control

```bash
# Launch LabVIEW with VI
"C:\Program Files\National Instruments\LabVIEW 2024\LabVIEW.exe" "C:\VIs\MainApplication.vi"

# Query NI-VISA Resource Names via Python PyVISA CLI
python3 -c "import pyvisa; rm = pyvisa.ResourceManager(); print(rm.list_resources())"
```

### Key Configuration Locations
- **VI Search Paths**: Configured in `labview.ini`
- **Measurement & Automation Explorer (NI-MAX) Config**: `%PROGRAMDATA%\National Instruments\MAX\`

---

## Agent Operational Directive
> **MANDATORY**: When inspecting LabVIEW Block Diagrams, verify that While loops containing dynamic data do not have "Auto-Indexing" enabled on output tunnels to prevent catastrophic memory leaks.
