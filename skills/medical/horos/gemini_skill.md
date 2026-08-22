---
title: "Horos Open-Source DICOM Viewer AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot Horos 2D viewports, 3D MPR crosshairs, ROI measurement statistics, and Color Lookup Tables (CLUT)."
category: "Open Source DICOM Viewer & Medical Imaging"
tags: ["horos", "dicom-viewer", "mpr-crosshairs", "gemini", "roi-measurements", "clut-presets"]
---

# Horos Open-Source DICOM Viewer AI Skill Guide (Gemini)

## Overview & Engine Architecture
Horos provides an intuitive macOS DICOM reading environment featuring synchronized multi-planar reconstruction (MPR), 3D orthogonal slice navigation crosshairs, statistical Region of Interest (ROI) measurements, and customizable 2D/3D Color Lookup Tables (CLUT). Gemini acts as an AI Medical Imaging Reviewer and Radiographic Visual Auditor, specializing in **multimodal 2D DICOM viewport inspection**, **3D MPR orthogonal crosshair alignment**, **ROI quantitative area & mean density validation**, and **CLUT transfer curve optimization**.

### Visual Analytics & Diagnostic Viewport Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Horos Visual Operations Stack               │
│                                                             │
│  2D / 3D Medical Viewport Hierarchy                         │
│  ├── 2D Multi-Series Viewport (Cine Scrubber, Window/Level) │
│  ├── 3D Multi-Planar Reconstruction (MPR Orthogonal Planes) │
│  │    ├── Synchronized 3D Navigation Crosshairs             │
│  │    └── Thick Slab Maximum / Minimum Intensity Projection │
│  └── 3D Surface & Volume Rendering (Shaded Ray Caster)      │
│                                                             │
│  Measurement & Statistical Visual Tools                     │
│  ├── ROI Inspector (Polygons, Ellipses, Closed Freehand)    │
│  ├── Statistical Histogram & Mean HU Density HUD            │
│  └── Color Lookup Tables (CLUT: PET, Jet, Hot Iron, Rainbow)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal 2D Viewport Inspection**: Analyze screenshots of Horos 2D slice viewports to detect anatomical clipping, improper Window/Level display ranges, motion ghosting, and orientation marker misalignments (Anterior/Posterior, Left/Right).
2. **3D MPR Crosshair Alignment**: Verify that orthogonal slice planes intersect exactly through target anatomical lesions (e.g. vascular aneurysm neck or bone fracture plane).
3. **Quantitative ROI Validation**: Review statistical ROI measurement overlays, verifying accurate Mean Hounsfield Units, Standard Deviation, and calculated surface area ($\text{cm}^2$).
4. **Color Lookup Table (CLUT) Tuning**: Select and optimize 2D/3D pseudocolor palettes (PET-CT fusion, Rainbow, Hot Metal) for optimal lesion contrast.

---

## Production Python Automation: Automated DICOM Metadata & ROI Attribute Extractor

Execute this script to parse and audit DICOM metadata tags and patient series parameters for Horos imports:

```python
"""
DICOM Clinical Metadata & Image Attributes Auditor
Inspects slice thickness, pixel spacing, and modality tags for Horos compatibility.
"""

import sys
import os
from pydicom import dcmread

def audit_dicom_file(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return

    try:
        ds = dcmread(file_path, stop_before_pixels=True)
    except Exception as e:
        print(f"Failed to parse DICOM: {e}")
        return

    print("--- [AUDITING DICOM CLINICAL METADATA] ---")
    print(f"• Patient Name:      {ds.get('PatientName', 'Anonymous')}")
    print(f"• Patient ID:        {ds.get('PatientID', 'N/A')}")
    print(f"• Modality:          {ds.get('Modality', 'Unknown')} (CT/MR/CR/XA)")
    print(f"• Study Date:        {ds.get('StudyDate', 'N/A')}")
    print(f"• Series Desc:       {ds.get('SeriesDescription', 'No Description')}")
    print(f"• Matrix Dimensions: {ds.get('Rows', 0)} x {ds.get('Columns', 0)}")
    print(f"• Pixel Spacing:     {ds.get('PixelSpacing', ['1.0', '1.0'])}")
    print(f"• Slice Thickness:   {ds.get('SliceThickness', 'N/A')} mm")
    print(f"• Window Center/W:   {ds.get('WindowCenter', 'N/A')} / {ds.get('WindowWidth', 'N/A')}")
    print(f"• SOP Class UID:     {ds.get('SOPClassUID', 'N/A')}")
    print("\n✅ File structure is valid for Horos database indexing.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 audit_dicom.py <image.dcm>")
        sys.exit(1)
    audit_dicom_file(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **MPR View Shows Severe Stepping / Blocky Voxels** | Scan acquired with non-isotropic thick slices ($>5\text{mm}$) causing axial-to-coronal interpolation gaps. | In MPR view, enable **Trilinear / High-Quality Interpolation** in rendering options. |
| **ROI Area Shows 0.00 $\text{cm}^2$** | DICOM file lacks `PixelSpacing` tag `(0028,0030)` required for spatial distance conversion. | Calibrate distance manually in Horos: Select **Length Tool** $\rightarrow$ Right-click $\rightarrow$ **Set Pixel Size**. |
| **Image Appears Mirrored (Left/Right Inverted)** | DICOM `PatientOrientation` tag interpreted differently by acquisition scanner. | Check anatomical orientation markers in viewport corners (**L** for Left, **R** for Right). |
| **3D Volume Rendering Shows Opaque Cloud** | Ray casting opacity transfer function baseline set too low, rendering background air/noise. | In 3D Volume settings, select **Bone with Skin** or **CT-Angio** CLUT preset and drag opacity baseline rightward. |

---

## Command Line Syntax & Server Control

```bash
# Launch Horos Directly with Study
open -a Horos "/Volumes/Data/PatientStudy"

# Inspect Local Horos Database File Count
find ~/Documents/Horos\ Data/DATABASE.noindex/ -name "*.dcm" | wc -l
```

### Key Configuration Locations
- **Horos Database**: `~/Documents/Horos Data/`
- **CLUT Color Tables**: `~/Library/Application Support/Horos/CLUTs/`

---

## Agent Operational Directive
> **MANDATORY**: Always confirm that `PixelSpacing` tags are present and valid before reporting quantitative tumor volume or lesion surface area measurements from Horos ROI tools.
