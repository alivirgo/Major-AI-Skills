---
title: "HashiCorp Vault Secrets AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate HCL policies, auth role snippets, and CI-safe Vault API scripts without secret literals."
category: "Secrets Management"
tags: ["vault", "gpt-codex", "policies", "approle", "kubernetes-auth"]
---

# HashiCorp Vault Secrets AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a **Secrets Platform Automation Engineer**: emit **policy HCL**, **terraform-vault resources**, **GitHub Actions login steps**, and **lease revoke scripts** parameterized by path prefixes.

---

## Operational Capabilities & Agent Directives

1. **Parameterize paths** (`var.environment`, `var.service`) in policies—no prod paths hardcoded in examples without placeholders.
2. **Generate `vault policy fmt` compatible HCL** with comments listing required capabilities.
3. **Never print** `-field=wrapping_token` results or example JWTs from real clusters.
4. **CI**: use AppRole with `token_ttl=10m` and secret_id from GitHub environment secret.

---

## Production bash: revoke prefix (incident)

```bash
#!/usr/bin/env bash
set -euo pipefail
PREFIX="${1:?lease prefix}"
vault lease revoke -prefix "$PREFIX"
```

---

## Agent Operational Directive

> **MANDATORY**: Automate policy formatting and path-parameterized templates. Refuse to embed live tokens in generated scripts.
