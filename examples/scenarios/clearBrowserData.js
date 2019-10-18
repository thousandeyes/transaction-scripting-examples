// If you need to clear cache and cookies during the transaction, you can do
// it with the clearBrowserData()

import { By, Key } from 'selenium-webdriver'
import { driver } from 'thousandeyes'

runScript()

async function runScript() {
    await driver.get('https://www.google.com/')
    await driver.findElement(By.name(`q`))

    await clearBrowserData()

    await driver.get('https://www.google.com/')
    await driver.findElement(By.name(`q`))
}

async function clearBrowserData() {
    // Open Chrome's Clear browsing data configuration screen
    await driver.get('chrome://settings/clearBrowserData')
    // Click 'Clear data' button
    await click(By.css(`* /deep/ #clearBrowsingDataConfirm`))
    await driver.takeScreenshot()
}

async function click(selector) {
    const configuredTimeouts = await driver.manage().getTimeouts()
    const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit

    await reattemptUntil(attemptToClick, clickAttemptEndTime)

    async function attemptToClick() {
        await driver.wait(() => isElementClickable(selector), configuredTimeouts.implicit)
        await driver.findElement(selector).click()
    }
}

async function isElementClickable(selector) {
    try {
        return await driver.findElement(selector).isDisplayed()
    } catch (error) {
        return false // Will throw an error if element is not connected to the document
    }
}

async function reattemptUntil(attemptActionFn, attemptEndTime) {
    const TIME_BETWEEN_ATTEMPTS = 100
    let numberOfAttempts = 0
    let attemptError
    while (Date.now() < attemptEndTime || numberOfAttempts === 0) {
        try {
            numberOfAttempts += 1
            await attemptActionFn()
        } catch (error) {
            attemptError = error
            await driver.sleep(TIME_BETWEEN_ATTEMPTS)
            continue // Attempt failed, reattempt
        }
        attemptError = null
        break // Attempt succeeded, stop attempting
    }

    const wasAttemptSuccessful = !attemptError
    if (!wasAttemptSuccessful) {
        throw attemptError
    }
}
