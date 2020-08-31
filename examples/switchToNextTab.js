import { By, Key } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    // Historically, the same browser has been securely re-used between multiple test
    // rounds.  To prevent the browser from closing completely, the system has kept around
    // an extra tab, the ID of which we look up here.  In the future, when browsers are not
    // reused across test rounds and there won't be a backup tab, this same code will continue
    // to behave as intended.
    const backupTabId = await getBackupTabId();
    await driver.get('https://wikipedia.com');
    
    await openInNewTab(By.css('a#js-link-box-en'));
    await switchToNextTab(backupTabId);

    await driver.sleep(1000);
}

async function openInNewTab(linkSelector) {
    await driver.findElement(linkSelector).sendKeys(Key.CONTROL, Key.RETURN);
}

async function getBackupTabId() {
    const currentTabId = await driver.getWindowHandle();
    const allTabIds = await driver.getAllWindowHandles();
    return allTabIds.filter(tabId => tabId !== currentTabId)[0];
  } 
  
  async function getAllWindowHandlesExcludingBackup(backupTabId) {
     const allTabIds = await driver.getAllWindowHandles();
     return allTabIds.filter(tabId => tabId !== backupTabId);
  }
  
  async function switchToNextTab(backupTabId) {
      const currentTabId = await driver.getWindowHandle();
      const allTabIds = await getAllWindowHandlesExcludingBackup(backupTabId);
      const currentTabIndex = allTabIds.findIndex(tabId => tabId === currentTabId);
      const nextTabId = allTabIds[currentTabIndex + 1] || allTabIds[0];
      return driver.switchTo().window(nextTabId);
  }