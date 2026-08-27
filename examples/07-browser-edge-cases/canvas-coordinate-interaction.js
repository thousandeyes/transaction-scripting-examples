import { By, until } from 'selenium-webdriver';
import { driver, markers, test } from 'thousandeyes';

// This section contains the customizable values. Add other customizable elements here for easy editing.
const IMPLICIT_TIMEOUT_MS = 7 * 1000;
const CANVAS_TIMEOUT_MS = 15 * 1000;
const CANVAS_SELECTOR = By.css('[data-testid="interactive-canvas"]');
const CANVAS_CLICK_POINTS = [
  { name: 'first canvas target', x: 40, y: 40 },
  { name: 'second canvas target', x: 120, y: 80 },
];

runScript();

async function runScript() {
  await configureDriver();

  const settings = test.getSettings();
  const targetUrl = settings.url;
  await driver.get(targetUrl);

  const canvas = await waitForVisible(CANVAS_SELECTOR, CANVAS_TIMEOUT_MS);

  markers.start('Canvas Coordinate Interactions');
  for (const point of CANVAS_CLICK_POINTS) {
    await clickCanvasPoint(canvas, point);
  }
  markers.stop('Canvas Coordinate Interactions');

  await driver.takeScreenshot();
}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: IMPLICIT_TIMEOUT_MS,
  });
}

async function clickCanvasPoint(canvas, point) {
  // Canvas child elements are not exposed as DOM nodes, so use coordinates relative to the canvas.
  await driver.actions({ async: true })
    .move({ origin: canvas, x: point.x, y: point.y })
    .click()
    .perform();

  console.log(`Clicked ${point.name} on the canvas.`);
}

async function waitForVisible(locator, timeoutMs) {
  const element = await driver.wait(until.elementLocated(locator), timeoutMs);
  await driver.wait(until.elementIsVisible(element), timeoutMs);
  return element;
}
