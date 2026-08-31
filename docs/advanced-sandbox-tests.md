# Advanced Transaction Sandbox Tests

This section is for experienced JavaScript authors who need transaction-script capabilities beyond ordinary browser journeys. It demonstrates raw sockets, protocol exchanges, TLS connections, and request signing inside the ThousandEyes transaction sandbox. The examples intentionally stay close to the former working protocol examples where that improves runtime confidence.

These examples are not for beginners. Use them at your own risk and only against systems you own or are authorized to monitor. Start with the standard [transaction examples](../examples/README.md), especially [getting started](getting-started.md), before adapting these scripts.

## Before using these examples

You should be comfortable with:

- JavaScript modules, `async`/`await`, Promises, and `try`/`catch`.
- Reading and writing protocol messages, line endings, response framing, and character encodings.
- TCP sockets, TLS negotiation, certificates, ports, and firewall behavior.
- Credential storage, request signing, canonicalization, and the security implications of handling secrets.
- Testing with dedicated non-production accounts and non-production endpoints.

Useful references:

- [ThousandEyes `net` module](https://docs.thousandeyes.com/product-documentation/browser-synthetics/transaction-tests/use-cases/api-monitoring/net-module) for raw TCP connections.
- [ThousandEyes `tls` module](https://docs.thousandeyes.com/product-documentation/browser-synthetics/transaction-tests/use-cases/api-monitoring/tls-module) for TCP connections secured with TLS.
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) for the language fundamentals needed to maintain advanced scripts.
- [MDN asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS) for Promises, `async`, and `await`.
- [Node.js `crypto.createHmac`](https://nodejs.org/api/crypto.html#cryptocreatehmacalgorithm-key-options) for HMAC signing.
- [Node.js `Buffer`](https://nodejs.org/api/buffer.html) for byte and encoding conversions.
- [ThousandEyes API Test Step Builder](https://docs.thousandeyes.com/product-documentation/api-test/using-the-step-builder) for deciding whether an HTTP check belongs in an API test instead.

## Test-type boundaries

These are transaction scripts, not dedicated IMAP, SMTP, TCP, TLS, or HMAC test types. An Agent-to-Server TCP test can check whether a service port is reachable, but it does not perform protocol commands or application authentication. Use these scripts only when protocol-level behavior is the thing being measured.

For standalone HTTP checks, prefer a ThousandEyes API test. The HMAC example is included because transaction scripts can use Node's `crypto` module, while the API Step Builder does not document HMAC as a built-in authentication scheme. A provider may require a precise canonical request, timestamp, nonce, digest encoding, or header format; adapt and validate those details against the provider's specification.

## Safety and maintenance rules

- Keep hostnames, paths, usernames, mailbox names, and expected values as obvious constants near the top of each script.
- Retrieve passwords, API keys, HMAC secrets, and other sensitive values with `credentials.get()`.
- Never log credentials, authorization headers, signatures, email contents, or complete protocol responses.
- Use bounded test data and dedicated test mailboxes. The IMAP example fetches one message to preserve the original protocol behavior; never point it at a production mailbox.
- Keep protocol parsing conservative and preserve the last useful failure without dumping sensitive response bodies.
- Revalidate each example after BrowserBot, Node.js, or ThousandEyes sandbox runtime changes. These scripts depend on lower-level behavior and are maintained on a best-effort basis.
