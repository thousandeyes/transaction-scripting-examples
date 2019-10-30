import { driver } from 'thousandeyes';

runScript(); 

async function runScript() {
    // Opens google.com; Make sure to add `await` to any async operations to wait for the operation to finish
    // If you're not sure that an operation is async, check the returned type. 
    // Anything that returns a "Promise" is an async operation
    await driver.get('https://google.com');
}
