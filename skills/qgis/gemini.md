---
title: "QGIS Open-Source Desktop GIS AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, script, and troubleshoot QGIS Map Canvas, Layer Styling, Graphical Modeler workflows, and Print Layout Composer."
category: "Open Source Desktop GIS & Spatial Analysis"
tags: ["qgis", "cartography", "layer-styling", "gemini", "graphical-modeler", "print-layout"]
---

# QGIS Open-Source Desktop GIS AI Skill Guide (Gemini)

## Overview & Engine Architecture
QGIS offers flexible cartographic visualization, multi-layered raster analysis, and visual workflow creation in the **Graphical Modeler**. Gemini acts as an AI Open-Source GIS Analyst and Cartographic Reviewer, specializing in **multimodal Map Canvas inspection**, **Layer Styling Panel rule-based symbology**, **Graphical Modeler visual pipeline diagnostics**, and **Print Layout Composer publishing**.

### Visual Analytics & Cartography Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 QGIS Visual Operations Stack                │
│                                                             │
│  2D / 3D Map Rendering & Composition                        │
│  ├── 2D Map Canvas (Blend Modes, Inverted Polygons, Masking)│
│  ├── Print Layout Composer (Dynamic Text, Grids, Scalebars) │
│  └── 3D Map View (Digital Terrain Models & Mesh Layers)     │
│                                                             │
│  Symbology & Workflow Modeling                              │
│  ├── Layer Styling Panel (Rule-Based, Categorized, Heatmap) │
│  ├── Graphical Modeler (Algorithm Flowchart Designer)       │
│  └── Geometry Generator Expressions (`buffer($geometry, 10)`)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Map Canvas & Styling Inspection**: Evaluate screenshots of QGIS vector/raster renders to diagnose visual overlap, improper color ramp stretching, illegible contour line labels, and missing base maps.
2. **Rule-Based Symbology & Expressions**: Author QGIS expression strings (`CASE WHEN "population" > 100000 THEN ... END`, `geometry_generator`) for dynamic multi-scale symbol rendering.
3. **Graphical Modeler Workflow Triage**: Inspect visual model diagrams to verify algorithm input-output parameter linkages and data type compatibility.
4. **Print Layout Publishing**: Review exported PDF/TIFF layouts, checking projection scale bar accuracy, geographic coordinate graticule ticks, and north arrow alignment.

---

## Production Python Automation: Automated QGIS Layer Symbology Applier (`PyQGIS`)

Execute this script within the QGIS Python Console to apply a categorized color ramp to an active vector polygon layer based on attribute values:

```python
"""
PyQGIS Automated Categorized Symbology Generator
Applies a categorized color palette to the active layer based on attribute fields.
"""

from qgis.core import (
    QgsProject,
    QgsCategorizedSymbolRenderer,
    QgsRendererCategory,
    QgsSymbol,
    QgsFillSymbol
)
from PyQt5.QtGui import QColor

def apply_categorized_symbology(layer_name: str, attribute_field: str):
    layers = QgsProject.instance().mapLayersByName(layer_name)
    if not layers:
        print(f"Error: Layer '{layer_name}' not found in active project.")
        return

    layer = layers[0]
    # Unique values from attribute
    idx = layer.fields().indexOf(attribute_field)
    unique_values = layer.uniqueValues(idx)

    categories = []
    color_palette = [
        QColor("#e41a1c"), QColor("#377eb8"), QColor("#4daf4a"),
        QColor("#984ea3"), QColor("#ff7f00"), QColor("#ffff33")
    ]

    print(f"Applying Categorized Symbology on '{attribute_field}' ({len(unique_values)} Categories)...")

    for i, val in enumerate(unique_values):
        color = color_palette[i % len(color_palette)]
        symbol = QgsFillSymbol.createSimple({
            "color": color.name(),
            "outline_color": "#333333",
            "outline_width": "0.3"
        })
        category = QgsRendererCategory(val, symbol, str(val))
        categories.append(category)

    renderer = QgsCategorizedSymbolRenderer(attribute_field, categories)
    layer.setRenderer(renderer)
    layer.triggerRepaint()
    print("✅ Symbology updated successfully.")

# Example Execution inside QGIS Python Console:
# apply_categorized_symbology("Land_Use", "ZONE_TYPE")
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Map Canvas Displays Inverted / Upside Down** | The selected project CRS has axis orientation defined as Northing/Easting rather than standard Easting/Northing. | In *Project $\rightarrow$ Properties $\rightarrow$ CRS*, verify the CRS code (e.g. `EPSG:4326` or target local projected UTM code `EPSG:326xx`). |
| **Layer Text Labels Render with Pixelated Jagged Artifacts** | Sub-pixel font hinting or text buffer disabled in Layer Labeling properties. | In Layer Properties $\rightarrow$ *Labels $\rightarrow$ Buffer*, check **Draw text buffer** and set size to `1.0 mm` with white background. |
| **Graphical Modeler Algorithm Throws `Invalid Input Layer`** | An algorithm in the model requires single-part polygon geometry but received multi-part polygons. | Insert **Multipart to Singleparts** (`native:multiparttosinglepart`) algorithm prior to running the failing tool. |
| **Print Layout Composer Scalebar Displays `0 km, 0 km, 0 km`** | The map item in the composer is using a geographic CRS (degrees) rather than a projected metric CRS. | In Map Canvas, change project CRS to a metric projected system (UTM / State Plane) and refresh composer. |

---

## Command Line Syntax & Server Control

```bash
# Launch QGIS directly with Specific Project File
qgis --project "C:\GIS_Projects\Urban_Plan.qgz"

# Run Standalone Processing Tool via QGIS CLI
qgis_process run native:reprojectlayer -- INPUT="C:\Data\pts.shp" TARGET_CRS="EPSG:3857" OUTPUT="C:\Data\pts_3857.gpkg"
```

### Essential File Locations
- **Project Archives**: `*.qgz` (Compressed zip containing `*.qgs` and layer styling)
- **Style Files**: `*.qml`

---

## Agent Operational Directive
> **MANDATORY**: Ensure scalebars in Print Layout Composer reference maps configured in metric projected Coordinate Reference Systems (e.g. UTM) rather than geographic degrees (`EPSG:4326`) to ensure accurate linear scale measurements.
