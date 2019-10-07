// Target webpage has a link (//a) that we are about to click. However, there is
// a 50% chance a popup is shown that overlaps the link. Popup can be closed by
// clicking a 'Close me' button in the middle of the popup.
// This is a showcase script on how to handle occasional popups.

import { By, Key } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    await driver.get('http://jam.si/popup.php');

    // Click on 'Close me' button in the popup if there is a popup
    // Notice that no await is in front of the function call, meaning that
    // transaction is not blocked here and proceeds further to the next step.
    // However, in parallel, this code is waiting if the popup pops up and if
    // it does, it clicks the 'Close me' button that closes the popup.
    click(By.xpath(`//div[@id="popup"]/button[text()="Close me"]`));

    // Click on 'Click this link if you can!'
    // If link is hidden behind the popup, this command is blocking the
    // transaction until the previous command closes the popup.
	await click(By.xpath(`//a[text()="Click this link if you can!"]`));
}

async function click(selector) {
    const configuredTimeouts = {
        // If an element is not found, reattempt for this many milliseconds
        implicit: 30 * 1000,
    }
    const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

    await reattemptUntil(attemptToClick, clickAttemptEndTime);

    async function attemptToClick() {
        await driver.wait(() => isElementClickable(selector), configuredTimeouts.implicit);
        await driver.findElement(selector).click();
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
