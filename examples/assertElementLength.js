import assert from 'assert';
import { By, until } from 'selenium-webdriver';
import { driver, test } from 'thousandeyes';

runScript();

async function runScript() {

const settings = test.getSettings();

// Load page
await driver.get(settings.url);

await driver.wait(until.elementsLocated(By.xpath("//article[contains(@id, 'post')]")));
     
let elementList = await driver.findElements(By.xpath("//article[contains(@id, 'post')]"));
     assert(elementList.length > 3, "Not enough elements found: " + elementList.length);
}
