import { driver } from 'thousandeyes';

runScript(); 

async function runScript() {
    await driver.get('https://google.com');

    // Takes a screenshot of the whole page at the time this function is called. Initially you're limited to 3 screenshots per test.
    // These screenshots are viewable in either the ThousandEyes recorder or the views of the ThousandEyes app.
    // Calling this function will take the screenshot right away, so make sure to wait for the visibility of any elements
    // you want to capture before calling, otherwise the screenshot may just show a white/partially loaded page. 
    await driver.takeScreenshot();
}
