---
title: "HashiCorp Packer AI Skill Guide (GPT & Codex)"
description: "Generate HCL2 Packer templates, init/validate/build CI steps, and manifest consumers—pinning base images and never baking long-lived credentials."
category: "Immutable Image Automation"
tags: ["packer", "hcl2", "ami", "gpt-codex", "ci"]
---

# HashiCorp Packer AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **Image Pipeline Engineer**: emit **`*.pkr.hcl`**, **GitHub Actions** with `packer init/validate/build`, **manifest.json** parsers for Terraform vars, and **guards** against embedding secrets in provisioners.

```
┌─────────────────────────────────────────────────────────────┐
│                 Packer CI stack                             │
│  packer init → fmt → validate → build -on-error=cleanup     │
│  manifest.json → AmiId output → IaC                         │
│  OIDC cloud role (no static keys in image)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Scaffold required_plugins + `packer init`** in every new template PR.
2. **Name AMIs with `git_sha`**; refuse `ami_name = "latest"` style collisions.
3. **Provisioner cleanup** block for cloud-init/ssh keys in generated templates.
4. **Prefer ansible provisioner** for complex config; keep shell short.
5. **Never write AWS secret keys into `inline` scripts**; document instance profile / CI OIDC.

---

## Production Python: require manifest post-processor

```python
"""Fail if amazon-ebs build lacks manifest post-processor."""
from __future__ import annotations

import re
import sys
from pathlib import Path

HAS_EBS = re.compile(r'source\s+"amazon-ebs"', re.M)
HAS_MANIFEST = re.compile(r'post-processor\s+"manifest"', re.M)


def main(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if HAS_EBS.search(text) and not HAS_MANIFEST.search(text):
        print(f"{path}: amazon-ebs build missing manifest post-processor")
        raise SystemExit(1)
    print("manifest check OK")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
```

---

## Technical Troubleshooting Matrix

| CI signature | Check | Fix |
| :--- | :--- | :--- |
| Plugin not found | Skipped init | `packer init .` |
| Validate passes, build IAM deny | Role perms | Document ec2/ami actions |
| Orphan packer SG | on-error abort | `-on-error=cleanup` |
| Secret in AMI | Provisioner env | Scrub + use roles |

---

## Agent Operational Directive

> **MANDATORY**: HCL2 with init/validate before build. Tag with git SHA; emit manifest. Never bake long-lived credentials. Prefer Docker for container apps.
