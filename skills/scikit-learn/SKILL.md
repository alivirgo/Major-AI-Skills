---
name: scikit-learn
description: "Operational skill for scikit-learn: pipelines, CV, preprocessing, model selection, and leakage-safe tabular ML."
category: scientific
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["scikit-learn", "machine-learning", "pipelines", "cross-validation", "python", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# scikit-learn Tabular ML AI Skill Guide

## Overview & Engine Architecture

scikit-learn standardizes estimators with `fit` / `predict` / `transform`. `Pipeline` and `ColumnTransformer` bundle preprocessing with models so cross-validation applies the same folds to transforms. Agents prevent leakage by fitting preprocessors inside CV, choose metrics matching the task, and persist entire pipelines - not only the final classifier.

```
raw columns -> ColumnTransformer
                    -> Pipeline(estimator)
                    -> cross_val / GridSearchCV
                    -> joblib dump
```

## When to use this skill

- Classical ML on tabular features
- Baselines before deep learning
- Feature preprocessing that must ship with the model

## Operational directives

1. Never `fit` scalers/encoders on the full dataset before splitting.
2. Use `Pipeline` so GridSearchCV tunes preprocessing + model together.
3. Stratify classification splits when classes are imbalanced.
4. Report confidence intervals / multiple seeds for small data.
5. Persist with `joblib.dump(pipeline, ...)` including transforms.

## Pipeline example

```python
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import HistGradientBoostingClassifier

num = Pipeline([("imp", SimpleImputer()), ("sc", StandardScaler())])
cat = Pipeline([
    ("imp", SimpleImputer(strategy="most_frequent")),
    ("oh", OneHotEncoder(handle_unknown="ignore")),
])

pre = ColumnTransformer([
    ("num", num, ["amount", "tenure_days"]),
    ("cat", cat, ["segment", "region"]),
])

clf = Pipeline([
    ("pre", pre),
    ("model", HistGradientBoostingClassifier(max_depth=6)),
])

scores = cross_val_score(clf, X, y, cv=5, scoring="roc_auc")
print(scores.mean(), scores.std())
clf.fit(X, y)
```

## Persist

```python
import joblib
joblib.dump(clf, "artifacts/churn_pipeline.joblib")
pipe = joblib.load("artifacts/churn_pipeline.joblib")
pipe.predict_proba(X_new)[:, 1]
```

## Common failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Optimistic AUC | leakage / target encoding wrong | CV-safe target encoders |
| Crash on predict | unseen categories | `handle_unknown='ignore'` |
| Slow grid search | huge param grid | RandomizedSearchCV; fewer folds first |
| Bad production | trained without pipeline | dump full Pipeline |

## Best practices

- Start with `DummyClassifier` / simple linear baselines.
- Align `scoring` with business cost (precision@k, recall, MAE).
- Keep train/serve features identical via the saved pipeline.
- Log params/metrics with `@mlflow`.

## Limitations

- Not ideal for raw text/image end-to-end (use `@huggingface-transformers`, `@pytorch`).
- GPU acceleration is limited compared to deep learning stacks.
- Online learning APIs are partial - batch retrain is the common path.

## Related skills

- `@pandas` - feature tables
- `@mlflow` - experiment tracking
- `@great-expectations` - validate feature inputs
