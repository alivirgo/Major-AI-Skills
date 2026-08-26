---
title: "Bruno API Client AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Bruno collections, Bru DSL generation, Postman-to-Bruno migration, and CLI runners."
category: "Offline-First Open-Source API Client"
tags: ["bruno", "bru-markup", "postman-migration", "openapi-import", "gpt-codex", "cli-automation"]
---

# Bruno API Client AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Bruno is a developer-focused, Git-integrated API testing suite utilizing human-readable `.bru` markup files. GPT/Codex acts as a Principal API Automation Developer and Pipeline Architect, delivering **programmatic `.bru` file generators**, **automated Postman/OpenAPI-to-Bruno migration scripts**, **JavaScript test hook authoring**, and **headless `@usebruno/cli` runner wrappers**.

### Architecture & Programmatic Developer Layer

```
┌─────────────────────────────────────────────────────────────┐
│                 Bruno Developer Ecosystem                   │
│                                                             │
│  Declarative DSL Layer                                      │
│  ├── `.bru` Recursive Grammar Parser & Tokenizer            │
│  ├── `bruno.json` Collection Root Metadata Schema           │
│  └── Dotenv & Custom Variable Interpolation Engine          │
│                                                             │
│  Automation & Pipeline Interfaces                           │
│  ├── `@usebruno/cli` (Node.js Headless Command Runner)      │
│  ├── Bruno JavaScript Sandbox (`bru`, `req`, `res`)         │
│  └── Programmatic Node/Python Converters (Postman/OpenAPI)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Declarative Bru DSL Generation**: Programmatically generate `.bru` request files from OpenAPI specs, cURL commands, or Python dictionary models with correct block indentation.
2. **Postman to Bruno Migration Automation**: Script the extraction of Postman Collection JSON format v2.1 into clean, modular `.bru` files organized by folder trees.
3. **Advanced Test Scripting**: Author JavaScript pre-request and post-response logic for computing HMAC-SHA256 signatures, managing session nonces, and verifying schema validation.
4. **CI/CD Automation & Reporting**: Build NPM scripts and GitHub Actions workflows that run collections via `npx @usebruno/cli` and post test metrics to pull requests.

---

## Production Python Automation: cURL to `.bru` Converter Script

Run this standalone Python script to convert standard `curl` commands directly into clean, Git-ready `.bru` request files:

```python
"""
Standalone Tool: cURL Command to Bruno (.bru) File Converter
Converts cURL syntax into clean declarative Bru markup.
"""

import sys
import re
import os

def curl_to_bru(curl_command: str, name: str, output_path: str):
    # 1. Parse HTTP Method
    method_match = re.search(r'-X\s+([A-Z]+)', curl_command)
    method = method_match.group(1).lower() if method_match else "get"
    if "--data" in curl_command or "-d" in curl_command and method == "get":
        method = "post"

    # 2. Parse URL
    url_match = re.search(r'[\'"](https?://[^\'"]+)[\'"]', curl_command)
    url = url_match.group(1) if url_match else "http://localhost:3000/api"

    # 3. Parse Headers
    headers = re.findall(r'-H\s+[\'"]([^:]+):\s*([^\'"]+)[\'"]', curl_command)

    # 4. Parse Body Data
    body_match = re.search(r'--data(?:-raw)?\s+[\'"]({.*?})[\'"]', curl_command, re.DOTALL)
    body_data = body_match.group(1) if body_match else None

    # 5. Build .bru Markup
    bru_content = f"""meta {{
  name: {name}
  type: http
  seq: 1
}}

{method} {{
  url: {url}
  body: {'json' if body_data else 'none'}
  auth: none
}}
"""
    if headers:
        bru_content += "\nheaders {\n"
        for k, v in headers:
            bru_content += f"  {k.strip()}: {v.strip()}\n"
        bru_content += "}\n"

    if body_data:
        bru_content += f"\nbody:json {{\n  {body_data.strip()}\n}}\n"

    bru_content += """
assert {
  res.status: eq 200
}
"""

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(bru_content.strip() + "\n")

    print(f"Successfully generated Bru file: {output_path}")

if __name__ == "__main__":
    example_curl = """curl -X POST 'https://api.example.com/v1/auth/login' -H 'Content-Type: application/json' -d '{"user":"admin","pass":"secret"}'"""
    curl_to_bru(example_curl, "User Login", "C:/Export/login.bru")
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`SyntaxError: Unexpected token in .bru file`** | Broken indentation, missing closing bracket `}`, or unescaped quotes in request body block. | 1. Ensure block names (`meta`, `headers`, `body:json`) are followed by `{` on the same line.<br>2. Run `npx @usebruno/cli lint` to identify the failing line number.<br>3. Format JSON payloads cleanly inside `body:json { ... }`. |
| **Pre-Request Script Fails: `bru.setVar is not a function`** | Script invoked outdated API syntax from legacy client versions. | 1. Use `bru.setVar(key, val)` for collection-level variables.<br>2. Use `bru.setEnvVar(key, val)` for environment-scoped variables.<br>3. Check Bruno runtime version ($\ge 1.15.0$). |
| **GitHub Actions CI Fails on Missing Bru CLI** | Package `@usebruno/cli` was not installed in CI runner before executing test steps. | Add `npm install -g @usebruno/cli` or execute directly via `npx -y @usebruno/cli run --env CI`. |
| **Request Hangs Indefinitely on Large File Upload** | `body:multipart-form` file path was specified with local relative path not resolvable by CLI runner. | Use paths relative to collection root or pass absolute file paths in `multipart-form` parameters. |

---

## Command Line Syntax & Batch Execution

```bash
# Windows CLI / NPM: Run Full Bruno Test Suite in CI
npx @usebruno/cli run --env Production --output test-results.json --format json

# Run Collection with Custom Environment Variable Injections
npx @usebruno/cli run tests/e2e/ --env Local --env-var token=xyz123 --bail
```

### Essential File Locations
- **Collection Descriptor**: `<root>/bruno.json`
- **Environment Definitions**: `<root>/environments/<name>.bru`
- **CLI Global Package**: `npm install -g @usebruno/cli`

---

## Agent Operational Directive
> **MANDATORY**: When converting APIs from cURL or Postman into Bruno, ensure headers, auth blocks, and bodies are formatted into declarative Bru syntax blocks. Use `@usebruno/cli` for automated testing in CI/CD environments.
