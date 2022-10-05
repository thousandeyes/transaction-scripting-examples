/*
    A script that uses fetch() and basic HTTP authentication to fetch data from API
    Author: primoz@thousandeyes.com
*/

import { By, Key, until } from 'selenium-webdriver';
import fetch from 'node-fetch';
import assert from 'assert';
import { credentials, markers } from 'thousandeyes'

runScript();

async function runScript() {

    // replace the username string with your ThousandEyes login
    const username = 'user@example.com';

    // retrieve the Basic authentication token from the credential stored as 'TE-Basic-token'
    // in the ThousandEyes Credentials Repository
    const password = credentials.get('TE-Basic-token');
    
    // Encode credentials in base64
    let buffer = Buffer.from(username+':'+password);
    let apiToken = buffer.toString('base64');

    let requestBody = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + apiToken
        }
    }

    markers.start('fetch');
    let response = await fetch('https://api.thousandeyes.com/v6/tests.json', requestBody);
    markers.stop('fetch');

    if (!response.ok) {
        assert.fail(response.status + ' ' + response.statusText);
    }
    let responseText = await response.json();
    console.log(responseText);

};
