import { By } from 'selenium-webdriver';
import { driver, credentials, authentication } from 'thousandeyes';

runScript();

async function runScript() {
    // Calling `credentials.get` will allow you to retrieve sensitive tokens/passwords saved 
    // in the ThousandEyes credential store. 
    // When working in the Recorder, make sure you've either imported or added the credential info by hand
    // When working in the thousandeyes app, make sure the credential is associated with the test in question
    const secretToken = credentials.get('TOTP Secret Token');
    
    
    // Calling `authentication.getTimeBasedOneTimePassword` will all you to generate a 6-digit
    // temporary authentication code to be used in conjunction with a password on sites that
    // support 2 factor authentication with time-based one-time passwords (TOTPs).
	var totp = authentication.getTimeBasedOneTimePassword(secretToken);
    
    
    await driver.findElement(By.css('.totp_auth_code'))
                .sendKeys(totp);
                

}
