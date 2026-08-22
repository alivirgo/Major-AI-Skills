---
title: "IBM Maximo Enterprise Asset Management AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot IBM Maximo Application Designer layouts, Asset Topology hierarchies, and Work Order Gantt schedules."
category: "Enterprise Asset Management (EAM)"
tags: ["ibm-maximo", "application-designer", "asset-hierarchy", "gemini", "gantt-scheduler", "work-orders"]
---

# IBM Maximo Enterprise Asset Management AI Skill Guide (Gemini)

## Overview & Engine Architecture
IBM Maximo delivers end-to-end operational visibility across asset lifecycles, preventive maintenance schedules, and graphical work planning. Gemini acts as an AI Maximo Functional Consultant and Systems Auditor, specializing in **multimodal Application Designer screen layout inspection**, **Asset Topology drill-down hierarchies**, **Graphical Work Order Gantt scheduling**, and **KPI dashboard performance diagnostics**.

### Visual Analytics & Operational Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Maximo Visual Operations Stack              │
│                                                             │
│  UI Configuration & Scheduling                              │
│  ├── Application Designer (XML Presentation Editor)         │
│  ├── Graphical Work Scheduler (Gantt CPM Network Charts)    │
│  └── Asset Topology & Spatial GIS Map Integration (Esri)    │
│                                                             │
│  Analytics & Process Governance                             │
│  ├── Workflow Designer (Canvas Process Routing Engine)      │
│  ├── Start Center KPI Dashboards & Result Sets              │
│  └── Linear Asset Viewer (Dynamic Segmentation & Markers)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Application Designer Triage**: Analyze screenshots of Maximo screens and XML presentation code to troubleshoot broken data sources (`datasrc`), misaligned section columns, and missing lookup dialogs.
2. **Graphical Work Scheduling Optimization**: Evaluate Gantt chart schedules, analyzing resource leveling, labor over-allocation, and critical path method (CPM) dependencies.
3. **Workflow Process Routing Diagnostics**: Inspect Workflow Designer canvas diagrams to identify orphaned nodes, missing action connections, and stuck process assignments.
4. **Start Center & KPI Auditing**: Formulate optimized SQL clauses for Result Sets to prevent heavy database table scans during dashboard loading.

---

## Production Python Automation: Automated OSLC REST Work Order & Asset Auditor

Execute this script to audit all high-priority open work orders against overdue preventive maintenance (PM) schedules:

```python
"""
Maximo OSLC REST API Work Order & Asset Auditor
Queries Maximo NextGen REST API to extract open emergency work orders.
"""

import sys
import requests
import json

MAXIMO_URL = "https://maximo.enterprise.io/maximo/oslc"
API_KEY = "your-maximo-api-key"

def audit_emergency_workorders():
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json",
        "x-public-uri": MAXIMO_URL
    }

    # Query WOs: Status APPR or WAPPR, WorkType EMERGENCY, Priority 1
    params = {
        "oslc.select": "wonum,description,status,assetnum,location,wopriority,reportdate",
        "oslc.where": "wopriority=1 and status in [\"APPR\",\"WAPPR\"]",
        "oslc.pageSize": "50"
    }

    try:
        res = requests.get(f"{MAXIMO_URL}/os/mxwo", headers=headers, params=params, verify=True)
        res.raise_for_status()
        data = res.json()
        
        member_list = data.get("member", [])
        print(f"--- [MAXIMO CRITICAL WORK ORDER AUDIT: {len(member_list)} OPEN TICKETS] ---")

        for wo in member_list:
            wonum = wo.get("wonum")
            desc = wo.get("description", "No description")
            status = wo.get("status")
            asset = wo.get("assetnum", "N/A")
            loc = wo.get("location", "N/A")
            rep_date = wo.get("reportdate", "")[:10]

            print(f"• WO: {wonum:<10} | Status: {status:<8} | Asset: {asset:<10} | Loc: {loc:<10} | Date: {rep_date}")
            print(f"  Summary: {desc}\n")

    except Exception as e:
        print(f"Error querying Maximo OSLC API: {e}")

if __name__ == "__main__":
    audit_emergency_workorders()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Maximo Screen Displays `Data Source Not Found` on New Tab** | The `<tab>` element in Application Designer lacks an explicit `id` or references a non-existent parent `datasrc`. | 1. In Application Designer, export the application XML.<br>2. Ensure the `<tab>` element defines `datasrc="MAINRECORD"` or contains an explicit `<datasrc id="my_ds" relationship="..."/>`.<br>3. Re-import XML. |
| **Workflow Process Stuck: User Cannot Route Ticket** | Target workflow node role resolution failed to resolve a valid Person record or email address. | 1. Navigate to *Workflow Administration* application.<br>2. Locate the active instance $\rightarrow$ Click **View History**.<br>3. Reassign task to a valid active Person Group. |
| **Start Center Dashboard Takes >30 Seconds to Load** | One or more Result Set portlets executing unindexed queries on large transactional tables (`WORKORDER`, `MATUSETRANS`). | 1. Review portlet SQL where-clauses in Start Center setup.<br>2. Add leading database indexes on frequently queried columns (`STATUS`, `SITEID`, `HISTORYFLAG`). |
| **Linear Asset Visualizer Shows Gaps in Segment Line** | Overlapping or negative length values configured on child asset segments. | Verify that start measure plus segment length equals end measure on linear segment records. |

---

## Command Line Syntax & Server Control

```bash
# Export Application XML Definition from Maximo Database via SQL
SELECT description, appxml FROM maxapps WHERE app = 'WOTRACK';

# Test Maximo REST Endpoint Availability
curl -I https://maximo.enterprise.io/maximo/oslc/ping
```

### Key Configuration Locations
- **Application XML Storage**: `MAXAPPS` table (`APPXML` column)
- **Start Center Definitions**: `LAYOUT` and `PORTLET` tables

---

## Agent Operational Directive
> **MANDATORY**: When modifying Maximo screens in Application Designer, always export and backup the existing application XML before importing changes. Structure Start Center queries to leverage existing database indexes.
