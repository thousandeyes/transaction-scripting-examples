import { By } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {

    // Load page
    await driver.get('http://the-acme-corporation.com/longpage.html');

    let elem = await driver.findElement(By.xpath(`//h3`));
    
    await scrollElementIntoView(elem, {block: 'end'})
    await driver.takeScreenshot();

    await scrollElementIntoView(elem, {block: 'center'})
    await driver.takeScreenshot();

    await scrollElementIntoView(elem, {block: 'start'})
    await driver.takeScreenshot();

};

async function scrollElementIntoView(element, scrollIntoViewOptions){
    // For details on the `scrollIntoViewOptions` parameter, see:
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    await driver.executeScript(
        `arguments[0].scrollIntoView(arguments[1]);`, 
        element, scrollIntoViewOptions
    )
}
