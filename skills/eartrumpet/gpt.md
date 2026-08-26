---
title: "EarTrumpet Windows Audio Engine AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize EarTrumpet, Windows Core Audio APIs (WASAPI in C# / PowerShell), IAudioEndpointVolume, and automated volume management."
category: "Per-App Audio Routing & Volume Control"
tags: ["eartrumpet", "wasapi-csharp", "iaudioendpointvolume", "powershell-audio", "gpt-codex", "windows-audio-dev"]
---

# EarTrumpet Windows Audio Engine AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
EarTrumpet is powered by the **Windows Core Audio (WASAPI) COM Subsystem**, exposing programmatic audio session orchestration via **`IAudioSessionManager2`**, **`IAudioSessionControl2`**, and **`IAudioEndpointVolume`**. GPT/Codex acts as a Principal Windows Audio Systems Engineer and COM Interop Developer, delivering **C# / PowerShell WASAPI automation scripts**, **per-process volume controllers**, **automated mute-on-lock background services**, and **audio endpoint diagnostic tools**.

### Developer Architecture & COM Audio Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 EarTrumpet Developer Platform               │
│                                                             │
│  WASAPI COM Interface Architecture (C# / P/Invoke)          │
│  ├── `IMMDeviceEnumerator` (`eRender`, `eMultimedia`)       │
│  ├── `IAudioEndpointVolume` (Master Level & Mute)           │
│  └── `IAudioSessionEnumerator` (Process ID Matching)        │
│                                                             │
│  Scripting & Service Automation                             │
│  ├── PowerShell P/Invoke WASAPI Volume Engine               │
│  ├── Python WASAPI Client Pipelines (`import pycaw`)        │
│  └── Unattended Sound Configuration Deployment Scripts      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **PowerShell / C# Core Audio Scripting**: Author standalone PowerShell scripts utilizing inline C# P/Invoke to enumerate WASAPI endpoints, adjust master volume, and toggle mute states without external binary dependencies.
2. **Per-Process Audio Session Volume Control**: Write scripts matching target process names (e.g. `chrome.exe`, `vlc.exe`) and setting granular volume levels via `ISimpleAudioVolume`.
3. **Automated Audio Profile Switching**: Construct scripts detecting peripheral connection (USB DAC / Bluetooth headset) and reassigning default audio endpoints.
4. **AppX Package Automation**: Automate silent deployment and configuration extraction for enterprise workstation provisioning.

---

## Production PowerShell Automation: Native WASAPI Master Volume & Mute Controller (Inline C#)

Save this script as `Set-AudioVolume.ps1`:

```powershell
<#
.SYNOPSIS
    Native Windows Core Audio (WASAPI) Volume Controller
    Uses inline C# P/Invoke to query/set master volume and mute state without third-party dependencies.
#>

$Source = @"
using System;
using System.Runtime.InteropServices;

namespace AudioController {
    [Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IAudioEndpointVolume {
        int RegisterControlChangeNotify(IntPtr pNotify);
        int UnregisterControlChangeNotify(IntPtr pNotify);
        int GetChannelCount(out uint pnChannelCount);
        int SetMasterVolumeLevel(float fLevelDB, ref Guid pguidEventContext);
        int SetMasterVolumeLevelScalar(float fLevel, ref Guid pguidEventContext);
        int GetMasterVolumeLevel(out float pfLevelDB);
        int GetMasterVolumeLevelScalar(out float pfLevel);
        int SetChannelVolumeLevel(uint nChannel, float fLevelDB, ref Guid pguidEventContext);
        int SetChannelVolumeLevelScalar(uint nChannel, float fLevel, ref Guid pguidEventContext);
        int GetChannelVolumeLevel(uint nChannel, out float pfLevelDB);
        int GetChannelVolumeLevelScalar(uint nChannel, out float pfLevel);
        int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, ref Guid pguidEventContext);
        int GetMute([MarshalAs(UnmanagedType.Bool)] out bool pbMute);
    }

    [Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IMMDevice {
        int Activate(ref Guid id, int clsCtx, IntPtr activationParams, [MarshalAs(UnmanagedType.IUnknown)] out object interfacePointer);
    }

    [Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IMMDeviceEnumerator {
        int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);
    }

    [ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
    public class MMDeviceEnumeratorComObject { }

    public class VolumeMaster {
        private static IAudioEndpointVolume GetMasterVolumeObject() {
            var enumerator = (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject());
            IMMDevice dev = null;
            enumerator.GetDefaultAudioEndpoint(0, 1, out dev); // eRender = 0, eMultimedia = 1
            Guid IID_IAudioEndpointVolume = typeof(IAudioEndpointVolume).GUID;
            object epv = null;
            dev.Activate(ref IID_IAudioEndpointVolume, 23, IntPtr.Zero, out epv);
            return (IAudioEndpointVolume)epv;
        }

        public static float GetVolume() {
            float vol = 0;
            GetMasterVolumeObject().GetMasterVolumeLevelScalar(out vol);
            return vol * 100.0f;
        }

        public static void SetVolume(float newVolumePercent) {
            Guid g = Guid.Empty;
            float scalar = Math.Max(0.0f, Math.Min(1.0f, newVolumePercent / 100.0f));
            GetMasterVolumeObject().SetMasterVolumeLevelScalar(scalar, ref g);
        }

        public static bool GetMute() {
            bool isMuted = false;
            GetMasterVolumeObject().GetMute(out isMuted);
            return isMuted;
        }

        public static void SetMute(bool muteState) {
            Guid g = Guid.Empty;
            GetMasterVolumeObject().SetMute(muteState, ref g);
        }
    }
}
"@

Add-Type -TypeDefinition $Source -Language CSharp

# Execution Examples:
$currentVol = [AudioController.VolumeMaster]::GetVolume()
$isMuted = [AudioController.VolumeMaster]::GetMute()

Write-Host "--- [WINDOWS MASTER AUDIO STATUS] ---"
Write-Host "• Current Master Volume: $([Math]::Round($currentVol, 1))%"
Write-Host "• Mute Status:          $isMuted"

# Example: To set volume to 50% uncomment below:
# [AudioController.VolumeMaster]::SetVolume(50.0)
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`Add-Type` Throws `Cannot add type. Compilation errors occurred`** | Target machine missing .NET Framework C# compiler references. | Ensure PowerShell is executing under Windows PowerShell 5.1 or PowerShell 7 with desktop runtime. |
| **`GetDefaultAudioEndpoint` Returns `E_NOTFOUND (0x80070490)`** | No active audio playback hardware device (speakers/headphones) connected to system. | Connect audio output device or enable virtual audio driver. |
| **`SetMasterVolumeLevelScalar` Value Ignored** | Volume scalar value passed was outside valid bounds ($0.0 - 1.0$). | Always clamp volume scalars: `Math.Max(0.0f, Math.Min(1.0f, vol))`. |
| **WASAPI COM Object Leak** | Calling COM methods in high-frequency loop without releasing interfaces. | Call `Marshal.ReleaseComObject()` on completed COM interface handles. |

---

## Command Line Syntax & Batch Processing

```powershell
# Set Windows Master Volume to 60% via Script
powershell -ExecutionPolicy Bypass -File .\Set-AudioVolume.ps1

# Mute Audio Master Output
powershell -Command "[AudioController.VolumeMaster]::SetMute(`$true)"
```

### Essential File Locations
- **Windows Core Audio DLL**: `C:\Windows\System32\AudioSes.dll`, `MMDevAPI.dll`

---

## Agent Operational Directive
> **MANDATORY**: When building zero-dependency Windows audio automation tools in PowerShell, use inline C# COM interop to `IAudioEndpointVolume` rather than sending simulated volume key presses (`[System.Windows.Forms.SendKeys]`).
