---
name: react
description: "Build accessible React UIs with function components, hooks, derived state, and effect discipline; fix Strict Mode double-invoke, list keys, and concurrent rendering pitfalls. Use for components, forms, and client islands in Next.js or SPA apps."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["react", "hooks", "components", "frontend", "a11y", "react-19", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# React UI Engineering AI Skill Guide (Claude)

## Overview & Engine Architecture

React renders a **component tree** of functions returning UI. **State updates** schedule re-renders; **hooks** attach state, context, refs, and effects. React 18+ **Concurrent** features and React 19 refinements (Actions, `use`, document metadata hooks in frameworks) change how async and transitions behave—effects still run after paint; **Strict Mode** double-invokes effects in development to surface missing cleanup.

Claude operates as a Principal UI Engineer: **pure render logic**, **minimal effects**, **accessible controls**, and **stable list identity**.

```
Render (derive from props/state)
  → commit DOM
      → useLayoutEffect (sync after DOM)
      → useEffect (async after paint)
```

---

## When to use / when not to

**Use when**

- Building interactive UI, forms, and client islands (`"use client"` in Next.js).
- Refactoring prop drilling into composition or colocated context.
- Fixing infinite loops, stale closures, and a11y failures.

**Do not use when**

- All data and interactivity can stay on the server (Next.js Server Components)—avoid unnecessary client bundles.
- Global state library migration is a team process—don't introduce Redux/Zustand without convention.

---

## Operational Capabilities & Agent Directives

1. **Derive during render**—don't mirror props into state (`fullName = first + last`).
2. **Effects for external sync only** (subscriptions, imperative DOM, analytics)—not for transforming props to state.
3. **Dependency arrays must be honest**; exhaustive-deps lint is your friend.
4. **Keys**: Stable unique IDs for reorderable lists—never index-as-key when order changes.
5. **Accessibility**: Real `<button>`, `<label htmlFor>`, keyboard focus; don't click-only `<div>`.
6. **React 19 / Actions**: Prefer `useTransition` + server actions (in Next) for mutations instead of manual loading flags when appropriate.
7. **Don't fetch in useEffect** for initial page data when a server layer exists (`@nextjs`).

---

## Patterns

Controlled input:

```tsx
function Search({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label>
      Search
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
```

Functional updates (avoid stale state):

```tsx
setCount((c) => c + 1);
```

---

## Technical Troubleshooting Matrix

| Bug | Cause | Fix |
| --- | --- | --- |
| Infinite re-render | Effect sets state that retriggers effect | Remove cycle; derive |
| Stale handler | Missing deps | Fix deps or functional updates |
| Lost focus | Unstable keys remount subtree | Stable keys on list items |
| Double fetch in dev | Strict Mode | Ensure idempotent effects + cleanup |
| Hydration error | Server HTML ≠ client first render | Gate client-only UI with `useEffect` or suppress only when safe |
| "Cannot update during render" | setState in render body | Move to event handler/effect |

---

## Best practices

- Colocate state at lowest common ancestor.
- Error boundaries for recoverable regions.
- Test with Testing Library (`getByRole`, `getByLabelText`).
- Side effects and network mutations: dedicated hooks or server layer.
- Memoize (`useMemo`, `useCallback`) only when profiling shows cost.

---

## Limitations

- React doesn't include routing, data fetching, or CSS strategy—framework choices matter.
- Concurrent rendering can interrupt renders—avoid non-idempotent render side effects.
- Server Components (Next.js) cannot use most hooks—split client boundaries.

---

## Related skills

- `@nextjs` — RSC vs client boundaries
- `@typescript` — prop and hook typing
- `@vitest` — component unit tests
- `@playwright` — E2E behavior

---

## Agent Operational Directive

> **MANDATORY**: Prefer derived state over effect-synced state. Fix effect dependency bugs instead of disabling lint. Use semantic HTML and role-based queries in tests. Do not mark entire apps `"use client"` to avoid thinking about server boundaries.

---

## Sources

- [React docs](https://react.dev/) — hooks, Strict Mode, useEffect
- React 19 release notes — Actions, concurrent updates
