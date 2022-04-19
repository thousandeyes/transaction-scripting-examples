//
// ThousandEyes Transaction script which trusts arbitrary certificates
//
import fetch from 'node-fetch';
import { fetchAgent } from 'thousandeyes';
import assert from 'assert';

runCode();

async function runCode() {
    // X509 of the certificate
    // NOTE: these are fake certificates make sure to replace with real ones
    const cert1 = `-----BEGIN CERTIFICATE-----
self signed certificate
-----END CERTIFICATE-----
`;

    const cert2 = `-----BEGIN CERTIFICATE-----
self signed certificate
-----END CERTIFICATE-----
`;
    // SSL options with custom certificates
    const sslOptions = { customCA: [cert1, cert2] };
    // get a fetch agent with custom certificates
    const agent = fetchAgent.getHttpsAgent(sslOptions);

    // set the agent in the request options
    const requestOptions = {
        agent: agent,
    };

    // call the endpoint with a self signed certificate 
    // NOTE: this is a fake endpoint make sure to replace with a real one
    const response = await fetch('https://some-website-with-a-self-signde-cert.com', requestOptions);

    //verify that response status is 200
    assert.equal(200, response.status);
}
