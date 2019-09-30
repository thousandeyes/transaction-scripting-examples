import { driver, transaction } from 'thousandeyes';

runScript();

async function runScript() {

    await driver.get('https://google.com');

    // This will set the start time of the transaction to the point that start is called.
    // This can be useful if you want to do some configuration or authenticate before recording data
    // Note that this will affect the start time of markers set via `markers.set`
    await transaction.start();
}
