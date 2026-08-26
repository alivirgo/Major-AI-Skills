---
title: "QGIS Open-Source Desktop GIS AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize QGIS Python plugins, custom QgsProcessingAlgorithm tools, GDAL/OGR bindings, and PyQGIS headless pipelines."
category: "Open Source Desktop GIS & Spatial Analysis"
tags: ["qgis", "pyqgis", "qgsprocessingalgorithm", "qgis-plugin", "gpt-codex", "gdal-scripting"]
---

# QGIS Open-Source Desktop GIS AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
QGIS offers an extensible Python 3 environment enabling developers to build custom **QGIS Plugins**, standalone **`QgsProcessingAlgorithm`** tools for the Processing Toolbox, and automated **GDAL/OGR** ETL routines. GPT/Codex acts as a Principal Geospatial Software Engineer and PyQGIS Tool Architect, delivering **custom Processing algorithms**, **GUI/dockable plugin interfaces (PyQt5/PyQt6)**, **vector feature iteration loops**, and **automated headless CI/CD testing suites**.

### Developer Architecture & PyQGIS Plugin Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 PyQGIS Developer Platform                   │
│                                                             │
│  Plugin & Processing Framework                              │
│  ├── `QgsProcessingAlgorithm` (Custom Alg Engine Subclass)  │
│  ├── `QgsProcessingParameterFeatureSource` (Input Sink)     │
│  └── PyQt5 / PyQt6 Custom DockWidgets & Action Toolbars     │
│                                                             │
│  Spatial Core & Memory Vector Operations                    │
│  ├── `QgsFeature` / `QgsGeometry` Vector Intersection Engine│
│  ├── Direct GDAL/OGR Python C-Bindings (`osgeo.gdal`)       │
│  └── Memory Layer In-Memory Processing (`memory:layer_name`)│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Custom `QgsProcessingAlgorithm` Development**: Author production-grade Python processing algorithms implementing `name()`, `displayName()`, `createInstance()`, `initAlgorithm()`, and `processAlgorithm()`.
2. **PyQt GUI Plugin Development**: Construct responsive GUI plugins utilizing `QAction`, `QgsDockWidget`, and `QgsMapTool` coordinate capture tools.
3. **High-Performance Geometry Processing**: Optimize feature reading and spatial filtering using `layer.getFeatures(QgsFeatureRequest().setFilterRect(...))` to minimize I/O overhead.
4. **Automated Unit Testing (`pytest-qgis`)**: Build headless pytest testing suites validating spatial geoprocessing algorithms inside CI/CD container environments.

---

## Production Python Code: Custom `QgsProcessingAlgorithm` for Spatial Attribute Normalization

Save this script as `NormalizeAttributesAlgorithm.py` inside your QGIS Python Processing scripts folder (`profiles/default/processing/scripts/`):

```python
# ==============================================================================
# QGIS Custom Processing Algorithm: Spatial Field Normalizer
# Normalizes numeric attribute fields to [0.0 - 1.0] range and exports layer.
# ==============================================================================
from qgis.PyQt.QtCore import QCoreApplication
from qgis.core import (
    QgsProcessing,
    QgsProcessingAlgorithm,
    QgsProcessingParameterFeatureSource,
    QgsProcessingParameterField,
    QgsProcessingParameterFeatureSink,
    QgsFeatureSink,
    QgsField,
    QgsFeature
)
from qgis.PyQt.QtCore import QVariant

class NormalizeAttributesAlgorithm(QgsProcessingAlgorithm):
    INPUT = "INPUT"
    FIELD = "FIELD"
    OUTPUT = "OUTPUT"

    def tr(self, string):
        return QCoreApplication.translate("Processing", string)

    def createInstance(self):
        return NormalizeAttributesAlgorithm()

    def name(self):
        return "normalize_attribute_field"

    def displayName(self):
        return self.tr("Normalize Numeric Attribute (0.0 to 1.0)")

    def group(self):
        return self.tr("Custom Spatial Analytics")

    def groupId(self):
        return "custom_spatial"

    def initAlgorithm(self, config=None):
        self.addParameter(
            QgsProcessingParameterFeatureSource(
                self.INPUT,
                self.tr("Input Vector Layer"),
                [QgsProcessing.TypeVectorAnyGeometry]
            )
        )
        self.addParameter(
            QgsProcessingParameterField(
                self.FIELD,
                self.tr("Numeric Field to Normalize"),
                parentLayerParameterName=self.INPUT,
                type=QgsProcessingParameterField.Numeric
            )
        )
        self.addParameter(
            QgsProcessingParameterFeatureSink(
                self.OUTPUT,
                self.tr("Normalized Output Layer")
            )
        )

    def processAlgorithm(self, parameters, context, feedback):
        source = self.parameterAsSource(parameters, self.INPUT, context)
        field_name = self.parameterAsString(parameters, self.FIELD, context)

        # 1. Calculate Field Min and Max
        values = [f[field_name] for f in source.getFeatures() if f[field_name] is not None]
        if not values:
            raise Exception("Selected field contains no valid numeric values.")

        min_val = float(min(values))
        max_val = float(max(values))
        val_range = max_val - min_val if max_val != min_val else 1.0

        # 2. Configure Output Feature Sink with New Normalized Field
        fields = source.fields()
        norm_field_name = f"{field_name}_norm"
        fields.append(QgsField(norm_field_name, QVariant.Double))

        (sink, dest_id) = self.parameterAsSink(
            parameters,
            self.OUTPUT,
            context,
            fields,
            source.wkbType(),
            source.sourceCrs()
        )

        # 3. Process Features and Normalize
        total = 100.0 / source.featureCount() if source.featureCount() else 0
        for current, feature in enumerate(source.getFeatures()):
            if feedback.isCanceled():
                break

            val = feature[field_name]
            norm_val = (float(val) - min_val) / val_range if val is not None else 0.0

            new_feature = QgsFeature(fields)
            new_feature.setGeometry(feature.geometry())
            new_attrs = feature.attributes() + [norm_val]
            new_feature.setAttributes(new_attrs)

            sink.addFeature(new_feature, QgsFeatureSink.FastInsert)
            feedback.setProgress(int(current * total))

        return {self.OUTPUT: dest_id}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`AttributeError: 'NoneType' object has no attribute 'geometry'`** | Feature without geometry encountered in a layer marked with vector geometry type. | Guard feature processing with `if feature.hasGeometry():` or `if feature.geometry().isGeosValid():`. |
| **Plugin UI Freezes on Long Processing Loops** | Processing algorithm running on the main Qt GUI thread rather than QgsTask background worker. | Subclass `QgsTask` or execute heavy loops inside the standard `QgsProcessingAlgorithm` framework. |
| **`sink.addFeature` Fails / Output Layer Empty** | Destination CRS or WKB geometry type passed to `parameterAsSink` does not match the input features. | Ensure `source.wkbType()` and `source.sourceCrs()` are passed correctly during sink creation. |
| **PyQGIS Script Fails: `NameError: name 'processing' is not defined`** | Missing import of the processing module in standalone headless execution. | Add `import processing` and `from processing.core.Processing import Processing; Processing.initialize()`. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute Custom QGIS Algorithm via qgis_process
qgis_process run custom_spatial:normalize_attribute_field -- INPUT="C:\Data\parcels.shp" FIELD="TaxValue" OUTPUT="C:\Data\parcels_norm.gpkg"

# Launch QGIS Python Console directly with script
qgis --code "C:\Scripts\startup_gis.py"
```

### Essential File Locations
- **Custom Processing Scripts**: `%APPDATA%\QGIS\QGIS3\profiles\default\processing\scripts\`
- **Installed User Plugins**: `%APPDATA%\QGIS\QGIS3\profiles\default\python\plugins\`

---

## Agent Operational Directive
> **MANDATORY**: In custom `QgsProcessingAlgorithm` implementations, always check `if feedback.isCanceled(): break` within feature iteration loops to allow users to cancel long-running geoprocessing jobs safely.
