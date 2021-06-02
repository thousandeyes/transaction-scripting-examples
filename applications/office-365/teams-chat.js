import { By, Key, until } from 'selenium-webdriver';
import { driver, credentials, markers } from 'thousandeyes';

// Template Parameters
let email = '<<email>>'; // tonystark@acmehero.onmicrosoft.com';
let targetUser = '<<targetUser>>'; // 'Pepper Potts';
let credentialsName = '<<credentialsName>>'; // 'tonystark';

let markerTimes = {};

runScript();

async function runScript() {
  await configureDriver();

  // TIP: Console.log prints timestamp
  await console.log("Page Load");

  markerStart('Page Load');
  await driver.get('https://teams.microsoft.com');
  markerStop('Page Load');

  markerStart("Login");
  await click(By.css(`[name="loginfmt"]`));
  await typeText(email, By.css(`[name="loginfmt"]`));

  // Click on 'Next'
  await click(By.css(`[value="Next"]`));

  // Click on 'Enter the password for tony@acmeher...'
  await click(By.css(`[name="passwd"]`));
  await typeText(credentials.get(credentialsName), By.css(`[name="passwd"]`));

  // Click on 'Sign in'
  await click(By.id(`idSIButton9`));

  // Click on 'No' (Do not stay signed in)
  // This click loads the main teams page
  await markerClick(By.id('idBtn_Back'), "Login", "Backend Load");

  // Wait for chat page to load
  await driver.wait(until.elementIsVisible(await driver.findElement(By.css(`.team-information`))));

  // Dismiss popups
  await clickPeriodic(By.css(`[data-tid="closeModelDialogBtn"]`), 200);
  await clickPeriodic(By.css(`[aria-label="Dismiss"]`), 200);
  markerStop("Backend Load");

  await driver.takeScreenshot();

  markerStart("Compose Message");

  // Start a new chat
  await click(By.css(`[aria-label="Chat Toolbar more options"]`));

  //Click "New Chat (Alt+N)"
  await click(By.css(`[aria-label="New Chat (Alt+N)"]`));

  
  await typeText(targetUser, By.css(`[data-tid="peoplePicker"]`));
  
  // Make driver sleep for 1 seconds
  await driver.sleep(1000);
   
  await driver.findElement(By.css(`[data-tid="peoplePicker"]`)).sendKeys(Key.RETURN);
  
  // Make driver sleep for 5 seconds
  await driver.sleep(2000);

  markerStop("Compose Message");
  markerStart("Send Message");

  // Send a message  
  let message = "Hello " + Date.now();
  await console.log("Sending " + message);

  await driver.findElement(By.css('[aria-label="Type a new message, editing"]')).sendKeys(message, Key.ENTER);

  await driver.sleep(500);

  // Find all messages
  await findElementWithText(message);

  markerStop("Send Message");
  await console.log("Found " + message);

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().window().setRect({
    width: 1200,
    height: 983 });

  await driver.manage().setTimeouts({
    implicit: 10 * 10000 // If an element is not found, reattempt for this many milliseconds
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

async function moveMouseInto(element) {
    await driver.actions({ bridge: true })
                .move({ x: -1, y: 0, origin: element })
                .move({ x: 1, y: 0, origin: element })
                .perform();
}

async function markerClick(selector, stop, start) {
  await driver.findElement(selector);
  await markerStop(stop);
  await markerStart(start);
  await click(selector);
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

async function clickPeriodic(selector, wait) {
  const imp = (await driver.manage().getTimeouts()).implicit;
  await driver.manage().setTimeouts({implicit: wait});
  const len = (await driver.findElements(selector)).length;
  if (len > 0) {
    await console.log("Clicking " + selector);
    await click(selector);
  }
  await driver.manage().setTimeouts({implicit: imp});
}

async function findElementWithText(text) {
  return await driver.findElement(By.xpath(`//*[text()="${text}"]`));
}

async function clickWithText(text) {
  return await click(By.xpath(`//*[text()="${text}"]`));
}

async function markerStart(marker) {
  markerTimes[marker] = Date.now();
  markers.start(marker);
}

async function markerStop(marker) {
  markers.stop(marker);
  console.log(marker + ": " + (Date.now() - markerTimes[marker]) + "ms");
}
