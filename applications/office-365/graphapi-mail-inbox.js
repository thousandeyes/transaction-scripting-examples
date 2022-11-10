/*
    A script that monitors Office 365 / Exchange mail services used by Outlook clients.
    This script lists Inbox and measures the response of the Graph API
    This script uses the OAuth authentication.
    Author: primoz@thousandeyes.com
*/

import { markers, credentials, test, fetchAgent } from 'thousandeyes';
import fetch from 'node-fetch';

let username = credentials.get('Microsoft Username');
let password = credentials.get('Microsoft Password');
let clientId = credentials.get('Microsoft Client ID');
let clientSecret = credentials.get('Microsoft Client Secret');

runScript();

async function runScript() {

    let testSettings = await test.getSettings();
    let httpProxySettings = testSettings.proxy;
    let sslOptions = {}; // do this to enforce SSL through CONNECT
    let httpProxyAgent = fetchAgent.getHttpProxyAgent(httpProxySettings, sslOptions);

    /*
     * OAuth authentication
     */

    await markers.start('OAuth Authentication');
    let body = {
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username,
        password: password,
        scope: 'mail.read mail.readwrite mail.send calendars.read calendars.readwrite user.read files.read files.readwrite openid profile offline_access'
    }

    let bodyText = '';
    for (let key in body) {
        bodyText += key + "=" + encodeURIComponent(body[key]) + "&";
    }

    let oauthFetchData = {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyText
    }
    if (httpProxySettings.type != 'NONE') {
        oauthFetchData['agent'] = httpProxyAgent;
    }
    let response = await fetch('https://login.microsoftonline.com/organizations/oauth2/v2.0/token', oauthFetchData);
    if (response.status != 200) {
        console.warn("OAuth HTTP Error: " + response.status + " " + response.statusText);
        console.warn(await response.text());
        throw Error("OAuth HTTP Error: " + response.status + " " + response.statusText);
    }
    await markers.stop('OAuth Authentication');

    let responseJson = await response.json();
    let accessToken = responseJson['access_token'];

    /*
     * API query
     */

    await markers.start('Open Inbox');
    let apiFetchData = {
        method: "GET",
        headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "Authorization": "Bearer " + accessToken
        }
    }
    if (httpProxySettings.type != 'NONE') {
        apiFetchData['agent'] = httpProxyAgent;
    }
    response = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages', apiFetchData);

    if (response.status != 200) {
        console.warn("API HTTP Error: " + response.status + " " + response.statusText);
        console.warn(await response.text());
        throw Error("API HTTP Error: " + response.status + " " + response.statusText);
    }
    await markers.stop('Open Inbox');

    responseJson = await response.json();

    if ('value' in responseJson) {
        console.warn('Number of messages: ' + responseJson['value'].length);
    } else {
        throw Error("API returned no 'value' parameter.");
    }
};
