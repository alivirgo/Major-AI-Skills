---
title: "Rclone Cloud Storage Engine AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Rclone RC API, systemd daemon units, programmatic transfers, and JSON-RPC control."
category: "Cloud Storage Sync & Mount Utility"
tags: ["rclone", "rclone-rc", "json-rpc", "gpt-codex", "systemd-mount", "cloud-automation"]
---

# Rclone Cloud Storage Engine AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Rclone exposes a comprehensive JSON-RPC / REST API via its **Remote Control (`rc`)** engine, allowing external Python, Go, and Node.js microservices to dynamically control mounts, start asynchronous transfer jobs, and query transfer metrics. GPT/Codex acts as a Principal Cloud Storage Automation Engineer, delivering **Rclone JSON-RPC automation scripts**, **production `systemd` / Windows Service mount definitions**, **dynamic `rclone.conf` generators**, and **disaster recovery pipelines**.

### Developer Platform & RC API Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Rclone Remote Control Stack                 │
│                                                             │
│  Client Integration Layer                                   │
│  ├── Python / Node.js HTTP REST & JSON-RPC Client           │
│  ├── Core Methods (`sync/sync`, `operations/copyfile`)      │
│  └── Job Management (`job/status`, `job/stop`)              │
│                                                             │
│  Engine & Daemon Lifecycle                                  │
│  ├── Standalone Daemon Process (`rclone rcd`)               │
│  ├── Systemd Unit & Windows NSSM Service Management         │
│  └── Dynamic Remote Instantiation on the Fly               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Rclone JSON-RPC API Automation**: Author Python scripts interacting with Rclone's HTTP endpoint (`http://localhost:5572/core/stats`, `sync/sync`, `mount/mount`) with authenticated JSON payloads.
2. **Production Systemd Service Generation**: Build robust Linux `systemd` service units for persistent, auto-restarting FUSE cloud mounts with proper network-online dependency chaining.
3. **Dynamic Remote Injection**: Configure remotes dynamically at runtime via the `config/create` API endpoint without editing static configuration files on disk.
4. **Bandwidth Scheduling & Throttling**: Script automated bandwidth limit transitions (e.g. 10MB/s during work hours, unlimited at night) using `core/bwlimit`.

---

## Production Python Automation: Rclone JSON-RPC Client & Job Monitor

Save this script as `rclone_rpc_client.py` to trigger and monitor asynchronous sync jobs via Rclone's Remote Control daemon:

```python
"""
Rclone Remote Control (RC) Python API Client
Triggers asynchronous transfer jobs and tracks real-time progress via JSON-RPC.
"""

import sys
import time
import requests

RCLONE_RC_URL = "http://127.0.0.1:5572"
AUTH = ("admin", "secretpassword")

def trigger_async_sync(src: str, dst: str) -> int:
    payload = {
        "srcFs": src,
        "dstFs": dst,
        "_async": True # Runs job asynchronously and returns job ID
    }
    
    response = requests.post(f"{RCLONE_RC_URL}/sync/sync", json=payload, auth=AUTH)
    response.raise_for_status()
    job_id = response.json().get("jobid")
    print(f"Dispatched Async Sync Job -> ID: {job_id}")
    return job_id

def monitor_job(job_id: int):
    while True:
        res = requests.post(f"{RCLONE_RC_URL}/job/status", json={"jobid": job_id}, auth=AUTH)
        res.raise_for_status()
        data = res.json()

        finished = data.get("finished", False)
        success = data.get("success", False)
        error = data.get("error", "")

        # Fetch current transfer stats
        stats_res = requests.post(f"{RCLONE_RC_URL}/core/stats", auth=AUTH)
        if stats_res.status_code == 200:
            stats = stats_res.json()
            bytes_transferred = stats.get("bytes", 0) / (1024 * 1024)
            speed = stats.get("speed", 0) / (1024 * 1024)
            print(f"[STATUS] Transferred: {bytes_transferred:.2f} MB | Speed: {speed:.2f} MB/s")

        if finished:
            if success:
                print("Job finished successfully!")
            else:
                print(f"Job failed with error: {error}")
            break

        time.sleep(2)

if __name__ == "__main__":
    # Ensure Rclone is running: rclone rcd --rc-user admin --rc-pass secretpassword
    job = trigger_async_sync("local_data:/var/backups", "s3_remote:enterprise-backups")
    monitor_job(job)
```

---

## Production Systemd Unit: Persistent Cloud Storage Mount

Save this unit file as `/etc/systemd/system/rclone-mount.service`:

```ini
[Unit]
Description=Rclone Persistent Cloud Storage FUSE Mount
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=root
ExecStart=/usr/bin/rclone mount remote_s3:production-bucket /mnt/cloud_data \
    --config=/root/.config/rclone/rclone.conf \
    --vfs-cache-mode=full \
    --vfs-cache-max-size=50G \
    --vfs-cache-max-age=24h \
    --vfs-read-chunk-size=32M \
    --buffer-size=64M \
    --allow-other \
    --log-file=/var/log/rclone-mount.log \
    --log-level=INFO
ExecStop=/bin/fusermount -u -z /mnt/cloud_data
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`fusermount: entry for /mnt not found in /etc/mtab`** | Previous mount process crashed leaving an un-cleared broken FUSE inode. | 1. Force unmount: `fusermount -uz /mnt/cloud_data` or `umount -l /mnt/cloud_data`.<br>2. Kill lingering rclone PID: `pkill -9 rclone`.<br>3. Restart systemd mount service. |
| **JSON-RPC Error: `401 Unauthorized` on RC API** | Missing or incorrect HTTP Basic Auth credentials in API request payload. | Pass valid credentials configured during daemon launch (`--rc-user` and `--rc-pass`). |
| **`Failed to copy: s3 upload failed: RequestTimeTooSkewed`** | Host system clock drifted from AWS NTP servers by $>15$ minutes. | 1. Synchronize system clock: `chronyd -q 'server pool.ntp.org iburst'`.<br>2. Enable automated time sync via `timedatectl set-ntp true`. |
| **Disk Space Exhaustion in `/tmp` during Large Sync** | Rclone buffering large files to OS `/tmp` partition instead of dedicated cache path. | Specify explicit cache directory: `--cache-dir /data/rclone_cache --vfs-cache-mode full`. |

---

## Command Line Syntax & Batch Processing

```bash
# Launch Rclone Remote Control Daemon with Authentication
rclone rcd --rc-addr 127.0.0.1:5572 --rc-user admin --rc-pass secretpassword

# Change Bandwidth Limit on the Fly via RC CLI
rclone rc core/bwlimit rate=10M
```

---

## Agent Operational Directive
> **MANDATORY**: When configuring background systemd mounts for production servers, include `fusermount -u -z <mount_point>` in `ExecStop` to ensure clean unmounting. Always specify `--vfs-cache-mode full` for multi-application compatibility.
