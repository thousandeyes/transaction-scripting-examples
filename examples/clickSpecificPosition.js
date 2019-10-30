import { By, Origin } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    await driver.get('https://google.com');
    const searchBar = driver.findElement(By.name('q'));

    // Clicks the google search bar, expanding suggestions.
    // Then clicks one of the suggested items
    await driver.actions({ bridge: true })
                .move({ x: 0, y: 0, origin: searchBar })
                .click()
                .pause(500)
                .move({ x: 0, y: 100, origin: Origin.POINTER })
                .click()
                .perform();
    
    await driver.sleep(1000);
};
