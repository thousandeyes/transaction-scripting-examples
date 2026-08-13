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
import { driver, markers, credentials, downloads, transaction, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const PAGE_READY_TIMEOUT_MS = 30 * 1000;

runScript();

async function runScript() {
  try {
    await configureDriver();

    const settings = test.getSettings();
    const targetUrl = settings.url;

    markers.start('Page Load');
    await driver.get(targetUrl);
    await waitForPageLoaded(PAGE_READY_TIMEOUT_MS);
    markers.stop('Page Load');

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

async function waitForPageLoaded(timeoutMs) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, timeoutMs, 'Timed out waiting for document.readyState to be complete');

  const body = await driver.wait(until.elementLocated(By.css('body')), timeoutMs);
  await driver.wait(until.elementIsVisible(body), timeoutMs);
}

async function captureDiagnostics(error) {
  console.log(`Transaction failed: ${error.message}`);

  try {
    console.log(`Current URL: ${await driver.getCurrentUrl()}`);
    console.log(`Page title: ${await driver.getTitle()}`);
    await driver.takeScreenshot();
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.message}`);
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

## First script checklist

- Add `await` before driver actions and waits.
- Configure implicit timeout once near the top.
- Use explicit waits for page state that matters.
- Name markers after business steps, not DOM operations.
- Take at least one screenshot after the page reaches the expected state.
- Capture diagnostics in `catch`, then throw the original error.
