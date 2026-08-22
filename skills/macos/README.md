# macOS Native Utilities, Virtualization & Productivity Suite (`skills/macos/`)

This directory contains production-grade, expert-level AI Skill specifications and automation architectures for essential native macOS productivity tools, clipboard history managers, screen capture utilities, containerization engines, window managers, and speech-to-text tools.

Each tool ecosystem includes three specialized AI engineering specifications:
- **`claude_skill.md`**: Tailored for Anthropic Claude (systems architecture, TCC permission diagnostics, native Swift/AppKit scripting, daemon lifecycle control).
- **`gemini_skill.md`**: Tailored for Google Gemini (multimodal UI inspection, preference panel validation, visual clipping/annotation review, HUD layout analysis).
- **`gpt_skill.md`**: Tailored for OpenAI GPT & Codex (React/TypeScript Raycast extensions, CoreData SQLite querying, `duti` LaunchServices scripts, automated `defaults` configuration).

---

## macOS Utility Domain Architecture & Pipeline Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 macOS Native Utilities & Productivity Map                   │
│                                                                             │
│  [1] AppCleaner (`appcleaner/`)                                             │
│  • Domain: Complete Application Uninstaller, ~/Library Residual Purging     │
│  • Automation: CFBundleIdentifier Extraction, LaunchAgent/Daemon Teardown   │
│                                                                             │
│  [2] Dropover (`dropover/`)                                                 │
│  • Domain: Floating Drag-and-Drop Shelf, Multi-Space Staging HUD            │
│  • Automation: Custom URL Scheme (`dropover://`), AppleScript Finder Stager │
│                                                                             │
│  [3] Maccy (`maccy/`)                                                       │
│  • Domain: Lightweight Open-Source Clipboard History Manager                │
│  • Automation: NSPasteboard Change Monitoring, CoreData SQLite Extractions  │
│                                                                             │
│  [4] MacWhisper (`macwhisper/`)                                             │
│  • Domain: On-Device AI Speech-to-Text, Core ML / Apple Neural Engine (ANE) │
│  • Automation: FFmpeg Audio Preprocessing, Timecoded SRT/VTT Subtitle Gen.  │
│                                                                             │
│  [5] OrbStack (`orbstack/`)                                                 │
│  • Domain: Fast Docker Engine & Linux VM Runtime for Apple Silicon          │
│  • Automation: `orb` CLI Scripting, Docker Buildx Multi-Arch, VirtioFS      │
│                                                                             │
│  [6] Raycast (`raycast/`)                                                   │
│  • Domain: Extensible Keyboard Productivity Launcher & Spotlight Alternative│
│  • Automation: React/TypeScript Extensions (`@raycast/api`), Script Commands│
│                                                                             │
│  [7] Rectangle (`rectangle/`)                                               │
│  • Domain: Keyboard & Drag Window Snapping and Multi-Display Tiling         │
│  • Automation: AXUIElement Accessibility Scripting, URL Scheme (`rectangle`)│
│                                                                             │
│  [8] Shottr (`shottr/`)                                                     │
│  • Domain: High-Speed Screen Capture, Metal Annotation, Vision Live Text OCR│
│  • Automation: ScreenCaptureKit Frame Ingestion, WebP Compression Pipelines │
│                                                                             │
│  [9] Velja (`velja/`)                                                       │
│  • Domain: Smart Browser Picker, Tracking Parameter Stripper, URL Router    │
│  • Automation: LaunchServices `duti` Bindings, Declarative Plist Rule Setup │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Applications & Quick Links

| Application Directory | Core Domain & Focus | Key Pipeline Capabilities |
| :--- | :--- | :--- |
| **[appcleaner/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/appcleaner)** | Application Uninstaller | Bundle ID scanning, ~/Library artifact purging, TCC permission audit |
| **[dropover/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/dropover)** | Floating Drag Shelf | URL scheme staging, `CGEventTap` gesture triage, Multi-space persistence |
| **[maccy/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/maccy)** | Clipboard History Manager | `NSPasteboard` changeCount monitoring, CoreData SQLite extractor, Secure Input |
| **[macwhisper/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/macwhisper)** | On-Device Speech-to-Text | Core ML Apple Neural Engine acceleration, FFmpeg pipelines, SRT/VTT formatting |
| **[orbstack/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/orbstack)** | Fast Docker & Linux VMs | Hypervisor.framework micro-VMs, `orb` CLI automation, Docker Buildx |
| **[raycast/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/raycast)** | Extensible Launcher | React/TypeScript `@raycast/api` extensions, Script Commands, OAuth PKCE |
| **[rectangle/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/rectangle)** | Window Tiling Manager | `AXUIElement` Accessibility window snapping, URL scheme workspace setup |
| **[shottr/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/shottr)** | Screen Capture & Markup | ScreenCaptureKit capture, Vision OCR, WebP compression, Redaction safety |
| **[velja/](file:///c:/Users/ASUS/Documents/Newfolder/Antigravity/Major%20AI%20Skills/skills/macos/velja)** | Browser Picker & Router | LaunchServices `duti` bindings, Tracking query stripper, Plist rule deployer |

---

## Integration Guidelines
These skill guides are engineered for direct ingestion into AI pair-programming systems, macOS systems engineering workflows, and developer dotfiles configurations. Load the specific model guide into agent system prompts or RAG context indexes for immediate domain-expert execution.
