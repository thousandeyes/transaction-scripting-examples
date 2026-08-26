# 06 API And Hybrid Flows

Use these examples when API authentication or authenticated API setup is part of a browser journey.

- [api-authentication-browser-flow.js](api-authentication-browser-flow.js) - authenticate with OAuth 2.0 client credentials, Bearer token, Basic auth, or API key header before launching the browser flow.
- [oauth-different-token-url.js](oauth-different-token-url.js) - fetch an OAuth token when the token endpoint is different from the saved test URL.

For credential-backed URLs, store only the endpoint URL in the ThousandEyes Credentials Repository. Do not include embedded usernames, passwords, query strings, or hash fragments.

Do not add standalone HTTP API examples here when they can be built as ThousandEyes API tests with the Step Builder. Keep examples in this category focused on browser journeys that need an authenticated API step before or during the browser flow.
