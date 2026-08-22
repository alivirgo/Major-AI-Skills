---
title: "IBM Maximo Enterprise Asset Management AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize IBM Maximo, MBO Jython APIs, OSLC REST payloads, MIF XML integrations, and database automation."
category: "Enterprise Asset Management (EAM)"
tags: ["ibm-maximo", "jython-automation", "oslc-api", "gpt-codex", "mif-integration", "eam-devops"]
---

# IBM Maximo Enterprise Asset Management AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
IBM Maximo provides an extensible enterprise API layer, embedded Jython scripting engines, and the Maximo Integration Framework (MIF) for asynchronous event processing. GPT/Codex acts as a Principal Maximo Automation Engineer and Enterprise Integration Architect, delivering **Jython Automation Scripts**, **Python OSLC REST client libraries**, **MIF XML/JSON payload transformers**, and **automated database migration routines**.

### Developer Architecture & Integration Engine Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Maximo Developer Platform                   │
│                                                             │
│  Scripting Engine & Launch Points                           │
│  ├── Object Launch Points (Save, Validate, Add, Delete)     │
│  ├── Attribute Launch Points (Initialize, Validate)         │
│  └── Action & Custom Condition Launch Points                │
│                                                             │
│  Integration Framework & REST Protocols                     │
│  ├── NextGen OSLC REST API (`/oslc/os/`, `/oslc/script/`)   │
│  ├── Enterprise Service & Publish Channel Processing        │
│  └── JSON Mapping Engine & Object Structures (`MXASSET`)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Jython Automation Scripting**: Author performant Jython scripts implementing MBO transactions (`mbo.getMboSet()`, `mboSet.add()`, `mbo.setValue()`) with defensive null-checks.
2. **OSLC REST API Payload Generation**: Build programmatic Python integration scripts to create, update, and bulk-load Maximo assets, meters, and inventory items via authenticated OSLC endpoints.
3. **MIF Custom Java / Jython User Exit Rules**: Develop User Exit and Processing Rule scripts to transform external JSON payloads into native Maximo MBO structures.
4. **Database Configuration Automation**: Author SQL scripts to register new tables, attributes, and relationships directly within `MAXOBJECT`, `MAXATTRIBUTE`, and `MAXRELATIONSHIP`.

---

## Production Python Automation: Automated Work Order Creator via OSLC REST

Save this script as `create_maximo_workorder.py` to programmatically generate work orders with line items via Maximo OSLC API:

```python
"""
Maximo OSLC REST API Work Order Generator
Creates an approved Work Order with associated tasks and material reservations.
"""

import sys
import requests
import json

MAXIMO_BASE_URL = "https://maximo.enterprise.io/maximo/oslc"
API_KEY = "your-maximo-api-key"

def create_work_order(site_id: str, asset_num: str, description: str, priority: int = 2):
    url = f"{MAXIMO_BASE_URL}/os/mxwo"
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json",
        "properties": "wonum,status,description,assetnum,siteid"
    }

    # Payload matching MXWO Object Structure
    payload = {
        "siteid": site_id,
        "assetnum": asset_num,
        "description": description,
        "wopriority": priority,
        "worktype": "EM", # Emergency Maintenance
        "status": "WAPPR",
        "wosequence": 1,
        # Nested Task Line Items
        "woactivity": [
            {
                "taskid": 10,
                "description": "Isolate Electrical Supply & Lockout/Tagout",
                "estdur": 0.5
            },
            {
                "taskid": 20,
                "description": "Inspect and Replace Faulty Drive Motor",
                "estdur": 2.0
            }
        ]
    }

    print(f"Submitting Work Order for Asset: {asset_num} to Maximo...")
    response = requests.post(url, headers=headers, json=payload, verify=True)
    
    if response.status_code in (200, 201):
        result = response.json()
        wonum = result.get("wonum")
        status = result.get("status")
        print(f"✅ Success! Created Work Order: {wonum} [Status: {status}]")
    else:
        print(f"🚨 Failed with HTTP {response.status_code}:\n{response.text}")

if __name__ == "__main__":
    create_work_order(site_id="BEDFORD", asset_num="PUMP-101", description="Main Coolant Pump High Vibration Alert", priority=1)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`MboSet.save() called within Automation Script` Error** | Explicitly calling `.save()` inside an Object Launch Point triggers an illegal nested transaction. | Never call `mboSet.save()` or `mbo.getThisMboSet().save()` within Save/Validate launch points; Maximo manages the outer transaction boundary automatically. |
| **OSLC API Returns `403 Forbidden: CSRF Token Invalid`** | Client attempted state-modifying POST/PUT request without `x-public-uri` or session CSRF token. | 1. Use API Key authentication header (`apikey: ...`).<br>2. Pass header `x-public-uri: https://maximo.enterprise.io/maximo/oslc`. |
| **`OutOfMemoryError: Metaspace / Java Heap` in WebSphere** | Compiling thousands of dynamic Automation Scripts without Jython script caching enabled. | In `maximo.properties`, verify `mxe.scripting.cache=1` is set to enable compiled bytecode caching. |
| **MIF Publish Channel XML Missing Custom Fields** | Custom attributes added to the MBO were not included in the associated Object Structure sub-elements. | Open *Integration $\rightarrow$ Object Structures $\rightarrow$ MXWO* $\rightarrow$ Select Sub-Record $\rightarrow$ Click **Exclude/Include Fields** $\rightarrow$ Enable custom fields. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute Maximo Automation Script via OSLC REST Endpoint
curl -X POST "https://maximo.enterprise.io/maximo/oslc/script/CALCULATE_METRIC" \
     -H "apikey: your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"assetnum": "PUMP-101", "runtime_hours": 1250}'

# Rebuild and Encrypt Database Password in maximo.properties
encryptproperties.bat
```

### Essential File Locations
- **Script Directory**: `C:\IBM\SMP\maximo\tools\maximo\`
- **Properties File**: `maximo.properties`

---

## Agent Operational Directive
> **MANDATORY**: Never invoke `mboSet.save()` inside Jython Automation Scripts, as Maximo's transaction framework manages commits automatically. Always enable script bytecode caching in high-concurrency environments.
