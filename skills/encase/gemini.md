---
title: "OpenText EnCase Forensic AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot OpenText EnCase Forensic evidence trees, Hex views, and Condition filters."
category: "Enterprise Digital Forensics & eDiscovery"
tags: ["encase", "digital-forensics", "hex-analysis", "gemini", "evidence-tree", "condition-filters"]
---

# OpenText EnCase Forensic AI Skill Guide (Gemini)

## Overview & Engine Architecture
OpenText EnCase Forensic provides comprehensive disk and memory analysis, file signature verification, and granular hex-level sector inspection. Gemini acts as an AI Forensic Analyst and Hex Investigator, specializing in **multimodal Evidence Tree inspection**, **Hex View byte-level signature verification**, **Condition and Filter logic formulation**, and **eDiscovery evidence bookmarking**.

### Forensic Inspection & Filter Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 EnCase Evidence Analysis                    │
│                                                             │
│  Evidence Navigation & File Viewers                         │
│  ├── Tree-Table View (Partition, Directory, File Records)   │
│  ├── Hex View with Data Interpreter (FAT/NTFS Boot Sectors) │
│  └── Text & Gallery Views with Metadata Properties          │
│                                                             │
│  Filter & Condition Engine                                  │
│  ├── EnCase Queries (Logical expressions, size, dates)      │
│  ├── Custom File Signature Hash Set Matching (NSRL, Custom) │
│  └── Tagging & Bookmark Hierarchy Architecture              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Evidence Tree Triage**: Analyze screenshots of EnCase Evidence Trees, Table Views, and Hash Category columns to detect deleted files, unallocated clusters, and signature mismatches (*e.g., EXE renamed to JPG*).
2. **Hex View & Sector Diagnostics**: Interpret raw hex dumps of Master Boot Records (MBR), GUID Partition Tables (GPT), and NTFS Volume Boot Records ($Boot) to diagnose partition tampering.
3. **Condition & Filter Construction**: Formulate complex boolean filter conditions (`File Extension == "exe" AND File Category != "Executable"`) to flag extension spoofing.
4. **Keyword & Grep Search Formulations**: Author regular expressions for credit card numbers (Luhn check pattern), SSNs, email addresses, and crypto wallet private keys.

---

## Production Python Automation: Automated File Signature & Extension Mismatch Checker

Execute this script on an exported directory of evidence files to detect malicious file extension spoofing:

```python
"""
Forensic File Signature (Magic Bytes) & Extension Mismatch Detector
Analyzes magic headers to identify spoofed extensions.
"""

import sys
import os

MAGIC_SIGNATURES = {
    b"\xFF\xD8\xFF": ("jpg", "JPEG Image"),
    b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A": ("png", "PNG Image"),
    b"\x25\x50\x44\x46": ("pdf", "PDF Document"),
    b"\x50\x4B\x03\x04": ("zip", "ZIP Archive / Office XML (DOCX/XLSX)"),
    b"\x4D\x5A": ("exe", "Windows PE Executable / DLL"),
    b"\x7F\x45\x4C\x46": ("elf", "Linux Executable / ELF")
}

def scan_file_signatures(target_dir: str):
    print(f"Scanning directory: {target_dir} for signature mismatches...\n")
    mismatches = 0

    for root, _, files in os.walk(target_dir):
        for file in files:
            file_path = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower().lstrip(".")

            try:
                with open(file_path, "rb") as f:
                    header = f.read(16)
                    
                detected_type = None
                for magic, (expected_ext, desc) in MAGIC_SIGNATURES.items():
                    if header.startswith(magic):
                        detected_type = (expected_ext, desc)
                        break

                if detected_type:
                    expected_ext, desc = detected_type
                    # Flag if file is actually an executable disguised as image/doc
                    if expected_ext == "exe" and ext not in ("exe", "dll", "sys"):
                        print(f"🚨 CRITICAL MISMATCH: {file_path}")
                        print(f"   Named as: .{ext} | True Magic Header: {desc} (.exe)\n")
                        mismatches += 1
                    elif expected_ext != ext and ext not in ("docx", "xlsx", "pptx", "jar") and expected_ext != "zip":
                        print(f"⚠️ Signature Mismatch: {file_path}")
                        print(f"   Extension: .{ext} | Header: {desc}\n")
                        mismatches += 1

            except Exception as e:
                pass

    print(f"--- [SCAN COMPLETE: {mismatches} MISMATCHES FLAGGED] ---")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python signature_checker.py <exported_evidence_dir>")
        sys.exit(1)
    scan_file_signatures(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Table View Shows Red 'Signature Mismatch' Flag** | The file's internal binary header does not match its declared filename extension (e.g. `malware.jpg` starts with `MZ`). | 1. Select the file $\rightarrow$ Open **Hex View**.<br>2. Verify the first 2 bytes (`4D 5A` indicates Windows Executable).<br>3. Bookmark file under "Extension Spoofing" folder. |
| **Grep Search Returns Millions of False Hits** | Unescaped regex metacharacters or overly broad wildcards (e.g. `.*` matching entire raw drive blocks). | 1. Anchor regular expressions with boundary markers (`\b`).<br>2. Limit search to active File Entries rather than entire unallocated disk space.<br>3. Test regex against known samples in EnCase Search dialog. |
| **Encrypted File Flagged as 'Unknown' / High Entropy** | File contains random high-entropy bytes characteristic of ransomware encryption, TrueCrypt volumes, or packed payloads. | 1. Run Entropy Analysis in Evidence Processor (Entropy $>7.9$ indicates encryption).<br>2. Search memory capture for active volume encryption keys. |
| **Bookmark Report Generates Blank RTF File** | Bookmark comments contain un-escaped control characters or the target report template was deleted. | 1. Re-select the standard EnCase default report template.<br>2. Export bookmark table as CSV or PDF. |

---

## Command Line Syntax & Server Control

```bash
# Query E01 Image Header Information
ewfinfo "C:\Evidence\Server_Image.E01"

# Extract Master File Table Records via TSK
fls -r -p -m "C:" "C:\Evidence\Server_Image.E01"
```

### Key Configuration Locations
- **Windows User Settings**: `%APPDATA%\EnCase\`
- **Evidence Cache**: `%LOCALAPPDATA%\EnCase\EvidenceCache\`

---

## Agent Operational Directive
> **MANDATORY**: Inspect the Data Interpreter in Hex View when analyzing raw disk sectors to parse integer and timestamp formats. Flag all executable files disguised with benign document extensions as high-priority investigation items.
