import { By, Key } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {

    await configureDriver();

    await driver.get('https://form.jotform.com/73302671092956');
    // Click on 'START'
    await click(By.id(`jfCard-welcome-start`));
    await click(By.id(`first_1`));

    // Type in your name
    await typeText('John', By.id(`first_1`));
    await typeText('Doe', By.id(`last_1`));
    await click(By.css(`[data-type="control_fullname"] [aria-label="Next"]`));

    // Type in your email
    await typeText('john.doe@thousandeyes.com', By.id(`input_2`));
    await click(By.css(`[data-type="control_email"] [aria-label="Next"]`));

    // Type in a test message
    await typeText('This is a test message', By.id(`input_3`));
    await click(By.css(`[data-type="control_textarea"] [aria-label="Next"]`));

    // Solve math based captcha
    await driver.switchTo().frame(driver.findElement(By.id(`customFieldFrame_4`)))
    let number = await driver.findElement(By.id(`number`)).getText();
    let func = await driver.findElement(By.id(`function`)).getText();
    let number2 = await driver.findElement(By.id(`number2`)).getText();
    let result;
    if (func == '+') {
        result = parseInt(number) + parseInt(number2)
    } else if (func == '-') {
        result = parseInt(number) - parseInt(number2)
    } else if (func == '*') {
        result = parseInt(number) * parseInt(number2)
    } else {
        result = parseInt(number) / parseInt(number2)
    }
    await typeText(result, By.id(`result`));
    await driver.switchTo().defaultContent()
    await click(By.css(`[data-type="control_widget"] [aria-label="Submit"]`));

}

async function configureDriver() {
    await driver.manage().window().setRect({
        width: 1200,
        height: 1373
    });
    await driver.manage().setTimeouts({
        implicit: 7 * 1000, // If an element is not found, reattempt for this many milliseconds
    });
}



async function click(selector) {
    await simulateHumanDelay();

    const configuredTimeouts = await driver.manage().getTimeouts();
    const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

    await reattemptUntil(attemptToClick, clickAttemptEndTime);

    async function attemptToClick() {
        await driver.findElement(selector)
                    .click();
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

async function simulateHumanDelay() {
    await driver.sleep(550);
}

async function typeText(value, selector) {
    await simulateHumanDelay();
    const element = await driver.findElement(selector);
    await element.clear();
    await element.sendKeys(value);
}
