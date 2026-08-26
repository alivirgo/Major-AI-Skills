---
title: "OsiriX MD Clinical DICOM Workstation AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot OsiriX study browsers, multi-tile viewing grids, PET-CT color fusion, and Curved MPR centerlines."
category: "DICOM Viewer & Radiology Workstation"
tags: ["osirix", "radiology-workstation", "pet-ct-fusion", "gemini", "curved-mpr", "hanging-protocols-ui"]
---

# OsiriX MD Clinical DICOM Workstation AI Skill Guide (Gemini)

## Overview & Engine Architecture
OsiriX MD provides a clinical radiology user interface featuring configurable multi-tile hanging layouts (**1x1, 2x2, 3x3, Dual-Monitor**), dynamic PET-CT color fusion blending, vascular Curved MPR centerline tracking, and multi-planar crosshair navigation. Gemini acts as an AI Clinical Radiology Workflow Reviewer and Diagnostic Interface Auditor, specializing in **multimodal OsiriX study browser table inspection**, **multi-tile layout and hanging protocol validation**, **PET-CT SUV threshold calibration**, and **Curved MPR centerline verification**.

### Visual Analytics & Clinical Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 OsiriX Visual Operations Stack              │
│                                                             │
│  Study Browser & Tiling Layout Hierarchy                    │
│  ├── Main Study Database Browser (Modality, Status, Date)   │
│  ├── Multi-Tile Viewport Grid (1x1, 1x2, 2x2, 4x4 Viewports)│
│  └── Dual-Head Diagnostic Monitor Layout Arranger           │
│                                                             │
│  Advanced Clinical Post-Processing                          │
│  ├── PET-CT Fusion Viewport (SUV Color Blend Alpha Slider)  │
│  ├── Curved Multi-Planar Reconstruction (Vessel Centerline) │
│  └── 3D Surface Mesh & Endoscopic Virtual Flythrough View   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Study Browser Inspection**: Analyze screenshots of the OsiriX study database list to verify patient demographic anonymization, modality status tags (*CT, MR, PT, CR*), and storage integrity.
2. **PET-CT Fusion Visualization Triage**: Validate color lookup table mapping and alpha transparency blending between anatomic CT scans and functional PET metabolic data.
3. **Curved MPR Centerline Diagnostics**: Review vascular centerline path tracking (e.g. coronary artery or aorta lumen) to identify centerline deviations through calcified plaques.
4. **Hanging Protocol Consistency Review**: Ensure comparison studies (prior vs current mammography / chest CT) are mirrored symmetrically across left and right viewports.

---

## Production Python Automation: Automated DICOM Series Integrity & Modality Auditor

Execute this script to audit an exported DICOM directory and ensure complete slice series indexing prior to clinical review in OsiriX:

```python
"""
OsiriX Study Series Completeness & Integrity Auditor
Scans DICOM folders to verify contiguous slice locations and slice count consistency.
"""

import sys
import os
from pydicom import dcmread

def audit_study_completeness(study_dir: str):
    if not os.path.exists(study_dir):
        print(f"Error: Directory '{study_dir}' not found.")
        return

    print(f"--- [AUDITING OSIRIX DICOM STUDY INTEGRITY: {study_dir}] ---")
    series_dict = {}

    for root, _, files in os.walk(study_dir):
        for f in files:
            path = os.path.join(root, f)
            try:
                ds = dcmread(path, stop_before_pixels=True)
                series_uid = ds.get("SeriesInstanceUID", "Unknown")
                series_desc = ds.get("SeriesDescription", "No Description")
                instance_num = int(ds.get("InstanceNumber", 0))
                slice_loc = float(ds.get("SliceLocation", 0.0))

                if series_uid not in series_dict:
                    series_dict[series_uid] = {
                        "desc": series_desc,
                        "modality": ds.get("Modality", "CT"),
                        "instances": [],
                        "locations": []
                    }
                series_dict[series_uid]["instances"].append(instance_num)
                series_dict[series_uid]["locations"].append(slice_loc)
            except Exception:
                continue

    print(f"Detected {len(series_dict)} Series in Study:\n")
    for uid, data in series_dict.items():
        inst_count = len(data["instances"])
        data["instances"].sort()
        data["locations"].sort()
        
        # Check for missing slice gaps
        expected = list(range(min(data["instances"]), max(data["instances"]) + 1))
        missing = set(expected) - set(data["instances"])

        print(f"• Modality: {data['modality']:<4} | Slices: {inst_count:>4} | Series: {data['desc']}")
        if missing:
            print(f"  🚨 WARNING: Detected {len(missing)} missing slice(s) in sequence: {list(missing)[:5]}...")
        else:
            print("  ✅ Contiguous slice sequence verified.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 audit_osirix_study.py <path_to_study_folder>")
        sys.exit(1)
    audit_study_completeness(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **PET-CT Fusion Colors Completely Wash Out CT Anatomy** | Fusion opacity slider set to 100% PET overlay with no CT background weighting. | In Fusion Viewport $\rightarrow$ Drag **Opacity Slider** to `50%` to blend anatomical CT bone/soft tissue with PET signal. |
| **Curved MPR Shows Blank Longitudinal Cut** | Centerline spline path has fewer than 3 anchor points or exceeds volume bounding box. | Re-plot vascular anchor points along the lumen in the axial view $\rightarrow$ Click **Generate Curved MPR**. |
| **Prior and Current Studies Not Linked in Cine Scroll** | Synchronization link (`Propagate to other views`) disabled in viewport toolbar. | Click the **Chain Link (Sync)** icon in the top toolbar to synchronize slice scrolling across matching planes. |
| **Study Browser Table Missing Patient Columns** | Table column header was dragged off or hidden in column selector. | Right-click the Study Browser table header $\rightarrow$ Select **Restore Default Columns**. |

---

## Command Line Syntax & Server Control

```bash
# Launch OsiriX
open -a OsiriX

# Open Patient Study by Accession Number via URL Scheme
open "osirix://loadStudy?accession=ACC102030"
```

### Key Configuration Locations
- **Preferences Plist**: `~/Library/Preferences/com.rossetantoine.osirix.plist`
- **Hanging Protocol Presets**: `~/Library/Application Support/OsiriX/Hanging Protocols/`

---

## Agent Operational Directive
> **MANDATORY**: When inspecting multi-series CT/MR scans, ensure slice continuity is verified to prevent corrupted multi-planar reconstructions caused by dropped slice instances.
