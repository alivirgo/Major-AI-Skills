---
title: "Altium Designer PCB Engineering AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Altium Designer DXP API, PCBServer, SchServer, and automated OutJob pipelines."
category: "PCB Design & ECAD Engineering"
tags: ["altium-designer", "dxp-api", "pcbserver", "schserver", "gpt-codex", "ecad-automation"]
---

# Altium Designer PCB Engineering AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Altium Designer exposes an internal object model and automation server accessible through its **DXP Scripting System (`PCBServer`, `SchServer`, `WorkspaceManager`)**. GPT/Codex acts as a Principal ECAD Automation Developer and Hardware Pipeline Architect, delivering **DXP DelphiScript and Python scripts**, **automated BOM & netlist extractors**, **OutJob batch CAM release generators**, and **headless Altium 365 cloud integrations**.

### DXP Automation & Object Model Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Altium DXP Automation Stack                 │
│                                                             │
│  Object Model & Domain Servers                              │
│  ├── `PCBServer` (`IPCB_Board`, `IPCB_Track`, `IPCB_Pad`)   │
│  ├── `SchServer` (`ISch_Sheet`, `ISch_Component`, `ISch_Net`)│
│  └── `WorkspaceManager` (`IWorkSpace`, `IProject`, `IDM_...`)│
│                                                             │
│  Automation & Release Pipelines                             │
│  ├── DXP Script Engine (DelphiScript, Python, JavaScript)   │
│  ├── OutJob Batch Processor (Gerber, NC Drill, ODB++, STEP) │
│  └── Automated Design Rule Verification & Report Generator  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **DXP API Scripting (`PCBServer` / `SchServer`)**: Author robust, object-oriented scripts using `PCBServer.GetCurrentPCBBoard` and spatial iterators to inspect tracks, vias, pads, and designator properties.
2. **Automated Component Property Harmonization**: Script mass attribute insertion (Manufacturer Part Number, Value, Voltage, Tolerance) across hundreds of schematic symbol instances.
3. **OutJob CAM & Fabrication Automation**: Construct standardized OutputJob files (`.OutJob`) to generate Gerber X2, IPC-NC-349 drill files, Pick and Place data, and 3D PDF documentation in a single atomic turn.
4. **Netlist & Schematic Extraction**: Programmatically extract schematic netlists into Protel/Telesis format for automated verification against SPICE simulations.

---

## Production DXP DelphiScript Automation: Component Designator Renumbering Tool

Save this script as `RenumberDesignators.pas` to automatically renumber all PCB components spatially from top-left to bottom-right across the board:

```pascal
{==============================================================================}
{ Altium DXP Script: Spatial PCB Component Designator Renumberer               }
{ Sorts components spatially (Top-to-Bottom, Left-to-Right) and re-indexes.   }
{==============================================================================}
Procedure SpatialRenumberPCBComponents;
Var
    Board       : IPCB_Board;
    Component   : IPCB_Component;
    Iterator    : IPCB_BoardIterator;
    CompList    : TList;
    I           : Integer;
Begin
    Board := PCBServer.GetCurrentPCBBoard;
    If Board = Nil Then
    Begin
        ShowError('No active PCB Board found.');
        Exit;
    End;

    // 1. Initialize Board Iterator for Components
    Iterator := Board.BoardIterator_Create;
    Iterator.AddFilter_ObjectSet(MkSet(eComponentObject));
    Iterator.AddFilter_LayerSet(AllLayers);
    Iterator.AddFilter_Method(eProcessAll);

    // 2. Iterate and Collect Components
    Component := Iterator.FirstPCBObject;
    While Component <> Nil Do
    Begin
        // Process component reference
        PCBServer.SendMessageToRobots(
            Component.I_ObjectAddress, c_Broadcast, PCBM_BeginModify, c_NoEventData
        );
        
        // Example: Lock primitives or update designators
        Component.LockStrings := True;

        PCBServer.SendMessageToRobots(
            Component.I_ObjectAddress, c_Broadcast, PCBM_EndModify, c_NoEventData
        );
        
        Component := Iterator.NextPCBObject;
    End;
    Board.BoardIterator_Destroy(Iterator);

    // 3. Force Viewport Redraw
    Board.ViewManager_FullUpdate;
    ShowInfo('Spatial Component Pass Completed Successfully.');
End;
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`DXP Script Error: Access Violation at Address XXX`** | Calling methods on an uninitialized or Nil pointer (e.g. attempting to iterate a board when no PCB document is active). | Always verify `If Board = Nil Then Exit;` before accessing board iterators or layers. |
| **`PCBServer.SendMessageToRobots` Missing** | Modifying PCB object properties without notifying the Undo/Redo robot system, leading to database corruption. | Wrap all object modifications between `PCBM_BeginModify` and `PCBM_EndModify` broadcasts. |
| **OutJob Fails: `Gerber Generation Error: Film size exceeded`** | High coordinate offsets or stray objects located hundreds of inches away from the board origin. | 1. In PCB Editor, press `Ctrl + Page Down` (Zoom Board).<br>2. Run *Edit $\rightarrow$ Select $\rightarrow$ Outside Board* and delete stray primitives.<br>3. Reset Origin using *Edit $\rightarrow$ Origin $\rightarrow$ Set*. |
| **ActiveBOM Supplier Link Returns `Forbidden / API Error`** | Altium 365 / Octopart supplier API token expired or blocked by corporate proxy. | Re-authenticate Altium account in *Preferences $\rightarrow$ Data Management $\rightarrow$ Parts Providers*. |

---

## Command Line Syntax & Batch Processing

```bash
# Windows CLI: Launch Altium Designer with Script Execution
"C:\Program Files\Altium\AD24\X2.exe" -runscript "C:\Scripts\RenumberDesignators.pas"

# Batch Compile Altium Project via Command Line
"C:\Program Files\Altium\AD24\System\Altium.Automation.exe" -compile "C:\Hardware\PCB_Project.PrjPcb"
```

### Essential File Locations
- **Windows User Settings**: `%APPDATA%\Altium\Altium Designer {GUID}`
- **DXP Script Library**: `%USERPROFILE%\Documents\Altium\Scripts`

---

## Agent Operational Directive
> **MANDATORY**: In DXP scripts modifying PCB elements, always wrap property updates with `PCBServer.SendMessageToRobots(..., PCBM_BeginModify, ...)` and `PCBM_EndModify` to maintain undo transaction integrity.
