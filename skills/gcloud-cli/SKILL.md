---
name: gcloud-cli
description: "Operational skill for agents to manage Google Cloud via gcloud - projects, IAM, GKE, Cloud Run, GCS, and safe deploy hygiene."
category: devops
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["gcloud", "gcp", "google-cloud", "iam", "gke", "cloud-run", "cli"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Google Cloud gcloud CLI AI Skill Guide

## Overview

`gcloud` is the primary CLI for Google Cloud Platform. It authenticates against GCP Identity, scopes work to a **project**, and drives APIs for Compute Engine, GKE, Cloud Run, Cloud Storage, IAM, and logging. Agents should treat project ID, region, and account as first-class context - most "wrong resource" bugs are wrong active config, not wrong YAML.

```
+------------------+     +-------------------+     +--------------------+
| gcloud config    | --> | Cloud APIs / IAM  | --> | GCE / GKE / Run    |
| account+project  |     | Resource Manager  |     | GCS / Artifact Reg |
+------------------+     +-------------------+     +--------------------+
```

## When to use

- Creating or switching GCP projects, regions, and named configurations
- Deploying to Cloud Run or inspecting GKE clusters with `gcloud` + `kubectl`
- Managing GCS buckets, Artifact Registry images, and service accounts
- Diagnosing auth failures (`Reauthentication required`, permission denied)

## Operational directives

1. Always print active context first: `gcloud config list` and `gcloud auth list`.
2. Prefer **named configurations** (`gcloud config configurations create`) over silently mutating the default.
3. Use `--project` and `--region` flags on mutating commands; do not rely on ambient defaults in scripts.
4. Prefer least-privilege service accounts; never embed user refresh tokens in CI.
5. Prefer `--format=json` or `--format=yaml` for machine parsing; never scrape human tables in automation.

## Concrete examples

### Context and auth

```bash
gcloud auth login
gcloud config set project my-prod-123
gcloud config set compute/region us-central1
gcloud config configurations create staging
gcloud config configurations activate staging
gcloud config list
```

### Cloud Run deploy (source)

```bash
gcloud run deploy api \
  --source=. \
  --region=us-central1 \
  --allow-unauthenticated=false \
  --service-account=api-runtime@my-prod-123.iam.gserviceaccount.com \
  --set-env-vars=LOG_LEVEL=info
```

### GKE credentials + GCS

```bash
gcloud container clusters get-credentials prod-gke --region us-central1
gcloud storage cp ./dist/* gs://my-prod-123-assets/app/
gcloud artifacts repositories list --location=us-central1
```

### IAM binding (explicit member)

```bash
gcloud projects add-iam-policy-binding my-prod-123 \
  --member="serviceAccount:ci@my-prod-123.iam.gserviceaccount.com" \
  --role="roles/run.developer"
```

## Troubleshooting matrix

| Symptom | Likely cause | Fix path |
| :--- | :--- | :--- |
| Permission denied on API | Missing IAM role on SA/user | Check `gcloud projects get-iam-policy`; bind least role |
| Wrong cluster / bucket | Active project mismatch | `gcloud config list`; pass `--project` |
| Reauth required | Expired ADC / user session | `gcloud auth login` or `gcloud auth application-default login` |
| Image pull on Cloud Run | Artifact Registry IAM | Grant `roles/artifactregistry.reader` to runtime SA |

## Best practices

1. Pin CLI version in CI (`gcloud version`) and document required components (`gke-gcloud-auth-plugin`).
2. Use Workload Identity Federation for CI - avoid long-lived JSON keys when possible.
3. Tag resources with `labels` (`env`, `owner`, `service`) for cost and blast-radius clarity.
4. Prefer `gcloud ... --dry-run` or describe-before-delete for destructive ops.

## Limitations

- `gcloud` does not replace Terraform/Pulumi for full IaC drift control.
- Some APIs lag behind Console UI; confirm beta vs GA (`gcloud beta` / `gcloud alpha`).
- Organization Policy constraints can block otherwise valid commands.

## Related skills

- `kubernetes` - GKE workload manifests and kubectl debugging
- `docker` - image build before Artifact Registry push
- `pulumi` / `terraform` (if present) - declarative GCP infrastructure
- `opentelemetry` - tracing/metrics export from Cloud Run / GKE
