# ThousandEyes Transaction Scripting Examples

Examples, templates, and guidance for writing maintainable ThousandEyes Browser Synthetics transaction scripts.

The examples are intentionally generic: configure the transaction test URL in ThousandEyes, then replace placeholder selectors, credential names, expected text, and other top-level constants with values from your own application.

Note: this project contains example code and is not covered under ThousandEyes support.

## Start here

- New to transaction scripting: read [Getting started](docs/getting-started.md), then run through [00-basics](examples/00-basics/).
- Modifying scripts for flaky browser flows: start with [Selector strategy](docs/selector-strategy.md) and [Script debugging](docs/script-debugging.md).
- Handling passwords, TOTP, MFA, or secrets: read [Credentials and secrets](docs/credentials-and-secrets.md).
- Adding logs, errors, or screenshots: read [Logging and reporting](docs/logging-and-reporting.md).
- Deciding whether a browser flow should become an API or hybrid test: read [Convert to API test](docs/convert-to-api-test.md).
- Migrating from the former flat repository layout: use the [legacy example map](docs/deprecation-map.md).
- Working with raw protocols or request signing: read [Advanced transaction sandbox tests](docs/advanced-sandbox-tests.md) first; these examples are not for beginners and are use at your own risk.

## Repository map

```text
docs/
  getting-started.md
  logging-and-reporting.md
  selector-strategy.md
  script-debugging.md
  credentials-and-secrets.md
  convert-to-api-test.md
  deprecation-map.md

examples/
  00-basics/
  01-navigation-and-waits/
  02-forms-and-login/
  03-verification-and-markers/
  04-files-downloads-uploads/
  05-auth-and-mfa/
  06-api-and-hybrid-flows/
  07-browser-edge-cases/
  08-advanced-transaction-sandbox/

templates/
  transaction-template.js
  browser-plus-api-template.js

scripts/
  validate-repository.mjs
```

## Example categories

| Category | Use it for |
| --- | --- |
| [00-basics](examples/00-basics/) | Hello-world page load, `test.getSettings()`, page-ready wait, screenshots. |
| [01-navigation-and-waits](examples/01-navigation-and-waits/) | Replacing sleeps, waiting for URL/title/elements, retrying clicks. |
| [02-forms-and-login](examples/02-forms-and-login/) | Typing, pressing Enter, dropdowns, submit flows, username/password login, SSO waits, logout cleanup. |
| [03-verification-and-markers](examples/03-verification-and-markers/) | Markers, transaction timing, assertions, screenshots, and diagnostics on failure. |
| [04-files-downloads-uploads](examples/04-files-downloads-uploads/) | Waiting for downloads, validating file expectations, and generating upload files. |
| [05-auth-and-mfa](examples/05-auth-and-mfa/) | TOTP, login MFA, and math captcha patterns. |
| [06-api-and-hybrid-flows](examples/06-api-and-hybrid-flows/) | Browser flows that need API authentication or authenticated API setup before the browser journey. |
| [07-browser-edge-cases](examples/07-browser-edge-cases/) | Iframes, shadow DOM, native alerts, new tabs/windows, hover menus, state, popups, and consent banners. |
| [08-advanced-transaction-sandbox](examples/08-advanced-transaction-sandbox/) | Advanced raw TCP, TLS, IMAP, SMTP, and HMAC transaction scripts; not for beginners. |

## Transaction Test Tricks and Tips

- Use `test.getSettings()` for the transaction test URL saved by ThousandEyes.
- Keep other user-defined values as constants near the top of the script so they are easy to review and edit.
- Use `credentials.get()` for passwords, API tokens, client secrets, TOTP seeds, and other secrets.
- Log diagnostic metadata instead of page source, raw page text, full URLs, response bodies, or secret-bearing values.
- Put markers around business steps: page load, login, search, checkout, authenticated API checks, download, and logout.
- Prefer explicit waits and bounded retry helpers over fixed sleeps. If a retry loop needs a short polling interval, name it and keep the total timeout explicit.
- Capture screenshots at important checkpoints only when the page state is appropriate for result collection.
- Keep examples copyable. Keep local selectors, URLs, and helper functions grouped where future editors can find them quickly.

## Validate changes

Run `npm run validate` before sharing changes. The zero-dependency validator checks JavaScript syntax, local Markdown links, example index coverage, the customizable-values convention, and the safe diagnostic logging patterns described in [Logging and reporting](docs/logging-and-reporting.md). The same check runs for pushes and pull requests in GitHub Actions.

## Additional Resources

- [Transaction tests documentation](https://docs.thousandeyes.com/product-documentation/browser-synthetics/transaction-tests)
- [Transaction scripting reference](https://docs.thousandeyes.com/product-documentation/browser-synthetics/transaction-tests/transaction-scripting-reference)
- [Selenium WebDriver JavaScript API](https://www.selenium.dev/selenium/docs/api/javascript/)
