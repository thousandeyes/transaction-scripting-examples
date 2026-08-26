import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const EXPECTED_TITLE = 'Example';
const EXPECTED_URL_FRAGMENT = 'example';
const EXPECTED_TEXT = 'Example';
const MINIMUM_ITEM_COUNT = 1;
const MESSAGE_SELECTOR = By.css('body');
const ITEM_SELECTOR = By.css('a');

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  markers.start('Assertions');
  await assertTitleContains(EXPECTED_TITLE);
  await assertUrlContains(EXPECTED_URL_FRAGMENT);
  await assertElementTextContains(MESSAGE_SELECTOR, EXPECTED_TEXT);
  await assertElementCountAtLeast(ITEM_SELECTOR, MINIMUM_ITEM_COUNT);
  markers.stop('Assertions');

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function assertTitleContains(expected) {
  await driver.wait(until.titleContains(expected), 10 * 1000);
}

async function assertUrlContains(expected) {
  await driver.wait(until.urlContains(expected), 10 * 1000);
}

async function assertElementTextContains(locator, expected) {
  const element = await driver.wait(until.elementLocated(locator), 10 * 1000);
  const text = await element.getText();

  if (!text.includes(expected)) {
    throw new Error(`Expected text was not present. textLength=${text.length}`);
  }
}

async function assertElementCountAtLeast(locator, minimum) {
  const elements = await driver.findElements(locator);

  if (elements.length < minimum) {
    throw new Error(`Expected at least ${minimum} elements, found ${elements.length}`);
  }
}
