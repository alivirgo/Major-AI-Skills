---
title: "OriginLab OriginPro Scientific Graphing & Analysis AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize OriginPro, originpro Python API, LabTalk (.ogs), Origin C, and COM automation."
category: "Scientific Graphing & Data Analysis"
tags: ["originpro", "originpro-python", "labtalk-ogs", "origin-c", "com-automation", "gpt-codex", "data-analysis-dev"]
---

# OriginLab OriginPro Scientific Graphing & Analysis AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
OriginLab OriginPro provides complete developer extensibility through the **`originpro` Python API**, **LabTalk macro scripts (`.ogs`)**, compiled **Origin C functions**, and the **COM Automation Interface (`win32com.client`)**. GPT/Codex acts as a Principal Scientific Software Engineer and Technical Graphing Automation Developer, delivering **`originpro` Python batch processing pipelines**, **LabTalk automated analysis routines**, **Origin C custom fitting functions**, and **automated report export scripts**.

### Developer Architecture & Scripting Interface Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 OriginPro Developer Platform                │
│                                                             │
│  Python & LabTalk Automation Tier                           │
│  ├── `originpro` Python Package (Workbooks, Graphs, NLFit)  │
│  ├── LabTalk Command Engine (`.ogs` Macro Batch Execution)  │
│  └── COM Automation Server (`win32com.client.Dispatch`)     │
│                                                             │
│  Compiled Origin C & Algorithmic Core                       │
│  ├── Origin C (ANSI C/C++ Engine with Full GDI/Matrix API)  │
│  ├── Custom NLFit Fitting Functions (`.FDF` Definitions)    │
│  └── Automated Batch Analysis Template Processing           │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **`originpro` High-Level Python Scripting**: Author modular Python scripts utilizing `originpro` to create books, inject multidimensional NumPy arrays, apply templates, execute fits, and export vectorized figures.
2. **LabTalk Macro Automation (`.ogs`)**: Build structured LabTalk scripts automating multi-file imports, batch column calculations, and automated print/export passes.
3. **Custom NLFit Function Definition (`.FDF`)**: Author custom nonlinear fitting functions in Origin C / LabTalk with analytical derivatives for high-speed Levenberg-Marquardt convergence.
4. **COM Automation Client (`win32com.client`)**: Control running OriginPro instances from external Python or C# enterprise applications.

---

## Production Python Automation: Batch CSV Processor & Origin Template Plotter (`originpro`)

Save this script as `batch_origin_processor.py` (requires `pip install originpro pandas`):

```python
"""
OriginPro Automated Batch CSV Data Importer & Graph Exporter
Iterates over raw experimental CSV files, imports into worksheets, applies templates, and exports images.
"""

import sys
import os
import glob
import pandas as pd
import originpro as op

def batch_process_experiments(data_dir: str, output_dir: str):
    print(f"--- [INITIALIZING ORIGINPRO BATCH DATA PIPELINE] ---")
    
    os.makedirs(output_dir, exist_ok=True)
    csv_files = glob.glob(os.path.join(data_dir, "*.csv"))

    if not csv_files:
        print(f"Notice: No CSV files found in '{data_dir}'.")
        return

    print(f"Discovered {len(csv_files)} experimental dataset(s).")
    
    # 1. Connect to OriginPro Headless Session
    op.set_show(False)

    try:
        for idx, file_path in enumerate(csv_files, 1):
            base_name = os.path.splitext(os.path.basename(file_path))[0]
            print(f"\nProcessing [#{idx}]: {base_name}...")

            # 2. Load Data into Origin Workbook
            df = pd.read_csv(file_path)
            wbook = op.new_book("w", f"Run_{idx}")
            wks = wbook[0]
            wks.from_df(df)

            # 3. Create Graph using Built-in Line+Symbol Template
            graph = op.new_graph(template="linesymb")
            gl = graph[0]
            gl.add_plot(wks, coly=1, colx=0)
            gl.rescale()

            # Format Graph Aesthetics
            gl.set_xlim(begin=df.iloc[:, 0].min(), end=df.iloc[:, 0].max())
            graph.set_title(f"Experimental Run: {base_name}")

            # 4. Export High-Resolution PNG (300 DPI)
            out_img = os.path.join(output_dir, f"{base_name}_Plot.png")
            graph.save_fig(out_img, width=1600)
            print(f"  ✅ Exported Graph: {out_img}")

            # Destroy Workbook and Graph to free memory
            wbook.destroy()
            graph.destroy()

        print(f"\n✅ All {len(csv_files)} datasets processed and exported successfully!")

    finally:
        op.exit()
        print("OriginPro session terminated.")

if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "C:\\Data\\Experiments"
    dst = sys.argv[2] if len(sys.argv) > 2 else "C:\\Data\\Plots"
    batch_process_experiments(src, dst)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`originpro.PyOriginException: Cannot create book`** | OriginPro license ceiling reached or multiple orphan processes running in background. | Terminate orphan processes in Task Manager (`taskkill /F /IM Origin64.exe`) and retry. |
| **LabTalk Script Throws `Error: Variable not declared`** | LabTalk variable scope mismatch between local session and global project scope. | Declare variables explicitly with scope prefix: `double myVal = 10.5;` or `string str$ = "Test";`. |
| **`wks.from_df()` Drops Header Names** | DataFrame contains multi-index columns not supported by standard 1-row header import. | Flatten DataFrame column headers (`df.columns = df.columns.to_flat_index()`) before importing. |
| **COM Automation Fails: `Dispatch: Invalid ProgID`** | `Origin.Application` or `Origin.ApplicationSI` not registered in Windows registry. | Run `Origin64.exe /regserver` in an elevated administrator prompt. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute Headless LabTalk Batch Script
"C:\Program Files\OriginLab\OriginPro 2025\Origin64.exe" -r "C:\Scripts\RunBatch.ogs"

# Run OriginPro Python Batch Script via Shell
python batch_origin_processor.py "C:\Experiments" "C:\Exports"
```

### Essential File Locations
- **Custom Fitting Functions**: `%USERPROFILE%\Documents\OriginLab\User Files\FitFunc\`
- **LabTalk Scripts**: `*.ogs`
- **Origin C Source Files**: `*.c`, `*.cpp`

---

## Agent Operational Directive
> **MANDATORY**: When orchestrating high-volume batch processing via `originpro`, always call `.destroy()` on completed workbooks and graphs within the loop to prevent memory leaks from hundreds of open windows.
