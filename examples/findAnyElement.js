import { By, Key, until } from 'selenium-webdriver';
import { driver, markers, transaction } from 'thousandeyes';

runScript();

async function runScript() {

    // Open the page
    await driver.get(`http://tmp.skufca.si/te/trx-branching/`);

    // Let's find any one of these elements, whatever appears first
    let locators = {
        "locator-1": By.xpath(`//div[@id="mydiv-1"]`),
        "locator-2": By.xpath(`//div[@id="mydiv-2"]`),
        "locator-3": By.xpath(`//div[@id="mydiv-3"]`),
    };
    let [locatorName, element] = await findAnyElement(locators, 5000);

    // Evaluate what has been found
    if (locatorName == "locator-1") {
        markers.set("Element #1 found");
    } else {
        markers.set("Element #2 or #3 found");
    }
}

async function findAnyElement(locators, timeoutInMs) {
    const TIME_BETWEEN_ATTEMPTS_MS = 100;
    let attemptEndTime = Date.now() + timeoutInMs;

    // Store the current timeout settings, then disable the implicit
    // timeout, since we're doing the polling ourselves.
    let origTimeouts = await driver.manage().getTimeouts();
    await driver.manage().setTimeouts({
        implicit: 0
    });

    while (Date.now() < attemptEndTime) {
        for (var locatorName in locators) {
            let locator = locators[locatorName];
            let elementsFound = await driver.findElements(locator);

            if (elementsFound.length > 0) {
                let element = elementsFound[0];
                await driver.manage().setTimeouts(origTimeouts);
                return [locatorName, element];
            }
        }
        await driver.sleep(TIME_BETWEEN_ATTEMPTS_MS);
    }

    await driver.manage().setTimeouts(origTimeouts);
    throw new Error(`None of the locators matched anything so far and the timeout has been reached.`);
}
