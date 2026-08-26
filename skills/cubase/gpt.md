---
title: "Steinberg Cubase Pro Music Production AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Steinberg Cubase Pro, Expression Map XML generators, MIDI Remote JavaScript APIs, and Logical Editor presets."
category: "Professional Music Production & MIDI Sequencing"
tags: ["cubase", "expression-maps-xml", "midi-remote-js", "logical-editor", "gpt-codex", "audio-scripting"]
---

# Steinberg Cubase Pro Music Production AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Steinberg Cubase Pro provides deep automation capabilities via the **Steinberg MIDI Remote JavaScript API**, **Expression Map XML schemas**, and the **Project Logical Editor (PLE)**. GPT/Codex acts as a Principal Audio Software Developer and MIDI Automation Engineer, delivering **custom Expression Map XML generators**, **modular MIDI Remote JavaScript drivers**, **automated stem export scripts**, and **rule-based Project Logical Editor transforms**.

### Developer Architecture & Scripting Platform Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Cubase Developer Platform                   │
│                                                             │
│  MIDI Remote JavaScript Architecture (`midiremote_api_v1`)  │
│  ├── `DeviceDriver` Initialization & Port Binding           │
│  ├── `Surface` Elements (Faders, Knobs, Buttons, Displays)  │
│  └── `HostAccess` Mapping (Mixer, Transport, Quick Controls)│
│                                                             │
│  Data Schema & Logical Engine                               │
│  ├── Expression Map XML Schemas (`.expressionmap`)          │
│  ├── Project Logical Editor XML Transformation Presets      │
│  └── VST XML Device Panels & MIDI Patch Lists               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Expression Map XML Generation**: Author Python scripts to dynamically generate valid Cubase Expression Map XML files (`.expressionmap`) mapping articulation sound slots to MIDI CC / Keyswitches.
2. **Steinberg MIDI Remote API Driver Development**: Write full JavaScript device drivers adhering to `midiremote_api_v1` standards with multi-page navigation.
3. **Project Logical Editor (PLE) Macro Development**: Design rule-based transformation schemas (*e.g. "Select all MIDI notes with velocity $<40$ and lengthen by $20\%$"*).
4. **Batch Audio Stem Export Pipelines**: Script external batch audio converters and metadata injectors processing multi-track stem exports.

---

## Production Python Automation: Automated Cubase Expression Map XML Generator

Save this script as `generate_expression_map.py` to programmatically build an Expression Map for an orchestral sample library:

```python
"""
Cubase Expression Map (.expressionmap) XML Generator
Builds a complete Cubase-compliant Expression Map XML file for orchestral instruments.
"""

import sys
import xml.etree.ElementTree as ET

ARTICULATIONS = [
    {"name": "Legato", "keyswitch": 24, "type": "Direction"},
    {"name": "Staccato", "keyswitch": 25, "type": "Attribute"},
    {"name": "Pizzicato", "keyswitch": 26, "type": "Attribute"},
    {"name": "Tremolo", "keyswitch": 27, "type": "Direction"},
    {"name": "Spiccato", "keyswitch": 28, "type": "Attribute"}
]

def generate_cubase_expression_map(map_name: str, output_file: str):
    root = ET.Element("InstrumentExpressionMap")
    
    # Header Info
    ET.SubElement(root, "string", name="name", value=map_name)
    slot_list = ET.SubElement(root, "list", name="slots", type="obj")

    print(f"--- [GENERATING CUBASE EXPRESSION MAP: {map_name}] ---")

    for idx, art in enumerate(ARTICULATIONS):
        slot = ET.SubElement(slot_list, "obj", type="USlotDescription", ID=str(idx))
        ET.SubElement(slot, "string", name="name", value=art["name"])
        ET.SubElement(slot, "int", name="status", value="1")

        # Articulation Slot Settings
        art_list = ET.SubElement(slot, "list", name="articulations", type="obj")
        art_obj = ET.SubElement(art_list, "obj", type="USlotArticDescription", ID="0")
        ET.SubElement(art_obj, "string", name="name", value=art["name"])
        ET.SubElement(art_obj, "int", name="type", value="1" if art["type"] == "Attribute" else "0")

        # Output MIDI Keyswitch Event
        output_list = ET.SubElement(slot, "list", name="outputEvents", type="obj")
        event_obj = ET.SubElement(output_list, "obj", type="USlotEvent", ID="0")
        ET.SubElement(event_obj, "int", name="status", value="144") # Note-On Channel 1
        ET.SubElement(event_obj, "int", name="data1", value=str(art["keyswitch"])) # Note Pitch
        ET.SubElement(event_obj, "int", name="data2", value="100") # Velocity

        print(f"• Added Slot #{idx}: {art['name']:<12} -> MIDI Note {art['keyswitch']} ({art['type']})")

    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ", level=0)
    tree.write(output_file, encoding="utf-8", xml_declaration=True)
    print(f"\n✅ Successfully generated Expression Map XML: {output_file}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "Violins_ExpressionMap.expressionmap"
    generate_cubase_expression_map("Violins I Master", out)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Expression Map XML Fails to Import: `Invalid File Format`** | XML missing required `InstrumentExpressionMap` root tag or numeric IDs are non-contiguous. | Validate XML schema against standard Steinberg DTD headers. |
| **`midiremote_api` Throws `TypeError: undefined is not a function`** | Script using deprecated syntax from early preview builds instead of `midiremote_api_v1`. | Ensure script starts with `var midiremote_api = require('midiremote_api_v1');`. |
| **Project Logical Editor Macro Hangs** | Target action contains contradictory filters (e.g. `Type Equal Note AND Type Equal Controller`). | Change boolean operator from `AND` to `OR` for multi-type filter queries. |
| **MIDI Remote Script Missing MIDI Port Output** | Device driver detection unit configured with mismatched MIDI port name string. | Use exact port name reported by macOS Audio MIDI Setup or Windows Device Manager. |

---

## Command Line Syntax & Batch Processing

```bash
# Validate Generated Expression Map XML Syntax
python3 -c "import xml.etree.ElementTree as ET; ET.parse('Violins_ExpressionMap.expressionmap'); print('XML Valid!')"

# Copy Script Driver to Local Cubase MIDI Remote Directory
cp CustomController.js ~/Library/Preferences/Cubase\ 14/MIDI\ Remote/Driver\ Scripts/Local/Vendor/
```

### Essential File Locations
- **Expression Maps Directory**: User specified or `%APPDATA%\Steinberg\Cubase 14_64\Presets\`
- **MIDI Remote Scripts**: `%APPDATA%\Steinberg\Cubase 14_64\MIDI Remote\Driver Scripts\`

---

## Agent Operational Directive
> **MANDATORY**: When authoring Expression Maps for orchestral scoring, designate short notes (Staccato, Spiccato) as `Attribute` (affects single note) and sustained articulations (Legato, Tremolo) as `Direction` (persists until next keyswitch).
