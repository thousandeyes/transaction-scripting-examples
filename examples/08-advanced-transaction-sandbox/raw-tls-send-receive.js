import assert from 'assert';
import { markers, net } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const TLS_HOST = 'google.com';
const TLS_PORT = 443;
const REQUEST_PATH = '/';
const EXPECTED_RESPONSE_PREFIX = 'HTTP/1.1';

runScript();

async function runScript() {
  let socket;

  try {
    markers.start('Raw TLS connection');
    socket = await net.connectTls(TLS_PORT, TLS_HOST, {
      minVersion: 'TLSv1.2',
    });
    await socket.setEncoding('utf8');
    markers.stop('Raw TLS connection');

    markers.start('Raw TLS request');
    await socket.writeAll(
      `GET ${REQUEST_PATH} HTTP/1.1\r\nHost: ${TLS_HOST}\r\nUser-Agent: thousandeyes-transaction\r\n\r\n`,
    );
    await socket.end();
    const response = String(await socket.readAll());
    socket = null;
    markers.stop('Raw TLS request');

    assert(response.startsWith(EXPECTED_RESPONSE_PREFIX), 'Raw TLS response was not HTTP.');
  } catch (error) {
    console.error('Advanced raw TLS transaction failed.');
    throw error;
  } finally {
    if (socket) {
      await socket.end();
    }
  }
}
