---
title: "Terraform Infrastructure as Code AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to scaffold modules, CI plan artifacts, moved-block refactors, and plan parsers that fail on unexpected destroys."
category: "Infrastructure as Code"
tags: ["terraform", "opentofu", "gpt-codex", "ci-plan", "moved-blocks"]
---

# Terraform Infrastructure as Code AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **IaC Automation Engineer**: generate **module skeletons**, **GitHub Actions plan/apply workflows**, **`moved` block patches**, and **plan scanners** that exit non-zero on destroy counts.

```
┌─────────────────────────────────────────────────────────────┐
│                 Terraform CI Pipeline                       │
│  fmt/validate → plan -out → upload artifact → review gate   │
│  apply job (environment protected) uses saved plan only       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Emit `moved` blocks** whenever renaming resources or nesting modules—never silent address changes.
2. **CI script**: parse `terraform show -json tfplan` for `actions: ["delete"]` on protected resource types.
3. **Pin provider versions** in generated `required_providers`.
4. **Never generate** `-lock=false` or `-auto-approve` on prod paths without explicit user gate.
5. **OpenTofu**: mirror commands when user specifies fork; keep backend blocks compatible.

---

## Production Python: plan destroy gate

```python
"""Fail CI if plan deletes protected resource types."""
from __future__ import annotations

import json
import sys
from pathlib import Path

PROTECTED = ("aws_db_instance", "aws_rds_cluster", "google_sql_database_instance")


def main(plan_json: Path) -> None:
    data = json.loads(plan_json.read_text(encoding="utf-8"))
    deletes = []
    for rc in data.get("resource_changes") or []:
        if "delete" not in (rc.get("change", {}).get("actions") or []):
            continue
        addr = rc.get("address", "")
        rtype = rc.get("type", "")
        if rtype in PROTECTED or any(p in addr for p in ("database", "rds", "sql")):
            deletes.append(addr)
    if deletes:
        print("Blocked deletes:", *deletes, sep="\n  ")
        raise SystemExit(1)
    print("Plan destroy gate OK")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
```

---

## Agent Operational Directive

> **MANDATORY**: Automate fmt/validate/plan in CI; block applies without saved plan artifact. Generate `moved` blocks for refactors. Scan plans for deletes on stateful types.
