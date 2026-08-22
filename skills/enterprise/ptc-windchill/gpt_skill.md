---
title: "PTC Windchill PLM Engineering AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize PTC Windchill, Info*Engine tasks, Java RMI APIs, LoadFromFile XML definitions, and OData integrations."
category: "Product Lifecycle Management (PLM)"
tags: ["ptc-windchill", "infoengine", "windchill-api", "gpt-codex", "loadfromfile", "plm-automation"]
---

# PTC Windchill PLM Engineering AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
PTC Windchill exposes powerful Java RMI / Server-Side APIs, **Info\*Engine task scripting (`.jsp` / `.xml`)**, and **OData REST interfaces** for high-volume enterprise data loading and custom listener automation. GPT/Codex acts as a Principal Windchill PLM Automation Developer and Enterprise Integration Specialist, delivering **Java MethodServer event listeners**, **Info\*Engine web service tasks**, **`LoadFromFile` XML bulk import templates**, and **automated CAD publishing scripts**.

### Developer Architecture & Info*Engine Platform

```
┌─────────────────────────────────────────────────────────────┐
│                 Windchill Developer Platform                │
│                                                             │
│  Integration & Remote Invocation Layer                      │
│  ├── Info*Engine Task Engine (XML/JSP Web Services)         │
│  ├── OData REST APIs (`/servlet/odata/v1/`)                 │
│  └── Java RMI / `RemoteMethodServer` Ingress                │
│                                                             │
│  Data Model & Business Persistence Engine                   │
│  ├── Core Persistables (`WTPart`, `WTDocument`, `EPMDocument`)│
│  ├── Service Event Bus (`StandardManagerListenerAdapter`)   │
│  └── `LoadFromFile` Bulk XML Import / Export Engine         │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Windchill Java Server API Development**: Author robust Java extensions extending `StandardManager` and `ServiceEventListenerAdapter` to intercept Part/Document lifecycle events (e.g. `POST_CHECKIN`, `PRE_PROMOTE`).
2. **`LoadFromFile` XML Bulk Ingestion**: Construct syntactically validated XML files and CSV mapping headers for `windchill wt.load.LoadFromFile` to import mass part catalogs.
3. **Info\*Engine Task Development**: Author custom Info\*Engine tasks (`.jsp`) querying `wt.query.QuerySpec` to return structured I*E VDB XML datasets.
4. **Automated CAD Worker Orchestration**: Script the automated dispatch and health monitoring of Creo/SolidWorks CAD worker conversion queues.

---

## Production XML Automation: Windchill `LoadFromFile` Part Definition Template

Save this file as `bulk_parts_import.xml` and execute via `windchill wt.load.LoadFromFile -d bulk_parts_import.xml -u admin_user -p password`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE NmLoader SYSTEM "standardX24.dtd">
<NmLoader>
  <!-- Bulk WTPart Definition Template for Windchill LoadFromFile -->
  <csvWTPart handler="wt.part.LoadPart.createWTPart">
    <csvpartNumber>CAP-001042-01</csvpartNumber>
    <csvpartName>Ceramic Capacitor 10uF 25V 0805</csvpartName>
    <csvtype>separable</csvtype>
    <csvsource>buy</csvsource>
    <csvfolder>/Default/Components/Passives</csvfolder>
    <csvlifecycleTemplate>Basic</csvlifecycleTemplate>
    <csvlifecycleState>INWORK</csvlifecycleState>
    <csvteamTemplate>Default</csvteamTemplate>
    <csvcontainerPath>/wt.inf.container.OrgContainer=EnterpriseOrg/wt.pdmlink.PDMLinkProduct=Hardware_Product</csvcontainerPath>
    <csvview>Design</csvview>
    <csvdefaultUnit>ea</csvdefaultUnit>
  </csvWTPart>

  <csvWTPart handler="wt.part.LoadPart.createWTPart">
    <csvpartNumber>RES-002010-01</csvpartNumber>
    <csvpartName>Thick Film Resistor 10k 1% 0603</csvpartName>
    <csvtype>separable</csvtype>
    <csvsource>buy</csvsource>
    <csvfolder>/Default/Components/Passives</csvfolder>
    <csvlifecycleTemplate>Basic</csvlifecycleTemplate>
    <csvlifecycleState>INWORK</csvlifecycleState>
    <csvteamTemplate>Default</csvteamTemplate>
    <csvcontainerPath>/wt.inf.container.OrgContainer=EnterpriseOrg/wt.pdmlink.PDMLinkProduct=Hardware_Product</csvcontainerPath>
    <csvview>Design</csvview>
    <csvdefaultUnit>ea</csvdefaultUnit>
  </csvWTPart>
</NmLoader>
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`LoadFromFile Fails: Container not found`** | The `csvcontainerPath` does not match the exact internal organization or product context name. | 1. Query container path: `windchill wt.load.LoadFromFile -test ...`.<br>2. Verify container format: `/wt.inf.container.OrgContainer=OrgName/wt.pdmlink.PDMLinkProduct=ProdName`. |
| **`RemoteMethodServer: InvocationTargetException` in Custom Java Code** | Unhandled `WTException` inside server-side transaction block causing database rollback. | 1. Wrap all persistence logic in `Transaction tr = new Transaction(); try { ... tr.commit(); } finally { tr.rollback(); }`.<br>2. Check detailed stack trace in `MethodServer.log`. |
| **Info\*Engine Task Returns `404 Not Found`** | Task `.jsp` file placed in wrong codebase directory or not mapped in `tasks/` directory tree. | Place custom tasks in `C:\ptc\Windchill\tasks\custom\` and invoke via `/Windchill/tasks/custom/mytask.jsp`. |
| **WVS Worker Fails with `CadWorkerException: Worker Timed Out`** | Native CAD executable (Creo Parametric / SolidWorks) hung on a popup dialog on the worker host. | 1. Log into CAD worker machine.<br>2. Close modal license or update dialogs in CAD.<br>3. Verify CAD launches cleanly in headless mode. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute Windchill Bulk Part Loader via CLI
windchill wt.load.LoadFromFile -d "C:\Data\bulk_parts_import.xml" -u admin_user -p SecurePass

# Query MethodServer Thread Dump via ServerManager CLI
windchill wt.manager.ServerManager -dump
```

### Essential File Locations
- **Codebase Root**: `C:\ptc\Windchill\codebase\`
- **Info\*Engine Tasks**: `C:\ptc\Windchill\tasks\`
- **DTD Definitions**: `C:\ptc\Windchill\codebase\standardX24.dtd`

---

## Agent Operational Directive
> **MANDATORY**: In custom Windchill Java extensions, execute database operations within explicit `wt.pom.Transaction` blocks to guarantee ACID rollback on errors. Validate XML tags against `standardX24.dtd` before running `LoadFromFile`.
