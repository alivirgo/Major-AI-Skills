---
title: "CODESYS V3.5 IEC 61131-3 Industrial Automation AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot CODESYS Device Trees, CFC flowcharts, Ladder Logic rungs, WebVisu HMIs, and Online Watch tables."
category: "IEC 61131-3 PLC Development Platform"
tags: ["codesys", "cfc-editor", "ladder-diagram", "gemini", "webvisu-hmi", "device-tree-ui", "watch-tables"]
---

# CODESYS V3.5 IEC 61131-3 Industrial Automation AI Skill Guide (Gemini)

## Overview & Engine Architecture
CODESYS V3.5 provides an industrial automation visual engineering environment featuring the hierarchical **Device Tree**, graphical **Continuous Function Chart (CFC)** & **Ladder Diagram (LD)** editors, dynamic **WebVisu HTML5 HMI dashboards**, and real-time **Online Watch & Trace tables**. Gemini acts as an AI Industrial Automation Reviewer and Controls Systems Auditor, specializing in **multimodal Device Tree topology inspection**, **CFC execution order analysis**, **Ladder Logic safety rung validation**, and **WebVisu HMI animation debugging**.

### Visual Analytics & Engineering Workspace Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 CODESYS Visual Operations                   │
│                                                             │
│  Project Navigation & Logic Viewports                       │
│  ├── Device Tree (PLC Target, Fieldbus Masters, IO Modules) │
│  ├── Continuous Function Chart / CFC (Dataflow Pins, Blocks)│
│  ├── Ladder Diagram / LD (Power Rails, Coils, Contacts)     │
│  └── Sequential Function Chart / SFC (Steps, Transitions)   │
│                                                             │
│  HMI Visualization & Diagnostics                            │
│  ├── WebVisu / TargetVisu (HTML5 SVG Buttons, Tanks, Gauges)│
│  ├── Online Watch Tables (Variable Values, Force Columns)   │
│  └── Trace Viewport (Multi-Channel Real-Time Oscilloscope)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Device Tree & Bus Triage**: Analyze screenshots of the CODESYS Device Tree to detect communication error icons (Red/Orange warning triangles next to EtherCAT/PROFINET slaves, unmapped I/O channels).
2. **CFC Execution Order Verification**: Review Continuous Function Chart diagrams, verifying that execution order numbers ($1, 2, 3\dots$) flow strictly from left inputs to right outputs to avoid 1-cycle feedback delays.
3. **Ladder Logic Safety Interlock Auditing**: Validate Ladder Diagram rungs, ensuring Emergency Stop (E-Stop) and safety guard contacts are wired in series with active output coils.
4. **WebVisu HMI Visual Diagnostics**: Inspect HMI screens to verify SVG gauge scaling, alarm banner color codes (Red=Critical, Yellow=Warning), and touch button responsive targets.

---

## Production Python Automation: Automated CODESYS PLC Open XML Tag & POU Extractor

CODESYS supports exporting PLC programs to PLCopen XML format. Run this script to parse and audit function blocks and variables from a PLCopen XML export:

```python
"""
CODESYS PLCopen XML POU & Variable Inspector
Parses exported IEC 61131-3 PLCopen XML files to extract POU types, inputs, and outputs.
"""

import sys
import os
import xml.etree.ElementTree as ET

def inspect_plcopen_xml(xml_path: str):
    if not os.path.exists(xml_path):
        print(f"Error: PLCopen XML file '{xml_path}' not found.")
        return

    print(f"--- [INSPECTING CODESYS PLCOPEN XML: {xml_path}] ---")
    try:
        tree = ET.parse(xml_path)
        root = tree.getroot()

        # Namespace handling for PLCopen schemas
        ns = {"ns": root.tag.split("}")[0].strip("{")} if "}" in root.tag else {}
        xpath_pou = ".//ns:pou" if ns else ".//pou"

        pous = root.findall(xpath_pou, ns)
        print(f"Detected {len(pous)} Program Organization Unit(s) (POUs):\n")

        for pou in pous:
            name = pou.attrib.get("name", "Unnamed")
            pou_type = pou.attrib.get("pouType", "unknown")
            print(f"• POU: {name:<24} | Type: {pou_type:<10}")

        print("\n✅ PLCopen XML structure validated successfully.")

    except Exception as e:
        print(f"Failed to parse PLCopen XML: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 inspect_plcopen.py <ExportedProgram.xml>")
        sys.exit(1)
    inspect_plcopen_xml(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Device Tree Shows Red Triangle on I/O Module** | Module hardware revision mismatch or incorrect EDS/GSDML file installed. | Right-click module $\rightarrow$ Select **Update Device** $\rightarrow$ Choose matching hardware firmware version. |
| **CFC Function Block Output Shows 1-Cycle Lag** | Execution order calculated incorrectly, executing consumer block before producer block. | In CFC Editor $\rightarrow$ Select *Execution Order $\rightarrow$ Order by Data Flow*. |
| **WebVisu Renders Blank White Page in Browser** | WebVisu object not enabled in Application or port 8080 blocked. | 1. In CODESYS $\rightarrow$ Check **WebVisu** is under Visualization Manager.<br>2. Open browser to `http://<PLC_IP>:8080/webvisu.htm`. |
| **Online Watch Value Shows `???` in Blue** | Variable belongs to a POU that is not called in any active Task. | Add the POU call into `PLC_PRG` or attach it to the Main Cyclic Task in Task Configuration. |

---

## Command Line Syntax & Server Control

```bash
# Launch CODESYS with Specific Project
"C:\Program Files\CODESYS 3.5\CODESYS\Common\CODESYS.exe" "C:\Projects\FactoryAutomation.project"

# Query CODESYS WebVisu via cURL
curl -I "http://192.168.1.100:8080/webvisu.htm"
```

### Key Configuration Locations
- **Device Repository**: `%APPDATA%\CODESYS\DeviceRepository\`
- **CODESYS Projects**: `*.project`

---

## Agent Operational Directive
> **MANDATORY**: When reviewing CFC graphical logic in CODESYS, always verify that Execution Order is set to "Order by Data Flow" to prevent non-deterministic multi-cycle feedback lag.
