---
title: "Ventoy Multiboot USB Creator AI Skill Guide (Gemini)"
description: "Comprehensive operational skill specification for Google Gemini to visually diagnose, automate, configure, and troubleshoot Ventoy boot screens, UEFI MOK enrollment dialogs, and ISO partition layouts."
category: "Multiboot USB Creator & ISO Bootloader"
tags: ["ventoy", "multiboot-usb", "uefi-diagnostics", "gemini", "mok-enrollment", "iso-bootloader"]
---

# Ventoy Multiboot USB Creator AI Skill Guide (Gemini)

## Overview & Engine Architecture
Ventoy enables seamless multi-operating system deployment by turning generic flash drives into bootable ISO loaders. Gemini acts as an AI OS Deployment Analyst and Hardware Triage Engineer, specializing in **multimodal UEFI/BIOS boot screen diagnosis**, **MOK (Machine Owner Key) enrollment verification**, **VentoyGUI partition layout configuration**, and **unattended deployment scripts**.

### Bootstrapping & Hooking Engine Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Ventoy Boot Execution Stack                 │
│                                                             │
│  Hardware Firmware Ingress                                  │
│  ├── UEFI (64-bit / 32-bit / ARM64) & Legacy BIOS Modes     │
│  └── Secure Boot Signature Verification & MOK Key Ring      │
│                                                             │
│  Dynamic ISO Hooking Layer                                  │
│  ├── Virtual Disk Hook (Intercepts OS read requests)        │
│  ├── RAM Injection Subsystem (`memdisk` for small WinPE)    │
│  └── Graphical GRUB2 Interactive Multilingual Theme Viewport│
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Multimodal Boot Screen Diagnosis**: Analyze screenshots of UEFI boot failures, blue Shim screens, and GRUB error dialogs to identify partition table mismatches and Secure Boot rejections.
2. **MOK Enrollment Step-by-Step Guidance**: Guide users through the visual steps of enrolling the Ventoy MOK key on initial Secure Boot launch.
3. **Partition Table Architecture Guidance**: Direct users to choose between MBR (maximum compatibility with legacy BIOS systems) and GPT (required for modern UEFI-only hardware).
4. **Theme & Menu Layout Configuration**: Design customized Ventoy theme descriptors (`theme.txt`) and font configurations for corporate deployment media.

---

## Production JSON Configuration: Theme & Multi-ISO Menu Hierarchy

Save this file as `/ventoy/ventoy.json` to organize ISO images into visual submenu categories:

```json
{
  "theme": {
    "file": "/ventoy/theme/flat/theme.txt",
    "gfxmode": "1920x1080",
    "display_mode": "GUI",
    "ventoy_color": "#0078d4"
  },
  "menu_class": [
    {
      "key": "windows",
      "class": "windows"
    },
    {
      "key": "linux",
      "class": "linux"
    },
    {
      "key": "utility",
      "class": "tools"
    }
  ],
  "control": [
    { "VTOY_DEFAULT_SEARCH_ROOT": "/ISOs" },
    { "VTOY_MAX_SEARCH_LEVEL": "3" },
    { "VTOY_DEFAULT_MENU_MODE": "list" }
  ]
}
```

---

## Technical Troubleshooting Matrix

| Issue & Visual Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Blue Screen with `Perform MOK Management` Title** | UEFI Secure Boot intercepted the bootloader; user must complete the one-time key enrollment. | 1. Select **Enroll MOK** $\rightarrow$ Press Enter.<br>2. Select **Continue** $\rightarrow$ Select **Yes**.<br>3. When prompted for password, type `ventoy` and press Enter.<br>4. Select **Reboot**. |
| **ISO Fails with `Error: Not enough memory to load image`** | Attempting to boot heavy ISO using Memdisk mode (`Ctrl + W`) on a machine with insufficient RAM. | 1. Boot the ISO in standard **Normal Mode** (Enter key) rather than Memdisk mode.<br>2. Memdisk copies the entire ISO into RAM and is only intended for small WinPE ($<1\text{GB}$). |
| **Ventoy Menu Shows Corrupted Font / Artifacts** | Viewport screen resolution mismatch in GRUB2 theme settings. | In `/ventoy/ventoy.json`, set `"gfxmode": "1024x768"` or `"auto"` to match native monitor resolution. |
| **Windows Installer Asks for 'Missing CD/DVD Device Driver'** | USB 3.0 controller driver missing in older Windows 7/8 installation media. | Copy vendor USB 3.0 driver INF files into `/ventoy/injection/` or use Windows 10/11 PE media. |

---

## Command Line Syntax & Server Control

```bash
# Check Disk Partition Alignment on Linux
sudo parted /dev/sdb print

# Launch Ventoy GUI on Linux
sudo ./VentoyGUI.x86_64
```

### Key Configuration Locations
- **Ventoy USB Data Partition**: Root of USB drive
- **Ventoy Configuration**: `/ventoy/ventoy.json`

---

## Agent Operational Directive
> **MANDATORY**: When diagnosing Secure Boot errors, provide the exact 4-step MOK enrollment sequence (`Enroll MOK` -> `Continue` -> `Yes` -> password `ventoy`). Advise users to use Normal Boot mode rather than Memdisk mode for large OS installers.
