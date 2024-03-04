/*
  Shadow DOM enables you to attach a DOM tree to an element, and have
  the internals of this tree hidden from JavaScript and CSS running in
  the page.

  https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM

  This script is an example of how you can select the Shadow root to
  find and interact with elements withing the Shadow tree.

  Only CSS selectors work within the Shadow tree, do not use Xpath!

  Author: primoz@thousandeyes.com
*/

import { By, Key } from 'selenium-webdriver';
import { driver, test } from 'thousandeyes';

runScript();

async function runScript() {

  await configureDriver();

  const settings = test.getSettings();

  // Load page
  await driver.get(settings.url);

  let shadowRoot1 = await findShadowRoot(By.css(`#cells-template-login`));

  let userInput = await shadowRoot1.findElement(By.css(`#user > input[type=text]`));
  await userInput.sendKeys('username');
  let passwordInput = await shadowRoot1.findElement(By.css(`#password > input[type=password]`));
  await passwordInput.sendKeys('password');
  await driver.takeScreenshot();

  let button = await shadowRoot1.findElement(By.css(`bbva-button-default`));
  button.click();

  await driver.sleep(1000);
  await driver.takeScreenshot();

}

async function findShadowRoot(selector) {
  /*
    Only works on open shadow roots. Cannot be used on closed shadow roots.
    Only CSS selectors work within the Shadow tree, do not use Xpath.
  */
  let shadowHost = await driver.findElement(selector);
  let shadowRoot = await driver.executeScript(`return arguments[0].shadowRoot;`, shadowHost);
  return shadowRoot;
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: 7 * 1000, // If an element is not found, reattempt for this many milliseconds
  });
}
