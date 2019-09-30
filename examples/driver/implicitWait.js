import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    // Doing some configuration before the start of the actual transaction is a common pattern.
    // If you want to exclude the configuration time from the recorded transaction timings, use `transaction.start` 
    // to denote the start time of the transaction
    await configureDriver();
}

async function configureDriver() {
    /*
        `driver.manage().setTimeouts` allows you to define the timeouts for various operations.
        One common one is to set an "implicit" wait time. The "implicit" wait time means that
        driver will wait for that many milliseconds when trying to find an element before considering
        the operation failed. 

        This can often be useful as sometimes an element won't exist right away in the browser due to
        animations or load times prior to the element appearing. 

        Alternatively you can use explicit waits.
    */
    return driver.manage().setTimeouts({
      implicit: 5 * 1000 // If an element is not found, reattempt for this many milliseconds
    });
}
  