/* 
    A script that checks availability of an SMTP Server by connecting to the service and evaluating the response code.
*/

import { net } from 'thousandeyes';
import assert from 'assert';
runScript();

async function runScript() {
    // Set host and port
    let host = 'smtp.gmail.com';
    let port = 587;
    await callServer(host, port);

};
async function callServer(host, port) {
    const sock = await net.connect(port, host);
    sock.setEncoding('utf8');
    let response = await sock.read();
    
    // Send Hello message to the server
    await sock.writeAll('HELO ' + host + '\r\n');
    response = await sock.read();
    
    // Check entire response by uncommenting line below - must use IDE
    //console.log (response);
    
    // Change 250 to expected response code if different 
    await checkCode(response,250);
    
    // Close connection
    await sock.writeAll('QUIT\r\n');
    await sock.end()
}

async function checkCode(response,correctCode){
    response = response.substring(0,3);
    if (response != correctCode) {
            assert.fail('Received wrong SMTP response code: ' + response);
    }
}
