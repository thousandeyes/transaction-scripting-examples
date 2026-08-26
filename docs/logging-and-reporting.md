# Logging And Reporting

Transaction script logs, thrown errors, screenshots, and captured diagnostics can be used during troubleshooting and may be shared beyond the person who wrote the test. Treat anything written to `console.log`, included in an error message, or captured as evidence as information that should not contain secrets, tokens, or customer data.

The examples in this repository favor diagnostic metadata over raw application data. The goal is to show what happened without copying page content, credentials, URLs, or response bodies into ThousandEyes results.

## Approved patterns

- Log the current step or marker name.
- Log the failure type, such as `Error`, instead of the raw error message when the message may contain application data.
- For HTTP and OAuth failures, log status and status text only.
- For navigation, log metadata such as `document.readyState`, whether the current origin matches the configured test URL, whether query/hash values exist, path depth, title length, and whether the body is present.
- For elements, log labels, located count, displayed state, enabled state, and size.
- For browser console diagnostics, log severity counts only.
- For text assertions, use page text internally but report only that the expected text was missing plus metadata such as text length.

## Do not log

- Page source, DOM snapshots, `innerHTML`, or `outerHTML`.
- Full URLs, query-string values, hash fragments, page titles, or redirect targets.
- Element text, alert text, form values, usernames, account names, tenant names, order IDs, case IDs, or record names.
- Credentials, API keys, tokens, TOTP seeds, cookies, storage values, authorization headers, or request headers.
- HTTP request bodies, response bodies, OAuth error response bodies, or parsed OAuth token fields.
- Browser console message bodies, stack traces, or network payloads.

## Failure diagnostics

Use a small diagnostic wrapper in templates and baseline examples:

```js
let currentStep = 'Starting transaction';

function setCurrentStep(stepName) {
  currentStep = stepName;
}

async function captureDiagnostics(error) {
  console.log(`Transaction failed during step: ${currentStep}`);
  console.log(`Failure type: ${error.name || 'Error'}`);
}
```

For deeper troubleshooting, add the diagnostic metadata pattern from [evidence-on-failure.js](../examples/03-verification-and-markers/evidence-on-failure.js). That example adds navigation metadata, element state, and browser console severity counts without logging page source, URLs, titles, alert text, or console message bodies.

## API and OAuth reporting

When an API step fails, report only the step name and status:

```js
if (!response.ok) {
  throw new Error(`${AUTH_STEP_NAME} failed: ${response.status} ${response.statusText}`);
}
```

Do not append `await response.text()` or parsed response JSON to error messages. OAuth error responses and API response bodies can include tokens, tenant details, user identifiers, provider diagnostics, or customer data.

## Text assertions

It is fine to read page text to verify user-visible behavior. Do not print the observed text:

```js
const text = await element.getText();

if (!text.includes(EXPECTED_SUCCESS_TEXT)) {
  throw new Error(`Expected success text was not present. textLength=${text.length}`);
}
```

## Screenshots

Screenshots are useful evidence when they show expected page state or business checkpoints. Before adding a screenshot, consider whether the page may display unmasked secrets, personal data, customer records, support cases, tenant names, or account details. For login, MFA, admin, support, checkout, healthcare, finance, or customer-record workflows, use screenshots only after the app reaches a page state intended for synthetic monitoring evidence, or rely on metadata and targeted assertions instead.
