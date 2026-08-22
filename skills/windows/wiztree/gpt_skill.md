---
title: "WizTree Disk Space Analyzer & MFT Engine AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize WizTree, CLI parameters (/export, /filter, /admin=1), scheduled disk auditing, and automated storage alert webhooks."
category: "Disk Space Visualizer & Storage Diagnostics"
tags: ["wiztree", "wiztree-cli-automation", "storage-audit-pipeline", "mft-reporting", "powershell-disk-audit", "gpt-codex", "windows-storage-dev"]
---

# WizTree Disk Space Analyzer & MFT Engine AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Antibody Software WizTree provides high-throughput disk analysis automation through its **Headless Command Line Interface (`wiztree64.exe`)**, supporting declarative filter patterns, raw MFT dumps, and automated CSV/JSON exports. GPT/Codex acts as a Principal Windows Systems Storage Engineer and Disk Automation Developer, delivering **unattended disk auditing pipelines**, **scheduled storage capacity monitors with Discord/Slack webhooks**, **raw MFT forensics extraction tools**, and **automated enterprise storage reclamation scripts**.

### Developer Architecture & Automation CLI Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 WizTree Developer Platform                  │
│                                                             │
│  CLI Command & Parameter Subsystem                          │
│  ├── Target Path Descriptor (`C:`, `D:\Data`, `\\server\sh`)│
│  ├── Export Formatters (`/export="...csv"`, `/export="...txt│
│  ├── Filtering & Sorting Engines (`/filter=...`, `/sortby=1`│
│  └── Privilege Escalation (`/admin=1` MFT Direct Read)      │
│                                                             │
│  Automated Storage Pipeline Integration                     │
│  ├── Scheduled Task Orchestrator (Windows Task Scheduler)   │
│  ├── Alert Webhook Dispatcher (Discord, Slack, Teams, Email)│
│  └── Automated High-Capacity Storage Reclamation Scripts    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **WizTree Headless CLI Orchestration**: Author robust PowerShell and Python scripts invoking `wiztree64.exe` with `/export`, `/admin=1`, and `/sortby=1` to generate instant storage reports.
2. **Automated Storage Alerting Webhooks**: Construct scheduled monitoring scripts evaluating drive capacity thresholds ($>85\%$ utilization) and posting top storage-consuming directories to Slack/Discord webhooks.
3. **Automated MFT Forensics Extraction**: Build scripts extracting raw Master File Table dumps (`/dumpmft="path.bin"`) for incident response and filesystem forensics.
4. **Targeted Artifact Reclamation**: Script automated cleanup routines purging build caches, node modules, and obsolete virtual machine snapshots identified by WizTree audits.

---

## Production PowerShell Automation: Scheduled Disk Space Auditor & Webhook Notifier

Save this script as `Invoke-WizTreeAudit.ps1`:

```powershell
<#
.SYNOPSIS
    Automated WizTree Disk Storage Monitor with Webhook Alerting
    Executes headless MFT scan on C:, analyzes top directories, and alerts if free space < 15%.
#>

$WizTreePath = "C:\Program Files\WizTree\wiztree64.exe"
$ReportPath = "$env:TEMP\WizTree_C_Audit.csv"
$TargetDrive = "C:"
$ThresholdPercent = 15.0 # Alert if free space below 15%
$WebhookUrl = "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL" # Optional webhook

if (-not (Test-Path $WizTreePath)) {
    Write-Error "WizTree executable not found at: $WizTreePath"
    exit 1
}

Write-Host "--- [RUNNING AUTOMATED WIZTREE MFT STORAGE SCAN] ---"

# 1. Execute Headless MFT Scan and Export
$process = Start-Process -FilePath $WizTreePath -ArgumentList "$TargetDrive /export=`"$ReportPath`" /admin=1 /sortby=1" -Wait -PassThru

if ($process.ExitCode -ne 0) {
    Write-Error "WizTree CLI failed with exit code: $($process.ExitCode)"
    exit 1
}

# 2. Check Drive Capacity
$driveInfo = Get-PSDrive -Name $TargetDrive.TrimEnd(':')
$freePercent = ($driveInfo.Free / $driveInfo.Used + $driveInfo.Free) * 100
$freeGB = [Math]::Round($driveInfo.Free / 1GB, 2)
$totalGB = [Math]::Round(($driveInfo.Used + $driveInfo.Free) / 1GB, 2)

Write-Host "• Drive Capacity: $freeGB GB Free of $totalGB GB ($([Math]::Round($freePercent, 1))% Free)"

# 3. Parse Top Space Consuming Files
$csvData = Import-Csv -Path $ReportPath
$topFiles = $csvData | Where-Object { $_.Folders -eq "0" } | Select-Object -First 5

Write-Host "`nTop 5 Largest Files on $TargetDrive`:"
foreach ($file in $topFiles) {
    $sizeGB = [Math]::Round([double]$file.Size / 1GB, 2)
    Write-Host "• [$sizeGB GB] $($file.'File Name')"
}

# 4. Trigger Webhook Alert if Below Threshold
if ($freePercent -lt $ThresholdPercent -and $WebhookUrl -notlike "*YOUR_WEBHOOK*") {
    Write-Warning "Disk space below threshold ($ThresholdPercent%)! Dispatching alert webhook..."
    $payload = @{
        content = "🚨 **Storage Alert:** Drive $TargetDrive is low on space! ($freeGB GB / $totalGB GB available)."
    } | ConvertTo-Json

    Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json"
    Write-Host "✅ Alert notification sent."
}

# Clean temporary report
Remove-Item -Path $ReportPath -Force -ErrorAction SilentlyContinue
Write-Host "✅ Automated disk audit completed successfully."
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`Start-Process` Hangs on WizTree CLI** | WizTree GUI prompt appeared due to missing or malformed CLI arguments. | Verify arguments syntax: use `/export="path.csv"` and `/admin=1` without extraneous spaces. |
| **`Import-Csv` Throws `Out of Memory`** | Exported CSV file for drives with millions of files exceeds 500MB. | Use PowerShell streaming parser (`Get-Content $ReportPath | ConvertFrom-Csv`) or use `/filter` to limit file counts. |
| **Scheduled Task Fails with `0x1` Exit Code** | Scheduled task configured without "Run with highest privileges" option. | In Task Scheduler $\rightarrow$ Task Properties $\rightarrow$ Check **Run with highest privileges** to allow MFT reading. |
| **`/dumpmft` Generates Empty 0-Byte File** | Target drive volume is formatted with ReFS or FAT32 which do not contain an NTFS `$MFT`. | Verify filesystem type: `/dumpmft` is only supported on NTFS formatted partitions. |

---

## Command Line Syntax & Scheduled Automation

```bash
# Register Daily Storage Audit in Windows Task Scheduler via PowerShell
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File C:\Scripts\Invoke-WizTreeAudit.ps1"
$Trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -TaskName "DailyDiskAudit" -Action $Action -Trigger $Trigger -User "NT AUTHORITY\SYSTEM" -RunLevel Highest
```

### Essential File Locations
- **Application Binary**: `C:\Program Files\WizTree\wiztree64.exe`
- **Settings Store**: `%APPDATA%\WizTree\WizTree.ini`

---

## Agent Operational Directive
> **MANDATORY**: When scheduling automated WizTree storage audits via Windows Task Scheduler, always configure the task to run under `NT AUTHORITY\SYSTEM` with `RunLevel Highest` to enable unhindered MFT volume reading.
