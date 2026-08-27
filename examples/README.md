# Examples

Examples are grouped by the problem they teach. Each script is designed to be copied into the ThousandEyes Recorder IDE or a transaction test, use the saved ThousandEyes test URL, and then be customized with your own selectors, expected text, credential names, and other top-level constants.

## Categories

- [00-basics](00-basics/) - page load, settings URL, page-ready wait, screenshots.
- [01-navigation-and-waits](01-navigation-and-waits/) - explicit waits, retry clicks, replacing sleeps, scrolling, and alternate locators.
- [02-forms-and-login](02-forms-and-login/) - forms, dropdowns, username/password login, SSO waits, logout cleanup.
- [03-verification-and-markers](03-verification-and-markers/) - markers, transaction timing, assertions, screenshots, browser-console checks, and failure diagnostics.
- [04-files-downloads-uploads](04-files-downloads-uploads/) - downloads, filename/content/hash checks, upload file generation.
- [05-auth-and-mfa](05-auth-and-mfa/) - TOTP, login MFA, math captcha.
- [06-api-and-hybrid-flows](06-api-and-hybrid-flows/) - OAuth client credentials, Bearer token, Basic auth, API key authentication, different OAuth token URLs, and authenticated API setup before browser flows.
- [07-browser-edge-cases](07-browser-edge-cases/) - iframes, shadow DOM, alerts, tabs, URL-based tab selection, hover, canvas, state, and popups.

## How to choose an example

- Start with the smallest example that matches your problem.
- Copy only the helpers you need.
- Keep selectors and other user-defined constants grouped near the top while adapting.
- Add markers around business steps, not every click.
- Replace sleeps with waits tied to application state.

## Find an example by problem

| If you need to... | Start with |
| --- | --- |
| Scroll a control or section into view | [scroll-element-into-view.js](01-navigation-and-waits/scroll-element-into-view.js) |
| Wait for one of several legitimate locators | [find-first-available-element.js](01-navigation-and-waits/find-first-available-element.js) |
| Fail when a page emits severe browser-console errors | [browser-console-errors.js](03-verification-and-markers/browser-console-errors.js) |
| Exclude setup from overall transaction timing | [transaction-start-after-setup.js](03-verification-and-markers/transaction-start-after-setup.js) |
| Interact with a canvas by relative coordinates | [canvas-coordinate-interaction.js](07-browser-edge-cases/canvas-coordinate-interaction.js) |
| Switch to a new tab by URL | [switch-to-tab-by-url.js](07-browser-edge-cases/switch-to-tab-by-url.js) |
