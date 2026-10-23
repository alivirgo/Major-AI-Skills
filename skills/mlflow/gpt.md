---
title: "MLflow Tracking & Registry AI Skill Guide (GPT & Codex)"
description: "Operational skill for GPT/Codex to generate MLflow logging wrappers, nested sweep runners, artifact-safe server flags, and registry alias promotion scripts."
category: "Experiment Tracking & Model Registry"
tags: ["mlflow", "model-registry", "aliases", "gpt-codex", "artifacts", "mlops"]
---

# MLflow Tracking & Registry AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as an **MLOps automation engineer**: emit **experiment bootstrap**, **run logging helpers**, **artifact-proxied server compose**, and **alias promotion** gates driven by held-out metrics.

```
┌─────────────────────────────────────────────────────────────┐
│                 MLflow automation stack                       │
│  set URI/experiment → log run → register → @champion gate   │
│  CI: metric threshold + signature present                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Templates always call `set_tracking_uri` + `set_experiment` (no silent Default).
2. Promote with `set_registered_model_alias(..., "champion", version)`—not deprecated stages.
3. Server snippets use `--artifacts-destination` for remote trainers.
4. Log `git_sha` and `dataset_version` tags on every generated training entrypoint.
5. Never put AWS keys in URIs; use env/IAM.

---

## Production Python: champion promotion gate

```python
"""Register alias only when holdout metric clears threshold."""
from __future__ import annotations

import os

import mlflow
from mlflow import MlflowClient

MODEL_NAME = os.environ["MLFLOW_MODEL_NAME"]
RUN_ID = os.environ["MLFLOW_RUN_ID"]
METRIC = os.environ.get("PRIMARY_METRIC", "roc_auc")
THRESHOLD = float(os.environ.get("METRIC_THRESHOLD", "0.90"))
ALIAS = os.environ.get("MODEL_ALIAS", "champion")


def main() -> None:
    mlflow.set_tracking_uri(os.environ["MLFLOW_TRACKING_URI"])
    client = MlflowClient()
    run = client.get_run(RUN_ID)
    value = run.data.metrics.get(METRIC)
    if value is None or value < THRESHOLD:
        raise SystemExit(f"{METRIC}={value} below {THRESHOLD}")
    mv = client.create_model_version(MODEL_NAME, f"runs:/{RUN_ID}/model", run_id=RUN_ID)
    client.set_registered_model_alias(MODEL_NAME, ALIAS, mv.version)
    client.set_model_version_tag(MODEL_NAME, mv.version, "validation_status", "passed")
    print(f"aliased {MODEL_NAME}@{ALIAS} -> v{mv.version}")


if __name__ == "__main__":
    main()
```

---

## Technical Troubleshooting Matrix

| Automation signature | Check | Script fix |
| :--- | :--- | :--- |
| Artifacts 403 in CI | proxy flags | Add artifacts-destination; new experiment |
| Wrong runs compared | URI drift | Inject MLFLOW_TRACKING_URI in all jobs |
| Stage URI breaks | legacy load | Switch to `@alias` URI |

---

## Agent Operational Directive

> **MANDATORY**: Automate experiment naming, metric gates, and alias promotion. Prefer proxied artifacts. No cloud credential literals in generated configs.
