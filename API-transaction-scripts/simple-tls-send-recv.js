//
// ThousandEyes transaction script which demonstrates making a low-level TLS connection, sending
// a message, and reading a result.  In this case, we connect to google.com on port 443 (HTTPS)
// and send the text of a standard HTTP/1.1 GET request.  After closing our end of the connection,
// we read everything sent by the server, expecting an HTTP/1.1 response. 
//
import { markers, net } from 'thousandeyes';
import assert from 'assert';

runCode();

async function runCode() {
    markers.start('connect');
    // make a TLS connection on port 443, which is the standard HTTPS port
    const sock = await net.connectTls(443, 'google.com', {
        minVersion: 'TLSv1.2',  // we require a minimum TLS version of 1.2
                                // other supported options are listed in the NodeJS TLS API docs:
                                // - https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
                                // - https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
    });
    markers.stop('connect');

    // set the socket's encoding to utf8 (it will be binary otherwise)
    sock.setEncoding('utf8');

    markers.start('GET request');
    // send a standard HTTP/1.1 GET request.  A Host: header for google.com is supplied.
    await sock.writeAll('GET / HTTP/1.1\r\nHost: google.com\r\n\r\n');
    // ...close our end of the connection after we've sent the request
    await sock.end();
    // ...read every byte of the server's response
    const response = await sock.readAll();
    markers.stop('GET request');

    // validate that the response looks like an HTTP response
    assert(response.toString().startsWith('HTTP/1.1'), 'Response doesn\'t start with \'HTTP/1.1\'');
}
                