# Agent Context

This repo is a transaction-scripting reference for ThousandEyes Browser Synthetics. Treat examples as public, reusable teaching material.

## Editing rules

- Do not commit real customer URLs, usernames, account names, tokens, passwords, TOTP seeds, or private page content.
- Keep scripts self-contained.
- Use `test.getSettings()` for the transaction test URL saved by ThousandEyes, and `credentials.get()` for secrets.
- Keep other user-defined values as constants near the top of the script so they are easy to review and edit.
- Prefer explicit waits, implicit timeout configuration, and bounded retry helpers over fixed sleeps.
- Add markers for business-relevant timing and screenshots for evidence-heavy flows.
- Wrap full transaction flows in `try/catch` when the example is meant to teach diagnostics.
- Keep placeholders obvious: `https://example.com`, `App Password`, `#username`, `Expected success text`.
- When adding a new example, update `examples/README.md` and the relevant category README.

## Structure

- `docs/` explains patterns and authoring decisions.
- `examples/` contains runnable, categorized scripts.
- `templates/` contains starting points for new scripts.
