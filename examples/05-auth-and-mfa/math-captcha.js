import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 7 * 1000;
const CAPTCHA_FRAME_SELECTOR = null;
const CAPTCHA_SELECTORS = {
  left: By.css('#number'),
  operator: By.css('#operator'),
  right: By.css('#number2'),
  answer: By.css('#result'),
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  if (CAPTCHA_FRAME_SELECTOR) {
    const frame = await waitForVisible(CAPTCHA_FRAME_SELECTOR, 15 * 1000);
    await driver.switchTo().frame(frame);
  }

  markers.start('Solve captcha');
  const answer = await solveMathCaptcha(CAPTCHA_SELECTORS);

  await typeText(CAPTCHA_SELECTORS.answer, String(answer));
  markers.stop('Solve captcha');

  if (CAPTCHA_FRAME_SELECTOR) {
    await driver.switchTo().defaultContent();
  }

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function solveMathCaptcha(selectors) {
  const left = Number(await getText(selectors.left));
  const operator = await getText(selectors.operator);
  const right = Number(await getText(selectors.right));

  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '*') return left * right;
  if (operator === '/') return left / right;

  throw new Error(`Unsupported captcha operator: ${operator}`);
}

async function getText(locator) {
  return (await waitForVisible(locator, 10 * 1000)).getText();
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
