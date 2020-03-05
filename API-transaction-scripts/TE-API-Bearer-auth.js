//
// ThousandEyes transaction script which calls an API endpoint that requires
// a Bearer authenication token
//
import { By, Key, until } from 'selenium-webdriver';
import { driver, markers, credentials, downloads, transaction } from 'thousandeyes';
import fetch from 'node-fetch';

runScript();

async function runScript() {

    // retrieve the Bearer authentication token from the ThousandEyes Credentials Repository
    const apiToken = credentials.get('TE-API-Bearer-token');

    // set the method and headers in the request body
    var requestBody = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + apiToken
        }
    }

    // call the API endpoint, in this case https://developer.thousandeyes.com/v6/agents/
    markers.start('FetchTime');
    const response = await fetch('https://api.thousandeyes.com/v6/agents.json?agentTypes=ENTERPRISE', requestBody);
    const responseText = await response.text();
    if (!response.ok) {
        await console.log(responseText);
        throw new Error('non-200 response');
    }
    markers.stop('FetchTime');

    // verify that a particular string of text was returned by the API call
    if (responseText.includes('Qwest Communications')) {
        await console.log('Success - found "Qwest Communications"');
    } else {
        throw new Error('"Qwest Communications" not found');
    }
};
