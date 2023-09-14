/*
    HTML5 canvas child elements are not part of DOM, hence Selenium Webdriver cannot directly access them.
    A possible shortcut to interact with elements in the canvas is to click on a certain predefined coordinate in the canvas itself.
    This example clicks at three different locations in the canvas and captures the explosion created at the click location.

    Author: primoz@thousandeyes.com

*/

import { By, Key, Origin } from 'selenium-webdriver';
import { driver, test } from 'thousandeyes';

runScript();

async function runScript() {

    await configureDriver();

    const settings = test.getSettings();

    // Load page
    await driver.get(settings.url);

    await driver.switchTo().frame(driver.findElement(By.id(`result`)))

    const canvas = await driver.findElement(By.id(`c`));

    await driver.sleep(500);

    await driver.actions({ bridge: true })
            .move({ x: -200, y: -200, origin: canvas })
            .click()
            .perform();
    await driver.sleep(100);
    await driver.takeScreenshot();

    await driver.actions({ bridge: true })
            .move({ x: 200, y: 100, origin: Origin.POINTER })
            .click()
            .perform();
    await driver.sleep(100);
    await driver.takeScreenshot();

    await driver.actions({ bridge: true })
            .move({ x: 200, y: 100, origin: Origin.POINTER })
            .click()
            .perform();
    await driver.sleep(100);
    await driver.takeScreenshot();


}

async function configureDriver() {
    await driver.manage().setTimeouts({
        implicit: 7 * 1000, // If an element is not found, reattempt for this many milliseconds
    });
}
