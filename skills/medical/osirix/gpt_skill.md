---
title: "OsiriX MD Clinical DICOM Workstation AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize OsiriX MD, AppleScript scripting dictionary, XML-RPC APIs, and DICOMweb endpoints."
category: "DICOM Viewer & Radiology Workstation"
tags: ["osirix", "applescript-osirix", "xml-rpc", "dicomweb", "gpt-codex", "radiology-automation"]
---

# OsiriX MD Clinical DICOM Workstation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
OsiriX MD features an AppleScript Scripting Dictionary, an embedded **XML-RPC / HTTP Web Portal**, and an Objective-C **Plugin SDK** for programmatic clinical workflow automation. GPT/Codex acts as a Principal Healthcare Informatics Software Engineer and PACS Automation Developer, delivering **AppleScript diagnostic automation scripts**, **XML-RPC client integrations**, **DICOMweb WADO-RS retrieval tools**, and **automated report generation pipelines**.

### Developer Architecture & Scripting Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 OsiriX Developer Platform                   │
│                                                             │
│  Automation & Ingress Tier                                  │
│  ├── AppleScript Scripting Dictionary (`tell app "OsiriX"`) │
│  ├── Embedded XML-RPC & JSON Web Portal (`:3333`)           │
│  └── URL Scheme Action Dispatcher (`osirix://...`)          │
│                                                             │
│  Clinical Data Access Layer                                 │
│  ├── CoreData SQLite Database Schema Access                 │
│  ├── DICOMweb RESTful Services (WADO-RS / QIDO-RS)          │
│  └── Objective-C `PluginFilter` Native Interface            │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **AppleScript OsiriX Automation**: Write robust AppleScript handlers to automate patient search, study loading, series 2D viewer opening, and ROI key-image exports.
2. **XML-RPC & REST Web Portal Automation**: Programmatically query and retrieve patient records from OsiriX's internal web server interface.
3. **DICOMweb WADO-RS Data Extraction**: Build Python scripts to stream DICOM instances over HTTPS directly from cloud PACS into the OsiriX viewing cache.
4. **Automated Structured Report (SR) Ingestion**: Construct scripts to parse and generate DICOM Structured Reporting objects for radiation dose and tumor tracking.

---

## Production AppleScript Automation: Automated Study Loader & ROI Key Image Exporter

Save this script as `export_key_images.scpt` and execute via `osascript export_key_images.scpt`:

```applescript
-- =============================================================================
-- AppleScript: OsiriX Automated Study Search & Key Image Exporter
-- Finds matching patient study in local database, opens 2D viewer, and exports.
-- =============================================================================
tell application "OsiriX"
    -- 1. Query Local Database for Target Patient ID
    set targetPatientID to "PATIENT_1002"
    set matchingStudies to (studies whose patientID is targetPatientID)

    if (count of matchingStudies) is 0 then
        display alert "No study found in OsiriX database for Patient ID: " & targetPatientID
        return
    end if

    set currentStudy to item 1 of matchingStudies
    set patientName to name of currentStudy
    set studyDate to date of currentStudy

    -- 2. Open 2D Viewer for the First Series
    set seriesList to series of currentStudy
    if (count of seriesList) is 0 then
        display alert "Study contains no image series."
        return
    end if

    set primarySeries to item 1 of seriesList
    set viewerWindow to open primarySeries

    -- 3. Adjust Viewport and Take Key Image Snapshot
    set exportPath to (POSIX path of (path to desktop folder)) & "KeyImage_" & targetPatientID & ".jpg"
    
    -- Save current frame to JPEG
    export JPEG viewerWindow to exportPath

    close viewerWindow
    display notification "Key image exported successfully to Desktop" with title "OsiriX Automation"
end tell
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **AppleScript Fails: `OsiriX got an error: Connection is invalid`** | OsiriX is not running or another modal dialog is blocking the application event loop. | Ensure OsiriX is launched and dismiss any open preference or alert dialogs before calling AppleScript. |
| **`osirix://` URL Scheme Ignored by macOS** | LaunchServices URL scheme mapping corrupted or OsiriX Lite / MD collision. | Run `/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain user`. |
| **DICOMweb WADO-RS Returns `401 Unauthorized`** | Missing HTTP Basic Authentication header or user account lacks DICOMweb access permissions. | In OsiriX Preferences $\rightarrow$ **Web Server**, configure user credentials and check **Enable DICOMweb Access**. |
| **Plugin Crashes OsiriX During Series Export** | Objective-C plugin accessing deallocated `ViewerController` pointer during window close. | Check pointer validity (`if (viewer && [viewer window])`) before invoking draw or filter methods. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute AppleScript via Terminal
osascript C:\Scripts\export_key_images.scpt

# Query Local OsiriX Web Portal via cURL
curl -u "admin:password" "http://localhost:3333/api/studies?patientID=12345"
```

### Essential File Locations
- **Scripting Dictionary**: Embedded in `OsiriX.app/Contents/Resources/OsiriX.sdef`
- **Application Support Directory**: `~/Library/Application Support/OsiriX/`

---

## Agent Operational Directive
> **MANDATORY**: When orchestrating multi-study batch exports via AppleScript, always close each `ViewerController` window upon export completion to prevent memory exhaustion from dozens of concurrent open volumes.
