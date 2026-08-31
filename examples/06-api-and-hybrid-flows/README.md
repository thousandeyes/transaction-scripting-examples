# 06 API And Hybrid Flows

Use these examples when API authentication or authenticated API setup is part of a browser journey.

The API examples use a bounded fetch helper that aborts an in-flight request when its timeout is reached and clears the timeout after the request settles. Keep this pattern when adapting the examples so a timed-out request does not continue running in the background.

- [oauth-client-credentials-browser-flow.js](oauth-client-credentials-browser-flow.js) - obtain an OAuth 2.0 access token with the client credentials grant before launching the browser flow.
- [bearer-token-browser-flow.js](bearer-token-browser-flow.js) - use a stored reusable Bearer token for an authenticated API check before launching the browser flow.
- [basic-auth-browser-flow.js](basic-auth-browser-flow.js) - use stored username and password credentials for a Basic-authenticated API check before launching the browser flow.
- [api-key-header-browser-flow.js](api-key-header-browser-flow.js) - use a stored API key in a configurable request header before launching the browser flow.
- [oauth-different-token-url.js](oauth-different-token-url.js) - fetch an OAuth token when the token endpoint is different from the saved test URL.

For credential-backed URLs, store only the endpoint URL in the ThousandEyes Credentials Repository. Do not include embedded usernames, passwords, query strings, or hash fragments.

Do not add standalone HTTP API examples here when they can be built as ThousandEyes API tests with the Step Builder. Keep examples in this category focused on browser journeys that need an authenticated API step before or during the browser flow.
