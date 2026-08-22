---
title: "Dassault Systèmes CATIA AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Dassault Systèmes CATIA V5 & 3DEXPERIENCE pipelines, COM Automation, and Knowledgeware."
category: "Advanced Surface & Solid Modeling PLM"
tags: ["catia", "catia-v5", "com-automation", "python-cad", "knowledgeware", "gpt-codex", "plm"]
---

# Dassault Systèmes CATIA AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Dassault Systèmes CATIA V5/3DEXPERIENCE is the core engineering design engine across enterprise aerospace, automotive, and heavy machinery industries. GPT/Codex acts as a Principal CAD/PLM Automation Developer, delivering **Python `win32com` automation scripts**, **CATScript/VBA macro libraries**, **Knowledgeware rule definitions**, and **headless batch conversion pipelines**.

### System Architecture & Automation Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 CATIA Enterprise Automation                 │
│                                                             │
│  Data & Geometry Engine (CGM - Convergence Geometric Modeler)│
│  ├── Hybrid Modeling (Solids, Wireframe, GSD Surfaces)      │
│  ├── Specification Tree Graph & Feature History Hierarchy   │
│  └── Knowledgeware Relations & Parameter Formulas           │
│                                                             │
│  Developer Interfaces                                       │
│  ├── Win32 Type Library COM Automation (`CATIA.Application`) │
│  ├── Visual Basic for Applications (VBA) & VBScript Engine  │
│  └── CAA C++ Software Development Kit (Low-level Native API)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Python COM Product Structure Traversal**: Write recursive Python scripts using `win32com.client` to traverse complex multi-tier `CATProduct` trees, extracting part numbers, instances, file paths, and metadata attributes.
2. **Automated Feature & Sketch Construction**: Programmatically generate 2D parametric sketch profiles, pads, pockets, shaft revolutions, and surface lofts via the Part Design and GSD COM interfaces.
3. **Batch Geometry Translation (STEP / IGES / 3D XML)**: Author headless conversion scripts using `CATBatchMonitor` or CLI wrappers to translate CAD repositories with preserved assembly hierarchies.
4. **Knowledgeware Rule & Parameter Management**: Formulate parameterized Knowledgeware equations, user parameters (`Length`, `Angle`, `Real`), and automated design checks.

---

## Production Python Automation: Recursive Assembly Tree Inspector

Execute this script with Python (`pip install pywin32`) to recursively extract the complete BOM (Bill of Materials) from an open CATProduct assembly:

```python
"""
CATIA V5 Automation: Recursive Assembly BOM & Hierarchy Extractor
Requires: pip install pywin32
"""

import sys
import win32com.client

def extract_assembly_bom(product, depth=0):
    indent = "  " * depth
    part_number = product.PartNumber
    instance_name = product.Name
    print(f"{indent}├── [{part_number}] (Instance: {instance_name})")

    # Traverse child products / components
    try:
        children = product.Products
        for i in range(1, children.Count + 1):
            child_product = children.Item(i)
            extract_assembly_bom(child_product, depth + 1)
    except Exception:
        pass # Leaf node (CATPart)

def run_bom_extraction():
    try:
        catia = win32com.client.Dispatch("CATIA.Application")
    except Exception as e:
        print(f"Error: Could not connect to CATIA: {e}")
        sys.exit(1)

    doc = catia.ActiveDocument
    if not doc:
        print("No active document found.")
        sys.exit(1)

    print(f"--- [CATIA ASSEMBLY BOM: {doc.Name}] ---")
    extract_assembly_bom(doc.Product)
    print("--- [BOM Extraction Completed] ---")

if __name__ == "__main__":
    run_bom_extraction()
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`com_error: (-2147352567, 'Exception occurred.')`** | The requested feature or workbench interface is not available in the current document context (e.g. calling `Part` methods on a `ProductDocument`). | 1. Verify document type via `doc.Type` (`CATPart` vs `CATProduct`).<br>2. Check whether target object is active/open in editor.<br>3. Handle missing interfaces with explicit exception checks. |
| **Cyclic Dependency Error during Part Update** | A geometric parameter references a downstream feature that depends on that same parameter. | 1. Open *Tools $\rightarrow$ Parameter Tree*.<br>2. Trace dependent formulas and delete cyclic loop relations.<br>3. Decouple features by creating intermediate Published datum planes/surfaces. |
| **Silent Macro Execution Hang in Batch Mode** | Interactive modal dialog (e.g. Warning / License prompt) spawned in headless session. | 1. In CATScript/Python, set `CATIA.DisplayFileAlerts = False`.<br>2. Set `CATIA.Interactive = False` prior to invoking batch loops.<br>3. Restore `DisplayFileAlerts = True` on termination. |
| **Drafting Sheet Export Fails with Missing Views** | Generative 2D drafting views were not updated after 3D part geometry modification. | 1. Open Drawing document.<br>2. Execute `sheet.Update()` on all drafting sheets before invoking `doc.ExportData(path, "pdf")`. |

---

## Command Line Syntax & Batch Processing

```bash
# Windows CLI: Execute Python Script against Background CATIA
python "C:\Pipeline\extract_bom.py"

# Launch CATIA V5 with Specific Environment File
"C:\Program Files\Dassault Systemes\B32\win_b64\code\bin\CNEXT.exe" -env CATIA_V5R32 -batch -macro "C:\Scripts\RunPreflight.CATScript"
```

### Essential File Locations
- **Windows Environment Files**: `C:\ProgramData\DassaultSystemes\CATEnv`
- **Windows User Settings**: `%APPDATA%\DassaultSystemes\CATSettings`
- **Dassault License Log**: `C:\ProgramData\DassaultSystemes\Licenses\DSLS.log`

---

## Agent Operational Directive
> **MANDATORY**: In Python COM automation scripts, always set `CATIA.DisplayFileAlerts = False` to prevent modal dialogs from hanging background tasks. Traverse product trees recursively to process multi-tier assembly components.
