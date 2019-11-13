import { By } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    
    // This page will show a popup 50% of the time
    await driver.get('http://jam.si/popup.php');

    await driver.sleep(1 * 1000);

    const doesPopupExist = await doesElementExist(By.id('popup'));
    if (doesPopupExist) {
        const closeButton = await driver.findElement(By.css('[type="button"]'));
        closeButton.click();
    }

    await driver.sleep(1 * 1000);
}

async function doesElementExist(selector) {
    return (await driver.findElements(selector)).length > 0;;
}
