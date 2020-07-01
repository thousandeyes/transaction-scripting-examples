import { By, Key } from 'selenium-webdriver';
import { driver, browser } from 'thousandeyes';

runScript();

async function runScript() {

    await driver.manage().setTimeouts({
        implicit: 7 * 1000, // If an element is not found, reattempt for this many milliseconds
    });

    await driver.get('https://google.com');

    await typeText('thousandeyes', By.name(`q`));

    // Click on 'Google Search'
    await click(By.xpath(`//input[@type='submit']`));

    // Click on the first link in search results
    await click(By.xpath(`//h3[1]`));

    // Wait for ThousandEyes URL
    await waitForUrl('thousandeyes.com');

}

async function typeText(value, selector) {
    const element = await driver.findElement(selector);
    await element.clear();
    await element.sendKeys(value);
}

async function click(selector) {
    const configuredTimeouts = await driver.manage().getTimeouts();
    const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

    await reattemptUntil(attemptToClick, clickAttemptEndTime);

    async function attemptToClick() {
        await driver.findElement(selector)
                    .click();
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

async function waitForUrl(url) {
    const configuredTimeouts = await driver.manage().getTimeouts();
    const attemptEndTime = Date.now() + configuredTimeouts.implicit;
    let currentUrl = await driver.getCurrentUrl();
    while (Date.now() < attemptEndTime) {
        currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes(url)) {
            return;
        }
        await driver.sleep(200);
    }
    throw new Error('Wait for URL ' + url + ' timed out. Current URL: ' + currentUrl);
}
