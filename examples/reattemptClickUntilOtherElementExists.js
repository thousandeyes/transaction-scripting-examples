/*
    When a JavaScript-heavy website assigns actions to buttons and other elements after the page load event,
    traditional await click() step will click the button before the button has the appropriate action.

    This example implements a function that keeps clicking the button until the element loaded by the button
    action (i.e. an element on a new page that opens after the button click) exists.

    Author: primoz@thousandeyes.com
*/

import { By, Key } from 'selenium-webdriver';
import { driver, credentials, markers } from 'thousandeyes';

runScript();

async function runScript() {

    await configureDriver();

    // Load page
    await driver.get('https://cisco.com');

    // Keep clicking 'Products' every 100ms until 'cdc-nav' element is present.
    await reattemptClickUntilOtherElementExists(By.xpath(`//a[text()='Meraki']`), By.xpath(`//title[contains(text(), 'Cisco Meraki')]`));

    await driver.takeScreenshot();

}

async function reattemptClickUntilOtherElementExists(clickSelector, existSelector) {
    let configuredTimeouts = await driver.manage().getTimeouts();
    let implicitTimeout = configuredTimeouts.implicit;
    let attemptEndTime = Date.now() + implicitTimeout;
    await driver.manage().setTimeouts({ implicit: 100 });
    let clicked = false;
    let lastError;
    while (Date.now() < attemptEndTime) {
        try {
            let e = await driver.findElement(clickSelector);
            clicked = true;
            e.click();
        } catch (e) {
            if (!clicked) {
                lastError = e;
            }
        }
        try {
            await driver.findElement(existSelector);
            await driver.manage().setTimeouts({ implicit: implicitTimeout });
            return;
        } catch (e) {
            if (clicked) {
                lastError = e;
            }
        }
    }
    await driver.manage().setTimeouts({ implicit: implicitTimeout });
    throw lastError;
}

async function configureDriver() {
    await driver.manage().setTimeouts({
        implicit: 7 * 1000, // If an element is not found, reattempt for this many milliseconds
    });
}
