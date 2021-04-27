/*
    A script that monitors Office 365 / Exchange mail services used by Outlook clients.
    This script lists Inbox and measures the response of the EWS API.
    This script uses the OAuth authentication.
    Author: primoz@thousandeyes.com
*/

import { markers, credentials } from 'thousandeyes';
import fetch from 'node-fetch';


let username = '<<email-of-the-inbox-user>>';
// You obtain the below values when you register ThousandEyes Web Script as an Azure AD app
// See: https://docs.microsoft.com/en-us/exchange/client-developer/exchange-web-services/how-to-authenticate-an-ews-application-by-using-oauth
let tenantId = '<<azure-id-tenant-id>>';
let clientId = ' <<azure-ad-client-id>>';
let secretToken = credentials.get('ThousandEyes Azure AD Secret');

let oauthUrl = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/token';
let ewsUrl = 'https://outlook.office365.com/EWS/Exchange.asmx';

let ewsBody = `
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages">
    <soap:Header>
        <t:RequestServerVersion Version="Exchange2010_SP2" />
        <t:ExchangeImpersonation>
            <t:ConnectingSID>
                <t:SmtpAddress>` + username + `</t:SmtpAddress>
            </t:ConnectingSID>
        </t:ExchangeImpersonation>
    </soap:Header>
    <soap:Body>
        <GetFolder xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
            <FolderShape>
                <t:BaseShape>IdOnly</t:BaseShape>
            </FolderShape>
            <FolderIds>
                <t:DistinguishedFolderId Id="inbox">
                    <t:Mailbox>
                        <t:EmailAddress>` + username + `</t:EmailAddress>
                    </t:Mailbox>
                </t:DistinguishedFolderId>
            </FolderIds>
        </GetFolder>
    </soap:Body>
</soap:Envelope>
`;

runScript();

async function runScript() {

    /*
     * OAuth authentication
     */

    await markers.start('OAuth Authentication');
    let body = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: secretToken,
        tenant_id: tenantId,
        resource: 'https://outlook.office365.com/'
    }

    let bodyText = '';
    for (let key in body) {
        bodyText += key + "=" + encodeURIComponent(body[key]) + "&";
    }
    let response = await fetch(oauthUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
        },
        body: bodyText
    });
    await markers.stop('OAuth Authentication');

    if (response.status != 200) {
        console.log("OAuth query HTTP Error: " + response.status + " " + response.statusText);
        console.log(await response.text());
        throw Error("OAuth HTTP Error: " + response.status + " " + response.statusText);
    }

    let responseJson = await response.json();
    let accessToken = responseJson['access_token'];

    /*
     * EWS API query
     */

    await markers.start('Open Inbox');
    response = await fetch(ewsUrl, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml; charset=utf-8",
            "Authorization": "Bearer " + accessToken
        },
        body: ewsBody.trim()
    });
    await markers.stop('Open Inbox');

    if (response.status != 200) {
        console.log("HTTP Error: " + response.status + " " + response.statusText);
        throw Error("HTTP Error: " + response.status + " " + response.statusText);
    }

    let content = await response.text();

    let responseCode;
    let res = content.match(/<m:ResponseCode>(.*)<\/m:ResponseCode>/);
    if ((res) && (res.length > 1)) {
        responseCode = res[1]
    } else {
        // Unhandled error
        console.log("Error: " + content);
        throw Error("Error: " + content);
    }

    if (responseCode == 'NoError') {
        console.log('Inbox opened!');
    } else {
        res = content.match(/<m:MessageText>(.*)<\/m:MessageText>/);
        if ((res) && (res.length > 1)) {
            console.log("Response Error: " + responseCode + " - " + res[1]);
            throw Error("Response Error: " + responseCode + " - " + res[1]);
        } else {
            console.log("Response Error: " + responseCode);
            throw Error("Response Error: " + responseCode);
        }
    }
};
