import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const READY_SELECTOR = By.css('body');
let currentStep = 'Starting transaction';

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
  setCurrentStep('Configure driver');
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;

  setCurrentStep('Load configured test URL');
  await driver.get(targetUrl);

  setCurrentStep('Wait for ready selector');
  markers.start('Ready check');
  const ready = await driver.wait(
    until.elementLocated(READY_SELECTOR),
    15 * 1000
  );
  await driver.wait(until.elementIsVisible(ready), 10 * 1000);
  markers.stop('Ready check');

  setCurrentStep('Capture evidence screenshot');
  await driver.takeScreenshot();
}

function setCurrentStep(stepName) {
  currentStep = stepName;
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function captureDiagnostics(error) {
  console.log(`Transaction failed during step: ${currentStep}`);
  console.log(`Failure type: ${error.name || 'Error'}`);

  try {
    await logNavigationState();
    await logElementState('ready selector', READY_SELECTOR);
    await logConsoleSummary();
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.name || 'Error'}`);
  }
}

async function logNavigationState() {
  const settings = test.getSettings();
  const state = await driver.executeScript(`
    const configuredUrl = new URL(arguments[0]);
    return {
      readyState: document.readyState,
      sameOriginAsConfiguredUrl: window.location.origin === configuredUrl.origin,
      hasQueryString: window.location.search.length > 0,
      hasHash: window.location.hash.length > 0,
      pathDepth: window.location.pathname.split('/').filter(Boolean).length,
      titleLength: document.title.length,
      bodyPresent: Boolean(document.body),
    };
  `, settings.url);

  console.log(`Navigation state: ${JSON.stringify(state)}`);
}

async function logElementState(label, locator) {
  const elements = await driver.findElements(locator);
  console.log(`${label}: located=${elements.length > 0}, count=${elements.length}`);

  if (elements.length === 0) {
    return;
  }

  const element = elements[0];
  const displayed = await element.isDisplayed();
  const enabled = await element.isEnabled();
  const rect = await element.getRect();

  console.log(
    `${label}: displayed=${displayed}, enabled=${enabled}, rect=${Math.round(rect.width)}x${Math.round(rect.height)}`
  );
}

async function logConsoleSummary() {
  const logs = await driver.manage().logs().get('browser');
  const counts = logs.reduce((summary, entry) => {
    const level = String(entry.level?.name || entry.level || 'UNKNOWN');
    summary[level] = (summary[level] || 0) + 1;
    return summary;
  }, {});

  console.log(`Browser console summary: ${JSON.stringify(counts)}`);
}
