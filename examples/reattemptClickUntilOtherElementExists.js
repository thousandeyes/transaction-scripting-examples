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
    
    await driver.get('https://google.com')
    await reattemptClickUntilOtherElementExists(By.xpath(`//button`), By.xpath(`//div[.="Some content opened by the button click"]`));

}

async function reattemptClickUntilOtherElementExists(clickSelector, existSelector) {
    const configuredTimeouts = await driver.manage().getTimeouts();
    const configuredImplicitTimeout = configuredTimeouts.implicit;
    const attemptEndTime = Date.now() + configuredImplicitTimeout;
    await driver.manage().setTimeouts({implicit: 50});
    while (Date.now() < attemptEndTime) {
        try {
            await driver.findElement(clickSelector).click();
            await driver.findElement(existSelector);
            // If both awaits threw no error, we can continue
            await driver.manage().setTimeouts({implicit: configuredImplicitTimeout});
            return;
        }
        catch {

        }
        // One of the awaits didn't match, retry in a bit
        await driver.sleep(50);
    }
    console.log(Date.now());
    throw new Error('reattemptClickUntilOtherElementExists(' + clickSelector + ', ' + existSelector + ') timed out.');
}