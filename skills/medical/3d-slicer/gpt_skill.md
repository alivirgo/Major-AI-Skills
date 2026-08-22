---
title: "3D Slicer Medical Image Computing AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize 3D Slicer, ScriptedLoadableModule Python extensions, MRML observers, and VTK/ITK algorithms."
category: "Open Source Medical Image Computing"
tags: ["3d-slicer", "slicer-module", "scriptedloadablemodule", "mrml-observers", "gpt-codex", "vtk-pipelines"]
---

# 3D Slicer Medical Image Computing AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
3D Slicer provides an extensible Python framework enabling developers to construct custom **Scripted Loadable Modules (`ScriptedLoadableModule`)**, attach observers to **MRML Scene Events (`vtkMRMLScene::NodeAddedEvent`)**, and build complex **VTK / ITK image processing pipelines**. GPT/Codex acts as a Principal Biomedical Software Engineer and 3D Slicer Module Developer, delivering **complete custom Slicer extension modules**, **VTK filter pipelines**, **automated DICOM batch processors**, and **surgical registration tools**.

### Developer Architecture & Slicer Extension Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 3D Slicer Developer Platform                │
│                                                             │
│  Slicer Extension Module Hierarchy                          │
│  ├── `ScriptedLoadableModule` (Module Metadata Descriptor)  │
│  ├── `ScriptedLoadableModuleWidget` (Qt UI View & Connectors│
│  ├── `ScriptedLoadableModuleLogic` (Headless Processing Alg)│
│  └── `ScriptedLoadableModuleTest` (Automated Unit Testing)  │
│                                                             │
│  MRML & VTK Pipeline Infrastructure                         │
│  ├── MRML Scene Event Observers (`AddObserver(slicer.vtk...)│
│  ├── VTK C++ Array Pointers & NumPy Buffers (`vtk_to_numpy`)│
│  └── ITK Python Filters (SimpleITK & ITK-Wasm Interop)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Custom Slicer Module Authoring**: Develop full `ScriptedLoadableModule` extensions implementing Qt-based UI widgets, logic classes, and MRML node parameter listeners.
2. **VTK & NumPy Array Interoperability**: Convert volumetric MRML scalar nodes into NumPy multidimensional matrices (`slicer.util.arrayFromVolume`), execute fast array transformations, and re-inject using `slicer.util.updateVolumeFromArray`.
3. **Automated DICOM C-MOVE / PACS Scripts**: Script programmatic querying and downloading of clinical imaging series from hospital PACS servers via DICOM networking protocols.
4. **Automated Surface Registration & Transforms**: Build rigid and non-rigid ICP (Iterative Closest Point) surface registration pipelines between pre-operative CT models and intra-operative surgical tracker fiducials.

---

## Production Python Automation: Custom 3D Slicer Scripted Module Template

Save this file as `CustomVolumeFilter.py` inside your Slicer Custom Modules directory:

```python
# ==============================================================================
# 3D Slicer Custom Scripted Module: Custom Volume Gaussian Filter
# Demonstrates ScriptedLoadableModule architecture with Qt UI and Logic classes.
# ==============================================================================
import slicer
from slicer.ScriptedLoadableModule import *
import qt
import ctk

class CustomVolumeFilter(ScriptedLoadableModule):
    def __init__(self, parent):
        ScriptedLoadableModule.__init__(self, parent)
        self.parent.title = "Custom Volume Filter"
        self.parent.categories = ["Filtering"]
        self.parent.contributors = ["AI Systems Engineering Team"]
        self.parent.helpText = "Applies Gaussian smoothing to medical scalar volumes."

class CustomVolumeFilterWidget(ScriptedLoadableModuleWidget):
    def setup(self):
        ScriptedLoadableModuleWidget.setup(self)

        # 1. UI Parameter Collapsible Button
        parametersCollapsibleButton = ctk.ctkCollapsibleButton()
        parametersCollapsibleButton.text = "Parameters"
        self.layout.addWidget(parametersCollapsibleButton)
        parametersFormLayout = qt.QFormLayout(parametersCollapsibleButton)

        # Input Volume Selector
        self.inputSelector = slicer.qMRMLNodeComboBox()
        self.inputSelector.nodeTypes = ["vtkMRMLScalarVolumeNode"]
        self.inputSelector.selectNodeUponCreation = True
        self.inputSelector.addEnabled = False
        self.inputSelector.removeEnabled = False
        self.inputSelector.noneEnabled = False
        self.inputSelector.showHidden = False
        self.inputSelector.setMRMLScene(slicer.mrmlScene)
        parametersFormLayout.addRow("Input Volume: ", self.inputSelector)

        # Apply Button
        self.applyButton = qt.QPushButton("Apply Gaussian Smoothing")
        self.applyButton.toolTip = "Runs the smoothing filter."
        parametersFormLayout.addRow(self.applyButton)
        self.applyButton.connect('clicked(bool)', self.onApplyButton)

        self.layout.addStretch(1)

    def onApplyButton(self):
        logic = CustomVolumeFilterLogic()
        inputVolume = self.inputSelector.currentNode()
        if inputVolume:
            outputVolume = logic.process(inputVolume)
            slicer.util.showStatusMessage("Smoothing Complete!")

class CustomVolumeFilterLogic(ScriptedLoadableModuleLogic):
    def process(self, inputVolume):
        import SimpleITK as sitk
        import sitkUtils

        print(f"Processing Volume: {inputVolume.GetName()}...")
        # Convert MRML to SimpleITK Image
        sitkInput = sitkUtils.PullVolumeFromSlicer(inputVolume)
        
        # Execute Gaussian Blur Filter
        gaussian = sitk.SmoothingRecursiveGaussianImageFilter()
        gaussian.SetSigma(1.5)
        sitkOutput = gaussian.Execute(sitkInput)

        # Push back to Slicer MRML Scene
        outputVolume = sitkUtils.PushVolumeToSlicer(sitkOutput, None, inputVolume.GetName() + "_Smoothed")
        return outputVolume
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`ImportError: No module named 'SimpleITK'`** | Slicer's embedded Python interpreter missing required library. | In Slicer Python Console, run: `slicer.util.pip_install('SimpleITK')`. |
| **`slicer.util.arrayFromVolume` Edits Do Not Update 3D View** | Array modified in NumPy but modified flag was not emitted on the MRML volume node. | Always call `volumeNode.GetImageData().Modified()` after modifying array buffers. |
| **MRML Observer Callback Causes Infinite Recursion** | Observer listening to `vtkCommand.ModifiedEvent` modifies the node within the callback without blocking events. | Wrap changes with `node.StartModify()` and `node.EndModify()` or temporarily disable observer. |
| **Custom Module Fails to Load on Startup** | Path not added to Slicer Additional Module Paths in Application Settings. | In *Settings $\rightarrow$ Modules $\rightarrow$ Additional module paths*, add the folder containing `CustomVolumeFilter.py`. |

---

## Command Line Syntax & Batch Processing

```bash
# Install Python Packages into Slicer's Embedded Environment
PythonSlicer.exe -m pip install SimpleITK scipy scikit-learn

# Run Automated Slicer Module Self-Tests Headless
Slicer.exe --no-splash --no-main-window --run-python-script "C:\Modules\CustomVolumeFilterTest.py"
```

### Essential File Locations
- **Custom Modules Directory**: `%APPDATA%\NA-MIC\Slicer 5.6\qt-scripted-modules\`
- **Slicer Application Core**: `C:\Program Files\Slicer 5.6\`

---

## Agent Operational Directive
> **MANDATORY**: When mutating volume voxel arrays via NumPy (`slicer.util.arrayFromVolume`), always call `volumeNode.GetImageData().Modified()` to notify the MRML scene and trigger visual viewport re-rendering.
