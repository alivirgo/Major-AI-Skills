---
title: "Autodesk Fusion (Fusion 360) AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Autodesk Fusion (Fusion 360) Python Add-Ins, CAM automation, and custom UI commands."
category: "Cloud-Integrated CAD/CAM/PCB Platform"
tags: ["fusion-360", "autodesk-fusion", "python-addin", "gpt-codex", "cam-automation", "cad-scripting"]
---

# Autodesk Fusion (Fusion 360) AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Autodesk Fusion provides an accessible yet powerful C++ and Python 3 API for extending the CAD/CAM environment. GPT/Codex acts as a Principal Add-In Developer and Automation Architect, delivering **event-driven Python Add-Ins (`adsk.core.CommandCreatedEventHandler`)**, **custom UI ribbon palettes**, **CAM toolpath batch generators**, and **parametric CAD modeling engines**.

### Fusion Add-In Architecture & Execution Model

```
┌─────────────────────────────────────────────────────────────┐
│                 Fusion 360 Add-In Lifecycle                 │
│                                                             │
│  UI & Event Layer                                           │
│  ├── Workspace Panels (Solid $\rightarrow$ Modify Ribbon)   │
│  ├── CommandDefinitions & Custom Button Controls            │
│  └── CommandCreatedEvent & ExecuteEvent Handlers            │
│                                                             │
│  Document & Model Layer                                     │
│  ├── `adsk.fusion.Design` & `B-Rep Feature Operations`      │
│  ├── Timeline Transaction Tracking & Parameter Bindings     │
│  └── CAM / Toolpath Operations & Post-Processor Execution   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Event-Driven Python Add-In Development**: Construct production-ready Python add-ins implementing `run(context)` and `stop(context)` with proper command cleanup to avoid lingering UI artifacts.
2. **Custom Input Command Dialogs**: Build interactive UI panels using `ValueCommandInput`, `DropDownCommandInput`, and `SelectionCommandInput` to gather user parameters cleanly.
3. **CAM & Post-Processor Automation**: Script the generation of CAM setups, adaptive clearing operations, and post-processor execution via `cam.generateToolpath()` and `cam.postProcess()`.
4. **Parametric Table Synchronization**: Create scripts that import/export parameter tables to CSV/JSON to drive configuration variants.

---

## Production Python Automation: Production Add-In Boilerplate

Save this script as `CustomFilletAddIn.py` in the Fusion Add-Ins folder to demonstrate an event-driven custom UI button and command handler:

```python
"""
Autodesk Fusion: Production Add-In Template
Creates a custom UI button in the Solid Modify panel with an interactive execution handler.
"""

import adsk.core
import adsk.fusion
import traceback

app = None
ui = None
handlers = []
CMD_ID = "Pipeline_CustomQuickFillet"

class CommandExecuteHandler(adsk.core.CommandEventHandler):
    def __init__(self):
        super().__init__()
    def notify(self, args):
        try:
            design = app.activeProduct
            root_comp = design.rootComponent
            # Example logic: Perform operation
            ui.messageBox("Custom Command Executed Successfully!")
        except Exception:
            ui.messageBox(f"Command execution failed:\n{traceback.format_exc()}")

class CommandCreatedHandler(adsk.core.CommandCreatedEventHandler):
    def __init__(self):
        super().__init__()
    def notify(self, args):
        try:
            cmd = args.command
            on_execute = CommandExecuteHandler()
            cmd.execute.add(on_execute)
            handlers.append(on_execute) # Retain reference
        except Exception:
            ui.messageBox(f"Command create failed:\n{traceback.format_exc()}")

def run(context):
    global app, ui
    try:
        app = adsk.core.Application.get()
        ui = app.userInterface

        # 1. Create Command Definition
        cmd_defs = ui.commandDefinitions
        cmd_def = cmd_defs.itemById(CMD_ID)
        if not cmd_def:
            cmd_def = cmd_defs.addButtonDefinition(
                CMD_ID, "Quick Fillet Tool", "Applies standardized fillets to selected edges.", ""
            )

        # 2. Attach Event Handler
        on_created = CommandCreatedHandler()
        cmd_def.commandCreated.add(on_created)
        handlers.append(on_created)

        # 3. Add to UI Ribbon Panel
        solid_panel = ui.allToolbarPanels.itemById("SolidModifyPanel")
        solid_panel.controls.addCommand(cmd_def)

    except Exception:
        if ui:
            ui.messageBox(f"AddIn Start Failed:\n{traceback.format_exc()}")

def stop(context):
    global ui
    try:
        # Clean up UI controls on stop
        cmd_def = ui.commandDefinitions.itemById(CMD_ID)
        if cmd_def:
            cmd_def.deleteMe()
        solid_panel = ui.allToolbarPanels.itemById("SolidModifyPanel")
        ctrl = solid_panel.controls.itemById(CMD_ID)
        if ctrl:
            ctrl.deleteMe()
    except Exception:
        pass
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Python Script Error: `NameError: global name 'handlers' is not defined`** | Event handlers garbage collected immediately because references were not retained in a persistent global list. | 1. Always declare a top-level `handlers = []` list.<br>2. Append every `CommandCreatedEventHandler` and `CommandExecuteEventHandler` to `handlers`.<br>3. Clear handlers on `stop(context)`. |
| **Command Button Remains in UI After Script Stop** | `stop(context)` lifecycle did not delete `CommandControl` from the target toolbar panel. | 1. In `stop()`, query the specific `ToolbarPanel.controls.itemById()`.<br>2. Call `.deleteMe()` on both the control and the `CommandDefinition`. |
| **CAM Post-Processing Fails with `Error: Failed to open post processor`** | CPS post-processor file path contains invalid characters or does not exist on disk. | 1. In Python, verify `os.path.exists(cps_path)`.<br>2. Ensure post processor is compatible with modern Autodesk CAM Post Engine v4.x.<br>3. Check output log file specified in `PostProcessInput`. |
| **API Mutation Fails: `RuntimeError: 2 : InternalValidationError`** | Passing invalid dimensions or conflicting constraint inputs to `ValueInput.createByString()`. | 1. Validate numerical inputs using `ValueInput.createByReal(float_val_in_cm)`.<br>2. Note that Fusion internal database units are **centimeters, radians, and kilograms**. |

---

## Command Line Syntax & Configuration

```bash
# Windows CLI: Launch Fusion 360 with Headless Command Script
"C:\Users\%USERNAME%\AppData\Local\Autodesk\webdeploy\production\<BUILD_ID>\Fusion360.exe"

# Launch Python Script Editor
# Inside Fusion 360: Press Shift + S -> Create New Script
```

### Essential File Locations
- **Windows User Add-Ins**: `%APPDATA%\Autodesk\Autodesk Fusion 360\API\AddIns`
- **Windows User Scripts**: `%APPDATA%\Autodesk\Autodesk Fusion 360\API\Scripts`
- **macOS User Add-Ins**: `~/Library/Application Support/Autodesk/Autodesk Fusion 360/API/AddIns`

---

## Agent Operational Directive
> **MANDATORY**: All Python Add-Ins must store event handler instances in a global array to prevent premature Python garbage collection. Remember that Fusion internal units are metric **centimeters (cm)** for geometry and **radians (rad)** for angles.
