---
title: "Autopsy Digital Forensics AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Autopsy Digital Forensics, Jython Ingest Modules, Automated Case Creation, and TSK Java SDK."
category: "Open Source Digital Forensics Platform"
tags: ["autopsy", "jython-module", "tsk-sdk", "gpt-codex", "dfir-automation", "digital-forensics"]
---

# Autopsy Digital Forensics AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Autopsy provides a Java/Jython SDK and REST/CLI automation hooks for building custom ingest pipelines, data source processors, and automated triage workers. GPT/Codex acts as a Principal Forensic Software Engineer and Automation Architect, delivering **Jython Ingest Modules**, **headless case creation scripts**, **The Sleuth Kit (TSK) datamodel queries**, and **automated forensic reporting pipelines**.

### Developer Architecture & Ingest Pipeline Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Autopsy Developer Platform                  │
│                                                             │
│  Ingest Pipeline & Lifecycle Hooks                          │
│  ├── `IngestModuleFactoryAdapter` (Module Descriptor)       │
│  ├── `FileIngestModule` & `DataSourceIngestModule`          │
│  └── `IngestServices` (Blackboard Event Bus & Notifications)│
│                                                             │
│  Data Model & Case Engine                                   │
│  ├── `SleuthkitCase` (Java Database Access Object / DAO)    │
│  ├── `BlackboardArtifact` & `BlackboardAttribute`           │
│  └── Content Data Model (`FsContent`, `AbstractFile`)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Jython File Ingest Module Development**: Construct thread-safe Python/Jython modules implementing `startUp()`, `process(AbstractFile)`, and `shutDown()` to parse proprietary log files and extract indicators of compromise (IOCs).
2. **Automated Headless Case Creation**: Author CLI automation scripts using Autopsy's command-line flags (`--createCase`, `--addDataSource`, `--runIngest`) to ingest disk images automatically upon acquisition.
3. **Blackboard Data Model Querying**: Script SQLite / PostgreSQL queries against `autopsy.db` to extract artifacts (`blackboard_artifacts`, `blackboard_attributes`, `tsk_files`).
4. **Automated Hash Filtering Configuration**: Build scripts to convert MD5/SHA256 threat intelligence lists into Autopsy-compatible HashSet databases.

---

## Production Python Automation: Automated Headless Case Builder & Ingest Pipeline

Save this script as `auto_case_builder.py` to automate case creation, forensic image addition, and ingest pipeline execution via CLI:

```python
"""
Autopsy Headless Case Automation Script
Creates a new forensic case and runs automated ingest via CLI.
"""

import sys
import os
import subprocess

AUTOPSY_EXEC = r"C:\Program Files\Autopsy-4.21\bin\autopsy64.exe"

def create_and_ingest_case(case_name: str, base_dir: str, image_path: str):
    if not os.path.exists(image_path):
        print(f"Error: Disk image '{image_path}' does not exist.")
        return

    os.makedirs(base_dir, exist_ok=True)
    print(f"Initializing Autopsy Case: '{case_name}' in '{base_dir}'...")

    # Autopsy Command Line Automation Parameters
    cmd = [
        AUTOPSY_EXEC,
        "--createCase",
        "--caseName", case_name,
        "--caseBaseDir", base_dir,
        "--caseType", "single",
        "--addDataSource",
        "--dataSourcePath", image_path,
        "--dataSourceType", "image",
        "--runIngest"
    ]

    print(f"Executing: {' '.join(cmd)}")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

    print("Autopsy headless ingestion running in background...")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python auto_case_builder.py <case_name> <base_dir> <image_path>")
        sys.exit(1)
    create_and_ingest_case(sys.argv[1], sys.argv[2], sys.argv[3])
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`ImportError: No module named org.sleuthkit` in Jython Module** | Module executed using standalone standard CPython interpreter rather than inside Autopsy's embedded Jython JVM environment. | Python ingest modules must be loaded directly through Autopsy GUI (*Tools $\rightarrow$ Python Plugins*) or run inside Jython. |
| **`TskCoreException: Error adding artifact to blackboard`** | Target file object was closed or artifact attribute type ID is invalid in current case schema. | 1. Ensure `file.newArtifact()` is called within the active `process()` lifecycle.<br>2. Use standard `BlackboardAttribute.ATTRIBUTE_TYPE` enum identifiers. |
| **Command Line Ingestion Exits Immediately without Errors** | Lock file from previously crashed Autopsy instance exists in the target case directory. | Check for and remove `.lock` files inside `<CaseBaseDir>\<CaseName>\` before running `--createCase`. |
| **Out-Of-Memory Error during Keyword Indexing** | Solr JVM process exhausted memory during extraction of large binary streams. | Edit `autopsy.conf` in `%APPDATA%\autopsy\etc\` and increase `-J-Xmx` heap ceiling (e.g. `-J-Xmx24g`). |

---

## Command Line Syntax & Batch Processing

```bash
# Launch Autopsy Headless Case Analysis
"C:\Program Files\Autopsy-4.21\bin\autopsy64.exe" --createCase --caseName "Case_2026_01" --caseBaseDir "C:\Cases" --addDataSource --dataSourcePath "C:\Evidence\evidence.E01" --runIngest

# Query Autopsy Blackboard Artifacts via SQLite CLI
sqlite3 "C:\Cases\Case_2026_01\autopsy.db" "SELECT * FROM blackboard_artifacts LIMIT 20;"
```

### Essential File Locations
- **Autopsy Installation**: `C:\Program Files\Autopsy-4.21`
- **User Plugin Directory**: `%APPDATA%\autopsy\python_modules`
- **Case Database**: `<case_path>\autopsy.db`

---

## Agent Operational Directive
> **MANDATORY**: Autopsy Python Ingest Modules run on the embedded Jython 2.7 runtime; do not use C-extension libraries (e.g. `numpy`, `pandas`) within Ingest modules. Use Java/TSK native classes for high-performance Blackboard data posting.
