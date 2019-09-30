import { driver, markers } from 'thousandeyes';

runScript();

async function runScript() {
    // Creates a new marker with the name of "PageLoad"
    // This will track the time between the start and stop call
    // and will show up in the views and API with this name.
    markers.start('PageLoad');
    await driver.get('https://google.com');
    markers.stop('PageLoad');
}
