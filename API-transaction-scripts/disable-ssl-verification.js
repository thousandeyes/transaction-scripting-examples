//
// ThousandEyes Transaction script which disables ssl verification
//
import fetch from 'node-fetch';
import { fetchAgent } from 'thousandeyes';
import assert from 'assert';

runCode();

async function runCode() {

    // SSL options with verification disabled certificates
    const sslOptions = { verifySSLCertificate: false };
    // get a HTTPS agent with ssl verification disabled
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
