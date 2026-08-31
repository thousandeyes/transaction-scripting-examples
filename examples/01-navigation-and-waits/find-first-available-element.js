import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 5 * 1000;
const FIND_ELEMENT_TIMEOUT_MS = 15 * 1000;
const CANDIDATE_ELEMENTS = [
  {
    name: 'primary result',
    locator: By.css('[data-testid="primary-result"]'),
  },
  {
    name: 'fallback result',
    locator: By.css('[data-testid="fallback-result"]'),
  },
];

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  markers.start('Find First Available Element');
  const match = await findFirstAvailableElement(
    CANDIDATE_ELEMENTS,
    FIND_ELEMENT_TIMEOUT_MS
  );
  markers.stop('Find First Available Element');

  console.log(`Found candidate element: ${match.name}`);
  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function findFirstAvailableElement(candidates, timeoutMs) {
  const originalTimeouts = await driver.manage().getTimeouts();
  await driver.manage().setTimeouts({ implicit: 0 });

  try {
    return await driver.wait(async () => {
      for (const candidate of candidates) {
        const elements = await driver.findElements(candidate.locator);
        if (elements.length === 0) {
          continue;
        }

        try {
          if (await elements[0].isDisplayed()) {
            return {
              element: elements[0],
              name: candidate.name,
            };
          }
        } catch (error) {
          // The element may have been replaced between findElements and isDisplayed.
        }
      }

      return false;
    }, timeoutMs, 'Timed out waiting for an available candidate element');
  } finally {
    await driver.manage().setTimeouts({
      implicit: originalTimeouts.implicit || 0,
    });
  }
}
