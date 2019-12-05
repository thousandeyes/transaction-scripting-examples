import { By, Key, until } from 'selenium-webdriver';
import { driver, markers, credentials, downloads, transaction } from 'thousandeyes';

runScript();

async function runScript() {

    // Configure
    await configureDriver();

    // Page Load
    markers.start('Page Load');
    
    // TODO: Replace <your-sharepoint-url> with your sharepoint site URL (ex yourcompany.sharepoint.com/sites/YourSite
    await driver.get('https://<your-sharepoint-url>');
    var actualTitle = await driver.getTitle();
    markers.stop('Page Load');
    await driver.takeScreenshot();

    // Login process
    markers.start('Username');
    await click(By.id(`i0116`));
    
    // TODO: Replace <your-email> with your sharepoint login email
    await typeText('<your-email>', By.id(`i0116`));
    await click(By.id(`idSIButton9`));
    markers.stop('Username');

    // Enter Password
    // TODO: Add 'myCredentials' to ThousandEyes credential manager
    markers.start('Password');
    await click(By.id(`i0118`));
    await typeText(credentials.get('myCredentials'), By.id(`i0118`));

    // Click on 'Sign in'
    await isElementClickable(By.id(`idSIButton9`));
    await click(By.id(`idSIButton9`));

    // Click on 'No' (do not stay signed in popup)
    await isElementClickable(By.id(`idBtn_Back`));
    markers.stop('Password');
    markers.start('Shared Documents');
    await click(By.id(`idBtn_Back`));

    // Wait for backend page to load
    await driver.wait(until.titleContains('Home'));
    
    // Navigate to 'Shared Documents'
    await click(By.css(`[href="https://<your-sharepoint-url>/Shared Documents"]`));

    // Wait for shared docs page to load
    await driver.wait(until.titleContains('All Documents'));
    
    // Select a file
    // TODO: replace <your-filename> with the name of the file your downloading; eg. Public Cloud Performance Benchmark Report Final.pdf
    await click(By.css(`[aria-label="Checkbox for <your-filename>"]`));
    markers.stop('Shared Documents');

    await driver.takeScreenshot();
    
    // Click on 'Download' and measure download time
    // TODO: replace <your-filename> with the name of the file your downloading; eg. Public Cloud Performance Benchmark Report Final.pdf
 
    markers.start('Download');
    await click(By.css(`[data-icon-name="download"]`));
    await downloads.waitForDownload('<your-filename>', 60000);
    markers.stop('Download');
};

async function configureDriver() {
    return driver.manage().setTimeouts({
        implicit: 10 * 1000, // If an element is not found, reattempt for this many milliseconds
    });
}

async function typeText(value, selector) {
    await simulateHumanDelay();
    await driver.findElement(selector)
                .sendKeys(value);
}

async function simulateHumanDelay() {
    await driver.sleep(550);
}


async function click(selector) {
    await simulateHumanDelay();

    const configuredTimeouts = await driver.manage().getTimeouts();
    const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

    await reattemptUntil(attemptToClick, clickAttemptEndTime);
    async function attemptToClick() {
        await driver.findElement(selector)
                    .click().then(null, async function (err) {
            await driver.wait(() => isElementClickable(selector), configuredTimeouts.implicit);
            await driver.findElement(selector)
                    .click();
        });
    }
}

async function isElementClickable(selector) {
    try {
        return await driver.findElement(selector).isDisplayed();
    }
    catch (error) {
        return false; // Will throw an error if element is not connected to the document
    }
}

async function reattemptUntil(attemptActionFn, attemptEndTime) {
    const TIME_BETWEEN_ATTEMPTS = 100;
    let numberOfAttempts = 0;
    let attemptError;
    while (Date.now() < attemptEndTime || numberOfAttempts === 0) {
        try {
            numberOfAttempts += 1;
            await attemptActionFn();
        }
        catch (error) {
            attemptError = error;
            await driver.sleep(TIME_BETWEEN_ATTEMPTS);
            continue; // Attempt failed, reattempt
        }
        attemptError = null;
        break; // Attempt succeeded, stop attempting
    }

    const wasAttemptSuccessful = !attemptError;
    if (!wasAttemptSuccessful) {
        throw attemptError;
    }
}

async function rightClick(selector) {
  const element = await driver.findElement(selector);
  await driver.actions({ bridge: true }).contextClick(element).perform();
}
