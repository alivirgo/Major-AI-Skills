# MAS AI Workflows submission packet

Status: prepared, not submitted or approved.

## Submission progress (2.3.0)

- Prepared a focused `mas-ai-workflows-2.3.0.zip` archive from the plugin directory, not the entire repository.
- Added [five positive and three negative review cases](submission-test-cases.md). Actual imported-skill execution results are still pending.
- OpenAI supports direct Claude skills-only archives: `.claude-plugin/plugin.json` plus `skills/<id>/SKILL.md`. Start at https://platform.openai.com/plugins, choose Create plugin, then Skills only. [Official instructions](https://developers.openai.com/plugins/guides/submit-claude-plugin).
- Required OpenAI account prerequisites: Apps Management write access and individual/business verification. Listing fields include logo, support, privacy policy, and terms URLs. These publisher-owned policy details must not be fabricated. [Submission requirements](https://developers.openai.com/plugins/deploy/submission).
- Claude entry point: https://claude.ai/settings/plugins/submit (or https://platform.claude.com/plugins/submit).
- Automated account-form access is blocked because no browser is connected to the UI tool. No draft ID or submission receipt has been obtained.

## Publisher and source

- Publisher: Ali Virgo / alivirgo.
- Repository: https://github.com/alivirgo/Major-AI-Skills
- Plugin directory: `plugins/mas-ai-workflows`.
- Plugin ID: `mas-ai-workflows`.
- License: MIT.
- Package: https://www.npmjs.com/package/major-ai-skills
- Release history: https://github.com/alivirgo/Major-AI-Skills/releases

## Suggested listing copy

MAS AI Workflows provides ten focused instruction sets for developers evaluating AI applications: datasets, retrieval audits, JSON contracts, citation checking, privacy review, injection boundaries, tool replay, prompt regressions, cost measurement, and human approval handoffs. It uses the agent's existing tools; it does not provide a hosted model or automatically execute a benchmark.

## Review evidence

- Native Claude manifest validation and Codex manifest validation passed for the bundle during the 2.2.0 release.
- Canonical skill/bundle synchronization and registry checks run in CI.
- No bundled MCP servers, account connections, or automatic hooks.
- No added installer telemetry. Skills may guide the host agent to use external services when the user's authorized task requires them.
- Independent agent-execution tests of these ten workflows are still needed. Do not claim universal safety, performance gains, or official endorsement.

## Representative reviewer tasks

1. Give the JSON-contract skill a schema and an otherwise valid order with quantity -1. Require rejection at the business-rule layer, not schema success alone.
2. Give the citation skill an inaccessible citation. Require an access limitation rather than an invented quotation or page number.
3. Give the replay skill a timed-out message-send operation with unknown delivery state. Require reconciliation before replay.
4. Give the handoff skill an expired approval followed by changed payment details. Require renewed approval tied to the changed action.
5. Give the redaction skill records containing identifiers in both text and filenames. Require inspection of both without reproducing removed identifiers in the report.

These are proposed review cases, not recorded pass results. Keep sanitized transcripts, host/model versions, task inputs, actual outputs, and reviewer decisions when executing them.

## Submission channels

Claude's current [discovery documentation](https://code.claude.com/docs/en/discover-plugins) distinguishes community submissions from discretionary official curation. Use the in-app submission flow for the community marketplace; do not describe it as guaranteed entry into `claude-plugins-official`.

For OpenAI, consult the submission flow linked from [official plugin documentation](https://developers.openai.com/plugins/build/plugins). Public-directory submission, local marketplace discovery, and workspace sharing are different operations. Publisher account access and any required review evidence must be supplied by the maintainer. Do not invent contact, privacy, or legal attestations to complete a form.

Gemini's gallery listing was verified in the earlier audit. Recheck it after release updates rather than submitting duplicate listings. Avoid unsolicited mass posts and duplicate directory submissions.
