---
title: "McNeel Rhinoceros (Rhino 8) AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot McNeel Rhinoceros (Rhino 8) NURBS surfaces, Grasshopper definitions, and SubD forms."
category: "NURBS Surface Modeling & Computational Design"
tags: ["rhino", "rhino-8", "grasshopper", "gemini", "nurbs-diagnostics", "subd-surfaces"]
---

# McNeel Rhinoceros (Rhino 8) AI Skill Guide (Gemini)

## Overview & Engine Architecture
Robert McNeel & Associates Rhinoceros (Rhino 8) is the premier tool for freeform architectural geometry, computational form-finding, and industrial product design. Gemini operates as an AI Computational Design Director and Geometry Analyst, specializing in **multimodal Grasshopper definition graph auditing**, **Zebra stripe surface continuity evaluation (G0, G1, G2, G3)**, **SubD crease diagnostics**, and **RhinoCommon Python scripting**.

### Computational Geometry & Grasshopper Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Rhino 8 Computational Stack                 │
│                                                             │
│  Mathematical Surface & Mesh Modeling                       │
│  ├── NURBS Mathematical Representation (Knots, Control Pts) │
│  ├── SubD Organic Surface Modeling with Crease Weights      │
│  └── Mesh Analysis (Curvature Combs, Naked Edge Detection)  │
│                                                             │
│  Parametric & Computational Flow                            │
│  ├── Grasshopper Node Graph (Data Streams, Graft/Flatten)   │
│  ├── Kangaroo 2 Interactive Physics & Form-Finding Solvers  │
│  └── Ladybug / Environmental Analysis Visualization Engine  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Surface Inspection**: Analyze screenshots of Zebra isophotes, Draft Angle heatmaps, and EMap spherical reflections to diagnose surface wrinkles, flat spots, and tangent kinks.
2. **Grasshopper Definition Graph Auditing**: Evaluate canvas screenshots to identify orange warning wires (Data conversion issues), red error components, and bloated data tree structures.
3. **Kangaroo Form-Finding Diagnostics**: Troubleshoot physics simulation mesh relaxation, resolving unstable spring constants and exploding anchor goal points.
4. **NURBS Curve & Surface Rebuilding**: Advise optimal degree ($3$ or $5$) and control point distributions (`Rebuild` / `RebuildCrvNonUniform`) for smooth Class-A surface lofting.

---

## Production Python Automation: Surface Curvature Inspector & Rebuilder

Execute this script in Rhino 8 Script Editor to inspect selected surfaces for G1/G2 continuity and rebuild high-span patches:

```python
"""
Rhino 8 Automation: NURBS Surface Rebuilder & Quality Analyzer
Rebuilds selected surfaces with optimal span counts (Degree 3x3) for smooth Class-A flow.
"""

import rhinoscriptsyntax as rs
import Rhino

def analyze_and_rebuild_surfaces(u_pts: int = 6, v_pts: int = 6, u_deg: int = 3, v_deg: int = 3):
    srf_ids = rs.GetObjects("Select surfaces to analyze and rebuild", rs.filter.surface)
    if not srf_ids:
        return

    rebuilt_count = 0
    for srf_id in srf_ids:
        # Check current surface degrees and point count
        u_degree = rs.SurfaceDegree(srf_id, 0)
        v_degree = rs.SurfaceDegree(srf_id, 1)
        u_count = rs.SurfacePointCount(srf_id)[0]
        v_count = rs.SurfacePointCount(srf_id)[1]

        print(f"Surface {srf_id} -> Deg: ({u_degree},{v_degree}) | Points: ({u_count},{v_count})")

        # Rebuild to standard uniform Class-A patch
        success = rs.RebuildSurface(srf_id, degree=(u_deg, v_deg), point_count=(u_pts, v_pts))
        if success:
            rebuilt_count += 1

    print(f"Successfully rebuilt {rebuilt_count} surfaces to Degree {u_deg}x{v_deg} ({u_pts}x{v_pts} points).")
    rs.Command("_Zebra", echo=False) # Open visual Zebra analysis

if __name__ == "__main__":
    analyze_and_rebuild_surfaces()
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Zebra Stripes Show Sharp Jagged Kink at Seam** | Tangency discontinuity (G0 only); the adjacent surface normal vectors do not align across the shared edge. | 1. Run `MatchSrf` command.<br>2. Select the target edge and set **Continuity** to `Tangency` (G1) or `Curvature` (G2).<br>3. Enable **Refine Match** to avoid altering distant surface points. |
| **Grasshopper Component Shows Orange Warning Balloon** | Data type mismatch (e.g. attempting to pass a text string into a numerical vector input) or `Null` item in list. | 1. Attach a **Panel** component to inspect output.<br>2. Insert a **Clean Tree** component to remove nulls and empty branches.<br>3. Use **Cast** components to convert types explicitly. |
| **Kangaroo 2 Physics Simulation Explodes** | Spring goal stiffness values are orders of magnitude too high relative to mesh scale, causing numerical oscillation. | 1. Lower the **Length (Spring)** stiffness multiplier.<br>2. Increase **SubIterations** in the Kangaroo Solver component (default 10 $\rightarrow$ 50).<br>3. Verify vertex anchor points are locked in world coordinates. |
| **Extrusion Shows Hollow Tubes Instead of Solid** | Input curves are not closed planar loops or have self-overlapping endpoints. | 1. Run `SelOpenCrv` to find unclosed boundary curves.<br>2. Use `CloseCrv` or `FilletCorners` to heal micro-gaps.<br>3. Use `Cap` command on the resulting open polysurface. |

---

## Command Line Syntax & Configuration

```bash
# Windows CLI: Launch Rhino with Safe Graphics / Hardware Acceleration Disabled
"C:\Program Files\Rhino 8\System\Rhino.exe" /safemode

# Launch Rhino with Specific Scheme Configuration
"C:\Program Files\Rhino 8\System\Rhino.exe" /scheme="IndustrialDesign"
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\McNeel\Rhinoceros\8.0\settings`
- **Windows Auto-Save Directory**: `%LOCALAPPDATA%\McNeel\Rhinoceros\8.0\AutoSave`
- **macOS User Settings**: `~/Library/Application Support/McNeel/Rhinoceros/8.0/`

---

## Agent Operational Directive
> **MANDATORY**: When diagnosing surface transitions, inspect visual Zebra stripes and curvature combs. Ensure that lofted and blend surfaces maintain G2 continuity across primary visual character lines.
