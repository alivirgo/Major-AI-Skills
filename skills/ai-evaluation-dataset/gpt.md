---
title: "AI Evaluation Dataset AI Skill Guide (GPT & Codex)"
description: "Operational skill for OpenAI GPT and Codex to author versioned JSONL eval datasets, manifests, content hashes, leakage checks, and CI-bound result rows."
category: "AI Workflows / Evaluation"
tags: ["evaluation-dataset", "golden-set", "jsonl", "versioning", "leakage", "gpt-codex", "ci"]
---

# AI Evaluation Dataset AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a Principal Evaluation Platform Engineer: generate **schemas, freeze scripts, CI gates, and bridge reports** so every metric row binds `dataset_hash`, `system_hash`, and `judge_hash`.

```
┌─────────────────────────────────────────────────────────────┐
│                 Dataset Automation Pipeline                 │
│  JSONL cases → validate schema → group-split check → hash   │
│  → manifest freeze → eval job → result row + artifacts      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Emit `evals/data/vN/{golden,regression,holdout}.jsonl` + `manifest.json`.
2. Implement validators: required fields, unique `id`, paraphrase co-location, PII heuristics.
3. Wire CI to fail if `HASH` file ≠ recomputed content hash.
4. On label PRs, auto-generate a bridge job: same `system_hash` on old vs new dataset versions.
5. Keep judge/assertion code versioned beside cases; never inline unscored “vibes.”

---

## Production Python: manifest freeze CLI sketch

```python
"""freeze_dataset.py — validate, hash, write manifest."""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

# Reuse helpers from SKILL.md: content_hash, load_jsonl, assert_paraphrase_groups_colocated

REQUIRED = {"id", "split", "input", "expected_behavior", "forbidden_behavior", "provenance"}


def validate_rows(rows: list[dict]) -> None:
    ids: set[str] = set()
    for row in rows:
        missing = REQUIRED - row.keys()
        if missing:
            raise SystemExit(f"{row.get('id')}: missing {missing}")
        if row["id"] in ids:
            raise SystemExit(f"duplicate id: {row['id']}")
        ids.add(row["id"])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", type=Path, required=True)
    ap.add_argument("--version", required=True)
    ap.add_argument("--description", default="")
    args = ap.parse_args()

    files = sorted(args.dir.glob("*.jsonl"))
    rows: list[dict] = []
    for f in files:
        rows.extend(json.loads(line) for line in f.read_text(encoding="utf-8").splitlines() if line.strip())
    validate_rows(rows)
    # assert_paraphrase_groups_colocated(rows)
    # digest = content_hash(files)
    digest = "sha256:COMPUTE"
    manifest = {
        "dataset_version": args.version,
        "created_at": date.today().isoformat(),
        "description": args.description,
        "files": [f.name for f in files],
        "case_count": len(rows),
        "content_hash": digest,
    }
    (args.dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (args.dir / "HASH").write_text(digest + "\n", encoding="utf-8")
    print(manifest)


if __name__ == "__main__":
    main()
```

### CI gate sketch

```yaml
# .github/workflows/eval-dataset.yml (fragment)
- name: Verify dataset hash
  run: |
    python scripts/freeze_dataset.py --dir evals/data/v3 --version v3 --description "check"
    git diff --exit-code evals/data/v3/HASH evals/data/v3/manifest.json
- name: Run eval
  run: python scripts/run_eval.py --dataset-version v3 --fail-under 0.85
```

---

## Technical Troubleshooting Matrix

| Signature | Check | Automation |
| :--- | :--- | :--- |
| Unstable hashes | Key order / whitespace | Canonical `sort_keys` JSON lines |
| Bridge missing | Label PR without dual run | Require `bridge.json` artifact |
| Few-shot leak | Overlap with prompt bank | Near-dup filter job |
| Schema drift | Extra fields break consumers | JSON Schema + `--strict` |

---

## Best Practices

1. Store large contexts by content hash sidecar; keep JSONL rows readable.
2. Export Promptfoo/DeepEval adapters from the same JSONL source of truth.
3. Redact before commit; scan for API keys and emails in CI.
4. Record `corpus_hash` for RAG jobs so corpus moves do not look like model wins.

---

## Agent Operational Directive

> **MANDATORY**: Automate immutability (hash files), group-aware split checks, and hash-bound result rows. Refuse in-place gold edits. Generate bridge comparisons whenever the dataset version bumps.
