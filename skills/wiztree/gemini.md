---
title: "WizTree Disk Space Analyzer & MFT Engine AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot WizTree Treemap visualizers, File Extension percentage charts, Tree View hierarchies, and drive capacity heatmaps."
category: "Disk Space Visualizer & Storage Diagnostics"
tags: ["wiztree", "treemap-visualizer-ui", "file-extension-chart", "gemini", "tree-view-hierarchy", "disk-capacity-heatmap"]
---

# WizTree Disk Space Analyzer & MFT Engine AI Skill Guide (Gemini)

## Overview & Engine Architecture
WizTree provides an intuitive storage visualization dashboard featuring the **Color-Coded Interactive Treemap Visualizer (Cushion Treemap representation)**, **Hierarchical Tree View with Size Percentage Progress Bars**, **File Extension Breakdown Chart (Extension, Space, % Total, File Count)**, and the **Top 1000 Largest Files Viewport**. Gemini acts as an AI Storage Systems Reviewer and Disk Cleanup Specialist, specializing in **multimodal Treemap visual pattern analysis**, **space consumption outlier detection**, **file extension categorization audits**, and **system drive partition hygiene**.

### Visual Analytics & Storage Visualization Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 WizTree Visual Operations                   │
│                                                             │
│  Treemap Viewport & Geometric Partitioning                  │
│  ├── Dynamic Cushion Treemap (Area Proportional to File Size│
│  ├── Interactive File Hover Cues (Path, Size, Allocated MB) │
│  └── Extension Color Mapping (Blue=Videos, Green=Archives)  │
│                                                             │
│  Directory Hierarchy & Extension Analytics                  │
│  ├── Tree View Grid (Size Percentage Horizontal Bars)       │
│  ├── File Extension Breakdown Table (Sorting by Total Space)│
│  └── Top 1000 Files Table (Fast Largest File Enumeration)   │
│                                                             │
│  Operations & Context Menu Actions                          │
│  ├── Explorer Context Menu (Open Path, Command Prompt, Del.)│
│  └── Space Reclamation Shortcuts (Wipe to Recycle / Perm.)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Treemap Inspection**: Analyze screenshots of the WizTree Treemap to instantly identify oversized monolithic block clusters (*e.g. multi-gigabyte VMDK virtual disks, forgot ISO images, or ballooning AppData caches*).
2. **File Extension Breakdown Auditing**: Review the File Types tab to discover unexpected space hogs (*e.g. `.log` files consuming 30% of drive capacity due to runaway application debug logging*).
3. **Directory Tree Percentage Analysis**: Evaluate the Tree View to identify which subfolders contain the highest relative percentage of disk usage (e.g. `WinSxS`, `AppData\Local\Docker`).
4. **Safe Deletion & System Integrity Verification**: Guide users away from deleting protected Windows operating system files (`pagefile.sys`, `hiberfil.sys`, `System Volume Information`) and recommend safe OS cleanup methods (*e.g. running `cleanmgr.exe` or `DISM /Cleanup-Image`*).

---

## Production Python Automation: Automated WizTree File Extension Summary Generator

Run this script to parse a WizTree exported CSV file and generate a visual ASCII bar chart of the top storage-consuming file extensions:

```python
"""
WizTree File Extension Storage Visualizer
Parses WizTree CSV export and generates an ASCII bar chart of space allocation by extension.
"""

import sys
import os
import pandas as pd

def generate_extension_chart(csv_path: str):
    if not os.path.exists(csv_path):
        print(f"Error: CSV report '{csv_path}' not found.")
        return

    print(f"--- [WIZTREE STORAGE DISTRIBUTION CHART: {csv_path}] ---")
    try:
        df = pd.read_csv(csv_path, encoding="utf-8", on_bad_lines="skip")
        df["Size_GB"] = df["Size"] / (1024**3)
        df["Ext"] = df["File Name"].apply(lambda x: os.path.splitext(str(x))[1].lower())

        # Group and calculate percentages
        ext_summary = df.groupby("Ext")["Size_GB"].sum().sort_values(ascending=False).head(10)
        total_gb = df["Size_GB"].sum()

        print(f"\nTotal Drive Storage Analyzed: {total_gb:.2f} GB\n")
        print(f"{'Extension':<12} | {'Size (GB)':>10} | {'% Total':>8} | Visual Allocation")
        print("-" * 75)

        for ext, size_gb in ext_summary.items():
            if not ext:
                ext = "[No Ext]"
            pct = (size_gb / max(total_gb, 0.001)) * 100
            bar_len = int(pct / 2) # 50 chars max for 100%
            bar_str = "█" * bar_len

            print(f"{ext:<12} | {size_gb:>10.2f} | {pct:>7.1f}% | {bar_str}")

        print("\n✅ Visual storage distribution generated successfully.")

    except Exception as e:
        print(f"Failed to generate chart: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 generate_ext_chart.py <WizTree_Export.csv>")
        sys.exit(1)
    generate_extension_chart(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Treemap Shows Huge Single Block: `hiberfil.sys`** | Windows Hibernation file reserving RAM equivalent on the primary system drive. | If hibernation is not required, disable it in elevated CMD: `powercfg -h off`. |
| **Treemap Shows Huge Block: `pagefile.sys`** | Windows Virtual Memory Paging file dynamically expanded. | Manage pagefile size in *System Properties $\rightarrow$ Performance Settings $\rightarrow$ Virtual Memory*. |
| **Tree View Highlights Huge `C:\Windows\WinSxS`** | Accumulated Windows Update component store backups. | Safely purge WinSxS in elevated terminal:<br>`Dism.exe /online /Cleanup-Image /StartComponentCleanup /ResetBase`. |
| **Treemap Shows Massive `C:\ProgramData\Docker`** | Unused Docker container images, build caches, and volumes. | Run Docker cleanup: `docker system prune -a --volumes`. |

---

## Command Line Syntax & Server Control

```bash
# Launch WizTree GUI
"C:\Program Files\WizTree\wiztree64.exe"

# Open WizTree Focused on Specific Subdirectory
"C:\Program Files\WizTree\wiztree64.exe" "C:\Users\%USERNAME%\AppData"
```

### Key Configuration Locations
- **Settings Store**: `%APPDATA%\WizTree\WizTree.ini`

---

## Agent Operational Directive
> **MANDATORY**: Never instruct users to manually delete `hiberfil.sys`, `pagefile.sys`, or files inside `C:\Windows\WinSxS` via file explorer; always use official OS commands (`powercfg -h off`, `DISM /StartComponentCleanup`).
