/*
    Transaction scripts can open new pages in new tabs/windows. This example shows how to switch to a new tab/window based on the
    URL.
    Author: primoz@thousandeyes.com
*/

import { By, Key } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {

    await driver.manage().setTimeouts({
        implicit: 7 * 1000 // If an element is not found, reattempt for this many milliseconds
    });

    await driver.get('https://developer.cisco.com/docs/thousandeyes/');

    await driver.findElement(By.xpath(`//a[text()='API Changelog']`)).click();
    await openInNewTab(By.xpath(`//a[text()='Changelog']`));

    await switchToTabWithUrl('https://docs.thousandeyes.com');
    await driver.takeScreenshot();

    await switchToTabWithUrl('https://developer.cisco.com/');
    await driver.takeScreenshot();
}

async function openInNewTab(linkSelector) {
    await driver.findElement(linkSelector).sendKeys(Key.CONTROL, Key.RETURN);
}

async function switchToTabWithUrl(url) {
    const configuredTimeouts = await driver.manage().getTimeouts();
    const attemptEndTime = Date.now() + configuredTimeouts.implicit;
    while (Date.now() < attemptEndTime) {
        for (const tab of await driver.getAllWindowHandles()) {
            await driver.switchTo().window(tab);
            const currentTabUrl = await driver.getCurrentUrl();
            if (currentTabUrl.includes(url)) {
                return;
            }
        }
        await driver.sleep(200);
    }
    throw new Error('Could not find a tab with url: ' + url);
}
