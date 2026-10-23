---
name: packer
description: "Build reproducible golden machine images with Packer HCL2: init/validate/build, pin source AMIs, provisioners, manifests, and cleanup on failure—without baking long-lived credentials."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["packer", "hashicorp", "ami", "hcl2", "golden-image", "immutable"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# HashiCorp Packer AI Skill Guide (Claude)

## Overview & Engine Architecture

Packer turns a declarative template into a **golden image**: a **builder** launches a temporary VM/container, **provisioners** install/configure software, then the result is snapshotted (AMI, Azure image, GCE image, etc.). Packer does **not** manage fleet drift after publish—consumers (`@terraform-aws`, `@pulumi`) launch from the artifact. Agents prefer **HCL2**, run `packer init` → `validate` → `build`, pin base images, emit manifests, clean temp resources on failure, and never bake long-lived cloud keys into images.

```
┌─────────────────────────────────────────────────────────────┐
│                 Packer build pipeline                       │
│                                                             │
│  *.pkr.hcl                                                  │
│  ├── packer { required_plugins }                            │
│  ├── source "amazon-ebs" / azure-arm / googlecompute / …    │
│  ├── build { provisioner shell|ansible|file }               │
│  ├── error-cleanup-provisioner (optional)                   │
│  └── post-processor manifest / compress                     │
│                                                             │
│  Runtime                                                    │
│  ├── Temp instance + SSH/WinRM                              │
│  ├── Snapshot → AMI / image artifact                        │
│  └── You own AMI lifecycle (delete old snaps)               │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Baking golden AMIs/VM images for ASGs / MIG / scale sets.
- Immutable baselines (agents, hardenings, runtimes) shared across many instances.
- Replacing snowflake `user-data` that grows unbounded.

**Do not use when**

- The workload is a container app—prefer `@docker` / OCI builds; Packer docker builder is a niche escape hatch.
- You only need one-off config on a single VM—use config management once, then graduate to images if scaled.
- Someone asks to embed AWS access keys or SSH private keys into the image → refuse; use instance roles / `@vault` at runtime.

---

## Operational Capabilities & Agent Directives

1. **HCL2 only** for new work (`*.pkr.hcl`); avoid legacy JSON unless migrating.
2. **Workflow**: `packer init .` → `packer fmt` → `packer validate` → `packer build` (CI must fail on validate errors).
3. **Pin bases**: prefer explicit `source_ami` / image ID, or `source_ami_filter` with **owners** + deterministic naming; record the resolved ID in the manifest.
4. **Secrets**: build with short-lived CI OIDC/roles; never `export AWS_SECRET_ACCESS_KEY=…` into provisioner scripts that land on disk.
5. **Cleanup**: default `-on-error=cleanup`; use `error-cleanup-provisioner` to unsubscribe/deregister side effects; lifecycle-delete old AMIs/snapshots yourself.
6. **Idempotent provisioners**; prefer `@ansible` for complex config; strip build SSH keys / cloud-init residue in a final cleanup script.
7. **Tag artifacts** with `git_sha`, `pipeline_id`, `build_time` for traceability.

---

## Production Example: amazon-ebs golden AMI

```hcl
packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.2.0"
    }
  }
}

variable "region" { type = string }
variable "git_sha" { type = string }

source "amazon-ebs" "ubuntu" {
  region        = var.region
  instance_type = "t3.small"
  ssh_username  = "ubuntu"
  ami_name      = "api-golden-${var.git_sha}"
  ami_regions   = [var.region]

  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"] # Canonical
    most_recent = true
  }

  tags = {
    Name       = "api-golden"
    git_sha    = var.git_sha
    managed_by = "packer"
  }
}

build {
  sources = ["source.amazon-ebs.ubuntu"]

  provisioner "shell" {
    inline = [
      "sudo apt-get update",
      "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx",
      "sudo systemctl enable nginx"
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo cloud-init clean --logs || true",
      "sudo rm -f /home/ubuntu/.ssh/authorized_keys"
    ]
  }

  post-processor "manifest" {
    output     = "manifest.json"
    strip_path = true
  }
}
```

CLI / CI loop:

```bash
packer init .
packer fmt -check .
packer validate -var region=us-east-1 -var git_sha="$(git rev-parse --short HEAD)" .
packer build -on-error=cleanup \
  -var region=us-east-1 \
  -var git_sha="$(git rev-parse --short HEAD)" .
# Consume artifact_id from manifest.json in Terraform/Pulumi
```

### Builder comparison

| Builder | Artifact | Notes |
| :--- | :--- | :--- |
| amazon-ebs | AMI | IAM to create images; you delete old AMIs |
| azure-arm | Managed image / Gallery | SP or managed identity |
| googlecompute | GCE image | GCP credentials / WIF |
| docker | OCI image | Prefer native Docker for apps |

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `packer validate` fails on plugin | Missing `packer init` / wrong required_plugins | `packer init`; pin plugin versions |
| SSH timeout to builder instance | SG/NACL, wrong `ssh_username`, public IP/subnet | Align network + username with base AMI; check temp SG rules |
| Build fails mid-provision; orphan resources | Abort without cleanup | `packer build -on-error=cleanup`; search for `packer` prefixed SG/keypairs |
| AMI exists but next build name collision | Duplicate `ami_name` | Include git SHA/timestamp; or `-force` when intentional replace |
| Image boots broken / no SSH | Cleanup removed needed keys; wrong cloud-init | Keep bootstrap user; inject runtime keys via cloud-init/SSM |
| Slow flaky apt/yum | Network/rate limits in builder VPC | Retry (`max_retries`), local mirrors, longer `timeout` |
| Credentials in image history | Env/files left by provisioner | Audit final image; use roles; scrub `/tmp` and shell history |

---

## Best Practices

1. Build in CI with ephemeral credentials; promote AMI IDs via manifest artifacts.
2. Scan filesystem / AMI with `@trivy` (or equivalent) before marking golden.
3. Keep provisioner scripts in-repo; avoid curling unsigned installers without checksums.
4. Separate “base OS harden” image from “app layer” image when rebuild frequency differs.
5. Document required IAM permissions for the builder role (ec2 run, ami register, etc.).

---

## Limitations

- Packer publishes images; it does not roll instances—pair with ASG instance refresh / IaC.
- Long shell provisioners are slow and brittle—layer thoughtfully.
- Spot/capacity and API throttling can flake builders—retry at pipeline level.
- Stop and ask for cloud account, region, base image policy, and how AMI IDs are consumed downstream.

---

## Related Skills

- `@terraform-aws` / `@pulumi` — launch ASGs from Packer AMI IDs
- `@ansible` — richer provisioners than inline shell
- `@docker` — prefer for container workloads
- `@trivy` — vulnerability gate before promotion
- `@github-actions` — OIDC build pipeline for Packer
- `@aws-cli` — describe/deregister old AMIs and snapshots

---

## Agent Operational Directive

> **MANDATORY**: Use HCL2 with `init` + `validate` before `build`. Pin or owner-filter base images; tag with git SHA; emit `manifest.json` for IaC. Never bake long-lived credentials into images. Prefer `-on-error=cleanup` and explicit AMI lifecycle. Prefer Docker for app containers unless a VM image is explicitly required.

---

## Source anchors (research)

- [packer validate](https://developer.hashicorp.com/packer/docs/commands/validate)
- [packer build / -on-error](https://developer.hashicorp.com/packer/docs/commands/build)
- [amazon-ebs builder](https://developer.hashicorp.com/packer/integrations/hashicorp/amazon/latest/components/builder/ebs)
- [provisioner / error-cleanup-provisioner](https://developer.hashicorp.com/packer/docs/templates/hcl_templates/blocks/build/provisioner)
