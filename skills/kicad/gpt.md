---
title: "KiCad Open-Source ECAD AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize KiCad, Pcbnew Python API, S-expression AST parsing, and automated hardware pipelines."
category: "Open Source PCB Design & EDA"
tags: ["kicad", "pcbnew-python", "s-expressions", "gpt-codex", "kicad-cli", "hardware-automation"]
---

# KiCad Open-Source ECAD AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
KiCad's open architecture, S-Expression syntax tree, and native Python scripting API (**`pcbnew`**) allow comprehensive automated layout synthesis, component placement, and manufacturing release pipelines. GPT/Codex acts as a Principal Hardware Automation Developer and PCB Synthesis Specialist, delivering **`pcbnew` Python scripts**, **S-Expression AST parsers/generators**, **automated footprint layout placement algorithms**, and **headless GitHub Actions CI/CD workflows**.

### Developer Architecture & S-Expression Engine

```
┌─────────────────────────────────────────────────────────────┐
│                 KiCad Developer Platform                    │
│                                                             │
│  Data Structure & File Formats (S-Expressions)              │
│  ├── `.kicad_pcb` (Layer definitions, footprints, tracks)   │
│  ├── `.kicad_sch` (Symbol instances, wires, buses, sheets) │
│  └── `.kicad_mod` (Individual footprint definitions)        │
│                                                             │
│  Automation & Programming APIs                              │
│  ├── Native `pcbnew` Python 3 C++ SWIG Bindings             │
│  ├── `kicad-cli` Command-Line Toolchain                     │
│  └── KiCad Action Plugin System (GUI Hook Extensions)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **`pcbnew` Python API Automation**: Author Python scripts to programmatically place components in circular/matrix arrays, create custom net tracks, and inject vias using SWIG bindings.
2. **S-Expression AST Generation & Parsing**: Parse and modify `.kicad_pcb` and `.kicad_sch` files using regular expressions and S-expression tree tokenizers.
3. **Automated CI/CD Hardware Workflows**: Construct GitHub Actions / GitLab CI pipelines using Dockerized KiCad containers (`kicad/kicad:8.0`) to validate DRC and publish fabrication zip bundles on every git tag.
4. **Automated Footprint Generator**: Script parameterized footprint generation for high-pin-count QFN, BGA, and custom SMD connectors.

---

## Production Python Automation: Procedural Circular LED Array Layout Synthesizer

Save this script as `place_circular_leds.py` and run within the KiCad Scripting Console or standalone with `pcbnew`:

```python
"""
Procedural Circular Component Array Generator for KiCad Pcbnew
Arranges a series of LED footprints (D1 to D16) in an exact radius circle.
"""

import sys
import math
import pcbnew

def arrange_circular_array(pcb_path: str, center_x_mm: float, center_y_mm: float, radius_mm: float, designator_prefix: str = "D", count: int = 16):
    print(f"Loading board: {pcb_path}...")
    board = pcbnew.LoadBoard(pcb_path)

    center_point = pcbnew.VECTOR2I(
        pcbnew.FromMM(center_x_mm),
        pcbnew.FromMM(center_y_mm)
    )
    radius_iu = pcbnew.FromMM(radius_mm)

    angle_step = (2.0 * math.pi) / count
    modified_count = 0

    for i in range(count):
        ref = f"{designator_prefix}{i+1}"
        footprint = board.FindFootprintByReference(ref)
        
        if footprint:
            current_angle = i * angle_step
            pos_x = center_point.x + int(radius_iu * math.cos(current_angle))
            pos_y = center_point.y + int(radius_iu * math.sin(current_angle))

            footprint.SetPosition(pcbnew.VECTOR2I(pos_x, pos_y))
            # Rotate footprint tangential to the circle
            rot_degrees = (math.degrees(current_angle) + 90.0) % 360.0
            footprint.SetOrientation(pcbnew.EDA_ANGLE(rot_degrees, pcbnew.DEGREES_T))
            
            print(f"Placed {ref:<5} at ({pcbnew.ToMM(pos_x):.2f}, {pcbnew.ToMM(pos_y):.2f}) mm | Rot: {rot_degrees:.1f}°")
            modified_count += 1
        else:
            print(f"Warning: Footprint '{ref}' not found on board.")

    if modified_count > 0:
        board.Save(pcb_path)
        print(f"\nSuccessfully arranged {modified_count} components and saved board.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python place_circular_leds.py <board.kicad_pcb>")
        sys.exit(1)
    arrange_circular_array(sys.argv[1], center_x_mm=100.0, center_y_mm=100.0, radius_mm=25.0, count=12)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`ImportError: No module named pcbnew`** | Python script run using standard host Python without KiCad's site-packages path linked. | 1. Use KiCad's bundled Python: `"C:\Program Files\KiCad\8.0\bin\python.exe" script.py`.<br>2. Or add KiCad Python path to `PYTHONPATH` (`C:\Program Files\KiCad\8.0\lib\python3\dist-packages`). |
| **`board.Save()` Corrupts File Formatting** | Modifying board objects in standalone mode without properly initializing the KiCad environment. | Use `pcbnew.SaveBoard(pcb_path, board)` and verify file permissions before saving. |
| **S-Expression Parser Error: `Unexpected Token at Line XX`** | Hand-editing `.kicad_pcb` or `.kicad_sch` with mismatched parentheses or unescaped quotes. | 1. Validate parenthetical balance in text editor.<br>2. Format file with standard S-expression formatter before loading into KiCad. |
| **GitHub Actions DRC Fails: `Font Not Found`** | Headless Linux container missing TrueType/FreeSans fonts used for silkscreen text. | In Dockerfile, run `apt-get install -y fonts-freefont-ttf fonts-dejavu-core`. |

---

## Command Line Syntax & CI/CD Pipeline Recipes

```bash
# Headless KiCad 8 Docker DRC & Export in GitHub Actions
docker run --rm -v $(pwd):/workspace -w /workspace kicad/kicad:8.0-amd64 \
    kicad-cli pcb drc --output-format json -o drc.json my_board.kicad_pcb

# Generate Positional Centroid Placement Data via CLI
kicad-cli pcb export pos --format ascii --units mm --output "C:\CAM\placement.pos" my_board.kicad_pcb
```

### Essential File Locations
- **Windows Bundled Python**: `C:\Program Files\KiCad\8.0\bin\python.exe`
- **Linux Python Site-Packages**: `/usr/lib/python3/dist-packages/pcbnew.py`

---

## Agent Operational Directive
> **MANDATORY**: Execute Python automation scripts against KiCad boards using the bundled `python.exe` interpreter. Units in `pcbnew` are Internal Units (nanometers); always use `pcbnew.FromMM()` and `pcbnew.ToMM()` for conversions.
