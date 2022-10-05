import { By, Key, until } from 'selenium-webdriver';
import { driver, credentials, markers } from 'thousandeyes';

// TODO: update with your specific login and password credentalName
const loginEmail = '<<loginEmail>>'; // 'user@example.com'
// use the same credentialName as what's used to store the Salesforce password in your ThousandEyes credentials repository
const credentialName = '<<credentialName>>';

runScript();

async function runScript() {
  await configureDriver();

  markers.start('Page Load');
  await driver.get('https://login.salesforce.com');
  markers.stop('Page Load');

  markers.start('Login');
  await click(By.id(`username`));
  await typeText(loginEmail, By.id(`username`));

  await click(By.id(`password`));
  await typeText(credentials.get(credentialName), By.id(`password`));

  // Click on 'Log In'
  await click(By.id(`Login`));
  markers.stop('Login');
 
  // I'm not yet sure why the click isn't working, but you can just load the next page
  await driver.get("https://expedia.lightning.force.com/lightning/o/Case/list?filterName=Recent");

  // waits for the page to load
  await driver.wait(until.elementIsVisible(driver.findElement(By.css("th.slds-cell-edit > span:nth-child(1)"))));
  
  await driver.takeScreenshot();

  // finds a link that 
  //    starts with /lighting/r/5000y00 
  //        (should be consistent across cases, may need to adjust)
  //    ends with /view
  const caseSelector = "a[href^=\"/lightning/r/5000y00\"][href$=\"/view\"]";
  
  // Add Marker to Measure Case Load
  markers.start('Load Case');


  // Click first case in list
  await click(By.css(caseSelector));

  // Wait for page to load
  const elementOnNewPage = "div.inFeed:nth-child(3) > div:nth-child(4)";
  await driver.wait(until.elementIsVisible(driver.findElement(By.css(elementOnNewPage))));
  
  
  // Stop timing case load
  markers.stop('Load Case');
  
  await driver.takeScreenshot();

}

async function configureDriver() {
  return driver.manage().setTimeouts({
    implicit: 10 * 1000 // If an element is not found, reattempt for this many milliseconds
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



async function isElementClickable(selector) {
  try {
    return await driver.findElement(selector).isDisplayed();
  }
  catch (error) {
    return false; // Will throw an error if element is not connected to the document
  }
}

async function simulateHumanDelay() {
  await driver.sleep(550);
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

async function typeText(value, selector) {
  await simulateHumanDelay();
  await driver.findElement(selector).
  sendKeys(value);
}