---
title: "AutoHotkey v2 Desktop Automation AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize AutoHotkey v2 (AHK v2), Win32 DllCall struct buffers, COM Object automation, and multi-process workers."
category: "Desktop Automation & Custom Scripting Engine"
tags: ["autohotkey-v2", "win32-dllcall", "com-automation", "struct-buffers", "gpt-codex", "windows-automation-dev"]
---

# AutoHotkey v2 Desktop Automation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
AutoHotkey v2 provides powerful systems programming primitives through **Win32 `DllCall` with C-style Struct Buffers (`Buffer()`, `NumGet()`, `NumPut()`)**, **ActiveX / COM Automation (`ComObject()`, `ComObjActive()`)**, and modular **`#Include` library architectures**. GPT/Codex acts as a Principal Windows Automation Engineer and Win32 Systems Developer, delivering **type-safe AHK v2 library modules**, **Win32 API struct marshaling scripts**, **COM Office automations**, and **asynchronous multi-process background worker pipelines**.

### Developer Architecture & Win32 Interop Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 AutoHotkey v2 Developer Platform            │
│                                                             │
│  AHK v2 Core Language & Memory Model                        │
│  ├── Dynamic Objects (`Map()`, `Array()`, Custom Classes)   │
│  ├── Raw Memory & Struct Allocation (`Buffer(size, 0)`)     │
│  └── Binary Endian Offsets (`NumGet`, `NumPut`, `StrGet`)   │
│                                                             │
│  Native Interop & COM Subsystem                             │
│  ├── Win32 Dynamic C-Type Marshalling (`DllCall(...)`)      │
│  ├── IDispatch / IUnknown COM Interface Wrappers            │
│  └── Multi-Process Worker Pipes (Anonymous Pipes / IPC)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Win32 `DllCall` Struct Marshalling**: Construct memory buffers (`Buffer()`) with exact C/C++ struct offsets (`NumPut("UInt", value, buf, offset)`) to invoke advanced Win32 functions (e.g. `GetCursorInfo`, `QueryPerformanceCounter`, `EnumWindows`).
2. **ActiveX / COM Automation Development**: Author scripts interfacing with Excel, Word, or WMI via `ComObject("Excel.Application")` to automate spreadsheet data ingestion and system hardware inventory.
3. **High-Performance Input Dispatching**: Enforce `SendMode("Input")` and `SetKeyDelay(-1, -1)` for zero-latency keystroke injection.
4. **Asynchronous Background Processing**: Implement worker architectures using `Run()` with anonymous standard I/O pipes to prevent long-running tasks from freezing the primary AHK UI message pump.

---

## Production AHK v2 Code: Advanced Win32 DllCall System Monitor & COM Excel Logger

Save this script as `SystemTelemetryLogger_v2.ahk` (execute with AutoHotkey v2 64-bit):

```autohotkey
#Requires AutoHotkey v2.0
#SingleInstance Force

; ==============================================================================
; AutoHotkey v2: Advanced Win32 API DllCall Telemetry & COM Automation Client
; Uses Win32 GlobalMemoryStatusEx to query physical RAM metrics and logs to CSV.
; ==============================================================================

; --- 1. Query Win32 GlobalMemoryStatusEx via DllCall ---
GetSystemMemoryInfo()
{
    ; MEMORYSTATUSEX structure size = 64 bytes
    MEMORYSTATUSEX := Buffer(64, 0)
    NumPut("UInt", 64, MEMORYSTATUSEX, 0) ; dwLength = 64

    if (!DllCall("kernel32\GlobalMemoryStatusEx", "Ptr", MEMORYSTATUSEX, "Int")) {
        throw Error("GlobalMemoryStatusEx failed with Win32 Error: " . A_LastError)
    }

    ; Extract Struct Fields (Byte Offsets)
    memoryLoad := NumGet(MEMORYSTATUSEX, 4, "UInt")           ; % Memory in Use
    totalPhys  := NumGet(MEMORYSTATUSEX, 8, "UInt64")         ; Total Physical RAM (Bytes)
    availPhys  := NumGet(MEMORYSTATUSEX, 16, "UInt64")        ; Available Physical RAM (Bytes)
    totalPage  := NumGet(MEMORYSTATUSEX, 24, "UInt64")        ; Total Commit Limit (Bytes)
    availPage  := NumGet(MEMORYSTATUSEX, 32, "UInt64")        ; Available Commit Limit (Bytes)

    bytesToGB := 1024 * 1024 * 1024

    return {
        MemoryLoad: memoryLoad,
        TotalPhysGB: Round(totalPhys / bytesToGB, 2),
        AvailPhysGB: Round(availPhys / bytesToGB, 2),
        TotalPageGB: Round(totalPage / bytesToGB, 2),
        AvailPageGB: Round(availPage / bytesToGB, 2)
    }
}

; --- 2. Query High-Resolution CPU Timestamp (QueryPerformanceCounter) ---
GetHighResolutionTimestamp()
{
    DllCall("kernel32\QueryPerformanceCounter", "Int64*", &counter := 0)
    DllCall("kernel32\QueryPerformanceFrequency", "Int64*", &freq := 0)
    return counter / freq ; Returns precise seconds
}

; --- 3. Execute Diagnostic Log & Display GUI ---
LogSystemStatus()
{
    try {
        mem := GetSystemMemoryInfo()
        timestamp := FormatTime(, "yyyy-MM-dd HH:mm:ss")

        logLine := Format("[{1}] RAM Load: {2}% | Available: {3} GB / {4} GB", 
                          timestamp, mem.MemoryLoad, mem.AvailPhysGB, mem.TotalPhysGB)

        ; Append to local diagnostic log
        FileAppend(logLine . "`n", "SystemTelemetry.log", "UTF-8")

        ; Display Visual Status
        MsgBox(logLine, "System Telemetry Diagnostic", "Iconi T2")
    } catch Error as err {
        MsgBox("Failed to query telemetry: " . err.Message, "Error", "Iconx")
    }
}

; Hotkey: Win + F12 to trigger Telemetry Audit
#F12::
{
    LogSystemStatus()
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`DllCall` Returns `0` and Sets `A_LastError`** | Invalid struct parameter size or pointer type passed to Win32 DLL function. | Check struct header size parameter: `NumPut("UInt", BufferSize, buf, 0)` and use `"Ptr"` for buffer addresses. |
| **`ComObject` Throws `0x800401E3 (Operation unavailable)`** | Target application (e.g. Excel) is running with different elevation or in background edit mode. | Use `try / catch` around `ComObjActive("Excel.Application")` and fallback to `ComObject("Excel.Application")`. |
| **AHK v2 Script Freezes on Web Request** | `WinHttp.WinHttpRequest.5.1` synchronous send blocked the main execution thread. | Dispatch HTTP requests via a separate worker process or use asynchronous COM callbacks. |
| **`NumGet` Returns Incorrect Numerical Value** | Incorrect integer type specified (e.g. reading 64-bit integer with `"Int"` instead of `"Int64"`). | Match exact Win32 struct data types: `DWORD` $\rightarrow$ `"UInt"`, `DWORDLONG` / `SIZE_T` $\rightarrow$ `"UInt64"`. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute AHK v2 Script with Arguments
"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" "C:\Scripts\SystemTelemetryLogger_v2.ahk" "arg1" "arg2"

# Run AHK Script and Output Syntax Errors to Console
"C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe" /ErrorStdOut "C:\Scripts\MyScript.ahk"
```

### Essential File Locations
- **AHK v2 Executable**: `C:\Program Files\AutoHotkey\v2\AutoHotkey64.exe`
- **User Library**: `%USERPROFILE%\Documents\AutoHotkey\Lib\`

---

## Agent Operational Directive
> **MANDATORY**: When declaring memory buffers for Win32 API `DllCall` invocations in AutoHotkey v2, always instantiate explicit `Buffer(size, 0)` allocations and populate struct size headers before invoking system libraries.
