---
name: ansible
description: "Write idempotent Ansible playbooks, FQCN modules, roles, and inventories; gate prod with check/diff, pin collections, and keep ansible-vault secrets out of Git and chat."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["ansible", "playbooks", "roles", "collections", "vault", "check-mode", "idempotency", "inventory"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Ansible Configuration Management AI Skill Guide (Claude)

## Overview & Engine Architecture

Ansible pushes **desired state** to hosts (SSH, WinRM, or cloud APIs) via **playbooks** and **roles**. Controllers assemble inventory + vars, then run modules that converge without requiring agents on targets. Production quality means **idempotent modules** (not raw shell), **FQCN** (`ansible.builtin.*`), **pinned collections**, and **vaulted secrets**. Treat `--check --diff` as a pre-flight gate; never invent vault passwords or cloud credentials.

```
┌─────────────────────────────────────────────────────────────┐
│                 Ansible control → managed nodes             │
│                                                             │
│  Inventory (static / dynamic) + group_vars / host_vars      │
│  ├── Environment split: inventories/{dev,staging,prod}      │
│  └── Vaulted secrets (never plaintext in Git)               │
│                                                             │
│  Playbook → roles (tasks / handlers / templates / defaults) │
│  ├── Modules (FQCN) > command/shell                         │
│  ├── Handlers fire only on changed                          │
│  └── serial / max_fail_percentage for rolling risk          │
│                                                             │
│  Targets: Linux SSH | Windows WinRM | cloud modules         │
│  Optional: AWX / Execution Environments for fleet scale     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Bootstrapping packages, users, services, and configs on VMs/bare metal.
- Writing reusable roles and collections for app deploy glue after `@terraform` provisions hosts.
- Encrypting secrets with ansible-vault; dry-running with `--check --diff`.

**Do not use when**

- You need multi-node scheduling, rolling Deployments, or cluster RBAC as the primary model → `@kubernetes` / `@helm`.
- Image build / local multi-container graphs are the unit of delivery → `@docker` (Ansible may only provision the host).
- Someone asks to commit vault passwords, cloud keys, or plaintext `group_vars` secrets → refuse; use vault + CI secret mounts.

---

## Operational Capabilities & Agent Directives

1. **Prefer modules over shell**: `ansible.builtin.package`, `copy`, `template`, `service`, `user`, `lineinfile`. Use `command`/`shell` only when no module exists—and add `creates`/`removes` or honest `changed_when`.
2. **Always use FQCN** (`ansible.builtin.template`) so collection resolution is explicit and lintable.
3. **Handlers for restarts**: `notify` only on real `changed`; never restart on every run via always-`changed` shell.
4. **Prod gate**: `ansible-playbook -i inventories/prod site.yml --check --diff` (limit one host when diffs are large) before live apply.
5. **Pin collections** in `requirements.yml` with versions; install via `ansible-galaxy collection install -r requirements.yml`.
6. **Split inventories** by environment; never point ad-hoc `--limit` at prod without explicit user confirmation.
7. **Vault secrets only**: encrypt `group_vars/*/vault.yml`; never put vault passwords in the repo, chat, or playbook defaults.
8. **Rolling risk**: set `serial` and `max_fail_percentage` on fleet-wide service flips.

---

## Production Example: role + inventory + check gate

`inventories/prod/hosts.yml`:

```yaml
all:
  children:
    web:
      hosts:
        web-01.example.com:
        web-02.example.com:
  vars:
    ansible_user: deploy
    ansible_become: true
```

`requirements.yml`:

```yaml
---
collections:
  - name: community.general
    version: ">=8.0.0,<10.0.0"
  - name: ansible.posix
    version: ">=1.5.0,<2.0.0"
```

`site.yml`:

```yaml
---
- name: Configure web hosts
  hosts: web
  become: true
  serial: 1
  max_fail_percentage: 25
  roles:
    - role: common
    - role: nginx
      vars:
        nginx_worker_processes: auto
```

`roles/nginx/tasks/main.yml`:

```yaml
---
- name: Ensure nginx is installed
  ansible.builtin.package:
    name: nginx
    state: present

- name: Deploy nginx site config
  ansible.builtin.template:
    src: site.conf.j2
    dest: /etc/nginx/sites-available/app.conf
    mode: "0644"
  notify: Reload nginx

- name: Enable site
  ansible.builtin.file:
    src: /etc/nginx/sites-available/app.conf
    dest: /etc/nginx/sites-enabled/app.conf
    state: link
  notify: Reload nginx

# Last resort when no module exists — make reporting honest
- name: Probe nginx config (read-only)
  ansible.builtin.command: nginx -t
  register: nginx_test
  changed_when: false
  failed_when: nginx_test.rc != 0
```

`roles/nginx/handlers/main.yml`:

```yaml
---
- name: Reload nginx
  ansible.builtin.service:
    name: nginx
    state: reloaded
```

Validation loop:

```bash
ansible-galaxy collection install -r requirements.yml
ansible-inventory -i inventories/prod --list
ansible-playbook -i inventories/prod site.yml --syntax-check
ansible-playbook -i inventories/prod site.yml --check --diff --limit web-01.example.com
ansible-vault encrypt group_vars/prod/vault.yml   # once; password via --vault-password-file (gitignored)
ansible-playbook -i inventories/prod site.yml --ask-vault-pass
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| `UNREACHABLE!` / SSH timeout | Key, bastion, or `ProxyJump` missing | `-vvv`; fix `ansible_ssh_common_args` / inventory vars |
| `changed=` on every run | `shell`/`command` without `changed_when`/`creates` | Switch to module or add honest idempotency guards |
| Handler restarts every run | Probe task reports `changed` | `changed_when: false` on read-only tasks |
| Template wrong / empty | Undefined var or wrong host/group_vars | `ansible-inventory --host H`; add `defaults/main.yml` |
| Check mode misses later tasks | Conditionals depend on registered live results | Document check-mode limits; use `check_mode: false` only when justified |
| Vault decrypt fail | Wrong password / vault-id | Confirm `--vault-id` and encrypted file set |
| Module not found | Collection not installed / unpinned | `ansible-galaxy collection install -r requirements.yml` |
| Partial fleet outage after apply | No `serial` / fail budget | Add `serial` + `max_fail_percentage`; tag rollback tasks |

---

## Best Practices

1. Name every task; use tags (`--tags`) for incident partial runs.
2. Put secrets in vaulted files; reference with `{{ vault_db_password }}`—never literal credentials in examples.
3. Prefer Execution Environments / AWX for shared controller consistency on large fleets.
4. Pair with `@terraform` (provision) then Ansible (configure); avoid duplicating cloud resource creation in both.
5. Lint with `ansible-lint`; treat `no-changed-when` failures as real bugs.
6. Document required `become` and network access (bastion) in the role README.

---

## Limitations

- Check mode is a simulation: modules without check support no-op; registered-var conditionals may skip falsely.
- Windows and network devices need specialized collections and remoting (`ansible.windows`, vendor collections).
- Extremely large fleets need AWX/Tower or EE pipelines—raw laptop controllers do not scale.
- Stop and ask if vault password location, inventory ownership, or prod `--limit` scope is unclear.

---

## Related Skills

- `@terraform` — provision machines Ansible configures
- `@docker` — when config moves into images; Ansible only hardens the host
- `@kubernetes` / `@helm` — cluster-native config instead of SSH fleets
- `@vault` — dynamic secrets beyond static ansible-vault files
- `@argocd` / `@fluxcd` — GitOps for K8s (complement, not replace, VM Ansible)

---

## Agent Operational Directive

> **MANDATORY**: Prefer FQCN modules over shell; make any unavoidable `command`/`shell` idempotent with `creates`/`changed_when`. Gate production with `--check --diff`. Pin collections in `requirements.yml`. Never commit vault passwords or plaintext secrets; never invent credentials. Confirm inventory and `--limit` before touching prod.

---

## Source anchors (research)

- [Check mode and diff mode](https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_checkmode.html)
- [Installing collections (`requirements.yml`)](https://docs.ansible.com/projects/ansible/latest/collections_guide/collections_installing.html)
- [ansible-lint `no-changed-when`](https://docs.ansible.com/projects/lint/rules/no-changed-when/)
- [ansible.builtin.shell module notes](https://docs.ansible.com/projects/ansible/latest/collections/ansible/builtin/shell_module.html)
