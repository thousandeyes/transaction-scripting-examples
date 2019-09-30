import { By } from 'selenium-webdriver';
import { driver, credentials } from 'thousandeyes';

runScript();

async function runScript() {
    // Calling `credentials.get` will allow you to retrieve sensitive tokens/passwords saved 
    // in the ThousandEyes credential store. 
    // When working in the Recorder, make sure you've either imported or added the credential info by hand
    // When working in the thousandeyes app, make sure the credential is associated with the test in question
    const password = credentials.get('MyPasswordInCredentialStore');
    await driver.findElement(By.css('.password'))
                .sendKeys(password);
}
