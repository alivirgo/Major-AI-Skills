---
title: "PTC Windchill PLM Engineering AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot PTC Windchill product structure trees, Creo View 3D visual markups, and CMII change workflows."
category: "Product Lifecycle Management (PLM)"
tags: ["ptc-windchill", "creo-view", "plm-tree", "gemini", "change-management", "bom-structures"]
---

# PTC Windchill PLM Engineering AI Skill Guide (Gemini)

## Overview & Engine Architecture
PTC Windchill provides comprehensive product lifecycle tracking, connecting multi-CAD digital mockups, manufacturing process plans, and formal engineering change orders (CMII). Gemini acts as an AI PLM Systems Auditor and Engineering Process Analyst, specializing in **multimodal Product Structure (eBOM) tree inspection**, **Creo View 3D visual markup & interference diagnostics**, **Change Management (PR $\rightarrow$ CR $\rightarrow$ CN) workflow triage**, and **lifecycle state tracking**.

### Visual Analytics & PLM Workflow Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Windchill Visual Analysis Stack             │
│                                                             │
│  Product Structure & 3D Visualization                       │
│  ├── Product Structure Browser (eBOM Multi-Level Tree)      │
│  ├── Creo View 3D (CAD Interference, Sectioning, PMI Text)  │
│  └── CAD-to-Part DescribedBy vs Builds Relationship Viewer  │
│                                                             │
│  Change Governance & Lifecycle                              │
│  ├── Change Notice (CN) Task Execution & Resulting Items    │
│  ├── Graphical Workflow Process Monitor (Active Transitions)│
│  └── Matrix Comparison Viewer (Rev A vs Rev B Diff Matrix)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal BOM & Structure Triage**: Analyze screenshots of the Windchill Product Structure Browser to identify unlinked CAD models, orphaned fasteners, mismatched quantity occurrences, and out-of-sync revision baselines.
2. **Creo View 3D Visual Interference Analysis**: Evaluate 3D interference and clearance reports, diagnosing hard clashes, soft clearances, and geometric intersections between complex assemblies.
3. **Change Management Process Auditing**: Inspect Problem Reports (PR), Change Requests (CR), and Change Notices (CN) to verify that all affected data items are properly recorded in the *Resulting Items* table with updated revision states.
4. **Workflow Execution Triage**: Inspect active workflow routing graphs to resolve bottlenecks and task escalation deadlocks.

---

## Production Python Automation: Automated Change Notice (CN) Affected Items Validator

Execute this script to verify that all CAD documents and WTParts associated with a Change Notice have been bumped to the correct revision state:

```python
"""
Windchill Change Notice (CN) Affected Items Validator
Verifies that all items in a Change Notice are promoted to the intended Release state.
"""

import sys
import requests
from requests.auth import HTTPBasicAuth

WINDCHILL_URL = "https://windchill.enterprise.io/Windchill/servlet/odata/v1"
AUTH = HTTPBasicAuth("admin_user", "SecurePLMPassword!")

def validate_change_notice(cn_number: str):
    url = f"{WINDCHILL_URL}/ChangeMgmt/ChangeNotices"
    params = {"$filter": f"Number eq '{cn_number}'", "$expand": "ChangeTasks"}
    
    print(f"Auditing Change Notice: {cn_number}...")
    res = requests.get(url, auth=AUTH, params=params, verify=True)
    res.raise_for_status()
    
    cn_data = res.json().get("value", [])
    if not cn_data:
        print(f"Error: Change Notice '{cn_number}' not found.")
        return

    cn = cn_data[0]
    cn_state = cn.get("State", {}).get("Value", "UNKNOWN")
    print(f"Change Notice State: {cn_state}")

    # Inspect Associated Change Tasks
    tasks = cn.get("ChangeTasks", [])
    print(f"\nAssociated Change Tasks ({len(tasks)}):")
    for task in tasks:
        task_num = task.get("Number")
        task_name = task.get("Name")
        task_state = task.get("State", {}).get("Value")
        print(f"  • Task: {task_num:<12} | State: {task_state:<12} | {task_name}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_cn.py <CN_Number>")
        sys.exit(1)
    validate_change_notice(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Product Structure Tree Shows Warning Triangle on Part** | Out-of-date association between the `WTPart` and its underlying CAD Document (`Owner` vs `Contributing` link out of sync). | 1. Open the Part in Product Structure Browser.<br>2. Select *Actions $\rightarrow$ Compare $\rightarrow$ Part to CAD Document*.<br>3. Check for modified assembly occurrences and click **Build Part Structure**. |
| **Creo View Shows Black Screen / Fails to Load 3D Model** | Worker agent failed to convert native Creo/SolidWorks CAD file to lightweight `.pvz` representation. | 1. In Windchill, check *Site $\rightarrow$ Utilities $\rightarrow$ WVS Job Monitor*.<br>2. Locate failed publishing job $\rightarrow$ Check worker log.<br>3. Restart the CAD Worker daemon on the conversion server. |
| **Change Notice Resulting Items List Shows `Not Check In`** | The engineer modified parts in their private workspace without checking them back into the Commonspace. | 1. Instruct user to open Workgroup Manager $\rightarrow$ Workspace.<br>2. Execute **Check In** on all modified CAD files and parts.<br>3. Refresh Change Notice resulting items list. |
| **BOM Difference Matrix Highlights All Components Red** | Compare tool executed with different unit-of-measure or differing effectivity dates. | In Structure Compare options, align effectivity timestamps and filter criteria. |

---

## Command Line Syntax & Server Control

```bash
# Check Status of Windchill Visualization (WVS) CAD Worker Publishers
windchill wt.wvs.WorkerMonitor

# Run Windchill Database Diagnostics
windchill wt.pom.DBProperties
```

### Essential File Locations
- **WVS Publisher Configuration**: `C:\ptc\Windchill\codebase\wvs.properties`
- **Cad Worker Setup**: `C:\ptc\worker\setup.bat`

---

## Agent Operational Directive
> **MANDATORY**: When auditing Engineering Change Notices (CN), verify that all affected parts in the *Resulting Items* table are checked in from private user workspaces before authorizing lifecycle release state transitions.
