---
title: "Siemens TIA Portal Industrial Automation AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot TIA Portal Project Trees, SCL code blocks, LAD online power flow, Watch Tables, and PROFINET Topology views."
category: "Integrated PLC & HMI Engineering"
tags: ["siemens-tia-portal", "project-tree-ui", "scl-editor", "lad-powerflow", "gemini", "profinet-topology", "watch-tables-ui"]
---

# Siemens TIA Portal Industrial Automation AI Skill Guide (Gemini)

## Overview & Engine Architecture
Siemens TIA Portal provides a unified industrial engineering user interface featuring the **Project Tree (PLC Program Blocks, PLC Tags, Technology Objects)**, the **Structured Control Language (SCL)** and **Ladder (LAD)** editors with real-time green dashed power flow monitoring, the **PROFINET Network & Topology View**, and **Watch & Force Tables**. Gemini acts as an AI Industrial Automation Systems Auditor and Siemens PLC Specialist, specializing in **multimodal Project Tree navigation**, **LAD power flow logic diagnostics**, **PROFINET physical topology verification**, and **Online Diagnostics buffer reviews**.

### Visual Analytics & Industrial Automation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 TIA Portal Visual Operations                │
│                                                             │
│  Project Navigation & Logic Editors                         │
│  ├── Project Tree (OBs, FBs, FCs, DBs, Technology Objects)  │
│  ├── Ladder Editor (LAD Green Dashed Rung Power Flow HUD)   │
│  ├── SCL Editor (Structured Text Highlighting & Call Stacks)│
│  └── WinCC Unified Screens (HTML5 Vector Faceplates & Trends)│
│                                                             │
│  Hardware, Networking & Diagnostics                         │
│  ├── PROFINET Topology View (Green Link Lines, Port Mapping)│
│  ├── Watch Table & Force Table Grid (Display Format / Force)│
│  └── Diagnostic Buffer HUD (Event ID, Timestamp, Call Stack)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Project Tree Inspection**: Analyze screenshots of the TIA Portal Project Tree to verify organization block types (`OB1` Main, `OB30` Cyclic, `OB82` Diagnostic Interrupt, `OB121` Programming Error) and identify compile warning badges.
2. **LAD Power Flow Online Diagnostics**: Review live ladder rungs during online monitoring (green dashed line = power active; blue dotted line = power inactive) to detect broken interlock conditions.
3. **PROFINET Topology View Triage**: Inspect the graphical PROFINET Topology View to ensure physical Ethernet port connections (e.g. `Port 1` of PLC connected to `Port 1` of ET 200SP interface module) match the designed topology for Fast Startup (FSU) and Device Replacement without Exchangeable Medium.
4. **Diagnostic Buffer Analysis**: Review Diagnostic Buffer event logs to pinpoint hardware faults (e.g. wire break on analog input channel or module power supply missing).

---

## Production Python Automation: Automated Siemens SCL Code & Data Block Generator

Run this script to programmatically generate structured SCL source text (`.scl`) ready for import into TIA Portal:

```python
"""
Siemens SCL Source Code Generator
Generates a complete, type-safe Structured Control Language (SCL) Function Block for TIA Portal.
"""

import sys

def generate_motor_scl(motor_name: str, output_file: str):
    print(f"--- [GENERATING SIEMENS SCL FUNCTION BLOCK: {motor_name}] ---")

    scl_content = f"""// ==============================================================================
// Function Block: FB_{motor_name}_Control
// Implements 3-wire motor control with overload interlock and running timer in SCL.
// ==============================================================================
FUNCTION_BLOCK "FB_{motor_name}_Control"
{{ S7_Optimized_Access := 'TRUE' }}
VERSION : 0.1

VAR_INPUT
    bStart_PB : Bool;          // Momentary Start Pushbutton
    bStop_PB : Bool;           // Normally Closed Stop Pushbutton (True when OK)
    bOverload_Tripped : Bool;  // Thermal Overload Relay Contact (True when Tripped)
    tMaxRunTime : Time;        // Maximum continuous run time limit
END_VAR

VAR_OUTPUT
    bMotor_Run_Out : Bool;     // Contactor Output Command
    bAlarm_Fault : Bool;       // Motor Overload or Timeout Fault
    tElapsedTime : Time;       // Current Continuous Run Duration
END_VAR

VAR
    statTimer : TON_TIME;      // IEC On-Delay Timer Instance
END_VAR

BEGIN
    // 1. Motor Start / Stop Interlock Logic
    IF #bStop_PB AND NOT #bOverload_Tripped THEN
        IF #bStart_PB THEN
            #bMotor_Run_Out := TRUE;
        END_IF;
    ELSE
        #bMotor_Run_Out := FALSE;
    END_IF;

    // 2. Overload Alarm Detection
    IF #bOverload_Tripped THEN
        #bAlarm_Fault := TRUE;
    ELSE
        #bAlarm_Fault := FALSE;
    END_IF;

    // 3. Continuous Run Duration Timer
    #statTimer(IN := #bMotor_Run_Out,
               PT := #tMaxRunTime,
               Q => #bAlarm_Fault,
               ET => #tElapsedTime);
END_FUNCTION_BLOCK
"""

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(scl_content)

    print(f"✅ Generated SCL source file: {output_file}")
    print("To import: In TIA Portal, right-click 'External source files' -> Add new external file -> Generate blocks from source.")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "FB_Motor_Control.scl"
    generate_motor_scl("Conveyor101", out)
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **LAD Rung Shows Blue Dotted Line on Output Coil** | Upstream condition evaluated false (e.g. normally-closed stop contact or safety relay open). | Trace the green power line across the rung to locate the first un-energized contact. |
| **PROFINET Topology Shows Red Crossed Line on Port** | Physical cable plugged into Port 2 instead of Port 1 as defined in the configured topology. | Swap cable to matching hardware port or in Topology View click **Synchronize with physical device**. |
| **Diagnostic Buffer Logs `Event ID 16#02:39CB (Stop caused by OB)`** | CPU transitioned to STOP mode due to unhandled programming error (e.g. divide by zero or array index out of bounds). | Add Error Organization Blocks: insert `OB121` (Programming Error) and `OB122` (I/O Access Error) to allow CPU to continue running while logging faults. |
| **HMI Screen Tag Values Display `####`** | WinCC HMI unable to communicate with PLC or field width too narrow for integer value. | 1. Check HMI Connection status in TIA Portal.<br>2. In IO Field properties, increase format pattern width (e.g. from `999` to `99999`). |

---

## Command Line Syntax & Server Control

```bash
# Launch TIA Portal
"C:\Program Files\Siemens\Automation\Portal V19\Bin\Siemens.Automation.Portal.exe"

# Query S7-1500 Integrated Web Server Diagnostics
curl -k -I "https://192.168.0.1"
```

### Key Configuration Locations
- **TIA Portal Projects**: `*.ap18`, `*.ap19`
- **GSD / GSDML Hardware Files**: `C:\Users\Public\Documents\Siemens\Automation\GSDML\`

---

## Agent Operational Directive
> **MANDATORY**: Always configure `OB121` (Programming Error) and `OB122` (I/O Access Error) in production SIMATIC S7-1500 projects to prevent unexpected CPU STOP transitions caused by minor peripheral communication errors.
