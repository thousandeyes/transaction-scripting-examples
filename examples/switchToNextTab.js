import { By, Key } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    await driver.get('https://wikipedia.com');
    
    await openInNewTab(By.css('a#js-link-box-en'));
    await switchToNextTab();

    await driver.sleep(1000);
}

async function openInNewTab(linkSelector) {
    await driver.findElement(linkSelector).sendKeys(Key.CONTROL, Key.RETURN);
}

async function switchToNextTab() {
    const currentTabId = await driver.getWindowHandle();
    const allTabIds = await driver.getAllWindowHandles();
    const currentTabIndex = allTabIds.findIndex(tabId => tabId === currentTabId);
    const nextTabId = allTabIds[currentTabIndex + 1] || allTabIds[0];
    return driver.switchTo().window(nextTabId);
}