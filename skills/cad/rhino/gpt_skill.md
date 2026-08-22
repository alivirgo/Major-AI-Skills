---
title: "McNeel Rhinoceros (Rhino 8) AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize McNeel Rhinoceros (Rhino 8), RhinoCommon API, Grasshopper Hops, and Rhino.Compute."
category: "NURBS Surface Modeling & Computational Design"
tags: ["rhino", "rhinocommon", "rhino-compute", "grasshopper-hops", "gpt-codex", "computational-geometry"]
---

# McNeel Rhinoceros (Rhino 8) AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
McNeel Rhinoceros (Rhino 8) provides an extensive OpenNURBS C++ geometric modeling core accessible via **RhinoCommon (.NET / CPython 3)** and **Rhino.Compute REST APIs**. GPT/Codex acts as a Principal Computational Geometry Developer and Pipeline Architect, delivering **RhinoCommon algorithms**, **Grasshopper Hops microservices**, **headless Brep generators**, and **automated STEP/3DM file converters**.

### Pipeline Architecture & Developer Layer

```
┌─────────────────────────────────────────────────────────────┐
│                 Rhino Developer Ecosystem                   │
│                                                             │
│  OpenNURBS Geometry Core                                    │
│  ├── `Rhino.Geometry.Brep`, `NurbsSurface`, `Curve`, `Mesh` │
│  ├── Spatial Search Structures (RTree, KDTree, Octree)      │
│  └── Intersect, Boolean, Fillet, and Offset Math Kernels    │
│                                                             │
│  Scripting & Distributed Services                           │
│  ├── Rhino 8 CPython 3.9 Integration (`import Rhino`)       │
│  ├── Grasshopper Hops (Remote C# / Python Node Execution)   │
│  └── Rhino.Compute (Headless Geometry Server via HTTP REST) │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Pure RhinoCommon Python Scripting**: Author high-speed algorithmic geometry scripts using `Rhino.Geometry` without GUI dependencies, suitable for standalone execution via Rhino.Inside or CPython 3.
2. **Grasshopper Hops Microservice Integration**: Author stateless geometry functions using `ghhops-server` (Flask/FastAPI) to expose Python math and machine learning solvers directly to Grasshopper canvas nodes.
3. **Spatial Search & Collision Optimization**: Leverage `Rhino.Geometry.RTree` for lightning-fast bounding box and point-cloud distance queries ($O(\log N)$ complexity).
4. **Automated Conversion & Export Pipelines**: Build command-line converters for 3DM, STEP, IGES, OBJ, and glTF asset management.

---

## Production Python Automation: Standalone RhinoCommon Procedural Truss Generator

Run this script in the Rhino 8 Python 3 Editor (`import Rhino.Geometry as rg`) to generate a parametric 3D space truss with solid pipe struts and spherical joint nodes:

```python
"""
Rhino 8 Automation: Procedural 3D Space Truss Generator
Pure RhinoCommon implementation utilizing Brep and Mesh primitives.
"""

import math
import Rhino
import Rhino.Geometry as rg
import scriptcontext as sc

def create_space_truss(length=50.0, width=20.0, height=10.0, bays=5, strut_radius=0.5, joint_radius=1.2):
    doc = sc.doc
    dx = length / bays
    
    bottom_nodes = []
    top_nodes = []
    struts = []

    # 1. Generate Node Coordinates
    for i in range(bays + 1):
        x = i * dx
        bottom_nodes.append(rg.Point3d(x, 0, 0))
        bottom_nodes.append(rg.Point3d(x, width, 0))
        if i < bays:
            top_nodes.append(rg.Point3d(x + dx/2, width/2, height))

    # 2. Add Spherical Joint Nodes to Document
    for pt in bottom_nodes + top_nodes:
        sphere = rg.Sphere(pt, joint_radius)
        doc.Objects.AddSphere(sphere)

    # 3. Connect Strut Curves
    lines = []
    # Bottom Longitudinal Chords
    for i in range(bays):
        lines.append(rg.Line(bottom_nodes[2*i], bottom_nodes[2*(i+1)]))
        lines.append(rg.Line(bottom_nodes[2*i+1], bottom_nodes[2*(i+1)+1]))
        lines.append(rg.Line(bottom_nodes[2*i], bottom_nodes[2*i+1]))

    # Top Longitudinal Chords
    for i in range(len(top_nodes) - 1):
        lines.append(rg.Line(top_nodes[i], top_nodes[i+1]))

    # Diagonal Web Struts
    for i in range(bays):
        top_pt = top_nodes[i]
        lines.append(rg.Line(bottom_nodes[2*i], top_pt))
        lines.append(rg.Line(bottom_nodes[2*i+1], top_pt))
        lines.append(rg.Line(bottom_nodes[2*(i+1)], top_pt))
        lines.append(rg.Line(bottom_nodes[2*(i+1)+1], top_pt))

    # 4. Generate Solid Cylindrical Brep Struts
    for line in lines:
        crv = line.ToNurbsCurve()
        pipe_breps = rg.Brep.CreatePipe(
            crv, strut_radius, False, rg.PipeCapMode.Flat, True, doc.ModelAbsoluteTolerance, doc.ModelAngleToleranceRadians
        )
        if pipe_breps:
            for b in pipe_breps:
                doc.Objects.AddBrep(b)

    doc.Views.Redraw()
    print(f"Successfully generated space truss: {len(lines)} struts and {len(bottom_nodes)+len(top_nodes)} joints.")

if __name__ == "__main__":
    create_space_truss()
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`Rhino.Geometry.Brep.CreateBooleanUnion` Returns Null** | Input Breps contain non-manifold edges, micro-gaps, or coplanar coincident faces within document tolerance. | 1. Verify `brep.IsValid` and `brep.IsSolid` for every input Brep.<br>2. Call `brep.Repair(doc.ModelAbsoluteTolerance)`.<br>3. Offset coincident faces by $0.005\text{ mm}$ before unioning. |
| **Grasshopper Hops Component Shows Connection Refused** | The backend Python `ghhops-server` HTTP daemon is not running on localhost or port 5000 is occupied. | 1. In terminal, run `python app.py` (verify server is listening on `http://127.0.0.1:5000`).<br>2. In Grasshopper Hops settings, verify Hops URL path.<br>3. Check firewall rules for TCP port 5000. |
| **Python Script Fails with `ImportError: No module named numpy`** | Rhino 8 CPython 3 runtime does not have the target pip wheel installed in its internal virtual environment. | 1. In Rhino 8 Script Editor, open *Tools $\rightarrow$ Python 3 $\rightarrow$ Manage Packages*.<br>2. Search for `numpy` and click **Install**.<br>3. Or run `# r: numpy` at the top of your Python script for auto-install. |
| **RTree Spatial Query Returns Duplicate Hit Points** | Bounding box margin in `RTree.Search` is too wide, matching multiple neighboring leaf nodes. | Filter query results using `Point3d.DistanceTo()` against a strict threshold distance after the broad-phase RTree query. |

---

## Command Line Syntax & Batch Processing

```bash
# Windows CLI: Execute Rhino Python Script in Background
"C:\Program Files\Rhino 8\System\Rhino.exe" /nosplash /runscript="-_RunPythonScript C:\Pipeline\truss_gen.py"

# Launch Grasshopper Hops HTTP Microservice
python -m ghhops_server --port 5000 --reload
```

### Essential File Locations
- **Windows Python 3 Packages**: `%USERPROFILE%\.rhinocode\py39-rh8\site-packages`
- **Windows Grasshopper Settings**: `%APPDATA%\Grasshopper`
- **macOS Python 3 Packages**: `~/.rhinocode/py39-rh8/site-packages`

---

## Agent Operational Directive
> **MANDATORY**: When scripting RhinoCommon operations, validate all Breps using `brep.IsValid` and `brep.IsSolid` before passing them to Boolean or Fillet math engines. In Rhino 8, use `# r: <package>` to declare Python package dependencies.
