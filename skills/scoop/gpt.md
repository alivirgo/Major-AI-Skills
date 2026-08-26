---
title: "Scoop Windows Package Manager AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Scoop, custom JSON app manifests, autoupdate schemas, bucket repositories, and PowerShell CI pipelines."
category: "Command-Line Package Manager"
tags: ["scoop", "scoop-json-manifest", "autoupdate-schema", "custom-scoop-bucket", "powershell-ci", "gpt-codex", "windows-package-dev"]
---

# Scoop Windows Package Manager AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Scoop is powered by declarative **JSON Application Manifests**, **Git-backed Bucket Repositories**, and an automated **Auto-Update Regex Engine (`autoupdate`)**. GPT/Codex acts as a Principal Windows DevOps Engineer and Scoop Package Maintainer, delivering **compliant Scoop JSON manifests**, **automated bucket release pipelines**, **multi-architecture URL schemas (64-bit / 32-bit / ARM64)**, and **automated hash extraction workflows**.

### Developer Architecture & Manifest Platform Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Scoop Developer Platform                    │
│                                                             │
│  JSON App Manifest Specification                            │
│  ├── Metadata Containers (`version`, `description`, `license│
│  ├── Multi-Arch Download Blocks (`architecture.64bit.url`)  │
│  ├── Shim / Shortcut Definitions (`bin`, `shortcuts`)       │
│  └── Persistence Rules (`persist` Directories & Files)      │
│                                                             │
│  Autoupdate & Release Pipeline Subsystem                    │
│  ├── `checkver` (Regex Target URL & Version Matcher)        │
│  ├── `autoupdate` (Hash Substitution `$sha256` / `$url`)    │
│  └── GitHub Actions Automated Manifest Verification Worker  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Scoop JSON Manifest Authoring**: Author complete, validated Scoop application JSON manifests declaring portable archive URLs, executable shims, extraction subfolders, and persistence mappings.
2. **`checkver` & `autoupdate` Schema Engineering**: Build robust auto-update blocks utilizing regular expressions to scrape upstream GitHub release pages and update SHA256 hashes automatically.
3. **Custom Git Bucket Creation & Hosting**: Structure and maintain custom Git bucket repositories (*e.g. enterprise internal tools bucket*) with automated GitHub Actions CI/CD validation (`bin/checkver.ps1`).
4. **Automated Manifest Validation Scripts**: Script PowerShell linters validating JSON schema compliance, dead URLs, and hash integrity across bucket repositories.

---

## Production JSON Code: Complete Scoop Application Manifest with Auto-Update Schema

Save this file as `custom-tool.json` inside your custom Scoop bucket repository (`bucket/custom-tool.json`):

```json
{
  "version": "1.4.2",
  "description": "High-Performance Systems Telemetry and Diagnostic CLI Utility.",
  "homepage": "https://github.com/example/custom-tool",
  "license": "MIT",
  "notes": "Ensure custom-tool.ini is configured in your persist directory.",
  "architecture": {
    "64bit": {
      "url": "https://github.com/example/custom-tool/releases/download/v1.4.2/custom-tool-v1.4.2-windows-amd64.zip",
      "hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
    },
    "arm64": {
      "url": "https://github.com/example/custom-tool/releases/download/v1.4.2/custom-tool-v1.4.2-windows-arm64.zip",
      "hash": "f0e1d2c3b4a59687123456789abcdef0123456789abcdef0123456789abcdef0"
    }
  },
  "extract_dir": "custom-tool-v1.4.2",
  "bin": [
    "custom-tool.exe",
    ["custom-tool.exe", "ctool"]
  ],
  "persist": [
    "config",
    "data.db"
  ],
  "checkver": {
    "github": "https://github.com/example/custom-tool"
  },
  "autoupdate": {
    "architecture": {
      "64bit": {
        "url": "https://github.com/example/custom-tool/releases/download/v$version/custom-tool-v$version-windows-amd64.zip"
      },
      "arm64": {
        "url": "https://github.com/example/custom-tool/releases/download/v$version/custom-tool-v$version-windows-arm64.zip"
      }
    },
    "extract_dir": "custom-tool-v$version"
  }
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`checkver` Fails to Match Upstream Version** | Upstream repository tags use non-standard naming (e.g. `release-1.0` instead of `v1.0`). | Configure custom `re` regex inside `checkver`: `"re": "tag/release-([\\d.]+)"`. |
| **`bin` Shim Fails to Launch Subprocess** | Relative path to executable within extracted archive missing `extract_dir` mapping. | Specify `extract_dir` or provide nested path in `bin`: `["bin/tool.exe", "tool"]`. |
| **Persist Directory Overwritten on Update** | User files located outside declared `persist` array paths. | Add target folder or config file names to the `"persist"` array in the manifest. |
| **Manifest Fails Schema Validation** | JSON syntax error, trailing commas, or invalid architecture keys. | Validate JSON schema using `Test-Json` in PowerShell 7. |

---

## Command Line Syntax & Bucket Maintenance Recipes

```powershell
# 1. Run Automated Manifest Checkver on Custom Bucket
.\bin\checkver.ps1 -Update -Force

# 2. Test Manifest Installation from Local File
scoop install .\bucket\custom-tool.json

# 3. Create a New Custom Bucket from GitHub Repository
scoop bucket add my-company-tools "https://github.com/my-company/scoop-bucket.git"
```

### Essential File Locations
- **Scoop Manifest Schemas**: `https://github.com/ScoopInstaller/Scoop/blob/master/schema.json`
- **Bucket Directories**: `%USERPROFILE%\scoop\buckets\<BucketName>\bucket\`

---

## Agent Operational Directive
> **MANDATORY**: When authoring Scoop JSON manifests, always provide both `architecture.64bit` and `architecture.arm64` blocks whenever upstream binaries are available for Windows on ARM.
