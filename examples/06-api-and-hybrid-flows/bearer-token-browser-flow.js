import fetch from 'node-fetch';
import { By, until } from 'selenium-webdriver';
import { credentials, driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const PAGE_READY_TIMEOUT_MS = 30 * 1000;
const API_TIMEOUT_MS = 30 * 1000;

const AUTHENTICATED_API_PATH = '/me';
const EXPECTED_API_STATUS = 200;
const BEARER_TOKEN_CREDENTIAL_NAME = 'API Bearer Token';

let currentStep = 'Starting transaction';

runScript();

async function runScript() {
  try {
    setCurrentStep('Configure driver');
    await configureDriver();

    const settings = test.getSettings();
    const targetUrl = settings.url;
    const authenticatedApiUrl = buildUrlFromTestSettings(AUTHENTICATED_API_PATH, targetUrl);

    setCurrentStep('Read Bearer token credential');
    const bearerToken = credentials.get(BEARER_TOKEN_CREDENTIAL_NAME);
    setCurrentStep('Run authenticated API check');
    await runAuthenticatedApiCheck(bearerToken, authenticatedApiUrl);

    setCurrentStep('Load configured test URL');
    markers.start('Page Load');
    await driver.get(targetUrl);
    await waitForPageLoaded(PAGE_READY_TIMEOUT_MS);
    markers.stop('Page Load');

    setCurrentStep('Capture evidence screenshot');
    await driver.takeScreenshot();
  } catch (error) {
    await captureDiagnostics(error);
    throw error;
  }
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

function setCurrentStep(stepName) {
  currentStep = stepName;
}

/* Bearer token authentication is common when a platform issues a reusable API token.
Store the token in the ThousandEyes credential store, not in this script. */
async function runAuthenticatedApiCheck(bearerToken, authenticatedApiUrl) {
  markers.start('Bearer Token API Check');
  let response;
  try {
    response = await fetchWithTimeout(authenticatedApiUrl, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${bearerToken}`,
      },
    }, API_TIMEOUT_MS);
  } finally {
    markers.stop('Bearer Token API Check');
  }

  assertResponseStatus(response, EXPECTED_API_STATUS, 'Bearer token API check');
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

function buildUrlFromTestSettings(path, settingsUrl) {
  const configuredUrl = new URL(settingsUrl);
  return new URL(path, `${configuredUrl.origin}/`).toString();
}

async function waitForPageLoaded(timeoutMs) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, timeoutMs, 'Timed out waiting for document.readyState to be complete');

  const body = await driver.wait(until.elementLocated(By.css('body')), timeoutMs);
  await driver.wait(until.elementIsVisible(body), timeoutMs);
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
