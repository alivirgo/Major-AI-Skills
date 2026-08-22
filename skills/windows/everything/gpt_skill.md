---
title: "Voidtools Everything Real-Time Search AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Voidtools Everything, Everything SDK (C/C++ & ctypes), WM_COPYDATA IPC, and automated EFU file list generation."
category: "Real-Time File Search & Indexing Engine"
tags: ["everything", "everything-sdk", "wm-copydata-ipc", "efu-file-lists", "ctypes-everything", "gpt-codex", "windows-file-indexing"]
---

# Voidtools Everything Real-Time Search AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Voidtools Everything exposes high-performance programmatic integration interfaces via the **Everything C-SDK (`Everything64.dll`)**, the **Win32 `WM_COPYDATA` IPC Message Protocol**, and the **EFU (Everything File Utility) File List Schema**. GPT/Codex acts as a Principal Windows Systems Software Engineer and File System Automation Developer, delivering **native C++ / Python SDK bindings**, **high-throughput IPC search daemons**, **automated EFU catalog synthesizers**, and **unattended backup indexing pipelines**.

### Developer Architecture & IPC Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Everything Developer Platform               │
│                                                             │
│  SDK & Inter-Process Communication (IPC)                    │
│  ├── `Everything64.dll` C-API Function Exports              │
│  ├── `WM_COPYDATA` Win32 Message Protocol (HWND Routing)    │
│  └── JSON / CSV / TXT Result Serialization Formats          │
│                                                             │
│  Search Query Engine & Data Types                           │
│  ├── Advanced Query Flags (`EVERYTHING_REQUEST_FULL_PATH`)  │
│  ├── Sort Fast Enumerators (`EVERYTHING_SORT_SIZE_DESCENDING│
│  └── EFU (Everything File Utility) CSV Manifest Generator   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Everything SDK C-API Development**: Author robust C++ and Python wrapper classes interfacing with `Everything64.dll` to perform thread-safe indexed queries with custom request flags.
2. **Win32 `WM_COPYDATA` IPC Messaging**: Construct zero-dependency Win32 IPC scripts discovering the `EVERYTHING_TASKBAR_NOTIFICATION` window class and dispatching `COPYDATASTRUCT` payloads.
3. **Automated EFU File List Generation**: Write Python scripts generating indexed `.efu` files (filename, size, date modified, date created, attributes) for offline archive disks.
4. **Automated High-Speed Disk Duplicate Finders**: Build scripts querying hash and size duplicates using Everything search modifiers (`dupe:size;name`).

---

## Production Python Automation: Automated EFU File List & Catalog Generator

Save this script as `generate_efu_manifest.py` to create an offline searchable `.efu` file catalog for external media drives:

```python
"""
Everything File Utility (EFU) Manifest Generator
Scans a target directory and generates a compliant .efu CSV file for instant Everything import.
"""

import sys
import os
import csv
import datetime

def generate_efu_file(scan_directory: str, output_efu_path: str):
    print(f"--- [GENERATING EVERYTHING EFU MANIFEST: '{scan_directory}'] ---")
    
    if not os.path.exists(scan_directory):
        print(f"Error: Directory '{scan_directory}' does not exist.")
        return

    # Windows FILETIME epoch offset (1601 to 1970 in 100ns units)
    WINDOWS_EPOCH_DIFF = 116444736000000000

    def to_windows_filetime(posix_timestamp):
        return int(posix_timestamp * 10000000) + WINDOWS_EPOCH_DIFF

    entry_count = 0
    with open(output_efu_path, "w", newline="", encoding="utf-8") as efu_file:
        writer = csv.writer(efu_file)
        # EFU Standard Header
        writer.writerow(["Filename", "Size", "Date Modified", "Date Created", "Attributes"])

        for root, dirs, files in os.walk(scan_directory):
            for file_name in files:
                full_path = os.path.join(root, file_name)
                try:
                    stat = os.stat(full_path)
                    file_size = stat.st_size
                    date_mod_ft = to_windows_filetime(stat.st_mtime)
                    date_cre_ft = to_windows_filetime(stat.st_ctime)
                    attr = 32 # FILE_ATTRIBUTE_ARCHIVE = 32

                    writer.writerow([full_path, file_size, date_mod_ft, date_cre_ft, attr])
                    entry_count += 1
                except Exception:
                    continue

    print(f"✅ Generated EFU catalog with {entry_count} files: {output_efu_path}")
    print("To search: In Everything, select File -> Open File List... -> select this EFU file.")

if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "C:\\"
    dst = sys.argv[2] if len(sys.argv) > 2 else "DriveCatalog.efu"
    generate_efu_file(src, dst)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`Everything_QueryW()` Returns `False`** | Everything application is not running in background or IPC handle failed. | Verify `Everything.exe` process is active in Task Manager before calling query functions. |
| **EFU File Shows Incorrect Dates in Everything** | Timestamps exported as POSIX seconds instead of 64-bit Windows FILETIME intervals. | Convert Unix timestamps to Windows FILETIME (`100-nanosecond intervals since Jan 1, 1601`). |
| **SDK Throws `EVERYTHING_ERROR_REGISTERCLASSEX`** | Duplicate window class registration in multi-threaded application. | Maintain a single static SDK controller instance per process. |
| **Search Ignores Request Flags** | Called `Everything_QueryW()` before setting `Everything_SetRequestFlags()`. | Set all search properties, flags, and limits before calling the query execution function. |

---

## Command Line Syntax & Batch Processing

```bash
# Query Search Results with es.exe and Output JSON
es.exe "ext:py size:>100kb" -json

# Create EFU File List via Native Everything Binary
"C:\Program Files\Everything\Everything.exe" -create-file-list "D_Drive.efu" "D:\"
```

### Essential File Locations
- **SDK Header & DLL**: `EverythingSDK.zip` (`Everything64.dll`, `Everything.h`)
- **CLI Utility**: `es.exe`

---

## Agent Operational Directive
> **MANDATORY**: When authoring EFU file manifests programmatically, always encode file timestamps as 64-bit Windows FILETIME integers to ensure native date filtering within Everything.
