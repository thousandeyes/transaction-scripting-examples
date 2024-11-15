import assert from 'assert';
import { By } from 'selenium-webdriver';
import { driver, test } from 'thousandeyes';

runScript();

async function runScript() {

const settings = test.getSettings();

// Load page
await driver.get(settings.url);

let elementList = await driver.findElements(By.xpath("//article[contains(@id, 'post')]"));
     let count = 0;
     for (let el of elementList) {
          if (el) {
               count++;
          }
     }
     
     assert(count > 3, "Not enough elements found: " + count);

}
