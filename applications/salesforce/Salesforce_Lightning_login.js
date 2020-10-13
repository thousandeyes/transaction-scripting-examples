// Sample Transasction script which logs in to Salesforce Lightning,
// waits for all objects to load, takes a screenshot, and then logs out

import { By, until } from 'selenium-webdriver';
import { driver, credentials, markers } from 'thousandeyes';

runScript();

async function runScript() {

  await configureDriver();

  // Load the initial login page and take a screenshot
  markers.start('Page Load');

  await driver.get('https://login.salesforce.com/');
  markers.stop('Page Load');

  await driver.takeScreenshot();

  // Enter login credentials, with the password coming from the
  // ThousandEyes credentials repository
  markers.start('Login');
  await click(By.id(`username`));

  await typeText('fake_username@example.com', By.id(`username`));

  await click(By.id(`password`));

  await typeText(credentials.get('fake_username_password'), By.id(`password`));

  // Click on 'Log In' and wait for the Home page to load
  await click(By.id(`Login`));

  const elements = await driver.findElements(By.css(".slds-card"));
  const promises = await elements.map(element => {
    return driver.wait(until.elementIsVisible(element));
  });
  await Promise.all(promises);

  markers.stop('Login');

  await driver.takeScreenshot();

  // Click on 'Log Out'
  markers.start('Logout');
  await click(By.css(".uiImage"));
  await driver.wait(until.elementIsVisible(driver.findElement(By.css('[href="/secur/logout.jsp"]'))));

  await click(By.css(`[href="/secur/logout.jsp"]`));
  markers.stop('Logout');
}

async function configureDriver() {
  await driver.manage().window().setRect({
    width: 1200,
    height: 1324 });

  await driver.manage().setTimeouts({
    implicit: 7 * 1000 // If an element is not found, reattempt for this many milliseconds
  });
}



async function typeText(value, selector) {
  await simulateHumanDelay();
  const element = await driver.findElement(selector);
  await element.clear();
  await element.sendKeys(value);
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
    await driver.findElement(selector).
    click();
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
