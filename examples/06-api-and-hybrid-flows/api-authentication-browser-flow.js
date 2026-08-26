import fetch from 'node-fetch';
import { By, until } from 'selenium-webdriver';
import { credentials, driver, markers, test } from 'thousandeyes';

//Constants defined upfront used later in the script
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const PAGE_READY_TIMEOUT_MS = 30 * 1000;
const API_TIMEOUT_MS = 30 * 1000;

//Choose one authentication mode: oauth-client-credentials, bearer-token, basic-auth, or api-key-header
const AUTHENTICATION_MODE = 'oauth-client-credentials';
const AUTHENTICATED_API_PATH = '/me';
const EXPECTED_API_STATUS = 200;

const OAUTH_TOKEN_PATH = '/oauth/token';
const OAUTH_CLIENT_ID_CREDENTIAL_NAME = 'OAuth Client ID';
const OAUTH_CLIENT_SECRET_CREDENTIAL_NAME = 'OAuth Client Secret';
const OAUTH_SCOPE = 'read:profile';

const BEARER_TOKEN_CREDENTIAL_NAME = 'API Bearer Token';

const BASIC_AUTH_USERNAME_CREDENTIAL_NAME = 'API Username';
const BASIC_AUTH_PASSWORD_CREDENTIAL_NAME = 'API Password';

const API_KEY_CREDENTIAL_NAME = 'API Key';
const API_KEY_HEADER_NAME = 'x-api-key';

runScript();

async function runScript() {
  try {
    await configureDriver();

    const settings = test.getSettings();
    const targetUrl = settings.url;
    const authenticatedApiUrl = buildUrlFromTestSettings(AUTHENTICATED_API_PATH, targetUrl);
    const oauthTokenUrl = buildUrlFromTestSettings(OAUTH_TOKEN_PATH, targetUrl);

    //Authenticate with the API before the browser flow
    const authentication = await authenticateWithApi(AUTHENTICATION_MODE, oauthTokenUrl);

    //Use the authenticated API call to verify account/session readiness before loading the browser
    await runAuthenticatedApiCheck(authentication, authenticatedApiUrl);

    //Load the Page
    markers.start('Page Load');
    await driver.get(targetUrl);
    await waitForPageLoaded(PAGE_READY_TIMEOUT_MS);
    markers.stop('Page Load');

    //Take a screenshot
    await driver.takeScreenshot();
  } catch (error) {
    await captureDiagnostics(error);
    throw error;
  }
}

/* helper function to use implicit timeouts.
Every step will wait for the amount of time defined in the implicit time out
before declaring an element cannot be found */
async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function authenticateWithApi(mode, oauthTokenUrl) {
  switch (mode) {
    case 'oauth-client-credentials':
      return fetchOAuthClientCredentials(oauthTokenUrl);
    case 'bearer-token':
      return buildBearerTokenAuthentication();
    case 'basic-auth':
      return buildBasicAuthentication();
    case 'api-key-header':
      return buildApiKeyHeaderAuthentication();
    default:
      throw new Error(`Unsupported API authentication mode: ${mode}`);
  }
}

/* OAuth 2.0 client credentials is common for service-to-service enterprise APIs.
The API returns a short-lived access token used as a Bearer token. */
async function fetchOAuthClientCredentials(oauthTokenUrl) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: credentials.get(OAUTH_CLIENT_ID_CREDENTIAL_NAME),
    client_secret: credentials.get(OAUTH_CLIENT_SECRET_CREDENTIAL_NAME),
    scope: OAUTH_SCOPE,
  });

  markers.start('OAuth Client Credentials');
  let response;
  try {
    response = await fetchWithTimeout(oauthTokenUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    }, API_TIMEOUT_MS);
  } finally {
    markers.stop('OAuth Client Credentials');
  }

  assertResponseStatus(response, 200, 'OAuth token request');

  const tokenResponse = await response.json();
  if (!tokenResponse.access_token) {
    throw new Error('OAuth token response did not include access_token');
  }

  return {
    label: 'OAuth 2.0 client credentials',
    headers: {
      authorization: `Bearer ${tokenResponse.access_token}`,
    },
  };
}

/* Bearer token authentication is common when a platform issues a reusable API token.
Store the token in the ThousandEyes credential store, not in this script. */
async function buildBearerTokenAuthentication() {
  const token = credentials.get(BEARER_TOKEN_CREDENTIAL_NAME);

  return {
    label: 'Bearer token',
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
}

/* Basic authentication is common for legacy APIs and simple internal services.
Store both values in the ThousandEyes credential store. */
async function buildBasicAuthentication() {
  const username = credentials.get(BASIC_AUTH_USERNAME_CREDENTIAL_NAME);
  const password = credentials.get(BASIC_AUTH_PASSWORD_CREDENTIAL_NAME);
  const encoded = Buffer.from(`${username}:${password}`).toString('base64');

  return {
    label: 'Basic authentication',
    headers: {
      authorization: `Basic ${encoded}`,
    },
  };
}

/* API key header authentication is common for developer-facing APIs.
Change API_KEY_HEADER_NAME if your API expects a different header such as x-api-token. */
async function buildApiKeyHeaderAuthentication() {
  return {
    label: 'API key header',
    headers: {
      [API_KEY_HEADER_NAME]: credentials.get(API_KEY_CREDENTIAL_NAME),
    },
  };
}

async function runAuthenticatedApiCheck(authentication, authenticatedApiUrl) {
  markers.start('Authenticated API Check');
  let response;
  try {
    response = await fetchWithTimeout(authenticatedApiUrl, {
      method: 'GET',
      headers: authentication.headers,
    }, API_TIMEOUT_MS);
  } finally {
    markers.stop('Authenticated API Check');
  }

  assertResponseStatus(response, EXPECTED_API_STATUS, `${authentication.label} API check`);
}

function assertResponseStatus(response, expectedStatus, label) {
  if (response.status !== expectedStatus) {
    throw new Error(`${label} failed: ${response.status} ${response.statusText}`);
  }
}

//helper function to apply a timeout to Node fetch API calls
async function fetchWithTimeout(url, options, timeoutMs) {
  return Promise.race([
    fetch(url, options),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Timed out during API request')), timeoutMs);
    }),
  ]);
}

function buildUrlFromTestSettings(path, settingsUrl) {
  const configuredUrl = new URL(settingsUrl);
  return new URL(path, `${configuredUrl.origin}/`).toString();
}

//helper function for a generic signal that the page has been loaded
async function waitForPageLoaded(timeoutMs) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, timeoutMs, 'Timed out waiting for document.readyState to be complete');

  const body = await driver.wait(until.elementLocated(By.css('body')), timeoutMs);
  await driver.wait(until.elementIsVisible(body), timeoutMs);
}

//Ensure console log test settings option is turned on to use the following helper function
async function captureDiagnostics(error) {
  console.log(`Transaction failed: ${error.message}`);

  try {
    console.log(`Current URL: ${await driver.getCurrentUrl()}`);
    console.log(`Page title: ${await driver.getTitle()}`);
    await driver.takeScreenshot();
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.message}`);
  }
}
