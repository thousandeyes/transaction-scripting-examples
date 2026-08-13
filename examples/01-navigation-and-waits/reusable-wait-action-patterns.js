import { By, Key, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const DEFAULT_WAIT_TIMEOUT_MS = 15 * 1000;
const EXPECTED_URL_FRAGMENT = 'example';
const SEARCH_TERM = 'status';
const EXPECTED_TEXT = 'status';
const SELECTORS = {
  optionalModalClose: By.css('[data-testid="modal-close"]'),
  searchInput: By.css('input[type="search"]'),
  submitButton: By.css('button[type="submit"]'),
  result: By.css('[data-testid="result"]'),
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;

  markers.start('Page Load');
  await driver.get(targetUrl);
  await waitForUrlFragment(EXPECTED_URL_FRAGMENT);
  markers.stop('Page Load');

  await dismissIfPresent(SELECTORS.optionalModalClose, 'optional modal');

  markers.start('Search');
  await typeText(SELECTORS.searchInput, SEARCH_TERM);
  await driver.findElement(SELECTORS.searchInput).sendKeys(Key.RETURN);
  await waitForText(SELECTORS.result, EXPECTED_TEXT);
  markers.stop('Search');

  markers.start('Submit');
  await clickWhenReady(SELECTORS.submitButton);
  markers.stop('Submit');

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function waitForUrlFragment(fragment, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) {
  await driver.wait(until.urlContains(fragment), timeoutMs);
}

async function waitForLocated(locator, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) {
  return driver.wait(until.elementLocated(locator), timeoutMs);
}

async function waitForVisible(locator, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) {
  const element = await waitForLocated(locator, timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}

async function waitForText(locator, expectedText, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) {
  await driver.wait(async () => {
    const elements = await driver.findElements(locator);
    if (elements.length === 0) {
      return false;
    }

    const text = await elements[0].getText();
    return text.includes(expectedText);
  }, timeoutMs);
}

async function typeText(locator, value, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) {
  const element = await waitForVisible(locator, timeoutMs);
  await element.clear();
  await element.sendKeys(value);
}

async function clickWhenReady(locator, timeoutMs = DEFAULT_WAIT_TIMEOUT_MS) {
  const endTime = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < endTime) {
    try {
      const element = await waitForVisible(locator, 2 * 1000);
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

async function dismissIfPresent(locator, label = 'optional element') {
  const elements = await driver.findElements(locator);
  if (elements.length === 0) {
    return false;
  }

  await elements[0].click();
  console.log(`Dismissed ${label}.`);
  return true;
}
