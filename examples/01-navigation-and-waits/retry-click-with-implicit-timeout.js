import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 7 * 1000;
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
      const element = await driver.wait(until.elementLocated(locator), 2 * 1000);
      await driver.wait(until.elementIsVisible(element), 2 * 1000);
      await driver.wait(until.elementIsEnabled(element), 2 * 1000);
      await element.click();
      return;
    } catch (error) {
      lastError = error;
      await driver.sleep(250);
    }
  }

  throw lastError || new Error(`Unable to click locator: ${locator}`);
}
