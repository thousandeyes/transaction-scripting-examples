import assert from 'assert';
import { markers, net } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const TCP_HOST = 'github.com';
const TCP_PORT = 22;
const RESPONSE_BYTES_TO_READ = 7;
const EXPECTED_RESPONSE_PREFIX = 'SSH-2.0';

runScript();

async function runScript() {
  let socket;

  try {
    markers.start('Raw TCP connection');
    socket = await net.connect(TCP_PORT, TCP_HOST);
    await socket.setEncoding('utf8');
    markers.stop('Raw TCP connection');

    markers.start('Raw TCP response');
    const response = String(await socket.read(RESPONSE_BYTES_TO_READ));
    await socket.end();
    socket = null;
    markers.stop('Raw TCP response');

    assert(response.startsWith(EXPECTED_RESPONSE_PREFIX), 'Raw TCP response was not HTTP.');
  } catch (error) {
    console.error('Advanced raw TCP transaction failed.');
    throw error;
  } finally {
    if (socket) {
      await socket.end();
    }
  }
}
