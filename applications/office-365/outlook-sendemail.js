import { By, Key } from 'selenium-webdriver';
import { driver, credentials, markers } from 'thousandeyes';

// Template Values
let email = 'tonystark@acmehero.onmicrosoft.com';
let credentialName = 'tonystark';
let sendToEmail = 'tonystark@acmehero.onmicrosoft.com';

runScript();

async function runScript() {

  await configureDriver();

  markers.start('Page Load');
  await driver.get('https://outlook.office365.com/');
  markers.stop('Page Load');

  markers.start('Login');
  await typeText(email, By.id(`i0116`));

  // Click on 'Next'
  await click(By.id(`idSIButton9`));

  // Click on 'Enter the password for tonystark@ac...'
  await click(By.id(`i0118`));

  await typeText(credentials.get(credentialName), By.id(`i0118`));

  // Click on 'Sign in'
  await click(By.id(`idSIButton9`));

  // Click on 'No'
  await markerClick(By.id('idBtn_Back'), "Login", "Compose Email");

  // Click on 'New message'
  await click(By.id(`id__20`));

  // #app > div > div._3KAPMPOz8KsW24ooeUflK2 > div._2jR8Yc0t2ByBbcz_HIGqZ4 > div > div._3mBjlqTqXMUiRuuWRKCPtX.css-41 > div._1jw6v9zFEgnOiXShpU1qqM > div > div.mm4nCLKbIRtx5HvuorDWT > div._1QDTZfBsizkS8O4Jej5a3A > div > div > div > div._29NreFcQ3QoBPNO3rKXKB0 > div._3Yr_hO7j5doGUkhrRiP6uY > div:nth-child(1) > div:nth-child(1) > div._31eKqae41uP_KBAvjXjCLQ > div > div > div > div > div.ms-FocusZone.css-57 > div > div > input
  ////*[@id="app"]/div/div[2]/div[1]/div/div[3]/div[2]/div/div[3]/div[1]/div/div/div/div[1]/div[1]/div[1]/div[1]/div[1]/div/div/div/div/div[1]/div/div/input
  await typeText(sendToEmail, By.css(`input.ms-BasePicker-input.pickerInput_ecad0f63`));

  await driver.sleep(500);

  await typeText(Key.TAB, By.css(`input.ms-BasePicker-input.pickerInput_ecad0f63`));

  // Click on 'Add a subject'
  await click(By.id(`subjectLine0`));

  let subject = "Hello " + Date.now();
  await typeText(subject, By.id(`subjectLine0`));
  await console.log("Sent: " + subject);

  // Click on 'Send'
  await markerClick(By.css(`[aria-label="Send"]`), "Compose Email", "Email Round Trip");

  await driver.sleep(200);

  await findElementWithText(subject);
  markers.stop('Email Round Trip');
  await console.log("Found email inbox: " + subject);

  await driver.takeScreenshot();

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