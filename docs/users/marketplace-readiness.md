# Marketplace readiness

Update: current Claude documentation routes in-app submissions to the community marketplace, not the discretionary official catalog. See the [submission packet](marketplace-submission-packet.md) for the distinction and review evidence gaps.

Audit: September 11, 2026. Repository compatibility and official-directory approval are separate.

## Claude Code

The self-hosted marketplace exposes the full library plus seven focused bundles. Prefer a focused bundle. The native `claude plugin validate .` command passes without warnings after publisher metadata was added. Bundle files are generated from canonical skills, not independently maintained copies.

```text
/plugin marketplace add alivirgo/Major-AI-Skills
/plugin install mas-cad-studio@major-ai-skills
```

No matching entry was found in the public anthropics/claude-plugins-official repository tree during this audit. This is not proof about pending submissions. Official submission requires the maintainer's account and review through [Claude's submission form](https://claude.ai/settings/plugins/submit) or [Console](https://platform.claude.com/plugins/submit). See [official distribution instructions](https://code.claude.com/docs/en/discover-plugins).

## Codex

The previous `.agents/plugins/marketplace.json` contained custom fields but no `plugins` array. It is now a native catalog with seven focused plugins, local source paths, availability policies, and validated `.codex-plugin/plugin.json` manifests.

```bash
codex plugin marketplace add alivirgo/Major-AI-Skills
codex plugin list --marketplace major-ai-skills --available
```

These remote commands require the changes to be pushed first. For local testing, add the repository directory instead. Adding a marketplace does not install all its plugins. Choose a bundle in the plugin directory and start a new session after installation.

This is a self-hosted marketplace, not an OpenAI-curated listing. Public-directory review is a separate process. [Official packaging and marketplace documentation](https://developers.openai.com/plugins/build/plugins).

## Gemini CLI

The public GitHub repository already has the `gemini-cli-extension` topic. Its root `gemini-extension.json` references an existing `GEMINI.md`; its version now matches package.json. Canonical skills are under the extension's root `skills/` directory.

```bash
gemini extensions install https://github.com/alivirgo/Major-AI-Skills
```

The live [Gemini extension gallery](https://geminicli.com/extensions) was searched for `major-ai-skills` during this audit. It returned `major-ai-skills`, owner `alivirgo/Major-AI-Skills`, with Context and Skills labels. Listing is confirmed. The [official releasing guide](https://geminicli.com/docs/extensions/releasing/) describes daily discovery of tagged public repositories. Gemini CLI was not installed on the audit machine, so a native extension installation was not tested.

## Maintenance

Run `npm run marketplaces` after canonical skill or package-version changes. CI runs `npm run marketplaces:check` to reject stale plugin content or metadata. Run `npm test`, `npm run validate`, and `claude plugin validate .` before release. Official-directory submissions still need account access and truthful test evidence; do not claim tested product workflows merely from manifest validation.
