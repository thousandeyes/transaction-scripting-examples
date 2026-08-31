import assert from 'assert';
import { createHmac } from 'crypto';
import fetch from 'node-fetch';
import { credentials, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const HTTP_METHOD = 'POST';
const HMAC_ALGORITHM = 'sha1';
const INTEGRATION_KEY_CREDENTIAL_NAME = 'Duo Integration Key';
const SECRET_KEY_CREDENTIAL_NAME = 'Duo Secret Key';
const USER_ID_CREDENTIAL_NAME = 'Duo User ID';
const EXPECTED_RESPONSE_STATUS = 200;
const EXPECTED_RESPONSE_STAT = 'OK';

// Configure the transaction test URL as the authorized HMAC endpoint.
// The endpoint path and host are included in the signature, so they must match the provider contract.

runScript();

async function runScript() {
  try {
    const settings = test.getSettings();
    const targetUrl = new URL(settings.url);
    const integrationKey = credentials.get(INTEGRATION_KEY_CREDENTIAL_NAME);
    const secretKey = credentials.get(SECRET_KEY_CREDENTIAL_NAME);
    const userId = credentials.get(USER_ID_CREDENTIAL_NAME);
    const dateString = new Date().toUTCString().replace(/GMT/g, '+0000');
    const body = `username=${userId}`;

    // This canonical request matches the legacy Duo-style transaction example.
    // Replace it only when the target provider specifies a different signing contract.
    const canonicalRequest = [dateString, HTTP_METHOD, targetUrl.host, targetUrl.pathname, body].join('\n');
    const hmac = createHmac(HMAC_ALGORITHM, secretKey)
      .update(canonicalRequest)
      .digest('hex');
    const authorization = Buffer.from(`${integrationKey}:${hmac}`).toString('base64');

    markers.start('HMAC-signed API request');
    const response = await fetch(targetUrl.toString(), {
      method: HTTP_METHOD,
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authorization}`,
        Date: dateString,
      },
    });
    markers.stop('HMAC-signed API request');

    assert.equal(EXPECTED_RESPONSE_STATUS, response.status, 'HMAC-signed request returned an unexpected status.');
    const responseBody = await response.json();
    assert.equal(EXPECTED_RESPONSE_STAT, responseBody.stat, 'HMAC-signed API response was not successful.');
  } catch (error) {
    console.error('Advanced HMAC transaction failed.');
    throw error;
  }
}
