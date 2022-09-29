//
// ThousandEyes Transaction script which calls an API endpoint that requires
// a Basic authenication token
//
import { By, Key, until } from 'selenium-webdriver';
import { driver, markers, credentials, downloads, transaction, authentication } from 'thousandeyes';
import fetch from 'node-fetch';

runScript();

async function runScript() {

    // update with your ThousandEyes username - typically your email address
    const username = 'username@example.com';

    // retrieve the Basic authentication token from the credential stored as 'TE-API-Basic-token'
    // in the ThousandEyes Credentials Repository
    const token = credentials.get('TE-API-Basic-token');

    // encode the token
    var buffer = Buffer.from(username+':'+token);
    var apiToken = buffer.toString('base64');

    // set the method and headers in the request body
    var requestBody = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic '+apiToken
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
