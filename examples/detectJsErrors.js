import { logging } from 'selenium-webdriver';
import { driver } from 'thousandeyes';
import assert from 'assert';

runScript();

async function runScript() {

    // Ensure we're not pulling in logs from prior pages/tests
    // Calling this function will clear out the logs up to the point
    await driver.manage().logs().get('browser');

    await driver.get('https://wikipedia.org');

    // Throw an error on a delay to simulate an uncaught JS error
    await driver.executeScript(`setTimeout(() => { throw new Error('Simulate Uncaught Error') }, 0)`);
    const browserLogs = await driver.manage().logs().get('browser');

    
    console.log('Browser logs:');
    console.log(JSON.stringify(browserLogs, null, '  '), '\n');
    
    const severeErrors = browserLogs.filter(logEntry => logEntry.level === logging.Level.SEVERE);
    assert(severeErrors.length === 0, 'Errors found during the page load!')
}
