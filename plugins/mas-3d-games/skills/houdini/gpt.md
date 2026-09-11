---
title: "SideFX Houdini AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize SideFX Houdini pipelines, Houdini Object Model (hou), VEX algorithms, and HDA tooling."
category: "Procedural VFX & Simulation"
tags: ["houdini", "hou-python", "vex", "hda-tooling", "pdg", "gpt-codex", "vfx-pipeline"]
---

# SideFX Houdini AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
SideFX Houdini is a fully programmable, node-graph-driven procedural DCC platform built on an extensible C++ core with a Python 3.11 object model (`hou`) and high-throughput VEX SIMD compiler. GPT/Codex operates as a Pipeline Architect and Houdini Tools Developer, delivering **robust Python `hou` tools**, **custom HDA (Houdini Digital Asset) builders**, **VEX math kernels**, and **PDG/TOPs wedge automation scripts**.

### System Architecture & Pipeline Framework

```
┌─────────────────────────────────────────────────────────────┐
│                 Houdini Technical Architecture              │
│                                                             │
│  Data Engine (Geometry & Field Arrays)                      │
│  ├── Detail, Primitive, Point, and Vertex Attribute Arrays  │
│  ├── VEX SIMD Virtual Machine (Run-time JIT compilation)    │
│  └── OpenVDB / Native Houdini Volume Buffers                │
│                                                             │
│  Developer Frameworks                                       │
│  ├── `hou` Python Object Model (Full graph mutation API)    │
│  ├── Hython / HBatch (Headless Batch Execution Runtime)     │
│  ├── HDK (Houdini Development Kit - C++ Plugin Interface)   │
│  └── PDG / TOPs (Task Graph Distributed Execution Engine)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Python `hou` Graph Construction**: Write robust, modular Python scripts to programmatically spawn nodes, wire inputs, set parameter expressions, and connect data streams in SOPs, DOPs, and LOPs.
2. **HDA Automation & Packaging**: Script the creation of `.hda` digital asset libraries, configure parameter templates (Floats, Ramps, File pickers), and set internal node locks.
3. **Advanced VEX Algorithm Design**: Author high-performance VEX wranglers for spatial point cloud lookups (`pcopen`, `pcfilter`), raycasting (`intersect`, `minpos`), and custom vector field manipulation.
4. **PDG / TOPs Pipeline Automation**: Configure Local and Farm Schedulers, wedge parameters across simulation passes, and handle task dependencies.

---

## Production Python Automation: Programmatic HDA Asset Creator

Execute this script in Houdini Python Source or via `hython` to programmatically build and save a Houdini Digital Asset (`.hda`):

```python
"""
Programmatic HDA Builder Tool
Creates an empty Subnet, configures exposed parameters, and saves to an HDA library.
"""

import os
import hou

def create_custom_hda(hda_name: str, hda_label: str, save_path: str) -> hou.Node:
    obj_context = hou.node("/obj")
    
    # 1. Create container subnet
    subnet = obj_context.createNode("subnet", node_name=hda_name)
    
    # 2. Inside subnet, add basic procedural geometry
    geo_node = subnet.createNode("geo", node_name="procedural_geo")
    tube = geo_node.createNode("tube", node_name="base_tube")
    tube.parm("type").set(1) # Polygon
    tube.parm("rad1").set(1.5)
    
    null_out = geo_node.createNode("null", node_name="OUT")
    null_out.setInput(0, tube)
    null_out.setDisplayFlag(True)
    null_out.setRenderFlag(True)

    # 3. Create HDA Definition
    hda_dir = os.path.dirname(save_path)
    if hda_dir and not os.path.exists(hda_dir):
        os.makedirs(hda_dir, exist_ok=True)

    hda_node = subnet.createDigitalAsset(
        name=hda_name,
        hda_file_name=save_path,
        description=hda_label,
        min_num_inputs=0,
        max_num_inputs=1,
        version="1.0"
    )

    # 4. Add Parameter Templates to HDA Interface
    ptg = hda_node.type().definition().parmTemplateGroup()
    
    radius_parm = hou.FloatParmTemplate(
        name="tube_radius",
        label="Tube Radius",
        num_components=1,
        default_value=(1.5,),
        min=0.1,
        max=10.0
    )
    ptg.addParmTemplate(radius_parm)
    hda_node.type().definition().setParmTemplateGroup(ptg)
    
    # Link internal node parm to HDA exposed parm
    tube.parm("rad1").setExpression('ch("../../tube_radius")')
    
    # Save definition and lock
    hda_node.type().definition().save(save_path)
    print(f"HDA successfully created and saved to: {save_path}")
    return hda_node

if __name__ == "__main__":
    create_custom_hda(
        hda_name="vfx_procedural_pipe",
        hda_label="Procedural Pipe Generator",
        save_path="C:/HDA_Library/vfx_procedural_pipe.hda"
    )
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`hou.GeometryPermissionError: Geometry is read-only`** | Script attempted to modify a node's geometry directly without creating a writable geometry copy (`hou.Geometry.freeze()` / `hou.SOPNode.geometry()`). | In Python SOPs, use `geo = node.geometry()` inside the cook method. In external scripts, operate on node parameters rather than mutating frozen geometry directly. |
| **VEX Compilation Error: `Type mismatch in function call`** | Calling vector/matrix VEX function with float or array argument without explicit casting. | Verify variable type prefixes (e.g. `v@Cd`, `f@scale`, `p@orient`). Cast floats to vector using `set(f, f, f)` or explicit type declarations. |
| **HDA Save Error: `Asset definition is locked`** | HDA file is marked read-only on disk or locked in session. | 1. Right-click HDA $\rightarrow$ Select **Allow Editing of Contents**.<br>2. Verify write permissions on the target `.hda` file.<br>3. Call `hda_node.type().definition().save()` after unlocking. |
| **RBD Bullet Simulation Jitter / Interpenetration** | Convex decomposition failed on concave geometry, or collision shape is set to default Box/Sphere. | 1. Attach an **RBD Convex Decomposition** node before the solver to break concave shapes into convex hulls.<br>2. In Bullet Solver, increase **Constraint Substeps** and **Max Iterations**. |

---

## Command Line Syntax & Batch Execution

```bash
# Windows CLI: Headless HDA Compilation / Regression Test
"C:\Program Files\Side Effects Software\Houdini 20.5.278\bin\hython.exe" "C:\Pipeline\test_hdas.py"

# Linux CLI: Batch Geometry Compression via Gconvert
gconvert /cache/sim.bgeo.sc /cache/compressed_sim.vdb

# Render HScript File on Cluster
hbatch -c "render -Va /stage/usdrender1" "C:\Projects\Solaris_Shot.hip"
```

### Essential File Paths
- **Windows Packages Path**: `%USERPROFILE%\Documents\houdini20.5\packages`
- **Windows Crash Logs**: `%LOCALAPPDATA%\Temp\houdini_temp\crash.*.hip`
- **Linux Crash Logs**: `/tmp/houdini_temp/crash.*.hip`

---

## Agent Operational Directive
> **MANDATORY**: Always prefer vectorized VEX wranglers for per-point geometric mutations ($>10,000\text{ points}$). Use Python `hou` strictly for node graph manipulation, HDA compilation, and pipeline orchestration.
