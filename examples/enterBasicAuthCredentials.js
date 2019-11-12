import { By } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    await driver.get('https://jigsaw.w3.org/HTTP/');

    await driver.sleep(1 * 1000);

    // Click link that opens basic auth prompt
    // await driver.findElement(By.css('[href="Basic/"]')).click();

    // Instead, navigate directly with basic auth credentials in url 
    // (https://username:password@url)
    await driver.get('https://guest:guest@jigsaw.w3.org/HTTP/Basic/');

    await driver.sleep(1 * 1000);
};
