---
title: "Microsoft PowerToys System Utilities AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Microsoft PowerToys, PowerToys Run C# plugins, FancyZones JSON configurations, and automated Winget DSC deployments."
category: "Power-User Operating System Utilities"
tags: ["microsoft-powertoys", "powertoys-run-plugin", "csharp-powertoys", "fancyzones-json", "winget-dsc", "gpt-codex", "windows-utilities-dev"]
---

# Microsoft PowerToys System Utilities AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Microsoft PowerToys provides extensible systems integration via the **PowerToys Run C# Plugin Architecture (`Wox.Plugin`)**, the **FancyZones JSON Schema Specification (`zones-settings.json`)**, and **Windows Package Manager (Winget) Desired State Configuration (DSC)**. GPT/Codex acts as a Principal Windows Systems Developer and PowerToys Extensibility Engineer, delivering **compiled C# PowerToys Run plugins**, **programmatic FancyZones layout synthesizers**, **automated enterprise DSC configuration scripts**, and **submodule IPC integrations**.

### Developer Architecture & Plugin Platform Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 PowerToys Developer Platform                │
│                                                             │
│  PowerToys Run C# Plugin Architecture                       │
│  ├── `Wox.Plugin.IPlugin` Interface (`Init`, `Query`)       │
│  ├── `Wox.Plugin.IContextMenu` (Secondary Context Actions)  │
│  └── `Result` Model (`Title`, `SubTitle`, `Action`, `Glyph`)│
│                                                             │
│  Declarative JSON Schema Engines                            │
│  ├── FancyZones Multi-Monitor Matrix (`zones-settings.json`)│
│  ├── Keyboard Manager Scan Code Mapping (`default.json`)    │
│  └── PowerToys Global Config (`settings.json`)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **PowerToys Run C# Plugin Development**: Author compiled C# plugins targeting .NET 8 referencing `Wox.Plugin.dll` to build custom launcher tools (*e.g. Docker container controller, AWS profile switcher*).
2. **Automated FancyZones Configuration**: Construct Python and PowerShell scripts to inject custom multi-monitor canvas schemas and zone margins into `zones-settings.json`.
3. **Enterprise Desired State Configuration (DSC)**: Author WinGet DSC `.yaml` manifests deploying standardized PowerToys utility states across corporate fleets.
4. **Keyboard Manager Remapping Automation**: Script automated key and shortcut remappings (*e.g. mapping CapsLock to Ctrl or Hyper Key*) via `default.json` manipulation.

---

## Production C# Code: PowerToys Run C# Plugin (`IPlugin`)

Save this file as `Main.cs` in a C# Class Library referencing `Wox.Plugin.dll` and `PowerToys.PowerLauncher.Plugin.dll`:

```csharp
// ==============================================================================
// Microsoft PowerToys Run Plugin: Windows Service Quick-Controller
// Lists Windows services matching query and allows starting/stopping them.
// ==============================================================================
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Windows;
using Wox.Plugin;

namespace Community.PowerToys.Run.Plugin.ServiceController {
    public class Main : IPlugin, IContextMenu {
        private PluginInitContext _context;
        public string Name => "Windows Service Controller";
        public string Description => "Search, start, stop, and restart local Windows services.";

        public void Init(PluginInitContext context) {
            _context = context;
        }

        public List<Result> Query(Query query) {
            var results = new List<Result>();
            string search = query.Search.Trim().ToLower();

            ServiceController[] services = ServiceController.GetServices();

            foreach (var svc in services) {
                if (string.IsNullOrEmpty(search) || svc.ServiceName.ToLower().Contains(search) || svc.DisplayName.ToLower().Contains(search)) {
                    string statusIcon = svc.Status == ServiceControllerStatus.Running ? "[RUNNING]" : "[STOPPED]";
                    
                    results.Add(new Result {
                        Title = $"{svc.DisplayName} ({svc.ServiceName})",
                        SubTitle = $"Status: {statusIcon} | Press Enter to Toggle",
                        IcoPath = "Images\\service.png",
                        Action = _ => {
                            try {
                                if (svc.Status == ServiceControllerStatus.Running) {
                                    svc.Stop();
                                    _context.API.ShowMsg("Service Stopped", $"Successfully stopped {svc.ServiceName}");
                                } else {
                                    svc.Start();
                                    _context.API.ShowMsg("Service Started", $"Successfully started {svc.ServiceName}");
                                }
                            } catch (Exception ex) {
                                _context.API.ShowMsg("Error", ex.Message);
                            }
                            return true;
                        }
                    });
                }
            }

            return results.Take(10).ToList();
        }

        public List<ContextMenuResult> LoadContextMenus(Result selectedResult) {
            return new List<ContextMenuResult>();
        }
    }
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Plugin Not Detected in PowerToys Run** | Plugin `.dll` not located in `%LOCALAPPDATA%\Microsoft\PowerToys\PowerToys Run\Plugins\<PluginFolder>\`. | Ensure all binaries, `plugin.json`, and dependencies are copied to the dedicated subfolder. |
| **`zones-settings.json` Resets to Default** | JSON syntax error or missing closing brace in custom layout definition. | Validate JSON schema syntax using `jq` or `python -m json.tool` before launching PowerToys. |
| **Winget DSC Configuration Fails** | Winget source or package version locked during system update. | Run `winget source update` before executing the DSC configuration manifest. |
| **Keyboard Manager Fails to Remap `Win + L`** | `Win + L` (Lock Workstation) is intercepted at kernel level by Winlogon and cannot be hooked in user space. | Inform users that Winlogon security combinations (`Win + L`, `Ctrl + Alt + Del`) cannot be remapped in user space. |

---

## Command Line Syntax & DSC Recipes

```bash
# 1. Install PowerToys via Winget CLI
winget install --id Microsoft.PowerToys -e --source winget

# 2. Run PowerToys Run Search directly
"%LOCALAPPDATA%\PowerToys\PowerToys.PowerLauncher.exe"

# 3. Kill All PowerToys Submodules via PowerShell
Get-Process | Where-Object { $_.ProcessName -like "PowerToys*" } | Stop-Process -Force
```

### Essential File Locations
- **PowerToys Run Plugins**: `%LOCALAPPDATA%\Microsoft\PowerToys\PowerToys Run\Plugins\`
- **Keyboard Manager Config**: `%LOCALAPPDATA%\Microsoft\PowerToys\Keyboard Manager\default.json`

---

## Agent Operational Directive
> **MANDATORY**: When authoring PowerToys Run C# plugins, limit results to a maximum of 10 items (`.Take(10)`) to maintain 60 FPS scrolling and low memory consumption on large query searches.
