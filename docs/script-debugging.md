# Script Debugging

Use this guide when modifying a transaction script so failures produce enough evidence to explain what happened without rerunning immediately. For the repository logging policy and rationale, read [Logging and reporting](logging-and-reporting.md).

## Evidence checklist

- Screenshot after page load.
- Screenshot after login or each major business step.
- Marker around each measured step.
- Current step name in failure logs.
- Navigation metadata such as ready state, same-origin check, query/hash presence, path depth, and title length.
- Element metadata such as located count, displayed state, enabled state, and element size.
- Browser console severity counts only.
- Do not log page source, element text, full URLs, titles, cookies, storage, headers, response bodies, or console message bodies.

## Diagnostic wrapper

```js
let currentStep = 'Starting transaction';

function setCurrentStep(stepName) {
  currentStep = stepName;
}

try {
  await runTransaction();
} catch (error) {
  await captureDiagnostics(error);
  throw error;
}

async function captureDiagnostics(error) {
  console.log(`Transaction failed during step: ${currentStep}`);
  console.log(`Failure type: ${error.name || 'Error'}`);

  try {
    await logNavigationState();
    await logElementState('ready selector', READY_SELECTOR);
    await logConsoleSummary();
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.name || 'Error'}`);
  }
}

async function logNavigationState() {
  const settings = test.getSettings();
  const state = await driver.executeScript(`
    const configuredUrl = new URL(arguments[0]);
    return {
      readyState: document.readyState,
      sameOriginAsConfiguredUrl: window.location.origin === configuredUrl.origin,
      hasQueryString: window.location.search.length > 0,
      hasHash: window.location.hash.length > 0,
      pathDepth: window.location.pathname.split('/').filter(Boolean).length,
      titleLength: document.title.length,
      bodyPresent: Boolean(document.body),
    };
  `, settings.url);

  console.log(`Navigation state: ${JSON.stringify(state)}`);
}

async function logElementState(label, locator) {
  const elements = await driver.findElements(locator);
  console.log(`${label}: located=${elements.length > 0}, count=${elements.length}`);

  if (elements.length === 0) {
    return;
  }

  const element = elements[0];
  const displayed = await element.isDisplayed();
  const enabled = await element.isEnabled();
  const rect = await element.getRect();

  console.log(
    `${label}: displayed=${displayed}, enabled=${enabled}, rect=${Math.round(rect.width)}x${Math.round(rect.height)}`
  );
}

async function logConsoleSummary() {
  const logs = await driver.manage().logs().get('browser');
  const counts = logs.reduce((summary, entry) => {
    const level = String(entry.level?.name || entry.level || 'UNKNOWN');
    summary[level] = (summary[level] || 0) + 1;
    return summary;
  }, {});

  console.log(`Browser console summary: ${JSON.stringify(counts)}`);
}
```

## Assertion patterns

Prefer explicit assertions at the point where the user goal is proven:

```js
const confirmation = await waitForVisible(By.css('[data-testid="confirmation"]'));
const text = await confirmation.getText();

if (!text.includes('Submitted')) {
  throw new Error(`Expected confirmation text was not present. textLength=${text.length}`);
}
```

## Marker naming

Use markers for business steps:

- `Page Load`
- `Login`
- `Search`
- `Checkout`
- `Download`
- `Logout`

Avoid implementation-only marker names such as `Click`, `Find element`, or `Sleep`.

## Bounded polling

Use a retry loop only for transient action failures, such as a control that is present but briefly not clickable. Give the loop a deadline, cap each condition wait by the time remaining, and use a short named poll interval only between attempts. For page readiness, URL changes, or expected text, use a state-based explicit wait instead. See [retry-click-with-implicit-timeout.js](../examples/01-navigation-and-waits/retry-click-with-implicit-timeout.js) for the focused pattern and [reusable-wait-action-patterns.js](../examples/01-navigation-and-waits/reusable-wait-action-patterns.js) for a broader helper set.

## Overall transaction timing

By default, overall transaction timing begins when the script starts. If setup or authentication should be excluded from that measurement, call `await transaction.start()` immediately before the measured user journey. Keep `markers.start()` and `markers.stop()` around the business steps you want to inspect within that overall boundary. See [transaction-start-after-setup.js](../examples/03-verification-and-markers/transaction-start-after-setup.js).
