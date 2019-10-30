import { By } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    await driver.get('https://www.tiffany.com');
    const element = driver.findElement(By.css('body > div.page-wrap > header > div.header__nav-container.stick > nav > ul > li:nth-child(1) > a'));
    await moveMouseInto(element);
    await driver.sleep(1000)
};

async function moveMouseInto(element) {
    await driver.actions({ bridge: true })
                .move({ x: -1, y: 0, origin: element })
                .move({ x: 1, y: 0, origin: element })
                .perform();
}