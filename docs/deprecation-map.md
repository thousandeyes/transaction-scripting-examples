# Legacy Example Map

The examples listed here were part of the former flat layout on `master`. They are no longer maintained as standalone files. Use the canonical example or migration guidance below instead of recreating an individual deprecation stub.

The current repository is organized around reusable Browser Synthetics patterns. Replace application-specific URLs, selectors, account names, and credential names with values from the system being monitored. Never copy secrets or customer-specific page content from a legacy script.

## How to use this map

- Start with the smallest canonical example that matches the behavior you need.
- Combine patterns when a legacy script covered several concerns, such as login, download, and verification.
- Convert standalone HTTP checks to ThousandEyes API tests. Keep an API step in a browser transaction only when it affects the browser journey; see [Convert to API test](convert-to-api-test.md).
- Treat entries marked “No direct replacement” as intentionally out of scope for this Browser Synthetics example repository.

## Browser transaction examples

| Legacy path from `master` | Use this guidance |
| --- | --- |
| `examples/loadPage.js` | Use [hello-world-settings-url.js](../examples/00-basics/hello-world-settings-url.js). |
| `examples/takeScreenshot.js` | Use the screenshot in [hello-world-settings-url.js](../examples/00-basics/hello-world-settings-url.js) for a basic checkpoint, or [evidence-on-failure.js](../examples/03-verification-and-markers/evidence-on-failure.js) for failure diagnostics. |
| `examples/configuringImplicitWaits.js` | Use [retry-click-with-implicit-timeout.js](../examples/01-navigation-and-waits/retry-click-with-implicit-timeout.js), which keeps implicit timeouts and retry deadlines explicit. |
| `examples/waitForCondition.js`, `examples/waitForUrl.js` | Use [wait-for-page-ready.js](../examples/01-navigation-and-waits/wait-for-page-ready.js) for page readiness, or [reusable-wait-action-patterns.js](../examples/01-navigation-and-waits/reusable-wait-action-patterns.js) for reusable condition and action helpers. |
| `examples/findAnyElement.js` | Use [find-first-available-element.js](../examples/01-navigation-and-waits/find-first-available-element.js) for ordered, legitimate UI alternatives. |
| `examples/reattemptClickUntilOtherElementExists.js` | Use [retry-click-with-implicit-timeout.js](../examples/01-navigation-and-waits/retry-click-with-implicit-timeout.js), then wait explicitly for the element that proves the click succeeded. |
| `examples/scrollElementIntoView.js` | Use [scroll-element-into-view.js](../examples/01-navigation-and-waits/scroll-element-into-view.js). |
| `examples/assertCondition.js` | Use [assertion-patterns.js](../examples/03-verification-and-markers/assertion-patterns.js). |
| `examples/detectJsErrors.js` | Use [browser-console-errors.js](../examples/03-verification-and-markers/browser-console-errors.js). |
| `examples/customTransactionStartTime.js` | Use [transaction-start-after-setup.js](../examples/03-verification-and-markers/transaction-start-after-setup.js) when setup should not count toward transaction time. |
| `examples/timePortionOfScript.js` | Use [marker-checkpoints.js](../examples/03-verification-and-markers/marker-checkpoints.js) for business-step timing. |
| `examples/waitForDownload.js` | Use [download-validate-file.js](../examples/04-files-downloads-uploads/download-validate-file.js). |
| `examples/usingCredentials.js` | Read [Credentials and secrets](credentials-and-secrets.md), then use [login-sso-logout.js](../examples/02-forms-and-login/login-sso-logout.js) when the credential is part of a browser login. |
| `examples/usingTOTPTwoFactorAuth.js` | Use [totp-login.js](../examples/05-auth-and-mfa/totp-login.js). |
| `examples/solveMathCaptcha.js` | Use [math-captcha.js](../examples/05-auth-and-mfa/math-captcha.js). |
| `examples/iframe.js`, `examples/shadowDomFindShadowRoot.js` | Use [iframe-and-shadow-dom.js](../examples/07-browser-edge-cases/iframe-and-shadow-dom.js). |
| `examples/dismissBrowserNativeAlert.js`, `examples/moveMouseIntoElement.js` | Use [tabs-alerts-hover.js](../examples/07-browser-edge-cases/tabs-alerts-hover.js). |
| `examples/switchToNextTab.js` | Prefer [switch-to-tab-by-url.js](../examples/07-browser-edge-cases/switch-to-tab-by-url.js) over relying on tab order. |
| `examples/switchToTabWithUrl.js` | Use [switch-to-tab-by-url.js](../examples/07-browser-edge-cases/switch-to-tab-by-url.js). |
| `examples/clickSpecificPosition.js`, `examples/html5CanvasInteractionCoordinates.js` | Use [canvas-coordinate-interaction.js](../examples/07-browser-edge-cases/canvas-coordinate-interaction.js) for coordinate-based canvas interaction. |
| `examples/checkIfElementExists.js` | Use the ordered alternative or optional-dismiss helpers in [reusable-wait-action-patterns.js](../examples/01-navigation-and-waits/reusable-wait-action-patterns.js). |
| `examples/closeConditionalPopup.js`, `examples/closeRandomPopupAsync.js` | Use [state-and-popups.js](../examples/07-browser-edge-cases/state-and-popups.js). Keep optional handling bounded and state-based; do not copy the legacy background polling approach. |

## Standalone HTTP and protocol scripts

Standalone HTTP scripts should use [Convert to API test](convert-to-api-test.md) for requests, authentication, assertions, variables, TLS, and proxy configuration. Protocol-level scripts that need raw socket behavior are collected in the advanced sandbox section; use the hybrid examples only when the API operation is part of a browser journey.

| Legacy path from `master` | Use this guidance |
| --- | --- |
| `examples/OAuthProtectedRestAPI.js` | Convert to an API test. If token acquisition is required before a browser flow, use [oauth-client-credentials-browser-flow.js](../examples/06-api-and-hybrid-flows/oauth-client-credentials-browser-flow.js) or [oauth-different-token-url.js](../examples/06-api-and-hybrid-flows/oauth-different-token-url.js). |
| `examples/fetchAPIWithBasicAuth.js`, `API-transaction-scripts/TE-API-Basic-auth.js` | Convert to an API test. If the request supports a browser journey, use [basic-auth-browser-flow.js](../examples/06-api-and-hybrid-flows/basic-auth-browser-flow.js). |
| `API-transaction-scripts/TE-API-Bearer-auth.js` | Convert to an API test. If the request supports a browser journey, use [bearer-token-browser-flow.js](../examples/06-api-and-hybrid-flows/bearer-token-browser-flow.js). |
| `examples/duoApiAuth.js` | Use [hmac-signed-http.js](../examples/08-advanced-transaction-sandbox/hmac-signed-http.js) as a generic transaction-script starting point. Duo's canonicalization and headers are provider-specific; API-test HMAC support is not assumed. |
| `examples/httpRequestConnectProxy.js`, `API-transaction-scripts/custom-settings-proxy.js`, `API-transaction-scripts/test-settings-proxy.js` | Use API test proxy settings. Do not preserve custom script-level proxy plumbing unless a browser journey specifically requires it. |
| `API-transaction-scripts/client-certificate.js`, `API-transaction-scripts/custom-ssl-certificate.js`, `API-transaction-scripts/disable-ssl-verification.js`, `API-transaction-scripts/proxy+custom-ssl-certificate.js`, `API-transaction-scripts/proxy+disable-ssl-verification.js` | Use API test TLS/client-certificate settings. Disable SSL verification only when intentionally required. |
| `API-transaction-scripts/simple-net-send-recv.js` | Use [raw-tcp-send-receive.js](../examples/08-advanced-transaction-sandbox/raw-tcp-send-receive.js) for a generic raw TCP request/response. Use an Agent-to-Server TCP test instead when port reachability is sufficient. |
| `API-transaction-scripts/simple-tls-send-recv.js` | Use [raw-tls-send-receive.js](../examples/08-advanced-transaction-sandbox/raw-tls-send-receive.js) for a generic raw TLS request/response. Use an API, HTTP Server, or Agent-to-Server TCP test when its higher-level behavior is sufficient. |
| `examples/imapLoginAndFetchEmail.js` | Use [imap-login-fetch-header.js](../examples/08-advanced-transaction-sandbox/imap-login-fetch-header.js) for a bounded IMAP-over-TLS transaction. There is no dedicated IMAP test type. |
| `examples/smtpServerAvailability.js` | Use [smtp-server-availability.js](../examples/08-advanced-transaction-sandbox/smtp-server-availability.js) for SMTP greeting/EHLO validation. Use an Agent-to-Server TCP test when port reachability is sufficient. |
| `examples/enterBasicAuthCredentials.js` | Do not copy the embedded username/password URL. Read [Credentials and secrets](credentials-and-secrets.md) and build a credential-backed flow only if browser HTTP Basic authentication is an actual requirement. |
| `examples/repeatingError.js` | Retire as a reusable example. It is a timing-dependent alerting probe, not a stable transaction pattern. |

## Application-specific scripts

The former Office 365 and Salesforce examples are retired as application-specific copies. Their reusable behavior is represented by generic patterns; adapt selectors, URLs, expected text, and credential names locally.

| Legacy path from `master` | Use this guidance |
| --- | --- |
| `applications/office-365/excel-login.js`, `applications/office-365/powerpoint-login.js`, `applications/office-365/word-login.js`, `applications/salesforce/Salesforce_Lightning_login.js` | Use [login-sso-logout.js](../examples/02-forms-and-login/login-sso-logout.js). |
| `applications/office-365/onedrive-download.js`, `applications/office-365/sharepoint-login-download.js` | Combine [login-sso-logout.js](../examples/02-forms-and-login/login-sso-logout.js) with [download-validate-file.js](../examples/04-files-downloads-uploads/download-validate-file.js). |
| `applications/office-365/teams-chat.js` | Compose the generic login, wait, form, assertion, and marker patterns. There is no application-specific Teams replacement. |
| `applications/office-365/outlook-send-email.js`, `applications/office-365/outlook-sendemail.js` | These are duplicate application-specific variants. Compose a local flow from the generic login, form, wait, and assertion examples instead of restoring either file. |
| `applications/office-365/exchange-ews-list-inbox.js`, `applications/office-365/exchange-ews-oauth-list-inbox.js`, `applications/office-365/exchange-ews-send-email.js`, `applications/office-365/graphapi-mail-inbox.js`, `applications/office-365/graphapi-oauth-list-inbox.js` | Convert the standalone API workflow to an API test using [Convert to API test](convert-to-api-test.md). Keep an authenticated API step in a browser transaction only when it affects the browser journey. |
| `applications/salesforce/SF_lightning_case_load.js` | Use [login-sso-logout.js](../examples/02-forms-and-login/login-sso-logout.js), page-ready waits, markers, and [assertion-patterns.js](../examples/03-verification-and-markers/assertion-patterns.js). Do not restore the Salesforce-specific URL or selectors. |

## Maintenance rule

The categorized examples and conversion guide are canonical. Update this page only when a legacy path needs a different destination or a canonical example is renamed. New examples should be added to the appropriate category and its README, not to the former flat directories and not as another deprecation stub.
