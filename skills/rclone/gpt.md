---
title: "Rclone Cloud Storage AI Skill Guide (GPT & Codex)"
description: "Generate rclone sync/copy jobs, mount units, and CI dry-run gates—preferring copy/backup-dir over unsafe sync and never inventing cloud keys."
category: "Cloud Transfer & Mount Automation"
tags: ["rclone", "sync", "s3", "vfs", "gpt-codex"]
---

# Rclone Cloud Storage AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Transfer Pipeline Engineer**: emit **systemd timers**, **wrapper scripts with CONFIRM_SYNC**, **mount service files** with explicit VFS mode, and **CI linters** that reject bare `rclone sync` without `--dry-run` or `--backup-dir`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Rclone automation                           │
│  remotes via rclone.conf / env → copy|sync wrappers         │
│  dry-run gate → backup-dir → checksum check                 │
│  mount: vfs-cache-mode full + sized cache-dir               │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Default wrappers to `copy`** unless the user explicitly wants dest deletions via `sync`.
2. **Any generated `sync` must include** `--dry-run` path or `--backup-dir`.
3. **Mount units always set** `--vfs-cache-mode full` (or document why `writes`/`off`).
4. **Credentials**: reference `AWS_PROFILE` / instance role / `RCLONE_CONFIG`—never invent access key IDs.
5. **Warn hard on bisync** templates; require `--resync --dry-run` first comments.

---

## Production Python: sync must mention dry-run or backup-dir

```python
"""Fail CI if shell scripts call rclone sync without safety flags nearby."""
from __future__ import annotations

import re
import sys
from pathlib import Path

SYNC = re.compile(r"rclone\s+sync\b")
SAFE = re.compile(r"(--dry-run|--interactive|-i\b|--backup-dir\b)")


def main(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if not SYNC.search(text):
        print("no rclone sync")
        return
    # naive: require safety token somewhere in file when sync present
    if not SAFE.search(text):
        print(f"{path}: rclone sync without --dry-run/--backup-dir/--interactive")
        raise SystemExit(1)
    print("sync safety tokens present")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Fix |
| :--- | :--- | :--- |
| Cron deleted cloud files | sync without dry-run | Gate + backup-dir |
| Mount unit fails app writes | vfs off | full/writes |
| GDrive 403 in CI | shared client | custom OAuth client fields |
| Keys in logs | -vv secrets | reduce log level; redact |

---

## Agent Operational Directive

> **MANDATORY**: Treat sync as destructive; automate dry-run/backup-dir. Set explicit VFS cache on mounts. Never invent cloud credentials.
