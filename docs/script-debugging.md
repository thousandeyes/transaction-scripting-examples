# Script Debugging

Use this guide when modifying a transaction script so failures produce enough evidence to explain what happened without rerunning immediately.

## Evidence checklist

- Screenshot after page load.
- Screenshot after login or each major business step.
- Marker around each measured step.
- Current URL and title in failure logs.
- Short page-source excerpt in failure logs when a selector is missing.
- Console logs only for values that are safe to expose.

## Diagnostic wrapper

```js
try {
  await runTransaction();
} catch (error) {
  await captureDiagnostics(error);
  throw error;
}

async function captureDiagnostics(error) {
  console.log(`Failure: ${error.message}`);

  try {
    console.log(`Current URL: ${await driver.getCurrentUrl()}`);
    console.log(`Page title: ${await driver.getTitle()}`);
    await driver.takeScreenshot();

    const source = await driver.getPageSource();
    console.log(source.slice(0, 2000));
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.message}`);
  }
}
```

## Assertion patterns

Prefer explicit assertions at the point where the user goal is proven:

```js
const confirmation = await waitForVisible(By.css('[data-testid="confirmation"]'));
const text = await confirmation.getText();

if (!text.includes('Submitted')) {
  throw new Error(`Expected confirmation text to include "Submitted", got: ${text}`);
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
