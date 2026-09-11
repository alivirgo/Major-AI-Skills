---
title: "Voidtools Everything Real-Time Search AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Voidtools Everything search syntax, filter presets, column sorting, and index configuration windows."
category: "Real-Time File Search & Indexing Engine"
tags: ["everything", "search-syntax-ui", "ntfs-index-options", "gemini", "column-sort", "everything-filters"]
---

# Voidtools Everything Real-Time Search AI Skill Guide (Gemini)

## Overview & Engine Architecture
Voidtools Everything provides an instantaneous search user interface featuring the **Real-Time Search Bar with syntax highlighting**, **Custom Filters (Audio, Compressed, Document, Executable, Picture, Video)**, **Dynamic Column Sorting (Path, Size, Date Modified, Extension)**, and the **Options Index Configuration Dialog**. Gemini acts as an AI File System Diagnostic Reviewer and Windows Search Optimization Specialist, specializing in **multimodal search query syntax analysis**, **index coverage auditing**, **Filter bar customization**, and **NTFS volume exclusion configuration**.

### Visual Analytics & Search Console Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Everything Visual Operations                │
│                                                             │
│  Search Viewport & Query Interface                          │
│  ├── Search Input Bar (Real-Time Keystroke Result Filtering)│
│  ├── Filters Bar (Audio, Doc, Exe, Pic, Video, Custom Regex)│
│  └── Status Bar (Total Object Count, Selected Item Size)    │
│                                                             │
│  Result List & Column Metadata                             │
│  ├── Sortable Columns (Name, Path, Size, Date Modified)     │
│  ├── Icon Preview & High-DPI Thumbnails                     │
│  └── Context Menu Actions (Open Path, Copy Name, Hash Calc) │
│                                                             │
│  Indexing & Preference Windows                              │
│  ├── Options -> Indexes -> NTFS Volume Management           │
│  ├── Folder Indexing (Network Shares & Scheduled Rescans)   │
│  └── Exclusions List (Hidden/System Files & Regex Filters)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Search Query Syntax Inspection**: Analyze screenshots of the Everything search bar to verify boolean operators (`AND` space, `OR` `|`, `NOT` `!`), quotes for spaced paths (`"Program Files"`), and modifier flags (`case:`, `regex:`, `wholeword:`).
2. **Options Index Verification**: Review the *Options $\rightarrow$ Indexes* configuration to ensure all local NTFS fixed drives (C:, D:, E:) have "Include in database" and "Enable USN Journal" checked.
3. **Filter Definition Customization**: Guide users in creating specialized custom filters (*e.g. Code Repositories: `ext:py;js;ts;rs;cpp;h;cs !path:.git !path:node_modules`*).
4. **Result Column Layout Optimization**: Recommend optimal column configurations (enabling Date Modified and Size columns with human-readable units: KB/MB/GB).

---

## Production Python Automation: Automated Everything HTTP Server Search Client

Voidtools Everything includes an embedded HTTP web server (default port 80 or configurable). Run this script to query the running Everything HTTP server:

```python
"""
Everything Embedded HTTP Server Search Client
Queries Everything HTTP API (JSON format) to retrieve live search results over localhost.
"""

import sys
import json
import urllib.request
import urllib.parse

EVERYTHING_HTTP_URL = "http://localhost:8080" # Ensure HTTP server is enabled in Everything Options

def query_everything_http(search_term: str):
    print(f"--- [QUERYING EVERYTHING HTTP SERVER: '{search_term}'] ---")
    
    params = {
        "search": search_term,
        "json": "1",
        "count": "10"
    }
    query_url = f"{EVERYTHING_HTTP_URL}/?{urllib.parse.urlencode(params)}"

    try:
        req = urllib.request.Request(query_url, headers={"User-Agent": "Everything-Python-Client"})
        with urllib.request.urlopen(req, timeout=3.0) as response:
            data = json.loads(response.read().decode("utf-8"))

            results = data.get("results", [])
            total = data.get("totalResults", 0)
            print(f"Total Matches: {total} (Showing top {len(results)}):\n")

            for r in results:
                name = r.get("name", "")
                path = r.get("path", "")
                size = int(r.get("size", 0)) / (1024 * 1024)
                print(f"• [{size:>7.2f} MB] {path}\\{name}")

            print("\n✅ HTTP search completed successfully.")

    except urllib.error.URLError as e:
        print(f"🚨 HTTP Connection Failed: {e}")
        print("💡 Ensure HTTP Server is enabled: Everything -> Tools -> Options -> HTTP Server -> Check 'Enable HTTP Server'.")

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "ext:iso;vmdk"
    query_everything_http(query)
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Search Highlights in Yellow with No Results** | Regex syntax error or unclosed quotation mark in search box. | Check search string for mismatched parentheses `(` `)` or unclosed quotes `"`. |
| **Specific Drive Letter (e.g. `D:`) Missing from Results** | Drive is formatted as exFAT/FAT32 without automatic USN indexing, or drive was excluded. | In *Tools $\rightarrow$ Options $\rightarrow$ Indexes $\rightarrow$ Folders*, click **Add...** and select the drive root `D:\`. |
| **Everything Status Bar Shows "Scanning..." Indefinitely** | A slow network share or unreadable external drive is blocking the indexing thread. | In Options $\rightarrow$ Folders, uncheck or remove unresponsive network drive paths. |
| **File Sizes Display in Raw Bytes Instead of MB/GB** | Size format preference set to raw integer. | In *Tools $\rightarrow$ Options $\rightarrow$ View*, set **Size format** to `Auto (KB/MB/GB)`. |

---

## Command Line Syntax & Server Control

```bash
# Launch Everything GUI
"C:\Program Files\Everything\Everything.exe"

# Export Index Database to Clean EFU File List
"C:\Program Files\Everything\Everything.exe" -create-file-list "C:\MyFiles.efu" "C:\"
```

### Key Configuration Locations
- **Everything Settings**: `%APPDATA%\Everything\Everything.ini`
- **File List Databases**: `*.efu` (Everything File Utility format)

---

## Agent Operational Directive
> **MANDATORY**: When crafting search queries with folder paths containing spaces, always enclose the path within double quotes (e.g. `path:"C:\Program Files"`) to prevent the space from being evaluated as an `AND` operator.
