import { By } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    // The page at thousandeyes.com/outages contains an iframe
    await driver.get('https://thousandeyes.com/outages');

    // To interact with elements within the iframe, must switch the web driver context
    // to the iframe by using the `driver.switchTo().frame()` API. 
    await driver.switchTo().frame(driver.findElement(By.css(`.embed-container > iframe`)))

    // You can then locate elements within the iframe as you normally would
    await driver.findElement(By.css(`.point-container:nth-child(1) > .point`)).click();

    // To switch the driver back to the default context, use:
    await driver.switchTo().defaultContent();
}

