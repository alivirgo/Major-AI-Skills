---
name: mlflow
description: "Track ML experiments and promote models with MLflow 3 patterns: runs/params/metrics/artifacts, proxied artifact stores, and Model Registry aliases (champion) instead of deprecated stages."
category: scientific
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["mlflow", "experiment-tracking", "model-registry", "aliases", "mlops", "artifacts", "autolog"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# MLflow Experiment Tracking AI Skill Guide (Claude)

## Overview & Engine Architecture

MLflow Tracking records **experiments → runs** with parameters, metrics, tags, and artifacts. A **tracking server** (or local `mlruns/`) holds metadata; an **artifact store** (local, S3/MinIO, or server-proxied) holds files. The **Model Registry** versions models and (since stages are deprecated) uses **aliases** (`champion`, `challenger`) and **tags** for deployment intent. Agents log enough to reproduce a run, align client/server tracking URIs, and promote only evaluated candidates via aliases—not every train job.

```
┌─────────────────────────────────────────────────────────────┐
│                 MLflow tracking + registry                    │
│                                                             │
│  Training process                                           │
│  ├── set_tracking_uri / set_experiment                      │
│  ├── start_run → log_params / log_metrics / log_artifact    │
│  ├── log_model (+ signature / input example)                │
│  └── optional nested runs (sweeps)                          │
│                                                             │
│  Tracking server                                            │
│  ├── backend store (sqlite / postgres / …)                  │
│  └── artifacts: --artifacts-destination (proxied) or S3     │
│                                                             │
│  Model Registry                                             │
│  ├── registered model → versions                            │
│  ├── aliases: models:/name@champion  (prefer over stages)   │
│  └── tags: validation_status, task, env                     │
└─────────────────────────────────────────────────────────────┘
```

---

## When to use / when not to

**Use when**

- Comparing hyperparameters / model families with audit trail.
- Attaching plots, env files, and signed models for batch or online inference handoff.
- Team-shared tracking server with remote artifact storage.

**Do not use when**

- The need is only ephemeral notebook scratch with no comparison → local prints fine; still prefer MLflow if the run may ship.
- Full feature-store / online feature serving is required → separate systems; MLflow tracks models, not feature freshness SLAs.
- User asks to commit cloud access keys into tracking URIs → refuse; use IAM roles / env / secret mounts.

---

## Operational Capabilities & Agent Directives

1. **Set experiment explicitly** (`mlflow.set_experiment`)—never dump prod work into `Default`.
2. **Align tracking URI** between trainer, UI, and CI (`MLFLOW_TRACKING_URI` or `set_tracking_uri`).
3. Log **data version**, git SHA, and primary metric consistently for search/compare.
4. Prefer **`log_model` with `infer_signature` + input example** for serving readiness.
5. **Registry**: use **aliases** (`champion` / `challenger`) and tags; treat stages (`Production`/`Staging`) as legacy.
6. **Artifacts**: for remote trainers, run server with `--artifacts-destination` (proxied) so clients do not write server-local paths; artifact config changes often apply to **new experiments only**.
7. Use **nested runs** for sweeps; keep parent for best summary metrics.
8. Gate alias moves on held-out metrics—never auto-`champion` every run.

---

## Production Example: track, register, alias

Server (dev/team):

```bash
mlflow server \
  --host 0.0.0.0 \
  --port 5000 \
  --backend-store-uri sqlite:///mlflow.db \
  --artifacts-destination ./mlartifacts
```

Training + registry (aliases, not stages):

```python
from __future__ import annotations

import os

import mlflow
import mlflow.sklearn
from mlflow import MlflowClient
from mlflow.models import infer_signature
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

mlflow.set_tracking_uri(os.environ.get("MLFLOW_TRACKING_URI", "http://127.0.0.1:5000"))
mlflow.set_experiment("churn-models")

X, y = load_breast_cancer(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

with mlflow.start_run(run_name="hgb-v3") as run:
    params = {"max_depth": 6, "learning_rate": 0.08}
    mlflow.log_params(params)
    clf = HistGradientBoostingClassifier(**params).fit(X_train, y_train)
    proba = clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, proba)
    mlflow.log_metrics({"roc_auc": auc})
    mlflow.set_tags({
        "data": "sklearn.breast_cancer",
        "git_sha": os.environ.get("GIT_SHA", "local"),
        "validation_status": "pending",
    })

    sig = infer_signature(X_train, clf.predict(X_train))
    model_info = mlflow.sklearn.log_model(
        sk_model=clf,
        artifact_path="model",
        signature=sig,
        input_example=X_train.head(3),
        registered_model_name="breast-cancer-hgb",  # or register in a later gated step
    )

    client = MlflowClient()
    # Resolve version from registration; pin explicitly in real pipelines
    versions = client.search_model_versions("name='breast-cancer-hgb'")
    latest = max(versions, key=lambda v: int(v.version))
    if auc >= 0.90:
        client.set_registered_model_alias("breast-cancer-hgb", "champion", latest.version)
        client.set_model_version_tag("breast-cancer-hgb", latest.version, "validation_status", "passed")

# Load by alias for serving / batch jobs
import mlflow.pyfunc
model = mlflow.pyfunc.load_model("models:/breast-cancer-hgb@champion")
```

---

## Technical Troubleshooting Matrix

| Signature | Likely cause | Fix path |
| :--- | :--- | :--- |
| Empty / wrong runs in UI | Trainer URI ≠ UI/server URI | Unify `MLFLOW_TRACKING_URI`; confirm experiment name |
| Unable to list artifacts / permission denied | Client writing server filesystem; missing boto3/creds; bad MinIO endpoint | `--artifacts-destination` proxy; install boto3 on server; fix `MLFLOW_S3_ENDPOINT_URL` (http endpoint, not `s3://`) |
| Artifact fix “does nothing” | Config applies to new experiments | Create a **new** experiment after server artifact changes |
| Cannot compare runs | Inconsistent metric names | Standardize `roc_auc` vs `auc`; one primary metric |
| Registry clutter | Auto-register every run | Register only candidates; alias only after eval |
| Stage-based URI failures | Legacy `models:/name/Production` | Migrate to `models:/name@champion` |
| Autolog misses custom loop | Unsupported ops | Manual `log_metric` / `log_params` |
| Huge artifact store | Logging full datasets | Log hashes/paths/queries instead |

---

## Best Practices

1. One primary metric per experiment for sorting; put secondary metrics in consistent namespaces.
2. Tag `team`, `env`, `dataset_version`, `git_sha` on every meaningful run.
3. Keep client and server on the same major version when possible (server backward-compatible within limits).
4. Pair with `@scikit-learn` / `@pytorch` / `@huggingface-transformers` training code.
5. Schedule training via `@airflow` / `@prefect` with tracking URI injected as config—not hardcoded secrets.

---

## Limitations

- Auth, multi-tenant isolation, and artifact IAM are ops concerns—defaults are not enterprise-ready alone.
- Autolog coverage varies by library; custom loops need manual logging.
- Model deployment/serving is separate from tracking (pair with your serving stack / `@vllm` for LLMs).
- Stop and ask if artifact backend, retention, or promotion criteria are unspecified.

---

## Related Skills

- `@scikit-learn` / `@pytorch` / `@huggingface-transformers` — training frameworks that log here
- `@airflow` / `@prefect` — scheduled training jobs
- `@jupyter` — exploratory runs that should still set experiment + tags
- `@docker` — packaging tracking server + artifact proxy

---

## Agent Operational Directive

> **MANDATORY**: Set experiment and tracking URI explicitly. Log data version + git SHA + signature on models. Prefer registry **aliases** over deprecated stages. Configure proxied artifacts for remote trainers. Never commit cloud credentials into URIs or notebooks.

---

## Source anchors (research)

- [Tracking APIs](https://mlflow.org/docs/latest/ml/tracking/tracking-api/)
- [Tracking server & artifact proxy](https://mlflow.org/docs/latest/ml/tracking/server/)
- [Model Registry & aliases](https://mlflow.org/docs/latest/ml/model-registry/)
- [Migrating from stages](https://mlflow.org/docs/latest/ml/model-registry/workflow/)
- [Artifact stores](https://mlflow.org/docs/latest/self-hosting/architecture/artifact-store/)
