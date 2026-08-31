import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 7 * 1000;
const FRAME_INPUT_VALUE = 'example';
const SHADOW_INPUT_VALUE = 'user@example.com';
const SELECTORS = {
  frame: By.css('iframe[name="embedded"]'),
  frameInput: By.css('input[name="inside-frame"]'),
  shadowHost: By.css('custom-login'),
  shadowInput: By.css('input[name="username"]'),
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  markers.start('Iframe step');
  const frame = await waitForVisible(SELECTORS.frame, 15 * 1000);
  await driver.switchTo().frame(frame);
  await typeText(SELECTORS.frameInput, FRAME_INPUT_VALUE);
  await driver.switchTo().defaultContent();
  markers.stop('Iframe step');

  markers.start('Shadow DOM step');
  const shadowRoot = await findOpenShadowRoot(SELECTORS.shadowHost);
  const shadowInput = await shadowRoot.findElement(SELECTORS.shadowInput);
  await shadowInput.clear();
  await shadowInput.sendKeys(SHADOW_INPUT_VALUE);
  markers.stop('Shadow DOM step');

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function findOpenShadowRoot(hostLocator) {
  const host = await waitForVisible(hostLocator, 15 * 1000);
  const root = await driver.executeScript('return arguments[0].shadowRoot;', host);

  if (!root) {
    throw new Error('Shadow root was not available. This helper only works with open shadow roots.');
  }

  return root;
}

async function typeText(locator, value) {
  const element = await waitForVisible(locator, 10 * 1000);
  await element.clear();
  await element.sendKeys(value);
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
