import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const READY_SELECTOR = By.css('body');
const EXPECTED_URL_FRAGMENT = 'example';
const EXPECTED_TITLE = 'Example';

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;

  markers.start('Page ready');
  await driver.get(targetUrl);

  await driver.wait(until.urlContains(EXPECTED_URL_FRAGMENT), 15 * 1000);
  await driver.wait(until.titleContains(EXPECTED_TITLE), 15 * 1000);

  const readyElement = await driver.wait(until.elementLocated(READY_SELECTOR), 15 * 1000);
  await driver.wait(until.elementIsVisible(readyElement), 10 * 1000);
  markers.stop('Page ready');

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}
