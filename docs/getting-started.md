# Getting Started

A transaction script should do three things well:

1. Load the right target from test settings.
2. Wait for real browser/application state instead of sleeping blindly.
3. Produce evidence that helps someone understand failures later.

Start with [examples/00-basics/hello-world-settings-url.js](../examples/00-basics/hello-world-settings-url.js) or [templates/transaction-template.js](../templates/transaction-template.js).

## Default baseline transaction test

Use this baseline for new transaction tests. Configure `url` in the test settings before running it.

```js
import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const PAGE_READY_TIMEOUT_MS = 30 * 1000;

let currentStep = 'Starting transaction';

runScript();

async function runScript() {
  try {
    setCurrentStep('Configure driver');
    await configureDriver();

    const settings = test.getSettings();
    const targetUrl = settings.url;

    setCurrentStep('Load configured test URL');
    markers.start('Page Load');
    await driver.get(targetUrl);
    await waitForPageLoaded(PAGE_READY_TIMEOUT_MS);
    markers.stop('Page Load');

    setCurrentStep('Capture evidence screenshot');
    await driver.takeScreenshot();
  } catch (error) {
    await captureDiagnostics(error);
    throw error;
  }
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

function setCurrentStep(stepName) {
  currentStep = stepName;
}

//helper function for a generic signal that the page has been loaded
async function waitForPageLoaded(timeoutMs) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, timeoutMs, 'Timed out waiting for document.readyState to be complete');

  const body = await driver.wait(until.elementLocated(By.css('body')), timeoutMs);
  await driver.wait(until.elementIsVisible(body), timeoutMs);
}

async function captureDiagnostics(error) {
  console.log(`Transaction failed during step: ${currentStep}`);
  console.log(`Failure type: ${error.name || 'Error'}`);

  try {
    await driver.takeScreenshot();
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.name || 'Error'}`);
  }
}
```

## Configuration pattern

Use `test.getSettings()` for the transaction test URL saved by ThousandEyes:

- `url`

Keep other user-defined parameters as constants near the top of the script:

- expected title or text
- tenant or environment name
- feature flags for optional steps
- expected filename

Use the ThousandEyes credential store for secrets:

- passwords
- API tokens
- OAuth client secrets
- TOTP seeds
- bearer tokens

## Bounded polling

A short `driver.sleep()` can be appropriate inside a retry helper when it only spaces attempts and the helper has an explicit deadline. Keep the poll interval as a named top-level constant, cap each condition wait by the remaining deadline, and preserve the last failure for useful error reporting. This is different from using a fixed sleep to guess when a page will be ready: prefer an explicit wait whenever the browser exposes the state you need. See [retry-click-with-implicit-timeout.js](../examples/01-navigation-and-waits/retry-click-with-implicit-timeout.js) and [reusable-wait-action-patterns.js](../examples/01-navigation-and-waits/reusable-wait-action-patterns.js).

## Transaction timing

Overall transaction time starts when the script starts unless you call `transaction.start()`. If the script performs setup that should not be measured—such as API authentication, test-data preparation, or cookie setup—call `await transaction.start()` immediately before the user journey begins. See [transaction-start-after-setup.js](../examples/03-verification-and-markers/transaction-start-after-setup.js).

Use `markers.start()` and `markers.stop()` to measure smaller business steps inside the overall transaction, such as page load, login, search, or checkout. These are complementary: `transaction.start()` defines the overall timing boundary, while markers explain where time was spent within that boundary. If the transaction should end before the script finishes cleanup, use `transaction.stop()` at that boundary.

## First script checklist

- Add `await` before driver actions and waits.
- Configure implicit timeout once near the top.
- Use explicit waits for page state that matters.
- Name markers after business steps, not DOM operations.
- Take at least one screenshot after the page reaches the expected state.
- Capture diagnostics in `catch`, then throw the original error.
