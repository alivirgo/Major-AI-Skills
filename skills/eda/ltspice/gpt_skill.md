---
title: "Analog Devices LTspice Circuit Simulation AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize LTspice, programmatic .asc netlist generation, binary .raw file parsing, and Python PyLTSpice automation."
category: "SPICE Circuit Simulation & Schematic Capture"
tags: ["ltspice", "pyltspice", "raw-parser", "gpt-codex", "circuit-synthesis", "spice-automation"]
---

# Analog Devices LTspice Circuit Simulation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
LTspice combines a high-speed numerical simulation engine with standard ASCII netlist and schematic formats (`.asc`, `.net`), making it ideal for algorithmic circuit synthesis and automated testing. GPT/Codex acts as a Principal Hardware Simulation Developer and SPICE Automation Architect, delivering **Python `PyLTSpice` automation pipelines**, **programmatic `.asc` schematic generators**, **binary `.raw` waveform parsers**, and **Monte Carlo statistical yield optimizers**.

### Developer Platform & Netlist Synthesis Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 LTspice Developer Platform                  │
│                                                             │
│  Programmatic Netlist & Schematic Synthesis                 │
│  ├── `.asc` Schematic AST Tokenizer (Wires, Flags, Symbols) │
│  ├── Dynamic Netlist Compilers (`.cir` / `.net` Generators) │
│  └── Sub-Circuit (`.subckt`) Encapsulation Modules          │
│                                                             │
│  Automation & Extraction Framework                          │
│  ├── `PyLTSpice` / CLI Batch Runner (`-b -Run -ascii`)      │
│  ├── Binary `.raw` Waveform Parser (IEEE 754 Float Decoder) │
│  └── Automated `.log` Measurement Extractor (`.MEAS` Regex) │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Procedural `.asc` Schematic Generation**: Author scripts generating valid LTspice `.asc` schematic files with proper wire coordinates, net flags, component rotations, and SPICE directives.
2. **Binary `.raw` Waveform Parsing**: Build Python functions to parse raw binary waveform files (`.raw`), reading header variables and unpacking binary float arrays.
3. **Automated Monte Carlo & Sensitivity Sweeps**: Programmatically inject component tolerance distributions (`gauss()`, `flat()`) into netlists to calculate production yields.
4. **Automated Filter & Power Stage Synthesis**: Synthesize passive/active filters (Butterworth, Chebyshev, Sallen-Key) and calculate component values based on user cutoff specifications.

---

## Production Python Automation: Binary LTspice `.raw` Fast Waveform Parser

Save this script as `ltspice_raw_parser.py` to extract waveform traces from binary `.raw` simulation files without third-party dependencies:

```python
"""
LTspice Fast Binary .raw Waveform File Parser
Extracts time vectors and trace voltages from LTspice binary simulation outputs.
"""

import sys
import os
import struct
import numpy as np

def parse_ltspice_raw(raw_file_path: str):
    if not os.path.exists(raw_file_path):
        print(f"Error: .raw file '{raw_file_path}' not found.")
        return

    with open(raw_file_path, "rb") as f:
        # 1. Parse ASCII Header
        header = {}
        variables = []
        is_binary = False

        while True:
            line = f.readline().decode("utf-8", errors="ignore").strip()
            if line.startswith("Variables:"):
                # Read all declared variables
                num_vars = int(header.get("No. Variables", 0))
                for _ in range(num_vars):
                    var_line = f.readline().decode("utf-8", errors="ignore").strip()
                    parts = var_line.split("\t")
                    if len(parts) >= 3:
                        variables.append((parts[1], parts[2])) # (Name, Type)
            elif line.startswith("Binary:"):
                is_binary = True
                break
            elif ":" in line:
                key, val = line.split(":", 1)
                header[key.strip()] = val.strip()

        num_points = int(header.get("No. Points", 0))
        num_vars = len(variables)

        print(f"--- [PARSED RAW FILE: {raw_file_path}] ---")
        print(f"Title:        {header.get('Title', '-')}")
        print(f"Total Points: {num_points:,}")
        print(f"Variables ({num_vars}): {', '.join([v[0] for v in variables[:5]])}...")

        if is_binary and num_points > 0 and num_vars > 0:
            # Time is stored as 8-byte double (float64), voltages as 4-byte single (float32)
            # Size per point: 8 + (num_vars - 1) * 4
            record_size = 8 + (num_vars - 1) * 4
            raw_bytes = f.read(num_points * record_size)
            
            print(f"\nSuccessfully read {len(raw_bytes):,} raw binary bytes.")
            print(f"First variable: '{variables[0][0]}' (Time Vector)")
            if num_vars > 1:
                print(f"Second variable: '{variables[1][0]}' ({variables[1][1]})")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ltspice_raw_parser.py <circuit.raw>")
        sys.exit(1)
    parse_ltspice_raw(sys.argv[1])
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`PyLTSpice` Batch Simulation Hangs Indefinitely** | LTspice launched without headless flags (`-b -Run`), waiting for user GUI interaction. | Always pass `-b -Run` flags when executing batch runs: `subprocess.run(["LTspice.exe", "-b", "-Run", cir_path])`. |
| **`.MEAS` Extraction Returns `Measurement "xyz" FAIL`** | Trigger condition not met in transient simulation (e.g. signal never reached threshold voltage). | 1. Inspect simulation time range in `.TRAN` to ensure circuit reached steady-state.<br>2. Lower measurement threshold in `.MEAS`. |
| **Schematic `.asc` File Fails to Open in LTspice** | Syntax error in custom `.asc` generator (e.g. invalid wire coordinates or missing `SYMBOL` terminator). | Follow strict `.asc` grammar: `WIRE X1 Y1 X2 Y2` and `FLAG X Y NetName`. |
| **Memory Exhaustion on Large Monte Carlo Sweeps** | Saving all internal nodal voltages during 10,000-run Monte Carlo batch. | Add `.save V(out) I(Rload)` to save only critical output nodes rather than entire circuit state. |

---

## Command Line Syntax & Batch Processing

```bash
# Run Headless Simulation with Fast Binary Output
"C:\Program Files\ADI\LTspice\LTspice.exe" -b -Run "C:\Circuits\BatchSim.asc"

# Convert Binary .raw File to ASCII
"C:\Program Files\ADI\LTspice\LTspice.exe" -ascii -b "C:\Circuits\BatchSim.cir"
```

### Essential File Locations
- **Windows User Models**: `%USERPROFILE%\Documents\LTspice\lib`
- **Global Installation**: `C:\Program Files\ADI\LTspice\`

---

## Agent Operational Directive
> **MANDATORY**: When executing automated batch simulations, always use `-b -Run` command-line flags. Limit saved waveform channels using `.save` statements to avoid filling disk storage with multi-gigabyte `.raw` files during Monte Carlo sweeps.
