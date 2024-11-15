import assert from 'assert';
import { By } from 'selenium-webdriver';
import { driver, test } from 'thousandeyes';

runScript();

async function runScript() {

const settings = test.getSettings();

// Load page
await driver.get(settings.url);

let elementList = await driver.findElements(By.xpath("//article[contains(@id, 'post')]"));
     assert(elementList.length > 3, "Not enough elements found: " + elementList.length);
}
