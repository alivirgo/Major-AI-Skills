---
title: "Prompt Regression Gate AI Skill Guide (GPT & Codex)"
description: "Operational skill for OpenAI GPT and Codex to wire paired prompt regression CI: hashes, baseline artifacts, relative thresholds, slice hard-fails, and rollback."
category: "AI Workflows / Prompt CI"
tags: ["prompt-regression", "ci", "baseline", "promptfoo", "gpt-codex", "eval-gate"]
---

# Prompt Regression Gate AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture

GPT/Codex acts as a Principal LLM CI Engineer: implement **path-filtered workflows**, **hash manifests**, **baseline artifact promotion**, and **exit-code gates** so prompt/model PRs cannot merge on vibes.

```
┌─────────────────────────────────────────────────────────────┐
│  PR touches prompts/** → run suite → compare to main        │
│  baseline → fail on aggregate/slice/P0 delta → PR comment   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. Store prompts as files; compute `prompt_hash` over system+template+tool JSON.
2. Commit or artifact-store `baseline.jsonl` from **main** only; never from the PR under test.
3. Implement relative compare (`max_aggregate_drop`, `p0_allowed_regressions=0`).
4. Prefer Promptfoo/Evalgate/custom runner + deterministic scorers; pin judge models.
5. On main merge, job refreshes baseline; document judge/dataset upgrades as explicit re-baselines.

---

## Production: GitHub Actions fragment

```yaml
name: prompt-regression-gate
on:
  pull_request:
    paths: ["prompts/**", "evals/**", "src/llm/**"]
jobs:
  gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run candidate eval
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: python scripts/run_eval.py --prompt prompts/support.system.md --out candidate.jsonl
      - name: Fetch main baseline
        run: |
          git fetch origin main
          git show origin/main:evals/baselines/support.jsonl > baseline.jsonl
      - name: Compare
        run: python scripts/prompt_gate.py baseline.jsonl candidate.jsonl
```

Wire `prompt_gate.py` from the canonical `SKILL.md` example. Optionally `npx promptfoo eval -o results.json` then convert to per-case JSONL for the same comparator.

---

## Technical Troubleshooting Matrix

| CI symptom | Fix |
| :--- | :--- |
| Flaky gate | temp=0, cache keys include prompt+dataset hashes, raise tolerance slightly |
| Always fails after dataset edit | Bump dataset version; regenerate baseline on main |
| Cost spike | Path filters; shard suite; smoke subset on draft PRs |
| False GO | Missing P0 slice tags on cases |

---

## Best Practices

1. Majority-vote 3 runs for borderline stochastic tasks when budget allows.
2. Publish delta table as PR comment (upsert one comment).
3. Track cost tokens alongside quality in the same artifact.
4. Schema/prompt contract changes: update fixtures in the same commit.

---

## Agent Operational Directive

> **MANDATORY**: Automate paired baseline comparison with hashed provenance. Block merges on P0 and aggregate regressions. Refresh baselines only from main. Mark skipped runs as untested, not GO.
