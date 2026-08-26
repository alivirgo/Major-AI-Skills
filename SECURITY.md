# Security Policy

## Supported Versions

Security fixes apply to the latest `main` branch and the current npm package release of `major-ai-skills`.

## Reporting a Vulnerability

If you find a skill that includes unsafe command examples, credential leakage patterns, or destructive guidance without clear authorization gates:

1. Open a private security advisory on GitHub if the issue is sensitive, or
2. Open a public Issue labeled `security` for documentation-only problems.

Please include:

- skill ID / path
- the risky snippet
- why it is dangerous in an agent context
- a suggested safer rewrite if you have one

We do not execute skill contents during install. Still, agents may later act on installed instructions, so high-risk guidance must be labeled and gated.
