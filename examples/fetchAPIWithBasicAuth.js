/*
    A script that uses fetch() and basic HTTP authentication to fetch data from API
    Author: primoz@thousandeyes.com
*/

import { By, Key, until } from 'selenium-webdriver';
import fetch from 'node-fetch';
import assert from 'assert';

runScript();

async function runScript() {

    const username = 'noreply@thousandeyes.com';
    const password = 'g351mw5xqhvkmh1vq6zfm51c62wyzib2';
    // Encode credentials in base64
    let buffer = new Buffer(username+':'+password);
    let apiToken = buffer.toString("base64");

    let requestBody = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + apiToken
        }
    }

    let response = await fetch('https://api.thousandeyes.com/v6/tests.json', requestBody);
    if (!response.ok) {
        assert.fail(response.status + ' ' + response.statusText);
    }
    let responseText = await response.json();
    console.log(responseText);

};
