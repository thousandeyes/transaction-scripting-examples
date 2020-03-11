import { By, Key } from 'selenium-webdriver';
import { driver, markers, credentials, downloads } from 'thousandeyes';

// Template Values
let domain = '<<o365domain>>'; // 'acmehero'
let loginEmail = '<<loginEmail'; // 'tonystark@acmehero.onmicrosoft.com'
let credentialName = '<<credemtialName'; // 'tonystark'
let downloadFileName = '<<Download Filename>>'; //"Public Cloud Performance Benchmark Report Final.pdf"

runScript();

async function runScript() {

  await configureDriver();

  markers.start('Page Load');

  await driver.get(`https://`+domain+`-my.sharepoint.com`);

  markers.stop('Page Load');
  markers.start('Login');

  // Click on 'Enter your email, phone, or Skype.'
  await click(By.id(`i0116`));

  await typeText(loginEmail, By.id(`i0116`));

  // Click on 'Next'
  await click(By.id(`idSIButton9`));

  // Click on 'Enter the password for tonystark@ac...'
  await click(By.id(`i0118`));

  await typeText(credentials.get(credentialName), By.id(`i0118`));

  // Click on 'Sign in'
  await click(By.id(`idSIButton9`));

  markers.stop('Login');
  markers.start('Backend');
  // Click on 'No'
  await click(By.id(`idBtn_Back`));
  markers.stop('Backend');

  await driver.takeScreenshot();

  // Click on 'Download'
  markers.start('Download');
  await clickText (downloadFileName);
  await click(By.css('[data-icon-name="Download"]'));
  //await click(By.id(`id__521`));
  await downloads.waitForDownload(downloadFileName, 60000);
  markers.stop('Download');
}
 
async function findElementWithText(text) {
 return await driver.findElement(By.xpath(`//*[text()="${text}"]`));
}
 
async function clickText(text) {
 await click(By.xpath(`//*[text()="${text}"]`));
}
 
async function markerClick(selector, markerStop, markerStart) {
 await driver.findElement(selector);
 await markers.stop(markerStop);
 await markers.start(markerStart);
 await click(selector);
}



async function configureDriver() {
  await driver.manage().window().setRect({
    width: 1200,
    height: 758 });

  await driver.manage().setTimeouts({
    implicit: 7 * 1000 // If an element is not found, reattempt for this many milliseconds
  });
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

async function simulateHumanDelay() {
  await driver.sleep(550);
}

async function typeText(value, selector) {
  await simulateHumanDelay();
  const element = await driver.findElement(selector);
  await element.clear();
  await element.sendKeys(value);
}