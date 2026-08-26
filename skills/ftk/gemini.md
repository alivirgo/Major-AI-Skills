---
title: "Exterro FTK (Forensic Toolkit) AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Exterro FTK evidence trees, Email Threading views, and Cerberus malware scores."
category: "Forensic Toolkit & Evidence Processing"
tags: ["ftk", "ftk-imager", "email-forensics", "gemini", "cerberus-malware", "evidence-triage"]
---

# Exterro FTK (Forensic Toolkit) AI Skill Guide (Gemini)

## Overview & Engine Architecture
Exterro FTK provides deep-level evidence analysis, automated email conversation threading, graphic carving, and integrated malware analysis (**Cerberus**). Gemini acts as an AI Digital Forensic Examiner and Malware Analyst, specializing in **multimodal Evidence Tree and column layout analysis**, **Email Threading visualization**, **Cerberus malware risk score triage**, and **KFF hash set filtering**.

### Visual Forensic Analysis & Triage Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 FTK Visual Examination Stack                │
│                                                             │
│  Evidence Triage & Exploration                              │
│  ├── File List / Table View (KFF Status, Flagged, Category) │
│  ├── Email Threading & Social Network Analysis Tree         │
│  └── Cerberus Threat Scoring & Disassembly Visualizer       │
│                                                             │
│  Artifact Classification & Decryption Engine                │
│  ├── PRTK / DNA Distributed Password Recovery Engine        │
│  ├── Known File Filter (NSRL Known vs Ignored vs Alert)     │
│  └── Graphic / Video Thumbnail Indexer                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Evidence Tab Triage**: Analyze screenshots of FTK interface tabs (Explore, Overview, Email, Graphics, Video Guide) to detect anomalous file size spikes, hidden file systems, and encrypted archives.
2. **Email Conversation Threading**: Evaluate email communication timelines to trace forwarded chains, extract nested attachments, and identify external recipient leaks.
3. **Cerberus Malware Threat Evaluation**: Interpret Cerberus static analysis scores (0 to 100 risk score), analyzing flagged API calls (`VirtualAllocEx`, `WriteProcessMemory`) and section entropy.
4. **KFF Hash Management**: Filter out standard operating system files using Known File Filter statuses (Known Good / Alert) to reduce examiner review burden.

---

## Production Python Automation: Automated Email Attachment Forensic Harvester

Execute this script on an exported directory of forensic evidence to recursively extract, catalog, and hash all email attachments (PST, EML, MSG):

```python
"""
Forensic Email Attachment Harvester & Hasher
Parses EML message files, extracts attachments, and logs cryptographic hashes.
"""

import sys
import os
import email
from email import policy
import hashlib

def harvest_attachments(eml_dir: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    manifest = []
    print(f"Scanning for EML messages in: {eml_dir}...\n")

    for root, _, files in os.walk(eml_dir):
        for file in files:
            if file.lower().endswith(".eml"):
                eml_path = os.path.join(root, file)
                try:
                    with open(eml_path, "rb") as f:
                        msg = email.message_from_binary_file(f, policy=policy.default)

                    subject = msg.get("subject", "No Subject")
                    sender = msg.get("from", "Unknown")

                    for part in msg.iter_attachments():
                        filename = part.get_filename()
                        if filename:
                            payload = part.get_payload(decode=True)
                            if payload:
                                sha256 = hashlib.sha256(payload).hexdigest()
                                out_name = f"{sha256[:8]}_{filename}"
                                out_path = os.path.join(output_dir, out_name)

                                with open(out_path, "wb") as out_f:
                                    out_f.write(payload)

                                print(f"• Extracted: {filename} ({len(payload)} bytes)")
                                print(f"  SHA-256: {sha256}")
                                print(f"  Source Email: '{subject}' from {sender}\n")

                except Exception as e:
                    pass

    print("Attachment harvesting completed.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python email_harvester.py <eml_directory> <output_directory>")
        sys.exit(1)
    harvest_attachments(sys.argv[1], sys.argv[2])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Email Tab Shows Blank / Messages Not Categorized** | Email processing option was unchecked during initial evidence processing profile setup. | 1. Right-click Evidence Item $\rightarrow$ **Re-process Evidence**.<br>2. Check **Email Analysis (PST/OST/MBOX/DBX)**.<br>3. Verify Microsoft Messaging API (MAPI) libraries are installed. |
| **Cerberus Threat Score Highlights Red (>80)** | File contains packed sections (UPX/Themida) or imports dangerous API hooks characteristic of malware. | 1. Open Cerberus tab to inspect flagged PE imports.<br>2. Check section entropy ($>7.5$ indicates packing).<br>3. Submit hash to offline threat intelligence database. |
| **KFF Status Column Displays `Unknown` on All Files** | KFF database was not linked to the active case or KFF server service is stopped. | 1. In FTK Case Options, verify KFF Server connection.<br>2. Link the NIST NSRL RDS database.<br>3. Run *Evidence $\rightarrow$ Run KFF on Selected Files*. |
| **FTK Graphics Tab Displays Broken / Corrupted Thumbnails** | Image files contain proprietary formats (HEIC, RAW) or files are partially carved without headers. | Install required Windows Imaging Component (WIC) codec packs for HEIC/RAW previews. |

---

## Command Line Syntax & Server Control

```bash
# Verify FTK Processing Engine Service Status via PowerShell
Get-Service -Name "AD Processing Engine"

# Extract Encrypted File List via FTK Imager
ftkimager.exe --list-encrypted-files "C:\Evidence\Disk.E01"
```

### Key Configuration Locations
- **FTK Case Directory**: `C:\FTK_Cases\`
- **KFF Database Path**: `C:\ProgramData\AccessData\KFF\`

---

## Agent Operational Directive
> **MANDATORY**: When reviewing email evidence, track attachment SHA-256 hashes back to the originating sender and message headers. Leverage the Known File Filter (KFF) to eliminate standard operating system binaries before conducting deep artifact review.
