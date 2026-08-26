import { By, until } from 'selenium-webdriver';
import { credentials, driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
//Store cookie values in the ThousandEyes Credentials Repository.
const COOKIE_NAME = 'Example Preference Cookie';
const COOKIE_VALUE_CREDENTIAL_NAME = 'Example Preference Cookie Value';
const CONSENT_SELECTOR = By.css('#onetrust-accept-btn-handler');
const MODAL_CLOSE_SELECTOR = By.css('[data-testid="modal-close"]');
const READY_SELECTOR = By.css('body');

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  markers.start('Prepare state');
  await setStorage('syntheticTest', 'true');
  await addCookieIfConfigured(COOKIE_NAME, COOKIE_VALUE_CREDENTIAL_NAME);
  markers.stop('Prepare state');

  await dismissIfPresent(CONSENT_SELECTOR, 'consent banner');
  await dismissIfPresent(MODAL_CLOSE_SELECTOR, 'modal');

  await waitForVisible(READY_SELECTOR, 15 * 1000);
  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function setStorage(key, value) {
  await driver.executeScript(
    'window.localStorage.setItem(arguments[0], arguments[1]); window.sessionStorage.setItem(arguments[0], arguments[1]);',
    key,
    value
  );
}

async function addCookieIfConfigured(name, credentialName) {
  if (!name || !credentialName) {
    return;
  }

  const value = credentials.get(credentialName);

  await driver.manage().addCookie({
    name,
    value,
  });
}

async function dismissIfPresent(locator, label) {
  const elements = await driver.findElements(locator);
  if (elements.length === 0) {
    console.log(`No ${label} found.`);
    return;
  }

  await elements[0].click();
  console.log(`Dismissed ${label}.`);
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
