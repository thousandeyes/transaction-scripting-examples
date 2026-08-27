import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const SCROLL_TIMEOUT_MS = 15 * 1000;
const TARGET_SELECTOR = By.css('[data-testid="target-section"]');
const SCROLL_OPTIONS = {
  block: 'center',
  inline: 'nearest',
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;

  markers.start('Page Load');
  await driver.get(targetUrl);
  await waitForVisible(By.css('body'), SCROLL_TIMEOUT_MS);
  markers.stop('Page Load');

  markers.start('Scroll to Target');
  const target = await waitForLocated(TARGET_SELECTOR, SCROLL_TIMEOUT_MS);
  await driver.executeScript(
    'arguments[0].scrollIntoView(arguments[1]);',
    target,
    SCROLL_OPTIONS
  );
  await waitForElementInViewport(target, SCROLL_TIMEOUT_MS);
  markers.stop('Scroll to Target');

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function waitForLocated(locator, timeoutMs) {
  return driver.wait(until.elementLocated(locator), timeoutMs);
}

async function waitForVisible(locator, timeoutMs) {
  const element = await waitForLocated(locator, timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}

async function waitForElementInViewport(element, timeoutMs) {
  await driver.wait(async () => {
    return driver.executeScript(`
      const rect = arguments[0].getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    `, element);
  }, timeoutMs, 'Timed out waiting for target to enter the viewport');
}
