# Credentials And Secrets

Never put real passwords, tokens, client secrets, TOTP seeds, or customer identifiers in an example script.

## Browser login

```js
import { By } from 'selenium-webdriver';
import { driver, credentials } from 'thousandeyes';

const username = credentials.get('App Username');
const password = credentials.get('App Password');

await driver.findElement(By.css('#username')).sendKeys(username);
await driver.findElement(By.css('#password')).sendKeys(password);
```

If usernames are not secret in your environment, keep the example-specific username as a top-level constant so it is easy to review and edit.

## TOTP

```js
import { authentication, credentials } from 'thousandeyes';

const seed = credentials.get('TOTP Seed');
const code = authentication.getTimeBasedOneTimePassword(seed);
```

## API credentials

For standalone HTTP API checks, prefer a ThousandEyes API test and attach credentials through the API Step Builder's authentication controls.

In transaction scripts, use API credentials only when the API call is part of a browser journey or a capability that cannot be represented as an API test.

## Adding credentials

Do not paste real credential values into this repository, chat, pull requests, issues, or generated examples.

When an example needs a password, token, client secret, TOTP seed, or other secret, add the value directly in the [ThousandEyes Credentials Repository](https://app.thousandeyes.com/network-app-synthetics/test-settings/credentials/) and reference only the credential name from the script.

```js
const password = credentials.get('App Password');
```

If an agent or skill reviews a script for credential handling, it should detect missing or hardcoded credential patterns, redact any candidate values in its report, and direct the user to the Credentials Repository to add secrets themselves. It should not collect, store, transmit, or automatically import secret values.

## Naming conventions

Use clear credential names that describe purpose:

- `App Username`
- `App Password`
- `OAuth Client Secret`
- `TOTP Seed`
- `API Bearer Token`

Avoid names tied to individual people or temporary debugging sessions.
