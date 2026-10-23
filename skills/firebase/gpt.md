---
title: "Firebase Platform AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate Firestore Security Rules, Emulator configs, custom-claims Functions, and index manifests without open rules or client service accounts."
category: "BaaS & Mobile Backend"
tags: ["firebase", "firestore", "security-rules", "emulator", "gpt-codex"]
---

# Firebase Platform AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Firebase Platform Engineer**: emit **deny-by-default Rules**, **`firebase.json` emulator ports**, **Admin SDK Functions**, and **`firestore.indexes.json`**—never service-account JSON in apps and never `allow read, write: if true` for production.

```
┌─────────────────────────────────────────────────────────────┐
│                 Firebase automation                         │
│  rules + indexes → emulator tests → deploy staging          │
│  Admin claims → client getIdToken(true)                     │
│  No FIREBASE_*_EMULATOR_HOST in prod env                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate Rules with ownership + shape validation; include admin claim helpers when roles exist.
2. Emit Emulator Suite config and CI test hooks; document that indexes must be verified on a real project.
3. Keep Admin SDK in Functions/server; clients only use public config.
4. After `setCustomUserClaims`, document forced token refresh.
5. Refuse to embed `GOOGLE_APPLICATION_CREDENTIALS` JSON contents in source—path via env only.

---

## Production Python: block open rules in CI

```python
"""Fail CI if firestore.rules contains open allow-all patterns."""
from __future__ import annotations

import re
import sys
from pathlib import Path

OPEN = re.compile(
    r"allow\s+(read|write|read,\s*write|write,\s*read)\s*:\s*if\s+true",
    re.I,
)


def main(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    if OPEN.search(text):
        print(f"open rules detected in {path}", file=sys.stderr)
        return 1
    print("firestore rules gate OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(Path(sys.argv[1] if len(sys.argv) > 1 else "firestore.rules")))
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Emulator OK, prod index error | Query in CI against real DB | Add composite index |
| Claim not applied | Token age | Force refresh in client |
| Emulator host in prod | Env scan | Fail deploy if set |
| FCM in local Functions | Messaging call | Gate with `FUNCTIONS_EMULATOR` / flag |

---

## Agent Operational Directive

> **MANDATORY**: Deny-by-default Rules; Admin SDK server-only; no invented service accounts. Validate indexes beyond the emulator. Never export auth emulator host into production.
