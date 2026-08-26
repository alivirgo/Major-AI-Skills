---
title: "Exterro FTK (Forensic Toolkit) AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Exterro FTK (Forensic Toolkit), FTK Imager CLI, PostgreSQL backend schemas, and DPE automation."
category: "Forensic Toolkit & Evidence Processing"
tags: ["ftk", "ftk-imager", "postgresql-schema", "gpt-codex", "dpe-automation", "forensic-scripting"]
---

# Exterro FTK (Forensic Toolkit) AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Exterro FTK relies on a multi-tier client-server architecture powered by a PostgreSQL relational database backend, Distributed Processing Engines (DPE), and command-line acquisition utilities (`ftkimager.exe`). GPT/Codex acts as a Principal Forensic Automation Developer and Database Architect, delivering **FTK Imager batch scripting**, **PostgreSQL case schema database queries**, **DPE cluster monitoring daemons**, and **automated evidence triage pipelines**.

### Architecture & Database Processing Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 FTK Multi-Tier Architecture                 │
│                                                             │
│  Client & Processing Nodes                                  │
│  ├── FTK Forensic Examiner GUI Client                       │
│  ├── Distributed Processing Engine (DPE Multi-Core Workers) │
│  └── FTK Imager Command Line (Headless Disk Acquisition)    │
│                                                             │
│  Relational Database & Storage                              │
│  ├── PostgreSQL Database Cluster (Schema: `casedb_xxxx`)    │
│  ├── Shared Evidence Repository (NAS / SAN Storage Pool)    │
│  └── Known File Filter (KFF NSRL Indexing Engine)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **FTK Imager CLI Automation**: Author automated batch acquisition scripts utilizing `ftkimager.exe` with segment chunking (`--frag`), compression levels, and hash verification flags.
2. **PostgreSQL Forensic Case Querying**: Construct optimized SQL queries against FTK case database tables (`objects`, `file_types`, `c_properties`, `bookmarks`) to extract case statistics without GUI overhead.
3. **Automated Evidence Triage Pipelines**: Build Python/PowerShell daemons that monitor hot-folders, automatically trigger FTK Imager to image newly connected physical drives, and verify checksums.
4. **DPE Worker Node Telemetry**: Author scripts to query DPE worker node health, job queues, and CPU/memory utilization across the processing farm.

---

## Production Python Automation: PostgreSQL FTK Case Database Miner

Save this script as `ftk_db_miner.py` (requires `pip install psycopg2-binary`) to query an FTK PostgreSQL backend for top flagged files and file type breakdowns:

```python
"""
FTK PostgreSQL Case Database Miner
Queries the backend database for evidence statistics and flagged artifacts.
"""

import sys
import psycopg2

def query_ftk_case_db(db_name: str, host: str = "localhost", port: int = 5432, user: str = "postgres", password: str = "adpassword"):
    try:
        conn = psycopg2.connect(
            dbname=db_name,
            host=host,
            port=port,
            user=user,
            password=password
        )
        cur = conn.cursor()
    except Exception as e:
        print(f"Database connection error: {e}")
        return

    print(f"--- [CONNECTED TO FTK CASE DATABASE: {db_name}] ---")

    # 1. Query Total Evidence Objects
    cur.execute("SELECT COUNT(*) FROM objects WHERE is_deleted = false;")
    total_files = cur.fetchone()[0]
    print(f"Total Active Evidence Objects: {total_files:,}")

    # 2. Query File Type Distribution
    print("\nTop 5 File Categories in Case:")
    cur.execute("""
        SELECT category_name, COUNT(*) as count 
        FROM objects o 
        JOIN file_types f ON o.file_type_id = f.file_type_id 
        GROUP BY category_name 
        ORDER BY count DESC 
        LIMIT 5;
    """)
    for cat, count in cur.fetchall():
        print(f"  • {cat:<20}: {count:,} files")

    # 3. Query Flagged / Bookmarked Items
    print("\nBookmarked Evidence Items:")
    cur.execute("""
        SELECT b.bookmark_name, COUNT(ob.object_id) 
        FROM bookmarks b 
        LEFT JOIN object_bookmarks ob ON b.bookmark_id = ob.bookmark_id 
        GROUP BY b.bookmark_name;
    """)
    for bm_name, count in cur.fetchall():
        print(f"  • Folder: '{bm_name}' ({count} items)")

    cur.close()
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ftk_db_miner.py <casedb_name> [host] [user] [password]")
        sys.exit(1)
    query_ftk_case_db(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`psycopg2.OperationalError: FATAL: password authentication failed`** | Incorrect PostgreSQL database credentials for FTK database cluster. | Default AccessData PostgreSQL credentials: user `postgres` or `aduser`, verify password in FTK Database Configuration utility. |
| **FTK Imager Fails: `Cannot open physical drive: Access Denied`** | Process executed without elevated Administrator privileges or blocked by endpoint protection. | 1. Launch PowerShell/CMD as elevated **Administrator**.<br>2. Verify physical drive path using `wmic diskdrive get DeviceID,Caption`. |
| **PostgreSQL Error: `out of shared memory`** | PostgreSQL `max_locks_per_transaction` or `shared_buffers` exhausted during batch object insertion. | Increase `max_locks_per_transaction = 256` and `shared_buffers = 4GB` in `postgresql.conf`. |
| **DPE Processing Cluster Stalled on Large Video File** | Video indexing worker frozen attempting to extract frames from a multi-gigabyte video stream. | Set video thumbnail and keyframe extraction limits to maximum 5 minutes or exclude video carving in processing profile. |

---

## Command Line Syntax & Batch Processing

```bash
# Automated Physical Drive Acquisition via FTK Imager CLI
ftkimager.exe "\\.\PhysicalDrive1" "C:\Evidence\Target_Disk" --e01 --compress 6 --frag 2048M --verify

# Headless RAM Acquisition via FTK Imager CLI
ftkimager.exe --print-physical-memory "C:\Evidence\Memory.dmp"
```

### Essential File Locations
- **FTK Case DB Root**: PostgreSQL Database Server
- **FTK Imager Installation**: `C:\Program Files\AccessData\FTK Imager\`
- **Database Configuration Utility**: `C:\Program Files\AccessData\FTK\bin\DbConfig.exe`

---

## Agent Operational Directive
> **MANDATORY**: When querying FTK PostgreSQL databases, use read-only transactions to avoid altering case evidence records. Tune PostgreSQL connection and memory parameters (`shared_buffers`) before launching large DPE processing jobs.
