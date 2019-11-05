import { By } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    await driver.get('about:blank');

    await driver.executeScript(`alert("I'm a browser native alert!")`)
    
    await driver.sleep(2 * 1000);
    await driver.switchTo().alert().dismiss();
    await driver.sleep(1 * 1000);
};
