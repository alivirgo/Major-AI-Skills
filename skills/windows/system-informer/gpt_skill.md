---
title: "System Informer Kernel & Process Diagnostics AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize System Informer (Process Hacker 3), C Plugin SDK (phlib / phapp.h), KSystemInformer API (kphapi.h), and token privilege manipulation."
category: "Advanced Kernel, Process & Network Inspection"
tags: ["system-informer", "system-informer-sdk", "phlib", "kphapi-c", "token-privilege-elevation", "gpt-codex", "windows-internals-dev"]
---

# System Informer Kernel & Process Diagnostics AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
System Informer provides a rich C/C++ development ecosystem via **`phlib` (Process Hacker Core Library)**, the **System Informer Plugin SDK (`phapp.h`, `phlib.h`)**, and the **Kernel-Mode Driver Client Interface (`kphapi.h` for `KSystemInformer.sys`)**. GPT/Codex acts as a Principal Windows Systems Internals Engineer and Security Tooling Developer, delivering **native System Informer C plugins**, **low-level NTDLL memory manipulation routines**, **token privilege adjustment algorithms (`SeDebugPrivilege`)**, and **automated process dump scripts**.

### Developer Architecture & Plugin SDK Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 System Informer Developer Platform          │
│                                                             │
│  Plugin Architecture & Header Hierarchy                     │
│  ├── `phapp.h` Application Callbacks & Window Hooks         │
│  ├── `phlib.h` Core Data Structures (Lists, Hashes, Trees)  │
│  └── `kphapi.h` Kernel Driver Bridge (`KphConnect2`, IOCTL) │
│                                                             │
│  Low-Level Windows Systems Internals                        │
│  ├── Token Privilege Elevation (`AdjustTokenPrivileges`)    │
│  ├── MiniDump Generation Engine (`MiniDumpWriteDump`)       │
│  └── Thread Hijacking & Remote Thread Injection Diagnostics │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **System Informer Native C Plugin Authoring**: Author C plugins implementing `PhPluginMain` that register callbacks for process creation, terminate event hooks, and custom context menu items.
2. **Token Privilege Escalation Development**: Write routines to enable `SeDebugPrivilege`, `SeAssignPrimaryTokenPrivilege`, and `SeImpersonatePrivilege` for administrative processes.
3. **Automated Memory Minidump Creation**: Construct automated diagnostic scripts leveraging `DbgHelp.dll` (`MiniDumpWriteDump`) to capture full memory dumps of hung or crashing processes.
4. **Kernel Driver IOCTL Communication**: Interface with `KSystemInformer` via `kphapi.h` to read memory from Protected Process Light (PPL) targets.

---

## Production C Code: Native System Informer Plugin Skeleton (`plugin.c`)

Save this file as `plugin.c` inside a System Informer Plugin Visual Studio project:

```c
// ==============================================================================
// System Informer Native C Plugin: Process Security Monitor
// Hooks process creation events and logs unsigned process executions.
// ==============================================================================
#include <phdk.h>
#include <phapp.h>

PPH_PLUGIN PluginInstance;

VOID NTAPI ProcessItemCreatedCallback(
    _In_opt_ PVOID Parameter,
    _In_opt_ PVOID Context
)
{
    PPH_PROCESS_ITEM processItem = (PPH_PROCESS_ITEM)Parameter;

    if (!processItem)
        return;

    // Check if process has a verified digital signature
    if (processItem->VerifyResult != VrTrusted) {
        PhShowInformation2(
            NULL,
            L"Unsigned Process Warning",
            L"An unverified process was detected: %s (PID: %lu)",
            processItem->ProcessName->Buffer,
            HandleToULong(processItem->ProcessId)
        );
    }
}

LOGICAL DllMain(
    _In_ HINSTANCE Instance,
    _In_ ULONG Reason,
    _In_ PVOID Reserved
)
{
    switch (Reason) {
        case DLL_PROCESS_ATTACH: {
            PPH_PLUGIN_INFORMATION info;

            PluginInstance = PhRegisterPlugin(L"Custom.ProcessSecurityMonitor", Instance, &info);
            if (!PluginInstance)
                return FALSE;

            info->DisplayName = L"Process Security Monitor";
            info->Author = L"AI Systems Engineering Team";
            info->Version = L"1.0.0";
            info->Description = L"Alerts on execution of unverified or unsigned executables.";

            // Register Process Item Creation Hook
            PhRegisterCallback(
                PhGetPluginCallback(PluginInstance, PluginCallbackProcessItemAdded),
                ProcessItemCreatedCallback,
                NULL,
                NULL
            );
            break;
        }
    }
    return TRUE;
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Plugin Fails to Load into System Informer** | Plugin compiled with mismatched `PHAPP_VERSION` or missing `phlib.lib` import link. | Link against matching `phlib.lib` and `phapp.lib` compiled from identical System Informer commit tag. |
| **`AdjustTokenPrivileges` Returns `ERROR_NOT_ALL_ASSIGNED (1300)`** | Caller process token does not hold the privilege in its token privilege table. | Ensure caller is running as Administrator (Elevated UAC token). |
| **`MiniDumpWriteDump` Fails with `Access Denied`** | Target process is running under PPL or local security authority (LSASS). | Enable `KSystemInformer` kernel driver or configure `SeSecurityPrivilege`. |
| **Memory Leak in Custom Plugin** | Created `PPH_STRING` or allocated memory without calling `PhDereferenceObject()`. | Ensure all System Informer reference-counted objects are freed via `PhDereferenceObject()`. |

---

## Command Line Syntax & Batch Processing

```bash
# Capture Complete Process MiniDump via PowerShell
powershell -Command "Get-Process -Id 1234 | Out-Null; rundll32.exe C:\Windows\System32\comsvcs.dll, MiniDump 1234 C:\temp\dump.dmp full"

# Launch System Informer with Specific View
"C:\Program Files\SystemInformer\SystemInformer.exe" -selectpid 1234 -c
```

### Essential File Locations
- **Plugin SDK Headers**: `phapp.h`, `phlib.h`, `kphapi.h`
- **Plugin Directory**: `C:\Program Files\SystemInformer\plugins\`

---

## Agent Operational Directive
> **MANDATORY**: When allocating strings and objects inside System Informer C plugins, always balance `PhCreateString()` calls with `PhDereferenceObject()` to prevent permanent memory leaks in the primary process tree.
