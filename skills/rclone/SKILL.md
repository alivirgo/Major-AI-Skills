---
name: rclone
description: "Sync, copy, check, crypt, and mount cloud remotes with rclone; prefer dry-run before sync deletions; tune VFS cache and avoid bisync lockouts."
category: cross-platform
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["rclone", "s3", "cloud-storage", "sync", "vfs", "crypt", "bisync"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Rclone Cloud Storage AI Skill Guide (Claude)

## Overview & Engine Architecture

Rclone is a **unified CLI** for object stores and consumer clouds (S3, GCS, Azure Blob, B2, Drive, OneDrive, SFTP, WebDAV, local). **`copy`** adds/updates without deleting dest; **`sync`** makes dest match source **including deletions**. **`mount`** exposes a FUSE/WinFsp filesystem with optional **VFS cache**. **`crypt`** wraps another remote with client-side encryption. Agents must treat `sync` as destructive, always offer `--dry-run`, keep credentials in `rclone.conf`/env (never invent access keys), and pick VFS cache mode for the workload.

```
┌─────────────────────────────────────────────────────────────┐
│                 Rclone data paths                           │
│                                                             │
│  Remotes (backend drivers)                                  │
│  ├── Object: s3 / gcs / azureblob / b2                       │
│  ├── Consumer: drive / onedrive / dropbox                   │
│  └── Protocol: sftp / webdav / local                        │
│                                                             │
│  Commands                                                   │
│  ├── copy / sync / check / bisync                           │
│  ├── mount (+ VFS cache modes)                              │
│  └── crypt overlay → encrypted names/payloads               │
│                                                             │
│  Config: ~/.config/rclone/rclone.conf (or RCLONE_CONFIG)    │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Migrating or backing up trees to object storage with checksums and retries.
- Mounting a bucket for media/tools that need a filesystem path (with VFS cache).
- Client-side encrypting backups before third-party cloud.

**Do not use when**

- You need a full backup product with catalogs, retention UI, and bare-metal restore workflows (use dedicated backup stacks; rclone can still be the transport).
- Bidirectional sync of active databases / lock files → not `bisync`’s job; use app-native replication.
- Someone asks to paste cloud access keys into the skill output → refuse; use env/`rclone config` / IAM roles (`@aws-cli`, `@vault`).

---

## Operational Capabilities & Agent Directives

1. **`--dry-run` (or `--interactive`) before any `sync`** that can delete; prefer `copy` when history on dest must remain.
2. **Safety net**: `--backup-dir remote:trash/$(date +%F)` on sync to quarantine deletes.
3. **Mounts**: default VFS `off` cannot do many read/write patterns—use `--vfs-cache-mode full` (or at least `writes`) for apps; avoid FAT/exFAT for cache dirs (no sparse files).
4. **Concurrency**: tune `--transfers` / `--checkers` against API quotas; custom OAuth client for Google Drive when hitting shared-client 403s.
5. **Integrity**: `rclone check` / `--checksum` where backends support hashes; do not assume Drive hash parity equals S3 ETag semantics.
6. **bisync is advanced**: first `--resync --dry-run -v`; critical errors lock future runs until resync—do not treat as casual Dropbox replacement.
7. **Secrets**: document `RCLONE_CONFIG_PASS` / obscured passwords; never invent AWS keys in examples—use `AWS_PROFILE` / instance role language.

---

## Production Example: nightly sync with dry-run gate

```bash
#!/usr/bin/env bash
set -euo pipefail

SOURCE="${SOURCE_DIR:-/var/backups/app}"
DEST="${RCLONE_DEST:-s3backup:prod-backups/app}"   # remote:bucket/path from rclone.conf
LOG="${LOG_FILE:-/var/log/rclone-app-backup.log}"
CONF="${RCLONE_CONFIG:-$HOME/.config/rclone/rclone.conf}"

common=(
  --config "$CONF"
  --transfers 8 --checkers 16
  --fast-list
  --retries 5 --low-level-retries 10
  --bwlimit "${BW_LIMIT:-0}"
  --exclude ".git/**" --exclude "*.tmp"
  --log-file "$LOG" --log-level INFO --stats 1m
)

# Preview deletions/changes
rclone sync "$SOURCE" "$DEST" "${common[@]}" --dry-run -v

# Operator gate in interactive use; in cron, require CONFIRM_SYNC=1
if [[ "${CONFIRM_SYNC:-}" != "1" ]]; then
  echo "Set CONFIRM_SYNC=1 after reviewing dry-run" >&2
  exit 2
fi

rclone sync "$SOURCE" "$DEST" "${common[@]}" \
  --backup-dir "${DEST}-trash/$(date +%F)"
```

Mount recipe (Linux):

```bash
rclone mount s3backup:prod-media /mnt/media \
  --vfs-cache-mode full \
  --vfs-cache-max-size 40G \
  --dir-cache-time 72h \
  --allow-other \
  --daemon
```

Crypt overlay (password via `rclone config` / obscured—do not hardcode):

```text
[cryptbackup]
type = crypt
remote = s3backup:encrypted-bucket
filename_encryption = standard
directory_name_encryption = true
# password / password2 set via rclone config (obscured)
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Unexpected remote deletes after `sync` | `sync` mirrors source deletions | Restore from versioning/`--backup-dir`; switch to `copy`; always dry-run first |
| Google Drive `403` rate / user rate limit | Shared rclone OAuth client quota | Create project OAuth client; set `client_id`/`client_secret` on remote |
| Mount: cannot open R/W, seek fails | `--vfs-cache-mode off` (default) | Use `full` or `writes`; size `--vfs-cache-max-size` |
| Mount ERROR about sparse files | Cache on FAT/exFAT | Move `--cache-dir` to ext4/NTFS/APFS |
| S3 multipart `RequestTimeout` | Large object / slow link | Raise `--s3-chunk-size`, `--timeout`, low-level retries; `rclone cleanup` aborted uploads |
| bisync refuses to run / `.lst-err` | Prior critical error lockout | Inspect listings; `--resync --dry-run -v` then careful resync |
| `check` mismatches | Backend hash differences / modified during copy | Re-copy; use size+modtime compare; freeze writers during backup |

---

## Best Practices

1. Separate remotes per environment (`s3-prod`, `s3-scratch`); never point prod sync at a test bucket by typo—use distinct names.
2. Prefer IAM roles / short-lived tokens over long-lived keys in CI (`@github-actions`, `@aws-cli`).
3. Log to files with `--stats`; alert on non-zero exit in systemd timers.
4. For huge trees, `--fast-list` where supported; watch memory.
5. Document excludes (caches, DB files) so sync does not corrupt live databases.

---

## Limitations

- Mount is not a substitute for block storage or POSIX-perfect locks; databases on `rclone mount` are high risk.
- Consumer clouds have API quirks (path length, modification time precision, versions).
- `bisync` can lose data if misused; official docs stress dry-run and recovery discipline.
- Stop and ask for remote type, whether deletes are allowed, and credential injection method.

---

## Related Skills

- `@aws-cli` — S3 IAM, bucket policies, lifecycle alongside rclone
- `@vault` — store remote credentials / config passphrases
- `@github-actions` — scheduled sync jobs with OIDC cloud auth
- `@docker` — sidecar transfer jobs with mounted config
- `@ansible` — distribute rclone.conf securely to backup hosts

---

## Agent Operational Directive

> **MANDATORY**: Treat `rclone sync` as destructive—require `--dry-run` (or interactive confirmation) and prefer `--backup-dir` or `copy` when unsure. For mounts, set an explicit `--vfs-cache-mode` appropriate to the app (`full` for general R/W). Never invent cloud access keys. Escalate before recommending bisync on production trees.

---

## Source anchors (research)

- [rclone sync](https://rclone.org/commands/rclone_sync/)
- [rclone copy](https://rclone.org/commands/rclone_copy/)
- [rclone mount / VFS cache modes](https://rclone.org/commands/rclone_mount/)
- [Bisync](https://rclone.org/bisync/)
- [rclone docs (flags including --dry-run)](https://rclone.org/docs/)
