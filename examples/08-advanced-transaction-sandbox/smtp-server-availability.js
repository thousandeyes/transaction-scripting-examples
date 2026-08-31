import assert from 'assert';
import { markers, net } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const SMTP_HOST = 'smtp.example.com';
const SMTP_PORT = 587;
const SMTP_CLIENT_NAME = 'example.com';
const SMTP_GREETING_COMMAND = 'HELO';
const EXPECTED_GREETING_CODE = '220';
const EXPECTED_HELO_CODE = '250';
const EXPECTED_QUIT_CODE = '221';
const MAX_RESPONSE_CHARS = 16 * 1024;

runScript();

async function runScript() {
  let socket;

  try {
    markers.start('SMTP connection');
    socket = await net.connect(SMTP_PORT, SMTP_HOST);
    await socket.setEncoding('utf8');
    await expectSmtpCode(socket, EXPECTED_GREETING_CODE, 'server greeting');
    markers.stop('SMTP connection');

    markers.start('SMTP HELO');
    await socket.writeAll(`${SMTP_GREETING_COMMAND} ${SMTP_CLIENT_NAME}\r\n`);
    await expectSmtpCode(socket, EXPECTED_HELO_CODE, 'HELO response');
    markers.stop('SMTP HELO');

    await socket.writeAll('QUIT\r\n');
    await expectSmtpCode(socket, EXPECTED_QUIT_CODE, 'QUIT response');
  } catch (error) {
    console.error('Advanced SMTP transaction failed.');
    throw error;
  } finally {
    if (socket) {
      await socket.end();
    }
  }
}

async function expectSmtpCode(socket, expectedCode, phase) {
  const response = await readSmtpResponse(socket, MAX_RESPONSE_CHARS);
  const responseCode = response.match(/(?:^|\r?\n)(\d{3}) /)?.[1];
  assert.equal(expectedCode, responseCode, `Unexpected SMTP ${phase} response.`);
}

async function readSmtpResponse(socket, maxResponseChars) {
  let response = '';

  while (!/(?:^|\r?\n)\d{3} /.test(response)) {
    response += String(await socket.read() ?? '');
    if (response.length > maxResponseChars) {
      throw new Error('SMTP response exceeded the configured safety limit.');
    }
  }

  return response;
}
