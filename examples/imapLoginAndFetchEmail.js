//
// ThousandEyes transaction script which demonstrates connecting to an IMAP
// e-mail server secured with TLS, and fetching a message from the Inbox
//

import { markers, net, credentials, driver } from 'thousandeyes';
import assert from 'assert';

runCode();

async function runCode() {
	const host = 'box.the-acme-corporation.net';
	const port = 993;
    const username = 'tonystark@the-acme-corporation.net';
    const password = credentials.get(username);

    // List of IMAP commands to send to the server, with associated marker names
    // and content-validation substrings
    const steps = [                     
    //  IMAP Command                            Marker Name     Response validation string
        [`? LOGIN ${username} ${password}\n`,   'Login',        '? OK'],
        [`? SELECT Inbox\n`,                    'Select Inbox', '? OK'],
        [`? FETCH 1:1 RFC822\n`,                'Fetch E-mail', `Delivered-To: ${username}`],
    ]

    markers.start('Connect');
    // Connect to the IMAP Server
    const socket = await net.connectTls(port, host, {
        minVersion: 'TLSv1.2',
    });
    markers.stop('Connect');
    await socket.setEncoding('utf8');

    // Read the Message of the Day from the Server
    console.log(await socket.read());                 // Remove this line if there is no MOTD

    // Send and validate all the commmands from the list above
    await imapSendCommandAndValidateResponse(socket, steps);
}

async function imapSendCommandAndValidateResponse(socket, commandsList){

    for(let i=0; i < commandsList.length; i++){
        const [command, markerName, validationString] = commandsList[i];

        // Start a marker for this command
        markers.start(markerName);

        // Send the command to the server
        await socket.writeAll(command);
        console.log(command);               // (Optional, used when running in the Recorder IDE)

        // Read the response from the server
        let response = "";
        while(!response.endsWith('\r\n')){
            response += await socket.read();
        }
        console.log(response);              // (Optional, used when running in the Recorder IDE)

        // Check for the validation substring in the response, raising an error if not valid
        assert(
            response.includes(validationString), 
            `${validationString} not found in response: ${response}`
        );

        // Stop the marker for this command
        markers.stop(markerName); 
    }
}
