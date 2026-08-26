---
title: "Microsoft Dynamics NAV & Business Central AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Dynamics NAV/BC, AL language extensions, C/AL to AL migration, and OData V4 integration."
category: "Microsoft Dynamics NAV / Business Central Desktop"
tags: ["dynamics-nav", "business-central", "al-extensions", "gpt-codex", "event-subscribers", "erp-automation"]
---

# Microsoft Dynamics NAV & Business Central AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Microsoft Dynamics NAV and Business Central provide modern cloud-native extensibility via the **AL Language**, **Event Subscriber model**, and **OData V4 / REST APIs**, eliminating destructive core codebase modifications. GPT/Codex acts as a Principal AL Language Developer and NAV/BC Integration Architect, delivering **clean AL table/page extensions**, **event subscriber codeunits**, **C/AL to AL conversion scripts**, and **PowerShell automated deployment pipelines**.

### AL Extension Architecture & Event Bus Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 AL Extension Developer Platform             │
│                                                             │
│  AL Language & Object Layer                                 │
│  ├── Core Tables & Table Extensions (`tableextension`)      │
│  ├── Pages & Page Extensions (`pageextension`)              │
│  └── Codeunits (`[EventSubscriber(ObjectType::Codeunit...)]`)│
│                                                             │
│  Compilation & Deployment Pipeline                          │
│  ├── `app.json` Extension Manifest & Dependencies           │
│  ├── AL Language Compiler (`alc.exe`) in VS Code            │
│  └── PowerShell Deployment (`Publish-NAVApp` / `Sync-NAVApp`)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **AL Language Extension Development**: Author structured AL objects (Tables, Pages, Codeunits, Enums, Reports, Queries) following modern Business Central coding standards.
2. **Event-Driven Architecture**: Implement clean `[EventSubscriber]` handlers on core posting routines (`OnBeforePostSalesDoc`, `OnAfterInsertGLLine`) without modifying base application code.
3. **C/AL to AL Code Modernization**: Convert legacy C/SIDE C/AL text exports into modern AL syntax, refactoring legacy `RecordRef` and `FieldRef` usage into strongly typed AL constructs.
4. **PowerShell CI/CD Packaging**: Build PowerShell automation scripts to compile `.app` packages, publish extensions to tenant instances, and synchronize schema tables.

---

## Production AL Code: High-Performance Event Subscriber & Audit Trail

Save this file as `AuditLedgerEntries.Codeunit.al` within an AL extension project:

```al
// ==============================================================================
// AL Codeunit: General Ledger Posting Event Subscriber & Custom Audit Logger
// Intercepts G/L Ledger Entry insertion and logs detailed transaction telemetry.
// ==============================================================================
codeunit 50101 "G/L Audit Event Subscriber"
{
    [EventSubscriber(ObjectType::Table, Database::"G/L Entry", 'OnAfterInsertEvent', '', true, true)]
    local procedure OnAfterInsertGLEntry(var Rec: Record "G/L Entry"; RunTrigger: Boolean)
    var
        AuditLog: Record "Custom Audit Log";
    begin
        if Rec.IsTemporary then
            exit;

        // Populate Custom Audit Record
        AuditLog.Init();
        AuditLog."Entry No." := 0; // Auto-incrementing primary key
        AuditLog."G/L Entry No." := Rec."Entry No.";
        AuditLog."G/L Account No." := Rec."G/L Account No.";
        AuditLog."Posting Date" := Rec."Posting Date";
        AuditLog."Document No." := Rec."Document No.";
        AuditLog."Amount" := Rec.Amount;
        AuditLog."User ID" := UserId();
        AuditLog."System Created At" := CurrentDateTime();
        AuditLog.Insert(true);
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Post", 'OnBeforePostSalesDoc', '', true, true)]
    local procedure CheckPostingPrerequisites(var Sender: Codeunit "Sales-Post"; var SalesHeader: Record "Sales Header"; CommitIsSuppressed: Boolean; PreviewMode: Boolean)
    begin
        // Enforce mandatory external document numbers on Invoices
        if SalesHeader."Document Type" = SalesHeader."Document Type"::Invoice then begin
            if SalesHeader."External Document No." = '' then
                Error('External Document No. (Customer PO Number) is mandatory for Sales Invoices.');
        end;
    end;
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`AL(AL0185): Target tableextension is not accessible`** | Missing dependency declaration in `app.json` or target extension is marked as internal/obsolete. | 1. In `app.json`, add target app ID to `"dependencies"` array.<br>2. Download matching symbol files: `AL: Download Symbols` in VS Code. |
| **`Publish-NAVApp Fails: Extension schema conflict`** | Table extension deleted or changed data type of a previously deployed field in a breaking manner. | 1. In development, use `Sync-NAVApp -Mode Clean` to reset schema.<br>2. For production, apply field deprecation (`ObsoleteState = Pending;`) rather than deleting fields. |
| **Event Subscriber Fails to Trigger on Posting** | The subscriber function declaration missing `true, true` flags (`SkipOnMissingLicense, SkipOnMissingPermission`) or target event signature changed. | Verify subscriber parameter types match base event signature exactly. |
| **`alc.exe Compilation Error: Maximum string length exceeded`** | Text literals in C/AL port exceeding AL 2048 character limit. | Break long string constants into `Label` definitions or concatenated strings. |

---

## Command Line Syntax & Batch Processing

```powershell
# 1. Publish and Install AL Extension to Dynamics NAV / Business Central
Publish-NAVApp -ServerInstance DynamicsNAV200 -Path "C:\Build\MyExtension.app" -SkipVerification
Sync-NAVApp -ServerInstance DynamicsNAV200 -Name "MyExtension" -Version "1.0.0.0"
Install-NAVApp -ServerInstance DynamicsNAV200 -Name "MyExtension" -Version "1.0.0.0"

# 2. Extract Base Application C/AL Code to Text via finsql
finsql.exe command=exporttotext,file=C:\NAV_Export\base_code.txt,servername=SQLSRV01,database=NAV_PROD
```

### Essential File Locations
- **Extension Manifest**: `app.json`
- **AL Workspace Config**: `.vscode/settings.json` and `.vscode/launch.json`

---

## Agent Operational Directive
> **MANDATORY**: Never modify standard Microsoft base tables directly; always use `tableextension`, `pageextension`, and `[EventSubscriber]` codeunits. Avoid breaking schema changes between version releases.
