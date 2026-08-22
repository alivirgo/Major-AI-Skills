---
title: "Sandboxie-Plus Application Isolation AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Sandboxie-Plus, SbieDll.dll C/C++ API, SbieIni.exe automation, and automated malware analysis sandboxing."
category: "Application Sandboxing & Isolation Engine"
tags: ["sandboxie-plus", "sbiedll-api", "sbieini-automation", "sandboxed-testing", "gpt-codex", "windows-security-dev"]
---

# Sandboxie-Plus Application Isolation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Sandboxie-Plus provides developer APIs and command-line automation interfaces via the **Sandboxie User-Mode API (`SbieDll.dll`)**, the **`SbieIni.exe` Configuration Parser**, and **`Start.exe` parameter switches**. GPT/Codex acts as a Principal Windows Systems Security Developer and Sandbox Automation Specialist, delivering **`SbieDll.dll` C++ / Python wrappers**, **unattended test execution scripts**, **programmatic INI policy generators**, and **automated malware analysis containment pipelines**.

### Developer Architecture & SbieDll API Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Sandboxie Developer Platform                │
│                                                             │
│  SbieDll API & Kernel Bridge (`SbieDll.dll`)                │
│  ├── `SbieApi_QueryProcessPath` (Verify Process Sandbox)    │
│  ├── `SbieApi_EnumBoxes` (Query Active Sandbox Names)       │
│  └── `SbieApi_QueryBoxPath` (Locate Root Storage Directory) │
│                                                             │
│  CLI Tooling & IPC Management                               │
│  ├── `Start.exe` Execution Controller (`/box:... /wait`)    │
│  ├── `SbieIni.exe` Runtime Config Re-loader (`/reload`)     │
│  └── Ephemeral Snapshot & Volume Shadow Copy Automation     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **`SbieDll.dll` API Development**: Author C++ and Python ctypes modules binding to `SbieDll.dll` exported functions to programmatically verify if the current process is sandboxed (`SbieApi_QueryProcessPath`).
2. **Automated Batch Test Pipelines**: Construct scripts spinning up isolated sandboxes, executing automated UI tests across software builds, and resetting sandbox environments between test runs.
3. **`Sandboxie.ini` Rule Synthesis**: Generate custom INI blocks defining granular process access permissions (`OpenPipePath`, `ClosedFilePath`, `FakeAdminRights`).
4. **Automated Sandbox Snapshotting**: Script snapshot backups of the virtualized sandbox root folder (`C:\Sandbox\%USER%\%BOX%\`) to enable rapid state reversion.

---

## Production Python Automation: Sandboxed Process Verification Client (`SbieDll.dll`)

Save this script as `check_sandbox_status.py` (requires `SbieDll.dll` in system path):

```python
"""
Sandboxie-Plus Native API Client (ctypes)
Queries SbieDll.dll to verify whether a given process is running inside an isolated sandbox.
"""

import sys
import os
import ctypes
from ctypes import wintypes

SBIEDLL_PATH = r"C:\Program Files\Sandboxie-Plus\SbieDll.dll"

def check_sandbox_containment(pid: int = None):
    print("--- [INITIALIZING SBIEDLL SANDBOX INSPECTION] ---")

    if not os.path.exists(SBIEDLL_PATH):
        print(f"Notice: SbieDll.dll not found at standard location ({SBIEDLL_PATH}).")
        return

    try:
        sbiedll = ctypes.WinDLL(SBIEDLL_PATH)

        # Function Signature: SbieApi_QueryProcessPath(HANDLE ProcessId, WCHAR *BoxName, WCHAR *ImagePath, WCHAR *SidString, ULONG *SessionId)
        sbiedll.SbieApi_QueryProcessPath.argtypes = [
            wintypes.HANDLE,
            wintypes.LPWSTR,
            wintypes.LPWSTR,
            wintypes.LPWSTR,
            ctypes.POINTER(wintypes.ULONG)
        ]
        sbiedll.SbieApi_QueryProcessPath.restype = wintypes.LONG

        box_name_buf = ctypes.create_unicode_buffer(128)
        image_path_buf = ctypes.create_unicode_buffer(512)
        sid_buf = ctypes.create_unicode_buffer(128)
        session_id = wintypes.ULONG()

        target_handle = wintypes.HANDLE(pid) if pid else wintypes.HANDLE(0) # 0 = Current Process

        res = sbiedll.SbieApi_QueryProcessPath(
            target_handle,
            box_name_buf,
            image_path_buf,
            sid_buf,
            ctypes.byref(session_id)
        )

        if res == 0:
            print("🛡️ STATUS: Process is RUNNING INSIDE SANDBOX!")
            print(f"• Sandbox Box Name: '{box_name_buf.value}'")
            print(f"• Image Path:       '{image_path_buf.value}'")
            print(f"• Windows Session:  {session_id.value}")
        else:
            print(f"⚠️ STATUS: Process is NOT sandboxed (API Code: {res}).")

    except Exception as e:
        print(f"Failed to query SbieDll: {e}")

if __name__ == "__main__":
    target_pid = int(sys.argv[1]) if len(sys.argv) > 1 else None
    check_sandbox_containment(target_pid)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`SbieApi_QueryProcessPath` Returns `0xC0000008`** | Invalid process handle passed to API. | Ensure target PID exists and process has not exited before invocation. |
| **`SbieIni.exe /reload` Does Not Update Live Box** | Changes made to temporary memory rather than writing to `Sandboxie.ini` file on disk. | Write modifications directly to `C:\Windows\Sandboxie.ini` before issuing `/reload`. |
| **Automated Pipeline Hangs on `Start.exe`** | Executable spawned a child background process keeping the sandbox open. | Launch with `/wait` parameter and set a hard timeout in Python `subprocess.run()`. |
| **Virtual Registry Silo Corruption** | Multiple threads concurrently modifying same virtual registry keys. | Isolate parallel test instances into distinct named sandboxes (e.g. `TestBox_01`, `TestBox_02`). |

---

## Command Line Syntax & Batch Processing

```bash
# Launch Application with Specific Sandbox and Wait for Exit
"C:\Program Files\Sandboxie-Plus\Start.exe" /box:AutomatedTest /wait "C:\App\test_runner.exe"

# Query Installed Sandboxie Version
"C:\Program Files\Sandboxie-Plus\Start.exe" /version
```

### Essential File Locations
- **Core DLL**: `C:\Program Files\Sandboxie-Plus\SbieDll.dll`
- **CLI Launcher**: `C:\Program Files\Sandboxie-Plus\Start.exe`

---

## Agent Operational Directive
> **MANDATORY**: For automated testing pipelines running in parallel, always provision dynamically named sandbox instances (`TestBox_<ThreadID>`) to prevent file silo contention.
