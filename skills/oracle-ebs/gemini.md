---
title: "Oracle E-Business Suite (EBS) AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Oracle Forms screens, Concurrent Request Logs, OAF Personalizations, and Flexfields."
category: "Oracle E-Business Suite Desktop Client"
tags: ["oracle-ebs", "oracle-forms", "concurrent-requests", "gemini", "oaf-personalization", "flexfield-diagnostics"]
---

# Oracle E-Business Suite (EBS) AI Skill Guide (Gemini)

## Overview & Engine Architecture
Oracle E-Business Suite (EBS R12.2) integrates classical Oracle Forms desktop applets and modern browser-based Oracle Application Framework (OAF) pages. Gemini acts as an AI Oracle EBS Functional Consultant and Systems Auditor, specializing in **multimodal Oracle Forms screen triage**, **Concurrent Request Log & Output file diagnostics**, **Descriptive Flexfield (DFF) configuration analysis**, and **OAF UI personalization validation**.

### Visual Operations & User Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Oracle EBS Visual Interface                 │
│                                                             │
│  Interactive UI Presentation                                │
│  ├── Oracle Forms Thick Client (Multi-Row Block Data Entry) │
│  ├── OAF (OA Framework HTML Web Applications / Self-Service)│
│  └── Concurrent Request Status & Output Viewer (PDF/Text)   │
│                                                             │
│  Configuration & Extensibility Viewers                      │
│  ├── Descriptive & Key Flexfield (DFF/KFF) Segment Windows  │
│  ├── Responsibility & Function Navigator Menus              │
│  └── Workflow Status Monitor Diagram (Worklist Notifications│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Forms Screen Triage**: Analyze screenshots of Oracle Forms error dialogs (`FRM-40735`, `APP-FND-01564`, `ORA-01403: no data found`) to identify unhandled triggers (`WHEN-BUTTON-PRESSED`, `POST-QUERY`) and missing required fields.
2. **Concurrent Request Log Diagnostics**: Review raw `.log` and `.out` text outputs to isolate SQL exceptions, memory allocation failures in C report executables (`FNDLIBR`), and data formatting errors.
3. **Descriptive Flexfield (DFF) & Value Set Validation**: Diagnose segment qualifier mismatches, unvalidated table-validated value sets, and context field synchronization bugs.
4. **OAF Personalization Triage**: Inspect OAF metadata definitions (`MDS` repository) to resolve broken custom field references and misconfigured page layouts.

---

## Production Python Automation: Automated Concurrent Request Log & Error Analyzer

Execute this script to scan an extracted Oracle EBS concurrent request log directory for common fatal database errors:

```python
"""
Oracle EBS Concurrent Request Log Diagnostic Tool
Scans request logs for fatal ORA-, APP-, and FRM- error signatures.
"""

import sys
import os
import re

ERROR_PATTERNS = [
    (r"(ORA-\d{5}:.*)", "Oracle Database Error"),
    (r"(APP-FND-\d{5}:.*)", "Application Framework Error"),
    (r"(FRM-\d{5}:.*)", "Oracle Forms Engine Error"),
    (r"(REP-\d{4}:.*)", "Oracle Reports Runtime Error"),
    (r"(Assertion failed:.*)", "C-Executable Core Dump / Assertion")
]

def analyze_concurrent_log(log_path: str):
    if not os.path.exists(log_path):
        print(f"Error: Log file '{log_path}' does not exist.")
        return

    print(f"--- [ANALYZING CONCURRENT REQUEST LOG: {log_path}] ---")
    findings = []

    with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
        for line_no, line in enumerate(f, 1):
            for pattern, category in ERROR_PATTERNS:
                match = re.search(pattern, line)
                if match:
                    findings.append((line_no, category, match.group(1).strip()))

    if findings:
        print(f"🚨 DETECTED {len(findings)} FATAL LOG SIGNATURES:\n")
        for line_no, cat, msg in findings[:10]:
            print(f"• [Line {line_no:>4}] {cat:<26}: {msg}")
    else:
        print("✅ Log analysis passed: No fatal ORA/APP/FRM error signatures detected.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_ebs_log.py <request.log>")
        sys.exit(1)
    analyze_concurrent_log(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`FRM-40735: ON-ERROR trigger raised unhandled exception ORA-01403`** | An Oracle Forms PL/SQL query expected a single row return but found no matching records in the underlying table. | 1. In Forms, press `Ctrl + Shift + E` to view the full error stack.<br>2. Check for missing foreign key master records (e.g. inactive customer or closed GL period). |
| **Forms Shows Yellow Screen / Stalled Cursor on LOV Selection** | List of Values (LOV) query executing an unindexed full-table scan on millions of records without a reduction filter. | 1. Advise users to type `%keyword%` in the search field before pressing find.<br>2. Add database indexes to the leading columns in the LOV record group query. |
| **OAF Page Displays `Error 500: Page Cannot Be Displayed`** | MDS XML Personalization was corrupted during site-level customization. | 1. Launch page with personalization disabled: append `?disablePersonalization=Y` to URL.<br>2. In Functional Administrator, delete the corrupted personalization document from MDS. |
| **Output File Button Disabled on Completed Concurrent Request** | Program output format was set to `Text` or `XML` without an associated BI Publisher RTF template. | In *Concurrent $\rightarrow$ Program $\rightarrow$ Define*, verify Output Format and link BI Publisher template in *XML Publisher Administrator*. |

---

## Command Line Syntax & Server Control

```bash
# Query Active Concurrent Managers via SQL*Plus
sqlplus apps/apps_pwd @$FND_TOP/sql/afcmstat.sql

# Bounce Oracle WebLogic Managed Server (oacore)
$ADMIN_SCRIPTS_HOME/admanagedsrvctl.sh stop oacore_server1
$ADMIN_SCRIPTS_HOME/admanagedsrvctl.sh start oacore_server1
```

### Key Configuration Locations
- **Concurrent Log Directory**: `$APPLCSF/$APPLLOG/` (e.g. `/u01/install/APPS/fs_ne/inst/logs/appl/conc/log`)
- **Concurrent Out Directory**: `$APPLCSF/$APPLOUT/`

---

## Agent Operational Directive
> **MANDATORY**: When diagnosing Oracle Forms runtime errors, instruct users to press `Ctrl + Shift + E` to view the underlying SQL error code. For OAF errors, append `?disablePersonalization=Y` to bypass corrupted personalizations.
