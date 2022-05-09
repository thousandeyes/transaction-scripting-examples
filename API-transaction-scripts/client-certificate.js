//
// ThousandEyes Transaction script which uses client certificates authentication
//
import fetch from 'node-fetch';
import { fetchAgent } from 'thousandeyes';
import assert from 'assert';

runCode();

async function runCode() {
    // X509 of the certificate
    // NOTE: these are fake certificates make sure to replace with real ones
    const key = `-----BEGIN CERTIFICATE-----
self signed certificate
-----END CERTIFICATE-----
`;

    const clientCert = `-----BEGIN CERTIFICATE-----
self signed certificate
-----END CERTIFICATE-----
`;
    const passphrase = '';

    // SSL options with client certificate, key and passphrase
    const sslOptions = { key: key, cert: clientCert, passphrase: passphrase };
    // get a fetch agent
    const agent = fetchAgent.getHttpsAgent(sslOptions);

    // set the agent in the request options
    const requestOptions = {
        agent: agent,
    };

    // call the endpoint
    // NOTE: this is a fake endpoint make sure to replace with a real one
    const response = await fetch('https://some-website.com', requestOptions);

    //verify that response status is 200
    assert.equal(200, response.status);
}
