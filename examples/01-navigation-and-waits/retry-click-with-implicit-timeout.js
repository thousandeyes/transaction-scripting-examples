import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 7 * 1000;
const MAX_ATTEMPT_WAIT_MS = 2 * 1000;
const RETRY_POLL_INTERVAL_MS = 250;
const SUBMIT_SELECTOR = By.css('button[type="submit"]');

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  markers.start('Submit');
  await clickWhenReady(SUBMIT_SELECTOR);
  markers.stop('Submit');

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function clickWhenReady(locator) {
  const configuredTimeouts = await driver.manage().getTimeouts();
  const timeoutMs = configuredTimeouts.implicit || IMPLICIT_TIMEOUT_MS;
  const endTime = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < endTime) {
    try {
      const element = await waitForRetryCondition(until.elementLocated(locator), endTime);
      await waitForRetryCondition(until.elementIsVisible(element), endTime);
      await waitForRetryCondition(until.elementIsEnabled(element), endTime);
      await element.click();
      return;
    } catch (error) {
      lastError = error;
      const remainingMs = endTime - Date.now();
      if (remainingMs <= 0) {
        break;
      }

      // This short delay spaces bounded retries; the deadline limits total wait time.
      await driver.sleep(Math.min(RETRY_POLL_INTERVAL_MS, remainingMs));
    }
  }

  throw lastError || new Error(`Unable to click locator: ${locator}`);
}

async function waitForRetryCondition(condition, endTime) {
  const remainingMs = endTime - Date.now();
  if (remainingMs <= 0) {
    throw new Error('Retry timeout expired');
  }

  return driver.wait(condition, Math.min(MAX_ATTEMPT_WAIT_MS, remainingMs));
}
