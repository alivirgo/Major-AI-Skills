---
title: "CODESYS V3.5 IEC 61131-3 Industrial Automation AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize CODESYS V3.5, Structured Text (ST) state machines, OPC UA clients (asyncua), and PLCopen XML generation."
category: "IEC 61131-3 PLC Development Platform"
tags: ["codesys", "structured-text-st", "opc-ua-client", "asyncua", "plcopen-xml", "gpt-codex", "industrial-automation"]
---

# CODESYS V3.5 IEC 61131-3 Industrial Automation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
CODESYS V3.5 provides programmable industrial automation through **IEC 61131-3 Structured Text (ST)**, an embedded **OPC UA Server (IEC 62541)**, and open **PLCopen XML schemas**. GPT/Codex acts as a Principal Industrial Controls Software Engineer and OPC UA Automation Developer, delivering **type-safe Structured Text algorithms**, **OPC UA Python telemetry clients (`asyncua`)**, **programmatic PLCopen XML generators**, and **automated continuous integration pipelines**.

### Developer Architecture & Automation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 CODESYS Developer Platform                  │
│                                                             │
│  IEC 61131-3 Structured Text (ST) Core                      │
│  ├── Type-Safe Function Blocks (FB), Functions & Programs   │
│  ├── Object-Oriented Industrial Extensions (Interfaces/EXT) │
│  └── Deterministic State Machines & Alarm Handlers          │
│                                                             │
│  OPC UA & Data Integration Layer                            │
│  ├── Embedded OPC UA Server (`opc.tcp://<ip>:4840`)         │
│  ├── Python `asyncua` Client Automation Scripts             │
│  └── Symbol Configuration XML Mappings                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **IEC 61131-3 Structured Text (ST) Development**: Author clean, type-safe Structured Text code implementing robust state machines (`CASE state OF`), hysteresis filters, and motor sequence controllers.
2. **OPC UA Telemetry Client (`asyncua`) Scripting**: Construct asynchronous Python scripts connecting to CODESYS OPC UA servers on port 4840 to read live variables, subscribe to alarms, and write setpoints.
3. **Automated PLCopen XML Generation**: Write Python tools to generate valid PLCopen XML schemas containing variable declarations and Structured Text bodies.
4. **Unit Testing with CODESYS Test Manager**: Author automated regression test scripts evaluating PLC algorithms against simulation targets.

---

## Production Python Automation: Async OPC UA Telemetry Client for CODESYS (`asyncua`)

Save this script as `codesys_opc_client.py` (requires `pip install asyncua`):

```python
"""
CODESYS OPC UA Industrial Telemetry Client (asyncua)
Connects to embedded CODESYS OPC UA Server (Port 4840) to read PLC tags and write setpoints.
"""

import asyncio
import sys
from asyncua import Client, ua

OPC_SERVER_URL = "opc.tcp://192.168.1.100:4840"

async def monitor_codesys_plc():
    print(f"--- [CONNECTING TO CODESYS OPC UA SERVER: {OPC_SERVER_URL}] ---")
    
    async with Client(url=OPC_SERVER_URL) as client:
        print("✅ Connected to CODESYS OPC UA Server!")

        # 1. Query Server Namespace
        ns_idx = await client.get_namespace_index("http://yourorganisation.org/test/")
        print(f"• Application Namespace Index: {ns_idx}")

        # 2. Read Tag: Application.GVL.rMotorSpeed
        try:
            speed_node = client.get_node(f"ns=4;s=|var|CODESYS Control for Linux ARM64.Application.GVL.rMotorSpeed")
            speed_val = await speed_node.read_value()
            print(f"• Current Motor Speed: {speed_val:.2f} RPM")

            # 3. Write Setpoint: Application.GVL.bStartMotor
            start_node = client.get_node(f"ns=4;s=|var|CODESYS Control for Linux ARM64.Application.GVL.bStartMotor")
            await start_node.write_value(ua.DataValue(ua.Variant(True, ua.VariantType.Boolean)))
            print("• Dispatched Motor Start Command: TRUE")

        except Exception as e:
            print(f"Notice: Ensure Symbol Configuration is built and downloaded in CODESYS. ({e})")

if __name__ == "__main__":
    asyncio.run(monitor_codesys_plc())
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`BadNodeIdUnknown` on OPC UA Read** | Tag not selected in CODESYS Symbol Configuration or Application not downloaded. | In CODESYS, open **Symbol Configuration** $\rightarrow$ Check variable boxes $\rightarrow$ Re-build and download to PLC. |
| **ST Array Out of Bounds Exception** | Structured Text loop exceeded upper bound of statically declared array. | Use `UPPER_BOUND(arr, 1)` and `LOWER_BOUND(arr, 1)` to iterate safely over dynamic bounds. |
| **OPC UA Server Connection Timeout** | Port 4840 blocked by Linux firewall on IPC target. | On PLC host, run: `sudo ufw allow 4840/tcp`. |
| **Structure Alignment Memory Fault on ARM** | Packed structure containing unaligned 32/64-bit variables accessed on strict alignment CPU. | In CODESYS $\rightarrow$ Add `{attribute 'pack_mode' := '0'}` or align data elements manually. |

---

## Command Line Syntax & Batch Processing

```bash
# Query CODESYS OPC UA Port Availability
python3 -c "import socket; s = socket.socket(); s.connect(('192.168.1.100', 4840)); print('OPC UA Port 4840 Open!'); s.close()"

# Run Async OPC UA Telemetry Client
python3 codesys_opc_client.py
```

### Essential File Locations
- **Symbol Configuration**: `SymbolConfiguration.xml` inside project build tree
- **OPC UA Default Port**: TCP `4840`

---

## Agent Operational Directive
> **MANDATORY**: When exposing Structured Text variables to external SCADA/MES systems via OPC UA, always configure and compile the "Symbol Configuration" object in the CODESYS project tree.
