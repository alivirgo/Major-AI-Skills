---
name: dont-repaste-entire-document
description: "How to maintain clean conversation context, leverage conversational memory, and avoid re-uploading large documents for micro-edits."
category: common-sense
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["context-hygiene", "token-savings", "conversational-memory", "efficiency", "prompt-caching", "prompt-engineering"]
tools: ["claude", "cursor", "gemini", "codex", "chatgpt"]
---

# Don't Re-Paste Entire Documents (Context Hygiene) (AI Skill)

## Overview
A common habit among users is re-pasting a 5,000-word document into the chat window every time they want to ask a follow-up question or tweak a single paragraph. 

Re-pasting entire files clogs the model's active memory window, invalidates prompt caches (making requests slower and more expensive), and risks exceeding context length limits.

The **Context Hygiene Protocol** teaches users how to reference already-loaded context using anchors, section numbers, and conversational pointers.

---

## Context Bloat vs. Context Hygiene

```
┌─────────────────────────────────────────────────────────────┐
│                 Context Bloat vs. Hygiene                   │
│                                                             │
│  Context Bloat (Re-pasting every turn):                     │
│  Turn 1: Paste 5,000-word document $\rightarrow$ 6,000 tokens │
│  Turn 2: Re-paste doc + 1 edit $\rightarrow$ 12,000 tokens  │
│  Turn 3: Re-paste doc + 1 fix $\rightarrow$ 18,000 tokens   │
│  ↳ Total: 36,000 tokens billed, high latency                │
│                                                             │
│  Context Hygiene (Pointer References):                      │
│  Turn 1: Paste 5,000-word document $\rightarrow$ 6,000 tokens │
│  Turn 2: "In Section 4, update point 2" $\rightarrow$ 6,100 t│
│  Turn 3: "Now check paragraph 3" $\rightarrow$ 6,200 t       │
│  ↳ Total: 18,300 tokens (50% savings, instant responses)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Master Pointer Reference Prompt Templates

### Pattern 1: The Anchor-Pointer Follow-Up
Use when modifying a document already present earlier in the chat:

```markdown
Referring to the document you reviewed in message #1:

Focus ONLY on **Section 3.2 (Payment Terms)**:
- Rewrite the late fee clause to specify 2% monthly interest instead of a flat $50 fee.
- Output only the revised Section 3.2 text.
```

---

### Pattern 2: The Chapter-by-Chapter Progression
Use when reviewing or drafting a multi-chapter report or ebook:

```markdown
We have established the outline in our previous turn.
Now let's work on **Chapter 2 ONLY**.

Do NOT reprint Chapter 1 or the outline.
Draft the 3 core subsections for Chapter 2 following our agreed tone.
```

---

## Real-World Case Study

### Scenario: Refactoring a 500-Line Config / Docker Compose File

#### The Wasteful Habit
> **User**: Pastes the entire 500-line `docker-compose.yml` file in Turn 1.
> In Turn 2, wants to add a Redis volume $\rightarrow$ Re-pastes the entire 500-line file with *"Add redis volume"*.
> In Turn 3, wants to change the Postgres password $\rightarrow$ Re-pastes the entire 500-line file.

#### The Context Hygiene Approach
> **Turn 1**: User uploads `docker-compose.yml`.
> **Turn 2**: *"Under the `redis` service defined above, add a persistent volume mount to `/data`. Show only the `redis` YAML block."*
> 
> **AI Response**:
> ```yaml
>   redis:
>     image: redis:7-alpine
>     ports:
>       - "6379:6379"
>     volumes:
>       - redis_data:/data
> ```

---

## 3 Rules of Context Hygiene
1. **Trust the session memory**: Within the same chat thread, the AI already remembers the document you pasted in Turn 1.
2. **Use specific section names**: Tell the AI: *"Look at Subsection 4B above"*.
3. **Start a fresh chat only when switching topics**: Keep related iterations in one thread, but reset when shifting to an unrelated project.
