import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 7 * 1000;
const TAB_TIMEOUT_MS = 15 * 1000;
const LINK_TO_NEW_TAB_SELECTOR = By.css('a[target="_blank"]');
const TARGET_TAB_URL_FRAGMENT = 'details';
const READY_SELECTOR = By.css('body');

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);
  await waitForVisible(READY_SELECTOR, TAB_TIMEOUT_MS);

  const originalWindow = await driver.getWindowHandle();

  markers.start('Open Target Tab');
  await driver.findElement(LINK_TO_NEW_TAB_SELECTOR).click();
  await switchToTabWithUrlFragment(
    originalWindow,
    TARGET_TAB_URL_FRAGMENT,
    TAB_TIMEOUT_MS
  );
  markers.stop('Open Target Tab');

  await waitForVisible(READY_SELECTOR, TAB_TIMEOUT_MS);
  await driver.takeScreenshot();

  await driver.close();
  await driver.switchTo().window(originalWindow);
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function switchToTabWithUrlFragment(originalWindow, urlFragment, timeoutMs) {
  let matchingWindow;

  await driver.wait(async () => {
    const handles = await driver.getAllWindowHandles();

    for (const handle of handles) {
      if (handle === originalWindow) {
        continue;
      }

      try {
        await driver.switchTo().window(handle);
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes(urlFragment)) {
          matchingWindow = handle;
          return true;
        }
      } catch (error) {
        // A new tab may still be loading or may have closed before it could be inspected.
      }
    }

    await driver.switchTo().window(originalWindow);
    return false;
  }, timeoutMs, 'Timed out waiting for a tab with the expected URL');

  await driver.switchTo().window(matchingWindow);
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
