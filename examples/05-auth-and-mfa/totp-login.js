import { By, until } from 'selenium-webdriver';
import { authentication, credentials, driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 7 * 1000;
const USERNAME_CREDENTIAL_NAME = 'App Username';
const PASSWORD_CREDENTIAL_NAME = 'App Password';
const TOTP_CREDENTIAL_NAME = 'TOTP Seed';
const SELECTORS = {
  username: By.css('#username'),
  password: By.css('#password'),
  submit: By.css('button[type="submit"]'),
  totp: By.css('#totp'),
  totpSubmit: By.css('button[type="submit"]'),
  success: By.css('[data-testid="dashboard"]'),
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  const username = credentials.get(USERNAME_CREDENTIAL_NAME);
  const password = credentials.get(PASSWORD_CREDENTIAL_NAME);
  const totpSeed = credentials.get(TOTP_CREDENTIAL_NAME);

  await driver.get(targetUrl);

  markers.start('Password login');
  await typeText(SELECTORS.username, username);
  await typeText(SELECTORS.password, password);
  await driver.findElement(SELECTORS.submit).click();
  markers.stop('Password login');

  markers.start('TOTP');
  const totp = authentication.getTimeBasedOneTimePassword(totpSeed);
  await typeText(SELECTORS.totp, totp);
  await driver.findElement(SELECTORS.totpSubmit).click();
  await waitForVisible(SELECTORS.success, 60 * 1000);
  markers.stop('TOTP');

  await driver.takeScreenshot();
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
