import os

apps = {
    "WizTree": {
        "platform": "Windows",
        "desc": "Lightning-fast disk space visualizer utilizing MFT (Master File Table) for instant scanning.",
        "features": ["MFT Scanning", "Visual Treemap", "CSV Export", "Command Line Interface"],
        "issues": ["Inaccurate scanning without Admin rights", "Network drive scanning latency", "MFT reading errors on corrupted drives", "High memory usage on massive arrays"],
        "commands": ["wiztree64.exe /admin=1", "wiztree64.exe /export=report.csv", "wiztree64.exe C: /treemap"],
        "troubleshooting": "Always ensure WizTree is run as Administrator to access the MFT directly. For network drives, fallback to standard API scanning."
    },
    "Everything": {
        "platform": "Windows",
        "desc": "Instant, real-time file search engine that indexes NTFS drives instantly.",
        "features": ["Instant NTFS Indexing", "Regex Support", "IPC/Command Line", "HTTP Server"],
        "issues": ["Everything service not running", "Outdated index requiring a rebuild", "Missing network shares", "Regex syntax errors"],
        "commands": ["Everything.exe -search \"<query>\"", "Everything.exe -admin", "Everything.exe -update"],
        "troubleshooting": "If files are missing, force a rebuild of the database via Options -> Indexes -> Force Rebuild. Ensure the 'Everything Service' is running to avoid UAC prompts."
    },
    "EarTrumpet": {
        "platform": "Windows",
        "desc": "Per-app volume control system tray app providing modern audio management.",
        "features": ["Per-app volume mixing", "Default playback device switching", "Modern Windows UI", "Custom hotkeys"],
        "issues": ["Legacy apps not appearing in the mixer", "Conflict with Windows default volume flyout", "Hotkeys not registering globally"],
        "commands": ["No traditional CLI, but responds to system audio API calls. Can be launched via EarTrumpet.exe"],
        "troubleshooting": "If EarTrumpet icon is hidden, check Windows Taskbar settings. For missing apps, ensure the app is actively outputting audio to be detected by the WASAPI session."
    },
    "ShareX": {
        "platform": "Windows",
        "desc": "Advanced screen capture, recording, OCR, and file sharing tool.",
        "features": ["Screen Capture/Recording", "FFmpeg integration", "OCR (Optical Character Recognition)", "Custom Uploaders/Workflows"],
        "issues": ["Hotkey conflicts with other software", "FFmpeg audio recording failures", "Uploader authentication expiry", "High CPU usage during encoding"],
        "commands": ["sharex.exe -workflow \"Screen record\"", "sharex.exe -imageeditor \"path_to_image\"", "sharex.exe -ocr"],
        "troubleshooting": "For FFmpeg audio issues, ensure 'Virtual-audio-capturer' is installed and selected in Task Settings. Re-authorize Imgur/Custom destinations if uploads fail."
    },
    "Flow_Launcher": {
        "platform": "Windows",
        "desc": "Speed-focused launcher with extension support, similar to Spotlight for Windows.",
        "features": ["Plugin Ecosystem (Python/C#)", "Everything Search Integration", "Web Searches", "Calculator/System commands"],
        "issues": ["Python environment not found for plugins", "High latency during search", "Plugin dependency errors", "Everything IPC connection failure"],
        "commands": ["Flow.Launcher.exe", "Can execute shell commands via '>' prefix internally"],
        "troubleshooting": "If plugins fail, verify the Python path in Flow Launcher settings. Ensure Everything is running if local file search is unresponsive."
    },
    "Microsoft_PowerToys": {
        "platform": "Windows",
        "desc": "Power-user toolkit for Windows, featuring FancyZones, Text Extractor, and Color Picker.",
        "features": ["FancyZones window manager", "PowerToys Run launcher", "Text Extractor OCR", "Color Picker", "Awake"],
        "issues": ["FancyZones not snapping elevated (Admin) apps", "PowerToys Run lagging", "Settings sync issues across machines"],
        "commands": ["powertoys.exe", "Win+Shift+T (Text Extractor)", "Win+Shift+C (Color Picker)", "Alt+Space (PowerToys Run)"],
        "troubleshooting": "To snap Admin apps with FancyZones, PowerToys must also be run as Administrator. Restart the PowerToys process if 'Run' becomes unresponsive."
    },
    "Raycast": {
        "platform": "macOS",
        "desc": "High-performance, extensible replacement for Spotlight and Alfred on macOS.",
        "features": ["Native Extensions", "Script Commands (Bash/Python/AppleScript)", "Window Management", "Clipboard History"],
        "issues": ["Accessibility permissions revoked", "Script timeouts", "Node.js environment issues for extensions", "High memory leak on heavy extensions"],
        "commands": ["raycast://", "raycast://extensions/author/extension-name", "Script Commands via aliases"],
        "troubleshooting": "If Raycast fails to manage windows or type text, remove and re-add Raycast in System Settings -> Privacy & Security -> Accessibility."
    },
    "Shottr": {
        "platform": "macOS",
        "desc": "Fast screenshot, pixelation, OCR, and ruler utility optimized for Apple Silicon.",
        "features": ["Scrolling Screenshots", "Instant Pixelation/Blur", "On-screen Ruler", "Text Recognition (OCR)"],
        "issues": ["Screen Recording permission denied", "Scrolling screenshot overlapping/failing on dynamic pages", "Shortcut conflict with macOS default"],
        "commands": ["shottr://", "Triggered mainly via customizable hotkeys (e.g., Cmd+Shift+2)"],
        "troubleshooting": "For scrolling screenshot failures, ensure no sticky headers are confusing the stitcher. Re-grant Screen Recording permission if captures are blank."
    },
    "AppCleaner": {
        "platform": "macOS",
        "desc": "Thorough uninstaller that removes apps along with all hidden support files and preferences.",
        "features": ["SmartDelete daemon", "Preference file hunting", "Widget/Plugin removal", "Drag-and-drop interface"],
        "issues": ["Inability to delete SIP-protected apps", "Full Disk Access permission missing", "SmartDelete not catching background deletions"],
        "commands": ["Open AppCleaner and pass app path (AppCleaner.app/Contents/MacOS/AppCleaner /Applications/AppName.app)"],
        "troubleshooting": "Ensure AppCleaner has Full Disk Access in Privacy Settings to locate files in ~/Library/Application Support and ~/Library/Preferences."
    },
    "Rectangle": {
        "platform": "macOS",
        "desc": "Keyboard and drag-based window management tool based on Spectacle.",
        "features": ["Window Snapping", "Keyboard Shortcuts", "Custom Gaps", "Multiple Display Support"],
        "issues": ["Snapping disabled due to Accessibility issues", "Conflict with macOS Stage Manager", "Windows not resizing to exact halves on external monitors"],
        "commands": ["Operates via hotkeys (e.g., Ctrl+Option+Left) or menu bar"],
        "troubleshooting": "If Rectangle stops responding, toggle the Accessibility permission off and on. Adjust 'Almost Maximize' settings if menubar/dock gaps are incorrect."
    },
    "MacCy": {
        "platform": "macOS",
        "desc": "Lightweight, open-source clipboard history manager for macOS.",
        "features": ["Image/Text clipboard history", "Fuzzy Search", "Pinning clips", "Secure input ignoring"],
        "issues": ["Not recording clipboard due to Secure Input locks", "Memory bloat with large images", "Search hotkey conflict"],
        "commands": ["Trigger via hotkey (Cmd+Shift+C default)", "Use arrow keys and enter to paste"],
        "troubleshooting": "If MacCy isn't saving clips, an app (like a password manager or terminal) is holding a 'Secure Input' lock. Identify and close the locking app."
    },
    "Dropover": {
        "platform": "macOS",
        "desc": "Temporary floating shelf for dragging files, text, and images.",
        "features": ["Multiple floating shelves", "iCloud Sync", "Quick Look integration", "Share action extensions"],
        "issues": ["Shelf not appearing on shake", "Accessibility permission errors", "Files moving instead of copying"],
        "commands": ["Shake cursor to trigger", "Drag and hover to trigger"],
        "troubleshooting": "If the shake gesture fails, adjust the sensitivity in Dropover Preferences. Ensure Accessibility permissions are granted for automatic pasting."
    },
    "Velja": {
        "platform": "macOS",
        "desc": "Intelligent browser picker to open specific links in specific browsers automatically.",
        "features": ["Rule-based routing (Domains/URLs)", "App-specific routing", "Removes tracking parameters", "Deep link support"],
        "issues": ["Not set as default browser", "Redirect loops", "Rules conflicting (overlapping domains)", "Safari extensions bypassing Velja"],
        "commands": ["Configure via UI, works passively as default browser"],
        "troubleshooting": "Velja MUST be set as the default macOS browser to intercept links. If links open in the wrong browser, check rule hierarchy and ensure no overlapping wildcard rules exist."
    }
}

ai_models = [
    {
        "name": "Claude",
        "persona": "Anthropic's Claude, emphasizing safe, nuanced, and extremely detailed step-by-step analytical troubleshooting.",
        "seo_keywords": ["Claude AI", "Anthropic Claude", "Claude prompt for {app}", "Troubleshooting with Claude", "Claude AI skills", "Claude integration"]
    },
    {
        "name": "GPT",
        "persona": "OpenAI's ChatGPT (GPT-4), emphasizing actionable, concise, code-heavy, and direct problem-solving capabilities.",
        "seo_keywords": ["ChatGPT", "GPT-4", "OpenAI GPT", "GPT prompt for {app}", "ChatGPT troubleshooting", "GPT automation"]
    },
    {
        "name": "Gemini",
        "persona": "Google's Gemini, emphasizing fast, context-aware, multimodal-ready, and integration-focused intelligence.",
        "seo_keywords": ["Google Gemini", "Gemini Advanced", "Gemini AI skills", "Gemini prompt for {app}", "Gemini troubleshooting", "Google AI"]
    }
]

template = """---
title: "{app} AI Skill for {ai}"
description: "Comprehensive SEO-rich AI skill guide for {ai} to manage, troubleshoot, and execute commands in {app} ({platform})."
keywords: "{keywords}"
author: "AI Integration Expert"
---

# 🚀 {app} Mastery Skill for {ai}

## 🌟 Overview
Welcome to the definitive, SEO-optimized AI skill guide for **{app}** on **{platform}**. This specific skill set is engineered for **{ai}** ({persona}). 
By embedding this skill, {ai} becomes a master troubleshooter, command executor, and advanced operator for {app}. 

> **App Description**: {desc}

## 🎯 Core Capabilities & AI Instructions
When acting as the primary assistant for {app}, **{ai}** must inherently understand and apply the following capabilities:

{features_list}

### 🧠 How {ai} Should Process Commands
1. **Context Recognition**: Immediately identify when a user mentions `{app}` or its related workflows.
2. **Actionable Execution**: Formulate direct, copy-pasteable commands or exact UI navigation paths.
3. **Proactive Diagnostics**: Anticipate common failure points and suggest checks before the user asks.

## 🛠 Troubleshooting Matrix
If the user experiences issues with {app}, {ai} will directly pinpoint the solution using this expert matrix:

### Known Issues & Diagnostics
{issues_list}

**Master Troubleshooting Protocol**:
> {troubleshooting}

## 💻 Command Execution & Syntax
{ai} is equipped to parse and generate the following exact commands and shortcuts for {app}:

```bash
{commands_list}
```

## 📈 SEO & Schema Context for Web Integrations
This markdown document is structured with rich semantic HTML/Markdown equivalents to ensure high visibility and machine readability. 
- **Target OS**: {platform}
- **Application Category**: System Utility / Productivity
- **AI Agent Optimization**: {ai}-native instruction formatting

### FAQ Structured Data for {ai}
**Q: How does {ai} solve {app} issues?**
A: By utilizing direct command injection, understanding exact UI layouts, and applying the Master Troubleshooting Protocol specified in this document.

**Q: Can {ai} automate {app}?**
A: Yes, through the CLI commands and hotkeys listed above, {ai} can guide the user to fully automate {app} workflows.

---
*Generated for the ultimate agentic capabilities of {ai}. Designed to seamlessly integrate into knowledge bases, providing unmatched resolution speed for {app} users.*
"""

output_dir = "skills"
os.makedirs(output_dir, exist_ok=True)

for app_name, app_data in apps.items():
    for ai in ai_models:
        # Prepare data
        features_list = "\\n".join([f"- **{f}**" for f in app_data['features']])
        issues_list = "\\n".join([f"- ⚠️ {i}" for i in app_data['issues']])
        commands_list = "\\n".join(app_data['commands'])
        
        keywords = ", ".join(ai['seo_keywords']).replace("{app}", app_name) + f", {app_name}, {app_data['platform']} utilities, AI troubleshooting"
        
        content = template.format(
            app=app_name.replace("_", " "),
            ai=ai['name'],
            platform=app_data['platform'],
            persona=ai['persona'],
            desc=app_data['desc'],
            features_list=features_list,
            issues_list=issues_list,
            troubleshooting=app_data['troubleshooting'],
            commands_list=commands_list,
            keywords=keywords
        )
        
        filename = f"{app_name.lower()}_{ai['name'].lower()}_skill.md"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"Created: {filepath}")

print("All skills generated successfully.")
