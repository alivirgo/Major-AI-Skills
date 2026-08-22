---
title: "ShareX Advanced Screen Capture & Automation AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize ShareX, Custom Uploader (.sxcu) JSON schemas, CLI workflows, and automated capture ingestion pipelines."
category: "Screen Capture, OCR, Video Recording & Sharing"
tags: ["sharex", "sxcu-json-schema", "sharex-cli-automation", "custom-uploaders", "gpt-codex", "windows-capture-dev"]
---

# ShareX Advanced Screen Capture & Automation AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
ShareX exposes complete programmatic automation via its **Custom Uploader Schema (`.sxcu`)**, extensive **CLI Automation Arguments**, and declarative **JSON Configuration Files (`ApplicationConfig.json`, `UploadersConfig.json`)**. GPT/Codex acts as a Principal Windows Integration Software Engineer and Automation Pipeline Developer, delivering **custom AWS S3 / Cloudflare R2 `.sxcu` configurations**, **PowerShell automated capture scripts**, **headless OCR batch processing**, and **automated media archiving pipelines**.

### Developer Architecture & Custom Uploader Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 ShareX Developer Platform                   │
│                                                             │
│  Custom Uploader Engine (`.sxcu` Specification)             │
│  ├── Request Model (`RequestMethod`, `RequestURL`, `Headers`)│
│  ├── Multi-Part Form Data & Custom Argument Parameters      │
│  └── Dynamic Response Extraction (`$json:path$`, `$regex:$`)│
│                                                             │
│  CLI Command & Automation Infrastructure                    │
│  ├── Command Line Parameter Switch Engine (`ShareX.exe -...`)│
│  ├── Automated Workflow Invocation (`-Workflow "<Name>"`)   │
│  └── JSON Configuration Engine (`%DOCUMENTS%\ShareX\`)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **ShareX Custom Uploader (`.sxcu`) Development**: Author `.sxcu` files connecting to AWS S3, Cloudflare R2, MinIO, or custom REST microservices with token authentication and dynamic JSON response parsing.
2. **Automated CLI Capture Orchestration**: Construct PowerShell and Python scripts invoking `ShareX.exe` with specific capture modes (*`-RectangleRegion`, `-ActiveWindow`, `-AutoCapture`*) and piping paths into processing pipelines.
3. **Automated OCR & Clipboard Parsing**: Build scripts triggering ShareX OCR headlessly and parsing returned clipboard text into structured JSON/CSV records.
4. **Configuration Templating & Deployment**: Script automated generation of `ApplicationConfig.json` to enforce standard capture directory locations and hotkeys across development machines.

---

## Production JSON Code: Cloudflare R2 / S3-Compatible ShareX Custom Uploader (`.sxcu`)

Save this file as `CloudflareR2_Uploader.sxcu` for direct import into ShareX:

```json
{
  "Version": "15.0.0",
  "Name": "Cloudflare R2 / S3 Image Bucket",
  "DestinationType": "ImageUploader, FileUploader",
  "RequestMethod": "POST",
  "RequestURL": "https://api.my-domain.com/storage/upload",
  "Headers": {
    "Authorization": "Bearer YOUR_SECRET_API_KEY",
    "X-Storage-Bucket": "production-media-vault"
  },
  "Body": "MultipartFormData",
  "Arguments": {
    "category": "screenshots",
    "visibility": "public"
  },
  "FileFormName": "media_file",
  "URL": "$json:data.public_url$",
  "ThumbnailURL": "$json:data.thumbnail_url$",
  "DeletionURL": "$json:data.delete_url$",
  "ErrorMessage": "$json:error.message$"
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`.sxcu` Upload Fails: `SSL/TLS Handshake Error`** | Server requires TLS 1.3 or uses a self-signed development certificate. | In ShareX $\rightarrow$ *Task Settings $\rightarrow$ Advanced*, configure HTTP client settings or verify valid certificate chain. |
| **CLI Parameter `-ScreenCaptureRegion` Ignored** | Another ShareX modal window or settings dialog is currently open. | Ensure background ShareX instance has no blocking modal dialogs active. |
| **`$json:data.url$` Returns Empty String** | Response JSON schema from API server does not match the dot-notation path. | Verify exact server JSON structure: if response is `{"link": "..."}`, update to `$json:link$`. |
| **Duplicate File Creation in Local Directory** | Both "Save image to file" and "Save image to file as..." active in After Capture tasks. | Ensure only a single file saving task is enabled in Task Settings. |

---

## Command Line Syntax & Batch Processing

```bash
# 1. Capture Active Window and Execute Configured Tasks
"C:\Program Files\ShareX\ShareX.exe" -ActiveWindow

# 2. Capture Entire Virtual Multi-Monitor Desktop
"C:\Program Files\ShareX\ShareX.exe" -EntireScreen

# 3. Import Custom Uploader via CLI
"C:\Program Files\ShareX\ShareX.exe" "C:\Profiles\CloudflareR2_Uploader.sxcu"
```

### Essential File Locations
- **Custom Uploaders**: `%USERPROFILE%\Documents\ShareX\CustomUploaders.json`
- **Application Settings**: `%USERPROFILE%\Documents\ShareX\ApplicationConfig.json`

---

## Agent Operational Directive
> **MANDATORY**: When developing `.sxcu` custom uploaders, always declare `"DeletionURL": "$json:delete_url$"` whenever supported by the backend API to enable immediate screenshot recall from the ShareX history menu.
