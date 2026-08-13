import { By, Key, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const SEARCH_TERM = 'order status';
const EXPECTED_TEXT = 'Result';
const SEARCH_SELECTOR = By.css('input[type="search"]');
const RESULT_SELECTOR = By.css('[data-testid="result"]');

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;

  await marked('Page Load', async () => {
    await driver.get(targetUrl);
    await driver.wait(until.elementLocated(By.css('body')), 15 * 1000);
  });

  await marked('Search', async () => {
    const input = await waitForVisible(SEARCH_SELECTOR, 15 * 1000);
    await input.clear();
    await input.sendKeys(SEARCH_TERM, Key.RETURN);
    await waitForVisible(RESULT_SELECTOR, 20 * 1000);
  });

  await marked('Verification', async () => {
    const bodyText = await driver.findElement(By.css('body')).getText();
    if (!bodyText.includes(EXPECTED_TEXT)) {
      throw new Error(`Expected page text to include "${EXPECTED_TEXT}"`);
    }
  });

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function marked(name, action) {
  markers.start(name);
  try {
    return await action();
  } finally {
    markers.stop(name);
  }
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
