import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const PAGE_READY_TIMEOUT_MS = 30 * 1000;
const EXPECTED_MAX_SEVERE_ERRORS = 0;
const READY_SELECTOR = By.css('body');

let currentStep = 'Starting transaction';

runScript();

async function runScript() {
  try {
    setCurrentStep('Configure driver');
    await configureDriver();

    setCurrentStep('Clear prior browser console entries');
    await clearBrowserConsole();

    const settings = test.getSettings();
    const targetUrl = settings.url;

    setCurrentStep('Load configured test URL');
    markers.start('Page Load');
    await driver.get(targetUrl);
    await waitForPageLoaded(PAGE_READY_TIMEOUT_MS);
    markers.stop('Page Load');

    setCurrentStep('Check browser console errors');
    await assertBrowserConsoleHealth();

    setCurrentStep('Capture evidence screenshot');
    await driver.takeScreenshot();
  } catch (error) {
    await captureDiagnostics(error);
    throw error;
  }
}

function setCurrentStep(stepName) {
  currentStep = stepName;
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function clearBrowserConsole() {
  await driver.manage().logs().get('browser');
}

async function assertBrowserConsoleHealth() {
  markers.start('Browser Console Check');
  try {
    const browserLogs = await driver.manage().logs().get('browser');
    const severeErrorCount = browserLogs.filter(isSevereLogEntry).length;

    console.log(`Browser console severe error count: ${severeErrorCount}`);

    if (severeErrorCount > EXPECTED_MAX_SEVERE_ERRORS) {
      throw new Error(
        `Browser console exceeded the allowed severe error count: ${severeErrorCount}`
      );
    }
  } finally {
    markers.stop('Browser Console Check');
  }
}

function isSevereLogEntry(entry) {
  const level = String(entry.level?.name || entry.level || 'UNKNOWN');
  return level === 'SEVERE';
}

async function waitForPageLoaded(timeoutMs) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, timeoutMs, 'Timed out waiting for document.readyState to be complete');

  const readyElement = await driver.wait(until.elementLocated(READY_SELECTOR), timeoutMs);
  await driver.wait(until.elementIsVisible(readyElement), timeoutMs);
}

async function captureDiagnostics(error) {
  console.log(`Transaction failed during step: ${currentStep}`);
  console.log(`Failure type: ${error.name || 'Error'}`);

  try {
    await driver.takeScreenshot();
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.name || 'Error'}`);
  }
}
