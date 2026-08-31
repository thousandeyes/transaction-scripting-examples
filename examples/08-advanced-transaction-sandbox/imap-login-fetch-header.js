import assert from 'assert';
import { credentials, markers, net } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMAP_HOST = 'imap.example.com';
const IMAP_PORT = 993;
const IMAP_USERNAME_CREDENTIAL_NAME = 'IMAP Username';
const IMAP_PASSWORD_CREDENTIAL_NAME = 'App Password';
const MAILBOX_NAME = 'INBOX';
const MESSAGE_SEQUENCE = '1:1';
const EXPECTED_FETCH_TEXT = 'Delivered-To:';
const MAX_RESPONSE_CHARS = 256 * 1024;

runScript();

async function runScript() {
  let socket;

  try {
    const username = credentials.get(IMAP_USERNAME_CREDENTIAL_NAME);
    const password = credentials.get(IMAP_PASSWORD_CREDENTIAL_NAME);

    markers.start('IMAP TLS connection');
    socket = await net.connectTls(IMAP_PORT, IMAP_HOST, {
      minVersion: 'TLSv1.2',
    });
    await socket.setEncoding('utf8');
    await readUntil(socket, '* OK', MAX_RESPONSE_CHARS);
    markers.stop('IMAP TLS connection');

    markers.start('IMAP login');
    await sendImapCommand(socket, 'A001', `LOGIN "${quoteImap(username)}" "${quoteImap(password)}"`);
    markers.stop('IMAP login');

    markers.start('IMAP mailbox check');
    await sendImapCommand(socket, 'A002', `SELECT "${quoteImap(MAILBOX_NAME)}"`);
    await sendImapCommand(
      socket,
      'A003',
      `FETCH ${MESSAGE_SEQUENCE} RFC822`,
    );
    markers.stop('IMAP mailbox check');

    await sendImapCommand(socket, 'A004', 'LOGOUT');
  } catch (error) {
    console.error('Advanced IMAP transaction failed.');
    throw error;
  } finally {
    if (socket) {
      await socket.end();
    }
  }
}

async function sendImapCommand(socket, tag, command) {
  await socket.writeAll(`${tag} ${command}\r\n`);
  const response = await readUntil(socket, `${tag} `, MAX_RESPONSE_CHARS);
  assert(response.includes(`${tag} OK`), `IMAP command ${tag} did not return OK.`);

  if (tag === 'A003') {
    assert(response.includes(EXPECTED_FETCH_TEXT), 'IMAP fetch did not include the expected text.');
  }
}

async function readUntil(socket, expectedText, maxResponseChars) {
  let response = '';

  while (!response.includes(expectedText)) {
    response += String(await socket.read() ?? '');
    if (response.length > maxResponseChars) {
      throw new Error('IMAP response exceeded the configured safety limit.');
    }
  }

  return response;
}

function quoteImap(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
