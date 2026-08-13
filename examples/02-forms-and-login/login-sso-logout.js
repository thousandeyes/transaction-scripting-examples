import { By, until } from 'selenium-webdriver';
import { driver, credentials, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 7 * 1000;
const USERNAME_CREDENTIAL_NAME = 'App Username';
const PASSWORD_CREDENTIAL_NAME = 'App Password';
const POST_LOGIN_URL_FRAGMENT = 'dashboard';
const SELECTORS = {
  username: By.css('#username'),
  password: By.css('#password'),
  submit: By.css('button[type="submit"]'),
  dashboard: By.css('[data-testid="dashboard"]'),
  logout: By.css('[data-testid="logout"]'),
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  const username = credentials.get(USERNAME_CREDENTIAL_NAME);
  const password = credentials.get(PASSWORD_CREDENTIAL_NAME);

  await driver.get(targetUrl);

  markers.start('Login');
  await typeText(SELECTORS.username, username);
  await typeText(SELECTORS.password, password);
  await driver.findElement(SELECTORS.submit).click();

  await driver.wait(until.urlContains(POST_LOGIN_URL_FRAGMENT), 60 * 1000);
  await waitForVisible(SELECTORS.dashboard, 60 * 1000);
  markers.stop('Login');
  await driver.takeScreenshot();

  markers.start('Logout');
  await clickIfPresent(SELECTORS.logout);
  markers.stop('Logout');
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function typeText(locator, value) {
  const element = await waitForVisible(locator, 15 * 1000);
  await element.clear();
  await element.sendKeys(value);
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}

async function clickIfPresent(locator) {
  const elements = await driver.findElements(locator);
  if (elements.length === 0) {
    console.log('Logout control was not present; skipping cleanup.');
    return;
  }

  await elements[0].click();
}
