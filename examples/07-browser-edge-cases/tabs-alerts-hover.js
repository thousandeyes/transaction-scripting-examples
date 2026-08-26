import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

const IMPLICIT_TIMEOUT_MS = 7 * 1000;
const ALERT_BUTTON_SELECTOR = null;
const SELECTORS = {
  menu: By.css('[data-testid="menu"]'),
  menuItem: By.css('[data-testid="menu-item"]'),
  newTab: By.css('a[target="_blank"]'),
};

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  markers.start('Hover menu');
  const menu = await waitForVisible(SELECTORS.menu, 15 * 1000);
  await driver.actions({ async: true }).move({ origin: menu }).perform();
  await waitForVisible(SELECTORS.menuItem, 10 * 1000);
  markers.stop('Hover menu');

  markers.start('New tab');
  const originalWindow = await driver.getWindowHandle();
  await driver.findElement(SELECTORS.newTab).click();
  await switchToNewWindow(originalWindow, 10 * 1000);
  await driver.wait(until.elementLocated(By.css('body')), 15 * 1000);
  await driver.close();
  await driver.switchTo().window(originalWindow);
  markers.stop('New tab');

  if (ALERT_BUTTON_SELECTOR) {
    markers.start('Native alert');
    await driver.findElement(ALERT_BUTTON_SELECTOR).click();
    const alert = await driver.wait(until.alertIsPresent(), 10 * 1000);
    const alertText = await alert.getText();
    console.log(`Alert was present. textLength=${alertText.length}`);
    await alert.accept();
    markers.stop('Native alert');
  }

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function switchToNewWindow(originalWindow, timeoutMs) {
  await driver.wait(async () => {
    const handles = await driver.getAllWindowHandles();
    return handles.length > 1;
  }, timeoutMs);

  const handles = await driver.getAllWindowHandles();
  const newWindow = handles.find((handle) => handle !== originalWindow);
  await driver.switchTo().window(newWindow);
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
