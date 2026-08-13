# Convert To API Test

Not every browser flow should stay a browser flow. Some checks are faster, clearer, and less flaky as ThousandEyes API tests or hybrid browser-plus-API scripts.

## Good API candidates

- Health checks where the browser adds no signal.
- Authentication/token validation.
- Data availability checks.
- Inbox, record, report, or job-status checks.
- Preflight checks that determine whether a browser flow should continue.

## Keep as browser tests when

- Rendering, layout, JavaScript execution, or user interaction is the thing being tested.
- SSO redirects, MFA prompts, iframes, popups, or downloads are part of the user experience.
- The business workflow depends on the browser session state.

## Hybrid Authentication Pattern

Use an authenticated API setup step only when it affects the browser journey. Standalone HTTP checks should become ThousandEyes API tests instead.

```js
const API_URL = 'https://api.example.com/me';
const API_TOKEN = credentials.get('API Bearer Token');

const settings = test.getSettings();
const targetUrl = settings.url;

markers.start('Authenticated API Check');
const response = await fetch(API_URL, {
  headers: {
    authorization: `Bearer ${API_TOKEN}`,
  },
});
markers.stop('Authenticated API Check');

if (!response.ok) {
  throw new Error(`Authenticated API check failed: ${response.status} ${response.statusText}`);
}

markers.start('Browser flow');
await driver.get(targetUrl);
await waitForVisible(By.css('[data-testid="dashboard"]'));
markers.stop('Browser flow');
```

## What belongs in this repo

Standalone HTTP API examples should not be added when they can be built with ThousandEyes API tests. Use API tests for HTTP methods, headers, bodies, Basic/Bearer/OAuth/API key authentication, response assertions, variable extraction across steps, client certificates, SSL verification controls, and proxy settings.

Keep transaction-script API examples only when the authenticated API call is part of a browser journey.

## Agent Skill: Convert Transaction API Script To API Test

Use this skill when a user asks an AI agent to convert an existing transaction script that primarily performs HTTP API calls into a ThousandEyes API test.

### Purpose

Convert JavaScript transaction API logic into a ThousandEyes API test plan, validate it with an instant API test, then create a scheduled production API test only after explicit user confirmation.

### When to use

Use this workflow when the transaction script is mostly:

- `fetch(...)`, `http.request(...)`, or `https.request(...)` calls.
- Basic, Bearer, OAuth, or API key authentication.
- Request headers, parameters, JSON bodies, or SOAP/XML bodies.
- Response status checks such as `response.ok`, `response.status`, or `assert.equal(200, response.status)`.
- Response body checks such as `responseText.includes(...)`, JSON property checks, or XML/SOAP content checks.
- A sequence where one response value feeds a later request.
- Proxy, SSL verification, custom CA, or client certificate setup.

Do not force conversion when the script needs browser state, DOM interaction, page-rendered cookies, file downloads, iframes, or SSO/MFA UI. Keep those as Browser Synthetics transaction tests, and use hybrid API examples only when the API step supports the browser journey.

### Conversion learnings from legacy transaction API scripts

| Transaction script pattern | ThousandEyes API test equivalent |
| --- | --- |
| `markers.start('FetchTime')` / `markers.stop(...)` | Use clear API step names and API transaction timing instead of script markers. |
| `fetch(url, { method, headers, body })` | One Step Builder request with method, endpoint, headers, parameters, and body. |
| `credentials.get('API Token')` in an `Authorization` header | Use the Step Builder Authentication tab and the Credentials Repository. |
| Manually encoded Basic auth with `Buffer.from(username + ':' + password)` | Use Basic authentication; do not manually build the header when the API test supports it. |
| Bearer header assembled in JavaScript | Use Bearer token authentication with a stored credential. |
| API key header such as `x-api-key` or `x-api-token` | Use API key/header authentication with a stored credential. |
| OAuth token fetch followed by a Bearer request | Use OAuth 2.0 authentication or model the token request as the first step and extract the token for later steps if the MCP schema requires explicit steps. |
| `if (!response.ok) throw ...` | Add status-code assertion rules. |
| `responseText.includes('expected')` | Add response-body contains or does-not-contain assertions. |
| `const json = await response.json()` then property checks | Add JSON response assertions or extract variables from JSON for later steps. |
| Response value reused in another request | Extract a post-request variable and reference it in later URLs, headers, parameters, or body fields. |
| `fetchAgent` proxy helpers | Use API test proxy settings rather than script-level proxy agents. |
| `verifySSLCertificate: false` | Use the per-step SSL verification control only when intentionally required. |
| `customCA`, client certificate, key, or passphrase | Use API test TLS/client certificate settings where supported. |
| SOAP/XML EWS examples | Convert to POST steps with XML body, `content-type` headers, status assertions, and response text/XML assertions. |

### MCP workflow for agents

1. Evaluate the transaction API script for conversion.

   - Identify each HTTP request in execution order.
   - Extract method, URL, headers, parameters, body, authentication, expected status, expected body text, and any values reused by later requests.
   - Decide whether the result should be a ThousandEyes `api` test, a browser-plus-API transaction, or a non-HTTP transaction script.
   - If the script is not a good API test candidate, explain why and propose the correct test type.

2. Check that the ThousandEyes MCP server is available.

   - Discover available ThousandEyes synthetic-monitoring tools before proposing execution.
   - Required tools for this workflow are typically `list_cloud_enterprise_agents`, `run_api_instant_test`, and `create_synthetic_test`.
   - Read the relevant tool schemas before building arguments. Do not invent fields that the MCP schema does not expose.
   - If the ThousandEyes MCP tools are unavailable, stop before pretending to validate or create the test. Ask the user to connect or enable the ThousandEyes MCP server.

3. Draft the API test and ask for instant-test validation inputs.

   - Build a concise `test_type: "api"` plan with `test_name`, base `url`, ordered `requests_config`, and the intended `agent_ids`.
   - If the user has not specified agents, ask for the intended target agents. Offer to list available Cloud and Enterprise Agents if the MCP tool is available.
   - Show the proposed API request sequence before running anything:
     - step names
     - methods and URLs
     - auth type and credential names, without secret values
     - headers and parameters
     - body shape, redacting secrets
     - assertions
     - extracted variables and where they are reused
   - Ask the user to confirm the instant test target agents and whether the draft is accurate or needs feedback.
   - After confirmation, run `run_api_instant_test`.

4. Ask the user to verify the instant-test result.

   - Share the instant-test result summary, including success/failure, response status, assertion failures, and any relevant timing or diagnostic fields returned by the MCP.
   - Ask the user whether the result is accurate or what feedback should be applied.
   - Iterate on the request sequence, assertions, credentials, variables, or agents until the user accepts the instant-test behavior.

5. Confirm production scheduled-test creation.

   - Before calling any write tool, explicitly ask whether the user wants to create the scheduled test in production.
   - Ask for the desired test interval.
   - Ask whether the scheduled test should be enabled or disabled at creation.
   - Ask whether any other changes are needed before production creation, such as name, description, agents, proxy, SSL verification, client certificate, alerting handoff, or response collection behavior.
   - Summarize the exact scheduled-test payload that will be sent.
   - Do not call `create_synthetic_test` until the user confirms.

6. Create the scheduled API test with the ThousandEyes MCP.

   - Use `create_synthetic_test` with `test_type: "api"` and the validated request configuration.
   - Include only schema-supported fields.
   - Preserve credential references by name or ID as required by the MCP schema; never expose secret values in chat.
   - If the tool returns a URL or permalink, share the link to the created test. If it returns only a test ID, share the ID and account context, then tell the user the MCP did not return a direct link.
   - Confirm whether the create operation succeeded and restate the final interval, enabled state, agents, and request sequence.

### User instructions for successful agent conversion

Give the agent as much of the following as you can:

- The original transaction API script or the relevant API-call portion of it.
- The desired test name and production account/account group context, if applicable.
- The target API base URL and any environment naming convention.
- Which credentials already exist in the ThousandEyes Credentials Repository.
- The Cloud or Enterprise Agents that should run the instant test.
- The expected success criteria: status codes, body text, JSON fields, XML/SOAP content, or timing expectations.
- Whether response bodies contain sensitive data and should be collected or avoided.
- Desired scheduled-test interval and whether the test should be enabled immediately.

Good prompt:

```text
Convert this transaction API script into a ThousandEyes API test. Use the ThousandEyes MCP if available. First create an instant API test from Cloud Agents A and B so I can validate it. If it passes and I confirm, create the scheduled test disabled at a 5-minute interval.
```

Avoid prompts that omit agents, expected assertions, or credential names. The agent can help discover agents and draft assertions, but it should not guess production monitoring settings.
