import { until } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    // An explicit wait until the page title is "Some Title", which will time out after 1000 milliseconds
    // Selenium webdriver provides many builtin conditions to wait for, such as element visibility or interactibility
    // To avoid longer transaction times, it's often good practice to avoid mixing implicit and explicit waits. 
    await driver.wait(until.titleIs('Some Title'), 1000);
};
