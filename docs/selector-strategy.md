# Selector Strategy

Selectors are the biggest reliability lever in most transaction scripts. `By.id`, `By.css`, and `By.xpath` can all be reliable when they target stable application contracts, and all three can be flaky when they target generated DOM structure.

## Preference order

| Prefer | Why |
| --- | --- |
| Stable test attributes, such as `[data-testid="login-submit"]` | Usually owned by the application and resistant to layout changes. |
| Semantic attributes, such as `name`, `aria-label`, `role`, or visible label text | Often tracks user intent better than DOM position. |
| Stable IDs | Good when IDs are human-authored; risky when generated per build/session. |
| Scoped CSS | Good for component-level selection when classes are stable. |
| Scoped XPath | Useful for visible text, labels, or ancestor relationships. |
| Absolute XPath | Last resort; breaks easily when layout changes. |

## Examples

```js
By.css('[data-testid="username"]')
By.name('password')
By.css('button[type="submit"]')
By.xpath('//form[@aria-label="Login"]//button[normalize-space()="Sign in"]')
```

Avoid selectors like:

```js
By.xpath('/html/body/div[2]/div[1]/div[3]/button')
By.css('.css-17x42a9 > div:nth-child(4) > button')
```

## Selector constants

For larger scripts, group selectors in a plain object near the top of the flow. This keeps placeholders easy to find without turning examples into shared modules:

```js
const selectors = {
  stableTestId: By.css('[data-testid="login-submit"]'),
  stableName: By.name('username'),
  ariaLabel: By.css('[aria-label="Search"]'),
  semanticButton: By.css('button[type="submit"]'),
  scopedText: By.xpath('//form[@aria-label="Login"]//button[normalize-space()="Sign in"]'),
};
```

## Scope before selecting

When pages have repeated controls, find a stable container first:

```js
const checkout = await driver.findElement(By.css('[data-testid="checkout-form"]'));
await checkout.findElement(By.css('button[type="submit"]')).click();
```

## Iframes and shadow DOM

Selectors do not cross iframe or shadow-root boundaries automatically.

For iframes:

```js
const frame = await driver.findElement(By.css('iframe[name="payment"]'));
await driver.switchTo().frame(frame);
await driver.findElement(By.css('#card-number')).sendKeys('4111111111111111');
await driver.switchTo().defaultContent();
```

For open shadow roots:

```js
const host = await driver.findElement(By.css('custom-login'));
const root = await driver.executeScript('return arguments[0].shadowRoot;', host);
await root.findElement(By.css('input[name="username"]')).sendKeys('user@example.com');
```

## Maintenance tips

- Add application-owned test IDs for high-value flows.
- Keep selectors near the top of examples or in a `selectors` object.
- Use helper functions such as `waitForVisible(selector)` to centralize wait behavior.
- If a selector is intentionally fragile because the app offers no stable contract, say so in a short comment.
