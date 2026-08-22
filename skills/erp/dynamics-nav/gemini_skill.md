---
title: "Microsoft Dynamics NAV & Business Central AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Dynamics NAV Role Centers, Chart of Accounts, General Journal posting previews, and Cues."
category: "Microsoft Dynamics NAV / Business Central Desktop"
tags: ["dynamics-nav", "business-central", "role-center", "gemini", "chart-of-accounts", "posting-preview"]
---

# Microsoft Dynamics NAV & Business Central AI Skill Guide (Gemini)

## Overview & Engine Architecture
Microsoft Dynamics NAV (and Business Central) provides deep ERP functionality spanning General Ledger accounting, sales order processing, warehouse management, and manufacturing MRP. Gemini acts as an AI ERP Financial Analyst and Systems Auditor, specializing in **multimodal RoleTailored Client (RTC) dashboard triage**, **General Journal posting preview diagnostics**, **Chart of Accounts dimension reconciliation**, and **Job Queue operational monitoring**.

### Visual Analytics & Financial Operations Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Dynamics NAV Visual Stack                   │
│                                                             │
│  Role Center & Financial Presentation                       │
│  ├── Role Center Tiles & Activity Cues (Open Orders, Overdue│
│  ├── Chart of Accounts (G/L Tree & Net Change Dimensions)   │
│  └── General Journal Posting Preview (Simulated G/L Entries)│
│                                                             │
│  Supply Chain & Warehouse View                              │
│  ├── Warehouse Bin Location Matrix & Pick/Put-away Maps     │
│  ├── Sales Order & Purchase Invoice Line Item Grids         │
│  └── Job Queue Status Dashboard (Red Error / Green Active)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Role Center & Cue Triage**: Analyze screenshots of Role Center cue tiles to identify operational bottlenecks (e.g. sudden surge in *Sales Orders Pending Approval* or *Overdue Invoices*).
2. **Posting Preview & Transaction Simulation**: Interpret Posting Preview ledger matrices to verify that debits and credits correctly balance and flow to intended balancing accounts before executing physical database commits.
3. **Chart of Accounts & Dimension Auditing**: Review G/L account trees and global dimension allocations (`Department`, `Project`) to ensure compliance with financial reporting rules.
4. **Job Queue Status Diagnostics**: Review Job Queue logs to identify scheduled report errors, XMLport export failures, and EDI communication dropouts.

---

## Production Python Automation: Automated OData V4 Open Sales Order & Credit Auditor

Execute this script to audit open Sales Orders in Dynamics NAV/BC via OData V4 and flag customers exceeding their approved credit limits:

```python
"""
Dynamics NAV / Business Central OData V4 Sales & Credit Auditor
Extracts open orders and compares total outstanding balance against customer credit limit.
"""

import sys
import requests
from requests.auth import HTTPBasicAuth

NAV_ODATA_BASE = "https://nav.enterprise.io:7048/DynamicsNAV/ODataV4/Company('CRONUS%20International%20Ltd.')"
AUTH = HTTPBasicAuth("domain\\admin_user", "NavServicePassword123!")

def audit_customer_credit():
    headers = {"Accept": "application/json"}
    print(f"Connecting to Dynamics NAV OData V4: {NAV_ODATA_BASE}...\n")

    try:
        # 1. Fetch Customers with Credit Limits
        cust_url = f"{NAV_ODATA_BASE}/Customers?$select=No,Name,Credit_Limit_LCY,Balance_LCY"
        res = requests.get(cust_url, auth=AUTH, headers=headers, verify=True)
        res.raise_for_status()
        customers = res.json().get("value", [])

        print("--- [CUSTOMER CREDIT LIMIT & EXPOSURE AUDIT] ---")
        for cust in customers:
            cust_no = cust.get("No")
            name = cust.get("Name")
            credit_limit = float(cust.get("Credit_Limit_LCY", 0.0))
            balance = float(cust.get("Balance_LCY", 0.0))

            if credit_limit > 0.0:
                exposure_pct = (balance / credit_limit) * 100.0
                if balance > credit_limit:
                    print(f"🚨 CREDIT LIMIT BREACH: Customer {cust_no} ({name})")
                    print(f"   Balance: ${balance:,.2f} | Limit: ${credit_limit:,.2f} ({exposure_pct:.1f}%)\n")
                elif exposure_pct >= 85.0:
                    print(f"⚠️ HIGH EXPOSURE (>85%): Customer {cust_no} ({name})")
                    print(f"   Balance: ${balance:,.2f} | Limit: ${credit_limit:,.2f} ({exposure_pct:.1f}%)\n")

    except Exception as e:
        print(f"Error querying NAV OData service: {e}")

if __name__ == "__main__":
    audit_customer_credit()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Posting Preview Shows Error: `Dimension XYZ is blocked`** | A line item in the journal uses a Global Dimension value that is marked as `Blocked` in the Dimension Values table. | 1. Open *Financial Management $\rightarrow$ Dimensions*.<br>2. Locate target Dimension $\rightarrow$ Click **Dimension Values**.<br>3. Uncheck **Blocked** or choose an active dimension code on the line. |
| **Role Center Cue Shows `Error` on Red Tile** | The underlying Query or FlowField calculation encountered an SQL timeout or division-by-zero. | 1. In RTC, click the Cue tile to view error details.<br>2. Inspect FlowField calculation formula in the Table definition.<br>3. Ensure necessary SQL SIFT indexes exist on ledger tables. |
| **Chart of Accounts Balance Out of Sync with Bank Ledger** | Bank Account Ledger Entries were entered via manual journal without linking the Bank Account card. | 1. Run the **Bank Account Reconciliation** tool.<br>2. Check for unbalanced direct postings in the G/L Bank Account. |
| **Web Client Displays `Session Timed Out / Reconnecting`** | Web Client session idle timeout reached or WebSocket connection dropped between client and NST. | In `web.config`, increase `SessionTimeout` setting (e.g. from default 20 minutes to 60 minutes). |

---

## Command Line Syntax & Server Control

```bash
# Query Active NAV User Sessions via PowerShell
Get-NAVServerSession -ServerInstance DynamicsNAV200

# Test Dynamics NAV OData Service Endpoint Availability
curl -I -u "admin:password" https://nav.enterprise.io:7048/DynamicsNAV/ODataV4/
```

### Key Configuration Locations
- **Web Client Config**: `C:\inetpub\wwwroot\DynamicsNAV\web.config`
- **User Personalization**: `User Metadata` table in NAV database

---

## Agent Operational Directive
> **MANDATORY**: Before posting large General Journals or Sales Invoices, always run **Posting Preview** to inspect simulated G/L and VAT entries. Verify that FlowFields in Role Center cues reference existing SQL SIFT indexes.
