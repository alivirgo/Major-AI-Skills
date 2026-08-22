---
title: "OrbStack macOS Fast Docker & Linux VM Runtime AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize OrbStack, orb CLI scripting, Docker Buildx multi-arch compilation, and Linux VM automation."
category: "Fast Docker & Linux VM Runtime"
tags: ["orbstack", "docker-engine", "orb-cli", "docker-buildx", "gpt-codex", "vm-automation"]
---

# OrbStack macOS Fast Docker & Linux VM Runtime AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
OrbStack provides scriptable container orchestration through its native Docker API engine, the **`orb` CLI toolkit**, and full support for **Docker Buildx (Multi-Arch Engine)**. GPT/Codex acts as a Principal DevOps Automation Engineer and Infrastructure Developer, delivering **automated `orb` provisioning scripts**, **cross-platform Docker Buildx pipelines**, **Linux VM environment bootstrap scripts**, and **local Kubernetes cluster setups**.

### Developer Architecture & Container Pipeline Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 OrbStack Developer Platform                 │
│                                                             │
│  CLI & Orchestration Tier                                   │
│  ├── `orb` Command-Line Tool (Machine Lifecycles & Shells)  │
│  ├── Docker CLI & `docker-compose` Engine                   │
│  └── Lightweight Kubernetes (`k8s`) Multi-Node Cluster      │
│                                                             │
│  Build & Multi-Architecture Pipeline                        │
│  ├── Docker Buildx (Native `linux/arm64` + Rosetta `x86_64`) │
│  ├── Multi-Stage Container Image Caching & Layer Sharing    │
│  └── Automated SSH Key Ingestion for Micro-VMs              │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **`orb` CLI Scripting & Automation**: Construct bash and Python automation scripts utilizing `orb create`, `orb run`, `orb push`, and `orb delete` to spin up ephemeral CI/CD runners.
2. **Docker Buildx Multi-Arch Automation**: Configure Docker Buildx builders targeting `linux/amd64` and `linux/arm64` simultaneously with Rosetta 2 acceleration.
3. **Automated Linux VM Bootstrapping**: Script cloud-init / bash bootstrap sequences installing toolchains (Rust, Node.js, Python, Clang) inside fresh OrbStack micro-VMs.
4. **Local Kubernetes Automation**: Initialize and manage lightweight single-node Kubernetes clusters via OrbStack's embedded k8s engine.

---

## Production Bash Automation: Automated Ephemeral Micro-VM Test Runner (`orb`)

Save this script as `run_ephemeral_test.sh` to spin up a clean Ubuntu micro-VM, execute integration tests, and tear down the VM:

```bash
#!/usr/bin/env bash
# ==============================================================================
# OrbStack Ephemeral CI Test Runner
# Creates a disposable Linux micro-VM, executes a test suite, and tears it down.
# ==============================================================================
set -euo pipefail

TEST_VM="test-runner-$(date +%s)"
DISTRO="ubuntu:24.04"

echo "--- [SPINNING UP EPHEMERAL VM: $TEST_VM] ---"
orb create "$DISTRO" "$TEST_VM"

cleanup() {
    echo -e "\n--- [TEARING DOWN EPHEMERAL VM: $TEST_VM] ---"
    orb delete --force "$TEST_VM"
    echo "✅ VM destroyed cleanly."
}
trap cleanup EXIT

# 1. Update Package Repositories inside VM
echo "Step 1: Updating packages inside VM..."
orb -m "$TEST_VM" sudo apt-get update -qq
orb -m "$TEST_VM" sudo apt-get install -y -qq build-essential git python3 python3-pip

# 2. Run Test Script
echo "Step 2: Executing Python test suite inside clean Linux environment..."
orb -m "$TEST_VM" python3 -c "
import platform, sys
print('Architecture inside VM:', platform.machine())
print('OS Release inside VM:  ', platform.version())
print('Python Version:        ', sys.version)
assert platform.system() == 'Linux', 'Test failed: Not running on Linux!'
print('✅ Test passed successfully inside OrbStack micro-VM!')
"

echo "Execution completed."
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`orb create` Fails: `Distribution not found`** | Distro identifier misspelled or unsupported release tag. | List valid distribution tags: `orb list --available` (e.g. `ubuntu:24.04`, `archlinux`, `debian:12`, `alpine`). |
| **Docker Buildx Hangs on Multi-Platform Builds** | Builder instance attempting QEMU emulation rather than native OrbStack Rosetta engine. | In OrbStack Settings $\rightarrow$ Ensure Rosetta is enabled $\rightarrow$ Run `docker buildx create --use --driver docker-container`. |
| **`orb push` File Transfer Fails with Permission Denied** | Target directory in VM is owned by `root` while pushing as default user. | Target user home directory: `orb push file.txt $TEST_VM:~/file.txt`. |
| **Kubernetes `kubectl` Cannot Connect to Cluster** | OrbStack Kubernetes engine disabled or kubeconfig context set to remote cluster. | 1. In OrbStack Settings $\rightarrow$ **Kubernetes**, toggle Enable.<br>2. In terminal, run: `kubectl config use-context orbstack`. |

---

## Command Line Syntax & Batch Processing

```bash
# 1. Build Multi-Architecture Container Images via Buildx
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest --push .

# 2. Push File to OrbStack VM
orb push config.env dev-box:/etc/app/config.env

# 3. Enable OrbStack Kubernetes Engine Context
kubectl config use-context orbstack
```

### Essential File Locations
- **OrbStack CLI Binary**: `/usr/local/bin/orb`
- **Docker Context Config**: `~/.docker/config.json`

---

## Agent Operational Directive
> **MANDATORY**: For automated testing workflows, ensure trap handlers (`trap cleanup EXIT`) are registered in bash scripts to guarantee ephemeral `orb` micro-VMs are destroyed upon script termination or unexpected errors.
