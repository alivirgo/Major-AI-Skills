---
name: python-packaging
description: "Operational skill for Python packaging: pyproject.toml, src layout, virtualenvs, pytest/ruff/mypy tooling, and publishing wheels to indexes."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["python", "packaging", "pyproject", "pytest", "wheels", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Python Packaging AI Skill Guide

## Overview & Engine Architecture

Modern Python projects declare metadata and tool config in `pyproject.toml`, prefer `src/` layouts to avoid accidental imports of the working tree, and isolate deps in virtualenvs or uv/poetry lockfiles. Agents build with `build`/`hatchling`, test with pytest, and never publish secrets or unpinned prod apps without a lock strategy.

```
pyproject.toml
   |
  build backend (hatchling/setuptools)
   |
  sdist + wheel
   |
pip/uv install -> site-packages
```

## When to use this skill

- Creating installable libraries or CLI packages
- Migrating from legacy `setup.py`-only projects
- Standardizing lint/test/type gates
- Preparing a release to PyPI or a private index

## Operational directives

1. Put package code under `src/<name>/` so tests import the installed package.
2. Declare dependencies in `[project]` / optional dependency groups - not ad-hoc README lists only.
3. Use a lockfile for applications (`uv.lock`, poetry.lock); libraries pin ranges carefully.
4. Keep version single-sourced (dynamic version or bump policy).
5. Run tests against the built wheel in CI for release tags.

## Minimal `pyproject.toml`

```toml
[project]
name = "inventory-kit"
version = "0.1.0"
description = "Inventory helpers"
readme = "README.md"
requires-python = ">=3.11"
dependencies = []

[project.optional-dependencies]
dev = ["pytest>=8", "ruff>=0.6", "mypy>=1.11"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.pytest.ini_options]
testpaths = ["tests"]

[tool.ruff]
line-length = 100
```

## Commands

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -e ".[dev]"
pytest -q
ruff check .
python -m build
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Flat layout without src | Tests import wrong code | `src/` layout |
| No requires-python | Installs on unsupported runtimes | Declare floor |
| Publishing with secrets in package data | Credential leak | Audit package files |
| Only testing editable installs | Hidden packaging bugs | Test installed wheel |

## Best practices

- Add a console script via `[project.scripts]` for CLIs.
- Use tox/nox or CI matrix for multiple Python versions when supporting a library.
- Prefer trusted publishing / API tokens over long-lived passwords for PyPI.
- Document supported platforms and optional extras clearly.

## Limitations

- Native extensions (Rust/C) need maturin/cibuildwheel beyond pure Python.
- Monorepo tooling (pants, bazel) may supersede simple pyproject flows.
- Namespace packages and plugin discovery have extra packaging rules.

## Related skills

- `@fastapi` / `@flask` - app frameworks that still need packaging discipline
- `@rust-cli` - alternative for shipping native CLIs
- `@docker` - app distribution when wheels are not the unit of deploy
