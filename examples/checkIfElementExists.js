import { By, Key } from 'selenium-webdriver';
import { driver } from 'thousandeyes';
import assert from 'assert';

runScript();

async function runScript() {
    // Randomly create either 
    // <custom-element-one></custom-element-one>
    // OR
    // <custom-element-two></custom-element-two>
    const customElementTagToAppend = (Math.random() < 0.5) ? 'custom-element-one' : 'custom-element-two';
    await driver.executeScript(`document.body.append(document.createElement('${customElementTagToAppend}'))`)    

    // Check if element one exists; if not, throw an error
    const doesElementOneExist = await doesElementExist(By.css('custom-element-one'));
    assert(doesElementOneExist, 'Element one does not exist!');
}

async function doesElementExist(selector) {
    return (await driver.findElements(selector)).length > 0;;
}
