---
title: "Autopsy Digital Forensics AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Autopsy forensic timelines, communications graphs, and artifact triage."
category: "Open Source Digital Forensics Platform"
tags: ["autopsy", "digital-forensics", "timeline-analysis", "gemini", "artifact-triage", "incident-response"]
---

# Autopsy Digital Forensics AI Skill Guide (Gemini)

## Overview & Engine Architecture
Autopsy delivers comprehensive digital evidence examination, integrating filesystem parsers, timeline visualizers, and communication link graphs. Gemini acts as an AI Digital Forensics Analyst and Threat Intelligence Lead, specializing in **multimodal Timeline event visualization**, **communications link graph inspection (email / SMS / messaging)**, **deleted data recovery analysis**, and **forensic reporting**.

### Forensic Analytics & Blackboard Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Autopsy Analytics Framework                 │
│                                                             │
│  Data Visualization Layer                                   │
│  ├── Timeline View (Activity clusters, Day/Hour histograms) │
│  ├── Communications Graph (Accounts, relationships, counts) │
│  └── Geolocation Map (EXIF GPS data, cell tower logs)       │
│                                                             │
│  Artifact Extraction & Correlation Engine                   │
│  ├── Web Artifacts (Cookies, History, Downloads, Autofill)  │
│  ├── System Artifacts (Recent docs, USB devices, Prefetch)  │
│  └── Central Repository (Cross-case correlation database)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Timeline Analysis**: Analyze screenshots of Autopsy Timeline activity histograms to detect event clustering (e.g. spike in file deletions at 03:00 AM) and identify anti-forensics timestamp manipulation (timestomping).
2. **Communications Graph Analysis**: Evaluate relationship graphs to isolate key suspects, email communication chains, and file transfer interactions.
3. **Registry & USB Forensics**: Correlate USB device insertion artifacts (`SYSTEM\CurrentControlSet\Enum\USBSTOR`) with user shellbags and mount points.
4. **Automated Evidence Reporting**: Format findings into clear, structured forensic reports compliant with courtroom evidentiary standards.

---

## Production Python Automation: Automated USB Device Forensic Extractor

Execute this script on an extracted Windows `SYSTEM` registry hive to identify all connected USB storage devices, serial numbers, and volume names:

```python
"""
Forensic USB Device Registry Extractor
Parses extracted SYSTEM hive for USBSTOR historical connections.
Requires: pip install python-registry
"""

import sys
import os
from Registry import Registry

def extract_usb_devices(system_hive_path: str):
    if not os.path.exists(system_hive_path):
        print(f"Error: Registry hive '{system_hive_path}' not found.")
        return

    reg = Registry.Registry(system_hive_path)
    usbstor_path = "ControlSet001\\Enum\\USBSTOR"

    try:
        usbstor_key = reg.open(usbstor_path)
    except Registry.RegistryKeyNotFoundException:
        print(f"Key '{usbstor_path}' not found in hive.")
        return

    print("--- [HISTORICAL USB STORAGE DEVICES DETECTED] ---")
    
    for device_type in usbstor_key.subkeys():
        device_name = device_type.name()
        for instance in device_type.subkeys():
            serial = instance.name()
            friendly_name = "-"
            try:
                friendly_name = instance.value("FriendlyName").value()
            except Registry.RegistryValueNotFoundException:
                pass

            last_write = instance.timestamp().strftime("%Y-%m-%d %H:%M:%S UTC")
            print(f"• Device: {device_name}")
            print(f"  Serial Number: {serial}")
            print(f"  Friendly Name: {friendly_name}")
            print(f"  Last Modified: {last_write}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python usb_extractor.py <SYSTEM_hive_path>")
        sys.exit(1)
    extract_usb_devices(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Timeline Shows Future or 1970 Timestamps** | Anti-forensics timestomping tool used, or unallocated MFT entry contains garbage timestamp bits. | 1. Compare `$STANDARD_INFORMATION` (easily modified) against `$FILE_NAME` (modified only by kernel) timestamps.<br>2. Filter out epoch 0 (`1970-01-01`) timestamps in Timeline settings. |
| **Central Repository Shows Warning Icon** | Central repository connection disconnected or SQLite storage exceeds max recommended size. | 1. Open *Tools $\rightarrow$ Options $\rightarrow$ Central Repository*.<br>2. Verify database connection string.<br>3. Purge orphaned correlation records. |
| **Encrypted BitLocker / FileVault Partition Skipped** | Forensic image contains encrypted volumes without encryption keys or recovery passwords. | 1. Extract BitLocker Volume Master Key (VMK) or Recovery Password.<br>2. Use `dislocker` (Linux) or Passware/Arsenal Image Mounter to decrypt before ingestion. |
| **Corrupted EXIF Thumbnail Rendering in Image Gallery** | Incomplete carving or partial file overwriting on flash storage. | Verify image header using hexadecimal viewer; look for valid JPEG SOI (`FF D8`) and EOI (`FF D9`) markers. |

---

## Command Line Syntax & Server Control

```bash
# Extract Master File Table ($MFT) from Forensic Disk Image
icat -o 2048 "C:\Evidence\disk.E01" 0 > "$MFT"

# Parse $MFT using AnalyzeMFT CLI Tool
analyzeMFT.py -f "$MFT" -o mft_timeline.csv
```

### Essential File Locations
- **Autopsy Case Database**: `<Case_Directory>\autopsy.db`
- **Case Reports**: `<Case_Directory>\Reports\`

---

## Agent Operational Directive
> **MANDATORY**: When analyzing timestamps, always cross-reference `$STANDARD_INFORMATION` attributes against `$FILE_NAME` attributes to detect malicious timestomping. Present forensic findings chronologically with explicit UTC timezones.
