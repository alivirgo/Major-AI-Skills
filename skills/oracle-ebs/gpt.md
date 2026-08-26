---
title: "Oracle E-Business Suite (EBS) AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Oracle EBS, PL/SQL APPS packages, Workflow Builder, FNDLOAD scripts, and Integrated SOA Gateway (ISG)."
category: "Oracle E-Business Suite Desktop Client"
tags: ["oracle-ebs", "plsql-packages", "workflow-engine", "gpt-codex", "fndload-scripts", "soa-gateway"]
---

# Oracle E-Business Suite (EBS) AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Oracle E-Business Suite provides extensive backend programmability through the **APPS PL/SQL Layer**, **Oracle Workflow Engine (`WFFILE` / `.wft`)**, **Integrated SOA Gateway (ISG)**, and **FNDLOAD** configuration data synchronization utilities. GPT/Codex acts as a Principal Oracle Applications Developer and ERP Integration Specialist, delivering **transactional PL/SQL API wrappers**, **Oracle Workflow process definitions**, **FNDLOAD deployment scripts**, and **REST/SOAP web service integrations**.

### Developer Architecture & APPS Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Oracle EBS Developer Platform               │
│                                                             │
│  Data Modeling & PL/SQL APIs                                │
│  ├── Unified `APPS` Schema (Custom Packages, Views, Synonyms│
│  ├── Standard Public APIs (`PO_PUB`, `AR_INVOICE_API_PUB`)  │
│  └── Concurrent Program PL/SQL Stored Procedures            │
│                                                             │
│  Integration & Deployment Subsystems                        │
│  ├── Integrated SOA Gateway (ISG REST & SOAP Web Services)  │
│  ├── Oracle Workflow Engine (`WF_ENGINE`, `.wft` Definitions│
│  └── FNDLOAD Configuration Migration LDT / LCT Compilers    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Transactional APPS PL/SQL Package Development**: Author modular, error-handled PL/SQL packages (`CREATE OR REPLACE PACKAGE BODY ...`) interacting with standard EBS base tables and interface tables (`GL_INTERFACE`, `AP_INVOICES_INTERFACE`).
2. **Oracle Workflow Engine Scripting**: Programmatically construct workflow activity procedures (`wf_engine.GetItemAttrText`, `wf_engine.SetItemAttrNumber`) to route dynamic approval hierarchies.
3. **FNDLOAD Automation Pipelines**: Author automated bash/PowerShell deployment scripts migrating Concurrent Programs, Menus, Responsibilities, and DFFs using `FNDLOAD`.
4. **Integrated SOA Gateway (ISG) Integration**: Build Python / Node.js client integrations consuming REST web services exposed via the Oracle Integration Repository.

---

## Production PL/SQL Automation: Custom General Ledger Interface Stager Package

Save this script as `XX_GL_INTERFACE_PKG.pkb` and compile into the Oracle EBS `APPS` schema:

```sql
-- =============================================================================
-- Oracle EBS Custom Package: XX_GL_INTERFACE_PKG
-- Inserts validated journal entries into GL_INTERFACE and triggers GLLEZL import.
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY xx_gl_interface_pkg AS

    PROCEDURE stage_and_submit_journal(
        p_ledger_id       IN  NUMBER,
        p_user_id         IN  NUMBER,
        p_resp_id         IN  NUMBER,
        p_appl_id         IN  NUMBER,
        p_journal_name    IN  VARCHAR2,
        p_period_name     IN  VARCHAR2,
        p_code_comb_id    IN  NUMBER,
        p_entered_dr      IN  NUMBER,
        p_entered_cr      IN  NUMBER,
        x_request_id      OUT NUMBER,
        x_status          OUT VARCHAR2
    ) IS
        l_group_id    NUMBER;
        l_req_id      NUMBER;
    BEGIN
        -- 1. Initialize EBS Session Context
        fnd_global.apps_initialize(p_user_id, p_resp_id, p_appl_id);

        -- Generate Unique Group ID
        SELECT gl_interface_control_s.NEXTVAL INTO l_group_id FROM dual;

        -- 2. Insert Record into Standard GL_INTERFACE Table
        INSERT INTO gl_interface (
            status,
            ledger_id,
            accounting_date,
            currency_code,
            date_created,
            created_by,
            actual_flag,
            user_je_category_name,
            user_je_source_name,
            code_combination_id,
            entered_dr,
            entered_cr,
            group_id,
            reference1,
            period_name
        ) VALUES (
            'NEW',
            p_ledger_id,
            TRUNC(SYSDATE),
            'USD',
            SYSDATE,
            p_user_id,
            'A',
            'Manual',
            'Manual',
            p_code_comb_id,
            p_entered_dr,
            p_entered_cr,
            l_group_id,
            p_journal_name,
            p_period_name
        );

        COMMIT;

        -- 3. Trigger General Ledger Journal Import (GLLEZL)
        l_req_id := fnd_request.submit_request(
            application => 'SQLGL',
            program     => 'GLLEZL',
            description => 'GL Import: ' || p_journal_name,
            start_time  => NULL,
            sub_request => FALSE,
            argument1   => '101',           -- Interface Run ID
            argument2   => TO_CHAR(l_group_id) -- Group ID
        );

        IF l_req_id > 0 THEN
            COMMIT;
            x_request_id := l_req_id;
            x_status := 'SUBMITTED';
        ELSE
            x_request_id := 0;
            x_status := 'FAILED: ' || fnd_message.get;
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            x_request_id := 0;
            x_status := 'EXCEPTION: ' || SQLERRM;
    END stage_and_submit_journal;

END xx_gl_interface_pkg;
/
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`ORA-04068: existing state of packages has been discarded`** | Another session recompiled a PL/SQL package while an active transaction held package state in memory. | Re-connect session or invoke `DBMS_SESSION.RESET_PACKAGE` before retrying API execution. |
| **FNDLOAD Fails: `Entity not found in data file`** | The `.lct` control file version is older or newer than the target `.ldt` configuration file format. | Verify `$FND_TOP/patch/115/import/<control_file>.lct` matches your EBS patch release level. |
| **Workflow Notification Stuck: Mailer Not Sending Email** | Workflow Notification Mailer component is down in Oracle Workflow Manager. | In Oracle Applications Manager (OAM) $\rightarrow$ *Workflow $\rightarrow$ Notification Mailers*, restart the IMAP/SMTP mailer service. |
| **Integrated SOA Gateway REST API Returns `404 Service Not Deployed`** | Custom PL/SQL package was not generated with iRep annotations or deployed as a REST service in ISG. | Add `/* $Header: ... */` and `@rep:scope` annotations $\rightarrow$ Generate WSDL/REST in Integration Repository $\rightarrow$ Click **Deploy**. |

---

## Command Line Syntax & Batch Processing

```bash
# Upload Custom Responsibility and Menu Configuration via FNDLOAD
FNDLOAD apps/apps_pwd 0 Y UPLOAD $FND_TOP/patch/115/import/afscursp.lct custom_resp.ldt

# Launch Oracle Workflow Definition Loader (WFLOAD)
WFLOAD apps/apps_pwd 0 Y FORCE $APPL_TOP/custom/wft/custom_approval.wft
```

### Essential File Locations
- **FNDLOAD Control Files**: `$FND_TOP/patch/115/import/*.lct`
- **Workflow Loader Executable**: `WFLOAD` in `$FND_TOP/bin/`

---

## Agent Operational Directive
> **MANDATORY**: In custom PL/SQL packages, always commit interface staging records before invoking `fnd_request.submit_request` so the concurrent background worker can read the inserted batch records.
