import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const READY_SELECTOR = By.css('body');

runScript();

async function runScript() {
  try {
    await runTransaction();
  } catch (error) {
    await captureDiagnostics(error);
    throw error;
  }
}

async function runTransaction() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  markers.start('Ready check');
  const ready = await driver.wait(
    until.elementLocated(READY_SELECTOR),
    15 * 1000
  );
  await driver.wait(until.elementIsVisible(ready), 10 * 1000);
  markers.stop('Ready check');

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function captureDiagnostics(error) {
  console.log(`Transaction failed: ${error.message}`);

  try {
    console.log(`Current URL: ${await driver.getCurrentUrl()}`);
    console.log(`Page title: ${await driver.getTitle()}`);
    await driver.takeScreenshot();

    const pageSource = await driver.getPageSource();
    console.log(pageSource.slice(0, 2000));
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.message}`);
  }
}
