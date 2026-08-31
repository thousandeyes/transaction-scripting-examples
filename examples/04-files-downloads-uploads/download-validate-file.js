import { readFile } from 'fs/promises';
import { createHash } from 'crypto';
import { By, until } from 'selenium-webdriver';
import { driver, downloads, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const EXPECTED_FILE_NAME = 'report.csv';
const DOWNLOAD_TIMEOUT_MS = 60 * 1000;
const DOWNLOAD_BUTTON_SELECTOR = By.css('[data-testid="download"]');
const DOWNLOAD_FILE_PATH = '';
const EXPECTED_TEXT = '';
const EXPECTED_SHA256 = '';

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;

  await driver.get(targetUrl);

  markers.start('Download');
  const downloadButton = await waitForVisible(DOWNLOAD_BUTTON_SELECTOR, 15 * 1000);
  await downloadButton.click();
  await downloads.waitForDownload(EXPECTED_FILE_NAME, DOWNLOAD_TIMEOUT_MS);
  markers.stop('Download');

  console.log(`Download completed: ${EXPECTED_FILE_NAME}`);

  if (DOWNLOAD_FILE_PATH) {
    await validateLocalFile(DOWNLOAD_FILE_PATH, EXPECTED_TEXT, EXPECTED_SHA256);
  }

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function validateLocalFile(filePath, expectedText, expectedSha256) {
  const file = await readFile(filePath);

  if (expectedText && !file.toString('utf8').includes(expectedText)) {
    throw new Error(`Downloaded file did not contain expected text: ${expectedText}`);
  }

  if (expectedSha256) {
    const actualSha256 = createHash('sha256').update(file).digest('hex');
    if (actualSha256 !== expectedSha256) {
      throw new Error(`Expected SHA-256 ${expectedSha256}, got ${actualSha256}`);
    }
  }
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
