import { By, Key, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const FIRST_NAME = 'Jane';
const LAST_NAME = 'Doe';
const EMAIL = 'jane.doe@example.com';
const TOPIC_VALUE = 'support';
const EXPECTED_SUCCESS_TEXT = 'Success';
const SELECTORS = {
  firstName: By.css('#first-name'),
  lastName: By.css('#last-name'),
  email: By.css('#email'),
  topic: By.css('#topic'),
  submit: By.css('button[type="submit"]'),
  success: By.css('[data-testid="success-message"]'),
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;

  await driver.get(targetUrl);

  markers.start('Complete form');
  await typeText(SELECTORS.firstName, FIRST_NAME);
  await typeText(SELECTORS.lastName, LAST_NAME);
  await typeText(SELECTORS.email, EMAIL);

  await chooseOption(SELECTORS.topic, TOPIC_VALUE);
  await driver.findElement(SELECTORS.email).sendKeys(Key.TAB);
  await driver.findElement(SELECTORS.submit).click();
  markers.stop('Complete form');

  const success = await waitForVisible(SELECTORS.success, 15 * 1000);
  const successText = await success.getText();

  if (!successText.includes(EXPECTED_SUCCESS_TEXT)) {
    throw new Error(`Expected success text to include "${EXPECTED_SUCCESS_TEXT}", got: ${successText}`);
  }

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function typeText(locator, value) {
  const element = await waitForVisible(locator, 10 * 1000);
  await element.clear();
  await element.sendKeys(value);
}

async function chooseOption(selectLocator, value) {
  const select = await waitForVisible(selectLocator, 10 * 1000);
  await select.click();
  await select.findElement(By.css(`option[value="${value}"]`)).click();
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
