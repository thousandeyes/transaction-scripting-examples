//
// ThousandEyes transaction script which demonstrates making a low-level TCP connection to GitHub's
// public SSH server.
//
import { markers, net } from 'thousandeyes';
import assert from 'assert';

runCode();

async function runCode() {
    markers.start('connect');
    // make a TCP connection on port 22 (SSH) to github.com
    const sock = await net.connect(22, 'github.com');
    markers.stop('connect');

    // set the socket's encoding to utf8 (it will be binary otherwise)
    sock.setEncoding('utf8');

    markers.start('get ssh connect message');
    // ...read enough bytes from the server to validate that it's running SSH protocol version 2.0
    const response = await sock.read(7);
    // close our end of the connection.  we won't be sending anything.
    await sock.end();
    markers.stop('get ssh connect message');

    // validate that the response looks like an HTTP response
    assert(response.toString().startsWith('SSH-2.0'), 'Response doesn\'t start with \'SSH-2.0\'');
}
                
