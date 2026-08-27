import fetch from 'node-fetch';
import { By, until } from 'selenium-webdriver';
import { credentials, driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const PAGE_READY_TIMEOUT_MS = 30 * 1000;
const API_TIMEOUT_MS = 30 * 1000;

const AUTHENTICATED_API_PATH = '/me';
const EXPECTED_API_STATUS = 200;
const BASIC_AUTH_USERNAME_CREDENTIAL_NAME = 'API Username';
const BASIC_AUTH_PASSWORD_CREDENTIAL_NAME = 'API Password';

let currentStep = 'Starting transaction';

runScript();

async function runScript() {
  try {
    setCurrentStep('Configure driver');
    await configureDriver();

    const settings = test.getSettings();
    const targetUrl = settings.url;
    const authenticatedApiUrl = buildUrlFromTestSettings(AUTHENTICATED_API_PATH, targetUrl);

    setCurrentStep('Read Basic authentication credentials');
    const username = credentials.get(BASIC_AUTH_USERNAME_CREDENTIAL_NAME);
    const password = credentials.get(BASIC_AUTH_PASSWORD_CREDENTIAL_NAME);
    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
    setCurrentStep('Run authenticated API check');
    await runAuthenticatedApiCheck(basicAuth, authenticatedApiUrl);

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

/* Basic authentication is common for legacy APIs and simple internal services.
Store both values in the ThousandEyes credential store. */
async function runAuthenticatedApiCheck(basicAuth, authenticatedApiUrl) {
  markers.start('Basic Authentication API Check');
  let response;
  try {
    response = await fetchWithTimeout(authenticatedApiUrl, {
      method: 'GET',
      headers: {
        authorization: `Basic ${basicAuth}`,
      },
    }, API_TIMEOUT_MS);
  } finally {
    markers.stop('Basic Authentication API Check');
  }

  assertResponseStatus(response, EXPECTED_API_STATUS, 'Basic authentication API check');
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
