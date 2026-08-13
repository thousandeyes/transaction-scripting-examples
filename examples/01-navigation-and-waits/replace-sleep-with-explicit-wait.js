import { By, Key, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const SEARCH_TERM = 'status';
const SELECTORS = {
  searchInput: By.css('input[type="search"]'),
  result: By.css('[data-testid="search-result"]'),
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;

  markers.start('Search');
  await driver.get(targetUrl);
  const input = await waitForVisible(SELECTORS.searchInput, 15 * 1000);
  await input.clear();
  await input.sendKeys(SEARCH_TERM, Key.RETURN);

  const result = await waitForVisible(SELECTORS.result, 20 * 1000);
  markers.stop('Search');

  console.log(`First result text: ${await result.getText()}`);
  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
