---
title: "Ansible Configuration Management AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate idempotent playbooks, FQCN roles, requirements.yml pins, check/diff CI gates, and vault-safe variable layouts."
category: "Infrastructure Automation"
tags: ["ansible", "playbooks", "roles", "collections", "check-mode", "gpt-codex", "vault"]
---

# Ansible Configuration Management AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **Infrastructure Automation Engineer**: emit **FQCN playbooks**, **role scaffolds**, **pinned `requirements.yml`**, and **CI check/diff validators**—never plaintext secrets.

```
┌─────────────────────────────────────────────────────────────┐
│                 Ansible automation stack                    │
│  requirements.yml → galaxy install → syntax-check           │
│  playbook --check --diff → apply with serial                │
│  vaulted group_vars only (password via CI secret mount)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Generate roles with `tasks/`, `handlers/`, `templates/`, `defaults/`—not flat shell scripts.
2. Emit FQCN modules only; flag bare `shell:` without `changed_when`/`creates`.
3. Always include `requirements.yml` with version constraints alongside new collections.
4. Script CI: `ansible-playbook --syntax-check` then `--check --diff` against a non-prod inventory.
5. Never emit vault passwords, AWS keys, or `ansible_password` literals—use env / vault file paths.

---

## Production Python: always-changed shell auditor

```python
"""Fail CI if command/shell tasks lack idempotency guards."""
from __future__ import annotations

import sys
from pathlib import Path

import yaml

GUARDS = ("changed_when", "creates", "removes")


def tasks_from(node):
    if isinstance(node, dict):
        if "tasks" in node:
            yield from node["tasks"] or []
        for v in node.values():
            yield from tasks_from(v)
    elif isinstance(node, list):
        for item in node:
            yield from tasks_from(item)


def main(path: Path) -> None:
    doc = yaml.safe_load(path.read_text(encoding="utf-8"))
    bad = []
    for t in tasks_from(doc):
        if not isinstance(t, dict):
            continue
        uses = any(k in t for k in ("ansible.builtin.shell", "ansible.builtin.command", "shell", "command"))
        if uses and not any(g in t for g in GUARDS):
            bad.append(t.get("name", "<unnamed>"))
    if bad:
        print("missing idempotency guards:", bad)
        raise SystemExit(1)
    print("shell/command idempotency OK")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
```

---

## Technical Troubleshooting Matrix

| Signature | Automation check | Fix |
| :--- | :--- | :--- |
| Always-changed recap | Auditor lists task names | Add `changed_when` or switch module |
| Module missing in CI | Galaxy install step absent | Pin + install `requirements.yml` |
| Vault fail in pipeline | Password file not mounted | CI secret → `--vault-password-file` |
| Check mode false green | Registered-var when clauses | Document; add integration apply job |

---

## Agent Operational Directive

> **MANDATORY**: Emit FQCN, idempotent roles with handlers, pinned collections, and check/diff gates. Never hardcode vault passwords or cloud credentials.
