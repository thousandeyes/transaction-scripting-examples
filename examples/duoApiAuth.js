/*
    This script shows an example of how to use the 'node-fetch' and 'crypto' modules
    to perform token based authnetication with Cisco Duo REST API. It also uses the 
    'assert' module to validate the API response.
*/

import { markers, credentials } from 'thousandeyes';
import assert from 'assert';
import { createHmac } from 'crypto';
import fetch from 'node-fetch';

runScript();

async function runScript() {
    // TODO: Create a ThousandEyes credential called "DuoIntegrationKey" and set it to your Duo Integration Key (this is your public key)
    const integrationKey = credentials.get('DuoIntegrationKey');

    // TODO: Create a ThousandEyes credential called "DuoSecretKey" and set it to your Duo Secret Key (this is your private key)
    const secretKey = credentials.get('DuoSecretKey');

    // TODO: Create a ThousandEyes credential called "DuoUserId" and set it to the User ID that will be used to access Duo API 
    const userId = credentials.get('DuoUserId');

    // TODO: get the API endpoint from Duo for the app you created; ex. api-4f26128f.duosecurity.com
    const host = 'api-4f26128f.duosecurity.com';

    const protocol = "https";
    const method = 'POST';
    const path = '/auth/v2/preauth';
    const body = `username=${userId}`;
    const url = `${protocol}://${host}${path}`;
    const dateString = getRFC2822Date();
    const payload2Hash = [dateString, method, host, path, body].join("\n");

    // Create the authentication code secured with the Secret Key
    const hash = createHmac('sha1', secretKey)
                 .update(payload2Hash)
                 .digest('hex');

    // Create the request body, using the Integration Key and HMAC authentication code as the Basic auth contents
    const requestBody = {
        method,
        body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${to64(`${integrationKey}:${hash}`)}`,
            'Date': dateString,
        }
    };

    markers.start('auth');
    const response = await fetch(url, requestBody);
    const respJSON = await response.json();
    markers.stop('auth');

    assert(respJSON.stat == "OK", "API auth failed");
}

function getRFC2822Date() {
    return new Date().toUTCString().replace(/GMT/g, '+0000');
}

function to64(data) {
    return Buffer.from(data).toString('base64');
}