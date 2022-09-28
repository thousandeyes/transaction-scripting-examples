/*
    This script example authenticates with the OAuth 2.0 service
    then uses the OAuth access token to query the REST API.
    Script validates REST API response contents and errors on unexpected
    values. It also exposes certain response values as markers and
    displays response contents in a screenshot.

    Authors: primoz@thousandeyes.com, benton@thousandeyes.com
*/
import {
    By
} from 'selenium-webdriver';
import {
    driver,
    markers,
    credentials
} from 'thousandeyes';
import fetch from 'node-fetch';

const clientId = 'ThousandEyesClient';
const clientSecret = credentials.get('OAuth_DCHS');
const oauthUrl = 'https://oauthservice.example.com/oauth2/api/v1/token?token_format=jwt&grant_type=client_credentials';
const apiUrl = 'https://restapi.example.com/api/v1/health';

runScript();

async function runScript() {

    /*
        Fetch the Access token from the OAuth service
    */
    await markers.start('OAuth Query Time');
    const buffer = Buffer.from(clientId + ':' + clientSecret);
    const basicHash = buffer.toString("base64");
    const oauthRequest = {
        method: 'POST',
        /*  clientId and clientSecret are provided with Basic Authorization
            but could also be provided as POST variables */
        headers: {
            'Authorization': 'Basic ' + basicHash
        }
    }
    const oauthResponse = await fetch(oauthUrl, oauthRequest);
    if (!oauthResponse.ok) {
        const oauthErrorResponseText = await oauthResponse.text();
        throw new Error('OAuth HTTP ' + oauthResponse.status + '(' + oauthResponse.statusText + ')\n' + oauthErrorResponseText);
    }
    const oauthResponseJson = await oauthResponse.json();
    if (!('access_token' in oauthResponseJson)) {
        const oauthResponseText = JSON.stringify(oauthResponseJson, null, 4);
        throw new Error('OAuth response is missing access_token:\n' + oauthResponseText);
    }
    const accessToken = oauthResponseJson.access_token;
    await markers.stop('OAuth Query Time');


    /*
        Query the API
    */
    await markers.start('API Query Time');
    const apiRequest = {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }
    const apiResponse = await fetch(apiUrl, apiRequest);
    if (!apiResponse.ok) {
        throw new Error('API HTTP ' + apiResponse.status + '(' + apiResponse.statusText + ')');
    }
    const apiResponseJson = await apiResponse.json();
    await markers.stop('API Query Time');

    /*
        Put the complete API response into a screenshot
    */
    const apiResponseText = JSON.stringify(apiResponseJson, null, 4);
    await driver.executeScript(`document.getElementsByTagName('body')[0].remove();document.write('<textarea id="output" style="width:100%;height:100%" rows="" cols=""></textarea>');`)
    var textArea = await driver.findElement(By.id('output'));
    await textArea.sendKeys(apiResponseText);
    await driver.takeScreenshot();


    /*
        Validate the API output
        If a property is not 'ok', add it to error message and throw an error.
    */
    if (!('globalChecks' in apiResponseJson)) {
        throw new Error('API response JSON is missing \'globalChecks\'');
    }

    let errorMessage = '';
    for (let property in apiResponseJson.globalChecks) {
        markers.start(property + ' status: ' + apiResponseJson.globalChecks[property].status);
        markers.stop(property + ' status: ' + apiResponseJson.globalChecks[property].status);
        if (apiResponseJson.globalChecks[property].status != 'ok') {
            errorMessage += property + ' status: ' + apiResponseJson.globalChecks[property].status + '\n';
        }
    }
    if (errorMessage.length > 0) {
        throw new Error(errorMessage);
    }

};
