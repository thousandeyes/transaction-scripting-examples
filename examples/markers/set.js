import { driver, markers } from 'thousandeyes';

runScript();

async function runScript() {
    await driver.get('https://google.com');

    // Sets a new marker with the name of "PageLoad"
    // The start time of this marker will be the transaction start time (can be modified with transaction.start())
    // The end time of this marker will be the time that set is called. There's no need to explicitly stop this marker. 
    markers.set('PageLoad');
}
