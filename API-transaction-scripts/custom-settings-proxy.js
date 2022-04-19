//
// ThousandEyes Transaction script which uses proxies with custom configuration
//
import {markers, fetchAgent } from 'thousandeyes';
import fetch from 'node-fetch';
import assert from 'assert';

runScript();

async function runScript() {
    // HTTP proxy
    markers.start('HTTP Proxy');
    // custom proxy settings
    const httpProxySettings = {
        host: 'proxy-host.com',
        port: 3333,
        proxyAuth: {
            username: 'username',
            password: 'password'
        }
    };
    // get a HTTP proxy agent
    const httpProxyAgent = fetchAgent.getHttpProxyAgent(httpProxySettings)
    // set the agent in the request options
    const httpProxyRequestOptions = {
        agent: httpProxyAgent,
    };
    // call the endpoint with a self signed certificate 
    // NOTE: this is a fake endpoint make sure to replace with a real one
    const response1 = await fetch('http://some-website.com', httpProxyRequestOptions);
    // verify that response status is 200
    assert.equal(200, response1.status);
    markers.end('HTTP Proxy');

    // HTTPS proxy
    markers.start('HTTPS Proxy');
    // custom proxy settings
    const httpsProxySettings = {
        host: 'ssl-proxy-host.com',
        port: 3333,
        proxyAuth: {
            username: 'username',
            password: 'password'
        }
    };
    // get a HTTPS proxy agent
    const httpsProxyAgent = fetchAgent.getHttpsProxyAgent(httpsProxySettings)
    // set the agent in the request options
    const httpsProxyRequestOptions = {
        agent: httpsProxyAgent,
    };
    // call the endpoint with a self signed certificate 
    // NOTE: this is a fake endpoint make sure to replace with a real one
    const response2 = await fetch('https://some-website.com', httpsProxyRequestOptions);
    // verify that response status is 200
    assert.equal(200, response2.status);
    markers.end('HTTPS Proxy');

    // PAC proxy
    markers.start('PAC Proxy');
    // custom proxy settings
    const pacProxySettings = {
        pacScriptUrl: 'http://pac-script-location.com',
        proxyAuth: {
            username: 'username',
            password: 'password'
        }
    };
    // get a PAC proxy agent
    const pacProxyAgent = fetchAgent.getPACProxyAgent(pacProxySettings)
    // set the agent in the request options
    const pacProxyRequestOptions = {
        agent: pacProxyAgent,
    };
    // call the endpoint with a self signed certificate 
    // NOTE: this is a fake endpoint make sure to replace with a real one
    const response3 = await fetch('https://some-website.com', pacProxyRequestOptions);
    // verify that response status is 200
    assert.equal(200, response3.status);
    markers.end('PAC Proxy');
};
