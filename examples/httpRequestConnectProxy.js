/*
    A script that establishes a connection with a CONNECT proxy server and sends subsequent requests through the proxy
    to the target server. Supports HTTP and HTTPS URLs and upgrades connection to TLS for HTTPS URLs.
    Author: primoz@thousandeyes.com
*/

import { By, Key } from 'selenium-webdriver';
import { driver } from 'thousandeyes';
import assert from 'assert';
import net from 'net';
import tls from 'tls';

let proxyHost = '10.10.10.110';
let proxyPort = 8888;
let url = 'https://www.google.com/';



runScript();

async function runScript() {

    let sock;
    try {
        sock = await connectProxy(proxyHost, proxyPort, url);
    } catch (e) {
        assert.fail('Proxy error: ' + e);
    }

    let response;
    try {
        response = await fetchUsingProxy(sock, url);
    } catch (e) {
        assert.fail('Fetch error: ' + e);
    }

    if (!response.match(/HTTP\/.*200/g)) {
        assert.fail(response);
    }

    console.log(response);

}



function connectProxy(proxyHost, proxyPort, url) {

    let urlComponents = urlToComponents(url);

    return new Promise(function(resolve, reject) {
        let options = {
            host: proxyHost,
            port: proxyPort
        }
        let sock = net.connect(options, () => {
            sock.write('CONNECT ' + urlComponents['serverWPort'] + ' HTTP/1.1\r\nHost: ' + urlComponents['server'] + '\r\n\r\n', null, (err) => {
                if (err !== undefined) {
                    reject(err);
                }
            })
        });
        sock.once('close', () => {
            reject('Proxy connection closed.');
        });

        sock.once('error', (err) => {
            reject(err);
        });

        sock.once('data', (data) => {
            if (data.toString('utf8').match(/HTTP\/.*200/g)) {
                // If target server is HTTPS, upgrade current sock to TLS. After we issued CONNECT command to the proxy, proxy now becomes transparent,
                // so TLS handshake is actually done between the client and the server.
                if (urlComponents['https']) {
                    let sockTls = tls.connect({
                        socket: sock,
                        servername: urlComponents['server']
                    }, () => {
                        resolve(sockTls);
                    });
                    sockTls.once('close', () => {
                        reject('Proxy or server connection closed.');
                    });
                    sockTls.once('error', (err) => {
                        reject(err);
                    });
                } else {
                    resolve(sock);
                }
            } else {
                reject(data.toString('utf8'));
            }
        });
    })
}

function fetchUsingProxy(sock, url, headers = {}, requestType = 'GET', body = '') {

    let urlComponents = urlToComponents(url);

    let headersStr = '';
    for (const [key, value] of Object.entries(headers)) {
        headersStr += key + ': ' + value + '\r\n';
    }

    let payload = `
        ` + requestType + ` ` + urlComponents['relativeUrl'] + ` HTTP/1.1
        Host: ` + urlComponents['server'] + `
        Content-Length: ` + body.trim().replace(/(?:\r\n|\r|\n) */g, '').length + `
        ` + headersStr + `
        ` + body.trim().replace(/(?:\r\n|\r|\n) */g, '') + `
    `
    payload = payload.trim().replace(/(?:\r\n|\r|\n)/g, '\r\n').replace(/  +/g, ' ').replace(/\r\n +/g, '\r\n');

    return new Promise(function(resolve, reject) {

        sock.write(payload + '\r\n\r\n', null, (err) => {
            if (err !== undefined) {
                reject(err);
            }
        })
        sock.once('close', () => {
            reject('Proxy or server connection closed.');
        });
        sock.once('error', (err) => {
            reject(err);
        });
        sock.once('data', (data) => {
            if (data.toString('utf8').match(/HTTP\/.*200/g)) {
                resolve(data.toString('utf8'));
            } else {
                reject(data.toString('utf8'));
            }
        });
    })
}

function urlToComponents(url) {
    let regex = /(https?):\/\/([\w\.:]+)(\/.*)?/
    var match = regex.exec(url);
    if (!match || match.length < 4) {
        throw ('Invalid URL.')
    }
    let isHttps = false;
    if (match[1] == 'https') {
        isHttps = true;
    }
    let serverHost = match[2]
    if (serverHost === undefined) {
        throw ('Invalid URL.')
    }
    let relativeUrl = match[3]
    if (relativeUrl === undefined) {
        relativeUrl = '/';
    }
    let serverHostPort = serverHost
    if (!serverHost.includes(":")) {
        if (isHttps) {
            serverHostPort = serverHost + ':443';
        }
    }
    return {
        'https': isHttps,
        'server': serverHost,
        'serverWPort': serverHostPort,
        'relativeUrl': relativeUrl
    }
}
