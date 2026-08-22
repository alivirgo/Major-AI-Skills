# Windows Utilities, Systems Engineering & Power-User Automation Suite (`skills/windows/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for premier Windows systems utilities, low-level process and kernel diagnostics, desktop automation engines, package managers, and storage analytics tools.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (Win32 architecture, low-level NTDLL/WASAPI APIs, MFT parsing, kernel driver troubleshooting, and CI/CD scripts).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal UI inspection, Window Spy coordinates, process tree highlighting, Treemap visual diagnostics, and settings verification).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (C#/.NET and C++ plugin SDKs, Python JSON-RPC adapters, Win32 `DllCall` structs, `.sxcu` custom uploaders, and PowerShell automation).

---

## Windows Systems Engineering Architecture & Ecosystem Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Windows Utilities & Systems Engineering Map                 │
│                                                             │
│  [1] AutoHotkey v2 (`autohotkey-v2/`)                                       │
│  • Domain: Desktop Automation, Win32 Hooks, Strict Expression Scripting     │
│  • Automation: Window Manager AHK v2, Win32 `DllCall` Memory Telemetry      │
│                                                             │
│  [2] EarTrumpet (`eartrumpet/`)                                             │
│  • Domain: Per-App Windows Core Audio (WASAPI), Endpoint Redirection        │
│  • Automation: `pycaw` Session Manager, Native WASAPI Inline C# PowerShell  │
│                                                             │
│  [3] Voidtools Everything (`everything/`)                                   │
│  • Domain: Real-Time NTFS MFT & USN Change Journal File Indexing Engine     │
│  • Automation: `Everything64.dll` C-SDK Python Client, EFU Manifest Gen     │
│                                                             │
│  [4] Flow Launcher (`flow-launcher/`)                                       │
│  • Domain: Extensible Desktop Search, Action Keywords, Python/C# Plugins    │
│  • Automation: JSON-RPC Stdin/Stdout Python Plugins, Native C# `IPlugin`    │
│                                                             │
│  [5] Microsoft PowerToys (`microsoft-powertoys/`)                           │
│  • Domain: Modular Desktop Utilities: FancyZones, PT Run, Awake, OCR        │
│  • Automation: `settings.json` Configurator, PT Run C# Service Plugin       │
│                                                             │
│  [6] Sandboxie-Plus (`sandboxie-plus/`)                                     │
│  • Domain: Kernel-Level Driver (`SbieDrv.sys`) Application Isolation Silo   │
│  • Automation: Ephemeral Testing Python Runner, `SbieDll.dll` Ctypes Check  │
│                                                             │
│  [7] Scoop (`scoop/`)                                                       │
│  • Domain: User-Space Package Manager, Git Buckets, Shims Architecture      │
│  • Automation: Idempotent Workstation Bootstrapper, Custom JSON Manifests   │
│                                                             │
│  [8] ShareX (`sharex/`)                                                     │
│  • Domain: Screen Capture, FFmpeg Recording, DirectShow Audio, OCR          │
│  • Automation: Flask Custom Uploader Server, Cloudflare R2 / S3 `.sxcu`     │
│                                                             │
│  [9] System Informer (`system-informer/`)                                   │
│  • Domain: Kernel Process Diagnostics, NTDLL Native APIs, PPL Security      │
│  • Automation: PEB / Command-Line Ctypes Inspector, Native C Plugin SDK     │
│                                                             │
│  [10] WizTree (`wiztree/`)                                                  │
│  • Domain: Direct NTFS `$MFT` Disk Visualizer, Cushion Treemap Partitions   │
│  • Automation: Headless Storage Auditor Python Script, Scheduled Webhooks   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[autohotkey-v2/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/autohotkey-v2)** | Desktop Scripting Engine | Strict v2 syntax, Win32 `DllCall`, UIPI bypass, Window Manager |
| **[eartrumpet/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/eartrumpet)** | Per-App Audio Routing | WASAPI Core Audio, `pycaw` Python client, inline C# volume engine |
| **[everything/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/everything)** | Real-Time NTFS Search | `Everything64.dll` C-SDK, USN journal, `es.exe` CLI, `.efu` lists |
| **[flow-launcher/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/flow-launcher)** | Extensible App Launcher | Python JSON-RPC plugins, C# `IPlugin`, Everything integration |
| **[microsoft-powertoys/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/microsoft-powertoys)** | Power-User Utilities | FancyZones JSON schemas, PT Run C# plugins, Awake CLI, WinUI 3 |
| **[sandboxie-plus/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/sandboxie-plus)** | Application Containment | `SbieDrv.sys` driver, `Sandboxie.ini`, ephemeral testing runner |
| **[scoop/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/scoop)** | Command-Line Package Mgr | Workstation bootstrapper, Aria2 acceleration, JSON manifests |
| **[sharex/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/sharex)** | Capture, Video & OCR | Custom Uploader `.sxcu`, FFmpeg screen recording, OCR pipelines |
| **[system-informer/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/system-informer)** | Kernel & Process Diagnostics | NTDLL PEB inspector, `KSystemInformer.sys`, native C plugin SDK |
| **[wiztree/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/windows/wiztree)** | MFT Disk Visualizer | Headless CSV audit, Treemap visualization, Scheduled webhooks |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, Windows workstation provisioning scripts, and systems administrator pipelines. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
