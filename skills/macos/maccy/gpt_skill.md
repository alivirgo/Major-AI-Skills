---
title: "Maccy macOS Clipboard History Manager AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Maccy, CoreData SQLite schema queries, Swift NSPasteboard injection, and clipboard data pipelines."
category: "Clipboard History Manager"
tags: ["maccy", "sqlite-coredata", "swift-nspasteboard", "clipboard-automation", "gpt-codex", "macos-scripting"]
---

# Maccy macOS Clipboard History Manager AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Maccy is built upon native Swift AppKit and CoreData persistence mechanisms. GPT/Codex acts as a Principal macOS Software Engineer and Swift Automation Architect, delivering **direct CoreData SQLite data extractors**, **programmatic `NSPasteboard` payload injectors**, **custom clipboard migration utilities**, and **automated JSON export pipelines**.

### Developer Architecture & Storage Model

```
┌─────────────────────────────────────────────────────────────┐
│                 Maccy Developer Platform                    │
│                                                             │
│  Data Ingress & Model Layer                                 │
│  ├── `HistoryItem` Entity (Title, FirstCopiedAt, LastCopied)│
│  ├── `HistoryItemContent` Entity (Type: String/PNG/RTF, Data│
│  └── Binary Blob Storage (`ZDATA` in SQLite Schema)         │
│                                                             │
│  Persistence & Query Subsystem                              │
│  ├── CoreData SQLite Engine (`Storage.sqlite`)              │
│  ├── Entity Table: `ZHISTORYITEM` & `ZHISTORYITEMCONTENT`   │
│  └── Swift / Python SQLite Automated Backup Pipelines       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **CoreData SQLite Querying & Ingestion**: Write Python / Bash scripts to directly query and extract stored clips from Maccy's `Storage.sqlite` database without launching the GUI.
2. **Swift `NSPasteboard` Injection**: Author standalone Swift code snippets writing multi-type data (`.string`, `.html`, `.rtf`, `.png`) to the system pasteboard.
3. **Automated History Exporters**: Build automated backup tools exporting Maccy history into structured JSON or Markdown code snippet libraries.
4. **Database Migration & Purging**: Script automated cleanup routines to delete old history records exceeding retention periods while preserving pinned clips.

---

## Production Python Automation: Maccy SQLite CoreData History Extractor

Save this script as `export_maccy_history.py` to extract text clips from Maccy's SQLite database directly to JSON:

```python
"""
Maccy CoreData SQLite History Extractor (Python 3)
Queries Maccy's internal SQLite database and exports text clips to JSON.
"""

import sys
import os
import sqlite3
import json

DB_PATHS = [
    os.path.expanduser("~/Library/Containers/org.pavelm.Maccy/Data/Library/Application Support/Maccy/Storage.sqlite"),
    os.path.expanduser("~/Library/Application Support/Maccy/Storage.sqlite")
]

def export_maccy_clips(output_json: str, limit: int = 100):
    db_file = None
    for p in DB_PATHS:
        if os.path.exists(p):
            db_file = p
            break

    if not db_file:
        print("Error: Maccy SQLite database not found.")
        return

    print(f"Connecting to Maccy Database: {db_file}...")
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Query CoreData ZHISTORYITEM and ZHISTORYITEMCONTENT tables
    # Note: Text content is stored in ZHISTORYITEMCONTENT.ZVALUE or ZDATA as UTF-8
    query = """
    SELECT 
        h.ZTITLE, 
        h.ZPIN, 
        h.ZFIRSTCOPIEDAT, 
        c.ZTYPE, 
        c.ZVALUE
    FROM ZHISTORYITEM h
    JOIN ZHISTORYITEMCONTENT c ON h.Z_PK = c.ZHISTORYITEM
    WHERE c.ZTYPE = 'public.utf8-plain-text'
    ORDER BY h.ZFIRSTCOPIEDAT DESC
    LIMIT ?;
    """

    cursor.execute(query, (limit,))
    rows = cursor.fetchall()

    extracted_clips = []
    for title, is_pinned, copied_at, clip_type, raw_value in rows:
        text_content = raw_value if raw_value else title
        extracted_clips.append({
            "title": title,
            "pinned": bool(is_pinned),
            "timestamp": copied_at,
            "type": clip_type,
            "content": text_content
        })

    conn.close()

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(extracted_clips, f, indent=2, ensure_ascii=False)

    print(f"✅ Successfully exported {len(extracted_clips)} clips to: {output_json}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "maccy_history_export.json"
    export_maccy_clips(out_file, limit=50)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`sqlite3.OperationalError: database is locked`** | Maccy is actively writing to `Storage.sqlite` while external script attempts exclusive lock. | In SQLite connection string, open database in read-only mode: `sqlite3.connect("file:...Storage.sqlite?mode=ro", uri=True)`. |
| **Pasted Text Loses Formatting in Markdown Editors** | Plain text was copied without rich text / HTML alternative pasteboard types. | In Swift injector, provide both `NSPasteboard.PasteboardType.string` and `.rtf` payloads. |
| **`Storage.sqlite-wal` Growing to Gigabytes in Size** | SQLite WAL file failing to checkpoint due to long-running uncommitted transactions. | In Terminal, run: `sqlite3 Storage.sqlite "PRAGMA wal_checkpoint(TRUNCATE);"`. |
| **Swift Script Fails: `AppKit/AppKit.h file not found`** | Attempting to run Swift script on Linux or headless container lacking macOS SDK. | Execute Swift AppKit scripts strictly on macOS hosts using the native `swift` toolchain. |

---

## Command Line Syntax & Batch Processing

```bash
# Check Maccy SQLite Database Tables
sqlite3 ~/Library/Containers/org.pavelm.Maccy/Data/Library/Application\ Support/Maccy/Storage.sqlite ".tables"

# Programmatic Pasteboard Write via macOS pbcopy
echo "New automated clipboard snippet" | pbcopy
```

### Essential File Locations
- **CoreData SQLite Store**: `~/Library/Containers/org.pavelm.Maccy/Data/Library/Application Support/Maccy/Storage.sqlite`
- **Preferences Plist**: `~/Library/Containers/org.pavelm.Maccy/Data/Library/Preferences/org.pavelm.Maccy.plist`

---

## Agent Operational Directive
> **MANDATORY**: When accessing Maccy's CoreData SQLite database from external scripts, always open in read-only mode (`?mode=ro`) to prevent database locking errors while Maccy is active.
