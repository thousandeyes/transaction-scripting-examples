
import { By, Key } from 'selenium-webdriver';
import { driver, credentials, markers } from 'thousandeyes';

runScript();

// TODO: Replace with your O365 login email
let myemail = 'tonystark@acmehero.onmicrosoft.com' 

// TODO: Create a credential called 'myPassword' in ThousandEyes and set your O365 login password.

async function runScript() {

  await configureDriver();

  markers.start('Page Load');
  await driver.get('https://outlook.office365.com/');
  markers.stop('Page Load');
  
  markers.start('Login');
  await typeText(myemail, By.id(`i0116`));

  // Click on 'Next'
  await click(By.id(`idSIButton9`));

  // Click on 'Enter the password for tonystark@ac...'
  await click(By.id(`i0118`));

  await typeText(credentials.get('myPassword'), By.id(`i0118`));

  // Click on 'Sign in'
  await click(By.id(`idSIButton9`));

  // Click on 'No'
  await markerClick(By.id('idBtn_Back'), "Login", "Compose Email");

  // Click on 'New message'
  await click(By.id(`id__3`));

  await typeText (myemail, By.css('input.ms-BasePicker-input.pickerInput_8d9d7e4e'));
  //await typeText('', By.css(`[role="combobox"]:nth-child(3)`));

  await driver.sleep(500);

  await typeText (Key.TAB, By.css('input.ms-BasePicker-input.pickerInput_8d9d7e4e'));

  // Click on 'Add a subject'
  //await click(By.id(`subjectLine0`));
  await click(By.css(`[aria-label="Add a subject"]`));

  let subject = "Hello " + Date.now();
  await typeText(subject, By.css(`[aria-label="Add a subject"]`));
  await console.log("Sent: " + subject);

  // Click on 'Send'
  await markerClick(By.css(`[aria-label="Send"]`), "Compose Email", "Email Round Trip");

  await driver.sleep(500);

  await findElementWithText(subject);
  markers.stop('Email Round Trip');
  await driver.takeScreenshot();
  await console.log("Found email inbox: " + subject);
  
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
    width: 1572,
    height: 1133 });

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
