import { By } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    await driver.manage().setTimeouts({
        implicit: 5 * 1000, // If an element is not found, reattempt for this many milliseconds
    });
    await driver.get('http://jam.si/popup.php');

    // Since the communication between the Transaction execution context and the
    // Browser is synchronous and thus every request is blocking the next one,,
    // every invocation of driver.findElement() must return before the next one
    // starts being processed. This means that we effectively cannot wait on two
    // elements at once in an asynchronous/reactive fashion, even if the transaction
    // execution context supports asynchronous programming. Consequentially, if we'd
    // create an async method that is waiting for a random popup to appear, and
    // that popup never appears, the next step (the regular transaction flow after
    // the popup closing function definition) will never get executed.
    //
    // What we can do to avoid this condition, however, is to "deploy" a custom
    // JavaScript code into browser/page context. That code will run independently
    // of the transaction code, and will close the random popup if it appears.
    //
    // To set this up, a single call to the browser is required. Although the
    // driver.executeScript() call itself is blocking in the same fashion the
    // driver.findElement() is, it returns immediately after the non-async part
    // of the code has completed. If this code sets itself up to be re-run in the
    // browser later (using the window.setTimeout() method), that does not affect
    // the communication between the browser and the transaction execution context
    // anymore.
    //
    // It is important to pay attention to where/when this independent JavaScript
    // code is deployed. It must end up in the correct "webpage context". If the
    // page is changed (or reloaded), this code will vanish.
    console.log("Let's set up the popup-closing function inside the browser.");
    await driver.executeScript(`
        function closePopup() {

            // Try to find a visible popup close button
            // It's important for this Xpath to not match a hidden popup,
            // otherwise the closing attempt will happen _before_ the popup becomes visible
            var popupCloseButton = document.evaluate('//div[@id="popup" and not(contains(@style, "hidden"))]/button[.="Close me"]', document, null, XPathResult.ANY_TYPE, null).iterateNext();

            if (popupCloseButton) {
                // When found, click it to close the popup and we're done
                console.log("Found the visible popup, closing it");
                popupCloseButton.click();
            } else {
                // When not (yet) found, let's reschedule this function to run after 1 second again
                console.log("Visible popup not found, scheduling a re-test in 1s");
                setTimeout(closePopup, 1000)
            }
        }

        // Run the function once, to set up the loop
        closePopup();
    `);
    console.log("Popup-closing function has been set up and started.");

    // Click on 'Click this link if you can!'
    //
    // If the link is hidden behind the popup, this command is blocking the
    // transaction until the link becomes visible.
    //
    // However, the popup-closing code we "deployed" with the driver.executeScript()
    // earlier is now running inside the browser independently. The transaction will
    // correctly continue when the popup is dismissed or when the popup does not
    // appear at all.
    await driver.findElement(By.xpath(`//a[text()="Click this link if you can!"]`)).click();
    console.log("All done.");
}
