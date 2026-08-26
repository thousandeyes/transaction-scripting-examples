import fetch from 'node-fetch';
import { By, until } from 'selenium-webdriver';
import { driver, markers, credentials, downloads, transaction, test } from 'thousandeyes';

//Constants defined upfront used later in the script
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const PAGE_READY_TIMEOUT_MS = 30 * 1000;
const AUTH_API_TIMEOUT_MS = 30 * 1000;
const AUTH_STEP_NAME = 'Fetch Authentication Credentials';
const AUTH_PATH = '/oauth/token';
const CLIENT_ID = credentials.get('API Client ID');
const CLIENT_SECRET = credentials.get('API Client Secret');
const SCOPE = 'read:status';

runScript();

async function runScript() {
  try {
    await configureDriver();

    const settings = test.getSettings();
    const targetUrl = settings.url;
    const authUrl = buildUrlFromTestSettings(AUTH_PATH, targetUrl);

    //Fetch OAuth 2.0 client credentials with the Node fetch API
    const authenticationCredentials = await fetchAuthenticationCredentials(authUrl);

    //Load the Page
    markers.start('Page Load');
    await driver.get(targetUrl);
    await waitForPageLoaded(PAGE_READY_TIMEOUT_MS);
    markers.stop('Page Load');

    //Use accessToken here if your application needs a bearer token, cookie, or session value.
    const accessToken = authenticationCredentials.access_token;
    if (accessToken) {
      console.log('OAuth access token fetched successfully.');
    }

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

/* helper function to fetch OAuth 2.0 client credentials before the browser flow.
Store secrets in the ThousandEyes credential store; do not put them directly in this file. */
async function fetchAuthenticationCredentials(authUrl) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: SCOPE,
  });

  markers.start(AUTH_STEP_NAME);
  let response;
  try {
    response = await fetchWithTimeout(authUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    }, AUTH_API_TIMEOUT_MS);
  } finally {
    markers.stop(AUTH_STEP_NAME);
  }

  if (!response.ok) {
    throw new Error(`${AUTH_STEP_NAME} failed: ${response.status} ${response.statusText}`);
  }

  try {
    const authenticationCredentials = await response.json();
    if (!authenticationCredentials.access_token) {
      throw new Error(`${AUTH_STEP_NAME} response did not include access_token`);
    }

    return authenticationCredentials;
  } catch (error) {
    throw new Error(`${AUTH_STEP_NAME} response could not be used: ${response.status} ${response.statusText}`);
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
