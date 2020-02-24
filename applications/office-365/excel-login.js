import { By, Key, until } from 'selenium-webdriver';
import { driver, credentials, markers } from 'thousandeyes';

// Template Values
const loginEmail = '<<loginEmail>>'; //'tonystark@acmehero.onmicrosoft.com';
const credentialName = '<<credentialName>>'; //'tonystark';

runScript();

async function runScript() {
  await configureDriver();
  markers.start('Page Load');
  await driver.get('https://excel.office.com');
  markers.stop('Page Load');

  await driver.takeScreenshot();

  // Login
  markers.start('Login');
  await typeText(loginEmail, By.id(`i0116`));
  await click(By.id(`idSIButton9`));
  await typeText(credentials.get(credentialName), By.id(`i0118`));
  await click(By.id(`idSIButton9`));
  markers.stop('Login');
}

async function configureDriver() {
  return driver.manage().setTimeouts({
    implicit: 5 * 1000 // If an element is not found, reattempt for this many milliseconds
  });
}

async function typeText(value, selector) {
  await simulateHumanDelay();
  await driver.findElement(selector).
  sendKeys(value);
}

async function simulateHumanDelay() {
  await driver.sleep(550);
}

async function click(selector) {
  await simulateHumanDelay();

  const configuredTimeouts = await driver.manage().getTimeouts();
  const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

  await reattemptUntil(attemptToClick, clickAttemptEndTime);

  async function attemptToClick() {
    await driver.wait(() => isElementClickable(selector), configuredTimeouts.implicit);
    await driver.findElement(selector).
    click();
  }
}

async function isElementClickable(selector) {
  try {
    return await driver.findElement(selector).isDisplayed();
  }
  catch (error) {
    return false; // Will throw an error if element is not connected to the document
  }
}

async function reattemptUntil(attemptActionFn, attemptEndTime) {
  const TIME_BETWEEN_ATTEMPTS = 100;
  let numberOfAttempts = 0;
  let attemptError;
  while (Date.now() < attemptEndTime || numberOfAttempts === 0) {
    try {
      numberOfAttempts += 1;
      await attemptActionFn();
    }
    catch (error) {
      attemptError = error;
      await driver.sleep(TIME_BETWEEN_ATTEMPTS);
      continue; // Attempt failed, reattempt
    }
    attemptError = null;
    break; // Attempt succeeded, stop attempting
  }

  const wasAttemptSuccessful = !attemptError;
  if (!wasAttemptSuccessful) {
    throw attemptError;
  }
}