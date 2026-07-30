# Efficiency AI Skills (`efficiency ai skills/`)

A modular collection of 100 technical rules focused on cutting token overhead, speeding up response times, and maximizing LLM context window efficiency.

All skill files in this folder are named using the clean `-ai-skill.md` convention (e.g., `concise-output-enforcer-ai-skill.md`).

---

## Core Focus Areas

1. **Prompt Compression & Token Reduction**:
   Directives to eliminate conversational preambles, enforce 3-line unified diffs, use shorthand notation, and emit minified JSON payloads.

2. **Context Window & RAG Pruning**:
   Techniques for line-bounded file reading, AST code skeletonizing (exposing function signatures while stripping bodies), Ripgrep glob filtering, and deduplicated context ingestion.

3. **API & Inference Optimization**:
   Header directives for prompt caching (saving up to 90% on static prompts), custom stop sequence truncation, temperature 0 determinism, and dynamic model tier routing.

4. **Code & Refactoring Efficiency**:
   Rules for targeted line-range editing, zero-boilerplate patch imports, single-pass multi-file replacements, and delegating code formatting to local CLI formatters (`prettier`, `black`, `ruff`).

5. **Agentic & Tool Execution Protocols**:
   Batch tool calling patterns, silent background execution, reactive completion signaling, and direct tool selection to eliminate exploratory clarification turns.

---

## How to Apply

Add relevant skill files directly to your system prompts, agent instructions (`CLAUDE.md`, `.cursorrules`), or feed them into your local RAG vector store for instant retrieval during AI coding sessions.
