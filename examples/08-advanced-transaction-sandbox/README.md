# 08 Advanced Transaction Sandbox

These examples are advanced transaction scripts for raw protocol and sandbox capabilities. They are not for beginners and are provided on a use-at-your-own-risk basis.

Use only test systems, test mailboxes, and credentials you are authorized to use. Read [Advanced transaction sandbox tests](../../docs/advanced-sandbox-tests.md) and the standard [getting started guide](../../docs/getting-started.md) before adapting them.

- [imap-login-fetch-header.js](imap-login-fetch-header.js) - connect to an IMAP server over TLS, authenticate, select a mailbox, fetch one message, and validate expected response text.
- [smtp-server-availability.js](smtp-server-availability.js) - connect to an SMTP service, issue `HELO`, validate the response, and close the session.
- [raw-tcp-send-receive.js](raw-tcp-send-receive.js) - open a TCP socket, read an SSH protocol banner, and validate its prefix.
- [raw-tls-send-receive.js](raw-tls-send-receive.js) - open a TLS-protected TCP socket, send an HTTP/1.1 request, and validate the response line.
- [hmac-signed-http.js](hmac-signed-http.js) - reproduce the legacy Duo-style HMAC request contract with Node `crypto` and credential-backed Basic authentication.

These scripts intentionally use lower-level primitives. Prefer the regular categorized browser examples or a ThousandEyes API test whenever they cover the requirement.
