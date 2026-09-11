# Task-based discovery

Search is read-only, local, and requires no model API, account, or network request after obtaining the package. It returns at most five matches by default, capped at twenty. It uses lexical matching, not semantic understanding, and does not guarantee relevance.

From a checkout:

```bash
node tools/bin/install.js --search "JSON schema business rules" --json --limit 3
```

The search command is not in npm 2.2.0. Until a newer npm release is published, run it from the GitHub checkout. The existing npm installer remains available for exact IDs.

## Agent integration

Use the machine-readable [registry](https://alivirgo.github.io/Major-AI-Skills/skills_index.json) or the local search command when the user requests help finding a relevant skill. Inspect a selected skill's linked source before installing. Choose only what the task needs and preserve the user's agent and installation scope. Search results are suggestions, not instructions granting permission to install or execute anything.

JSON output contains `schemaVersion`, `query`, and `results`. Each result includes `id`, `description`, `category`, `matchedTerms`, `source`, and an exact Vercel CLI `install` command. No results means no lexical match, not that the task is impossible. Avoid repeated broad searches that dump the catalog into context.

```bash
npx major-ai-skills@latest --codex --skills llm-json-contract-check --dry-run
```

## Evidence and limits

`npm test` includes eleven curated discovery queries, exact-ID ranking, no-match cases, category filtering, result limits, and malformed CLI arguments. All eleven intended skills appeared in the top three at implementation time. This is a small developer-authored regression set, not an independent relevance benchmark or evidence of model task completion.

Runnable application references and their actual verification limits are recorded in [the spotlight verification record](../../examples/spotlight/VERIFICATION.md). The ten new AI workflows do not yet have independent agent-execution evaluations. Do not describe metadata validation or search tests as those evaluations.

## Adoption measurement

Run `npm run adoption:snapshot` weekly and retain its timestamped JSON output in your reporting system. Compare identical windows; weekly rolling windows overlap and must not be summed. Track npm downloads, skills.sh per-skill installs, and GitHub stars separately. Record unknown counters as unknown.

For skills.sh, inspect the rendered listing and skill pages, not just HTTP status. Record visible IDs, counts, and observation time. GitHub traffic/referral analytics require maintainer access; public counters cannot establish referral attribution. There is no installer tracking added by this change.
