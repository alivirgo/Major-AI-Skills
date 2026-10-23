---
name: gcloud-cli
description: "Operate gcloud with named configurations, ADC vs CLI auth, Workload Identity Federation, and project-scoped GKE/Cloud Run/GCS workflows agents mis-target."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["gcloud", "gcp", "google-cloud", "workload-identity", "adc", "gke", "cloud-run", "iam"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Google Cloud gcloud CLI AI Skill Guide (Claude)

## Overview & Engine Architecture

**`gcloud`** authenticates a principal, scopes work to a **project** (and often region/zone), and drives Cloud APIs for Compute, GKE, Cloud Run, GCS, Artifact Registry, IAM, and logging. **CLI auth** (`gcloud auth login`) is distinct from **Application Default Credentials** (`gcloud auth application-default login`)—SDKs use ADC; the CLI uses its own login. Agents treat **active configuration + project ID** as first-class context: most “wrong resource” bugs are wrong config, not wrong YAML.

```
┌─────────────────────────────────────────────────────────────┐
│                 gcloud auth & API path                        │
│                                                             │
│  Principal                                                  │
│  ├── User: gcloud auth login                                 │
│  ├── Impersonation: --impersonate-service-account           │
│  ├── WIF: gcloud auth login --cred-file=… (CI / external)    │
│  └── Metadata SA (GCE / Cloud Run / Cloud Build)            │
│                                                             │
│  Config                                                     │
│  ├── Named configurations (account + project + region)      │
│  ├── ADC file (apps/SDKs only — not used by gcloud itself)   │
│  └── Flags: --project / --region override ambient defaults  │
│                                                             │
│  APIs → GKE · Cloud Run · GCS · Artifact Registry · IAM     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Switching projects/regions via **named configurations**; deploying Cloud Run; wiring GKE credentials.
- Managing GCS, Artifact Registry, and IAM bindings with least privilege.
- Diagnosing auth: reauth required, WIF, ADC vs CLI confusion.

**Do not use when**

- Full multi-env topology belongs in IaC → `@terraform` / `@pulumi`.
- Day-2 cluster workloads after kubeconfig → `@kubernetes`.
- Someone asks to commit a **service account JSON key** → refuse; use WIF, impersonation, or attached SA / `@vault`.

---

## Operational Capabilities & Agent Directives

1. **Print context first**: `gcloud config list` and `gcloud auth list` before mutates.
2. Prefer **named configurations** (`gcloud config configurations create|activate`) over silently mutating `default`.
3. Pass **`--project` and `--region`** on mutating commands in scripts—never rely on ambient defaults alone.
4. Prefer **Workload Identity Federation** (and SA impersonation) over downloadable JSON keys for CI and external workloads.
5. Remember: **`gcloud auth login` ≠ ADC**. Apps needing ADC need `gcloud auth application-default login` (or metadata/WIF ADC).
6. Machine output: `--format=json` or `yaml`; never scrape human tables in automation.
7. Destructive ops: describe/list first; use `--dry-run` where available; confirm project ID aloud.

---

## Production Example: named config + Cloud Run + GKE

```bash
# Named configuration (staging vs prod)
gcloud config configurations create prod
gcloud config set project my-prod-123
gcloud config set compute/region us-central1
gcloud config set account you@example.com
gcloud auth login
# Remote: gcloud auth login --no-launch-browser

gcloud config list
gcloud auth list

# Cloud Run — private by default; dedicated runtime SA
gcloud run deploy api \
  --project=my-prod-123 \
  --region=us-central1 \
  --source=. \
  --allow-unauthenticated=false \
  --service-account=api-runtime@my-prod-123.iam.gserviceaccount.com \
  --set-env-vars=LOG_LEVEL=info

# GKE credentials → @kubernetes
gcloud container clusters get-credentials prod-gke \
  --project=my-prod-123 --region=us-central1
# Ensure gke-gcloud-auth-plugin is installed for modern kubectl

# GCS + Artifact Registry
gcloud storage cp ./dist/* gs://my-prod-123-assets/app/ --project=my-prod-123
gcloud artifacts repositories list --project=my-prod-123 --location=us-central1

# IAM binding (explicit member — no invented emails)
gcloud projects add-iam-policy-binding my-prod-123 \
  --member="serviceAccount:ci@my-prod-123.iam.gserviceaccount.com" \
  --role="roles/run.developer" \
  --condition=None
```

CI (Workload Identity Federation sketch — prefer over JSON keys):

```bash
# External account credential file from WIF pool/provider (no long-lived SA key)
gcloud auth login --cred-file="${GOOGLE_APPLICATION_CREDENTIALS}"
gcloud config set project my-prod-123
gcloud run services describe api --region=us-central1 --format=json
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Permission denied / 403 | Missing IAM role on user/SA | `gcloud projects get-iam-policy`; bind least role; check Org Policy |
| Wrong cluster / bucket | Active project or config mismatch | `gcloud config list`; pass `--project`; activate correct configuration |
| Reauthentication required | Expired user session | `gcloud auth login`; for apps, refresh ADC separately |
| SDK works, `gcloud` fails (or reverse) | CLI auth ≠ ADC | Configure the missing side; do not assume they share tokens |
| WIF `invalid_grant` / stale ID token | Cred file’s token source expired (e.g. K8s SA volume during long terminate) | Refresh external token; shorten grace; recreate pod client |
| API `UNAUTHENTICATED` with federated token | API method rejects federated tokens | Impersonate SA / `GenerateAccessToken` per WIF docs |
| Cloud Run image pull fail | Artifact Registry IAM on runtime SA | Grant `roles/artifactregistry.reader` to runtime SA |
| kubectl auth plugin errors | Missing `gke-gcloud-auth-plugin` | Install component; verify `USE_GKE_GCLOUD_AUTH_PLUGIN=True` |

---

## Best Practices

1. Pin CLI version in CI (`gcloud version`); document required components (`gke-gcloud-auth-plugin`).
2. Labels: `env`, `owner`, `service` for cost and blast radius.
3. Prefer SA **impersonation** for break-glass over distributing keys.
4. Pair image builds with `@docker`; deploy manifests with `@kubernetes`.
5. Prefer IaC (`@terraform` / `@pulumi`) for shared networking and IAM topology.

---

## Limitations

- `gcloud` does not replace IaC for drift control across envs.
- Alpha/beta surfaces lag Console; confirm GA vs `gcloud beta`.
- Organization Policy constraints can block valid commands.
- Stop and ask if project ID, region, or destructive approval is missing.

---

## Related Skills

- `@kubernetes` — GKE workloads and kubectl debugging
- `@docker` — build before Artifact Registry push
- `@terraform` / `@pulumi` — declarative GCP infrastructure
- `@vault` — secrets vs Secret Manager patterns
- `@aws-cli` / `@azure-cli` — multi-cloud CLI analogs
- `@opentelemetry` — tracing/metrics from Cloud Run / GKE

---

## Agent Operational Directive

> **MANDATORY**: Print `gcloud config list` / `gcloud auth list` before mutating. Prefer named configurations and explicit `--project`/`--region`. Prefer WIF and impersonation over SA JSON keys. Do not confuse CLI login with ADC. Never invent or commit service account keys. If project or blast radius is unclear, stop and ask.

---

## Source anchors (research)

- [Authenticate with the gcloud CLI](https://docs.cloud.google.com/docs/authentication/gcloud)
- [Troubleshoot Workload Identity Federation](https://docs.cloud.google.com/iam/docs/troubleshooting-workload-identity-federation)
- [WIF / OIDC cred-file token source pitfalls](https://stackoverflow.com/questions/79660664/gcloud-auth-login-with-oidc-workload-identity-pool-cred-file-not-working)
