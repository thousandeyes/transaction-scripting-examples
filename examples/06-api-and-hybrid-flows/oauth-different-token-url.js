import fetch from 'node-fetch';
import { By, until } from 'selenium-webdriver';
import { credentials, driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const PAGE_READY_TIMEOUT_MS = 30 * 1000;
const API_TIMEOUT_MS = 30 * 1000;

const AUTHENTICATED_API_PATH = '/me';
const EXPECTED_API_STATUS = 200;

const OAUTH_TOKEN_URL_CREDENTIAL_NAME = 'OAuth Token URL';
const OAUTH_CLIENT_ID_CREDENTIAL_NAME = 'OAuth Client ID';
const OAUTH_CLIENT_SECRET_CREDENTIAL_NAME = 'OAuth Client Secret';
const OAUTH_SCOPE = 'read:profile';

const READY_SELECTOR = By.css('body');
let currentStep = 'Starting transaction';

runScript();

async function runScript() {
  try {
    setCurrentStep('Configure driver');
    await configureDriver();

    const settings = test.getSettings();
    const targetUrl = settings.url;
    const authenticatedApiUrl = buildUrlFromTestSettings(AUTHENTICATED_API_PATH, targetUrl);
    const oauthTokenUrl = getCredentialUrl(
      OAUTH_TOKEN_URL_CREDENTIAL_NAME,
      'OAuth token URL'
    );

    setCurrentStep('Fetch OAuth token');
    const accessToken = await fetchOAuthClientCredentials(oauthTokenUrl);

    setCurrentStep('Run authenticated API check');
    await runAuthenticatedApiCheck(accessToken, authenticatedApiUrl);

    setCurrentStep('Load configured test URL');
    markers.start('Page Load');
    await driver.get(targetUrl);
    await waitForPageLoaded(PAGE_READY_TIMEOUT_MS);
    markers.stop('Page Load');

    setCurrentStep('Wait for ready selector');
    await waitForVisible(READY_SELECTOR, 15 * 1000);

    setCurrentStep('Capture evidence screenshot');
    await driver.takeScreenshot();
  } catch (error) {
    await captureDiagnostics(error);
    throw error;
  }
}

function setCurrentStep(stepName) {
  currentStep = stepName;
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

function buildUrlFromTestSettings(path, settingsUrl) {
  const configuredUrl = new URL(settingsUrl);
  return new URL(path, `${configuredUrl.origin}/`).toString();
}

function getCredentialUrl(credentialName, label) {
  try {
    const url = new URL(credentials.get(credentialName));
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
      throw new Error('Invalid credential URL');
    }

    return url.toString();
  } catch (error) {
    throw new Error(`${label} credential must contain an HTTPS URL without username, password, query string, or hash`);
  }
}

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

  try {
    const tokenResponse = await response.json();
    if (!tokenResponse.access_token) {
      throw new Error('Missing access token');
    }

    return tokenResponse.access_token;
  } catch (error) {
    throw new Error(`OAuth token response could not be used: ${response.status} ${response.statusText}`);
  }
}

async function runAuthenticatedApiCheck(accessToken, authenticatedApiUrl) {
  markers.start('Authenticated API Check');
  let response;
  try {
    response = await fetchWithTimeout(authenticatedApiUrl, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    }, API_TIMEOUT_MS);
  } finally {
    markers.stop('Authenticated API Check');
  }

  assertResponseStatus(response, EXPECTED_API_STATUS, 'Authenticated API check');
}

function assertResponseStatus(response, expectedStatus, label) {
  if (response.status !== expectedStatus) {
    throw new Error(`${label} failed: ${response.status} ${response.statusText}`);
  }
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timed out during API request');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function waitForPageLoaded(timeoutMs) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, timeoutMs, 'Timed out waiting for document.readyState to be complete');

  await waitForVisible(By.css('body'), timeoutMs);
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}

async function captureDiagnostics(error) {
  console.log(`Transaction failed during step: ${currentStep}`);
  console.log(`Failure type: ${error.name || 'Error'}`);

  try {
    await driver.takeScreenshot();
  } catch (diagnosticError) {
    console.log(`Unable to capture diagnostics: ${diagnosticError.name || 'Error'}`);
  }
}
