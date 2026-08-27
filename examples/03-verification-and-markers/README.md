# 03 Verification And Markers

Use these examples to make transaction results easier to interpret.

Use [browser-console-errors.js](browser-console-errors.js) when unexpected severe browser-console errors should fail the transaction, even if the page appears usable. Use [evidence-on-failure.js](evidence-on-failure.js) when another step has already failed and you need safe diagnostic context such as the current step, navigation metadata, element state, and console severity counts. The two patterns can be combined for critical flows: one enforces console health and the other explains failures.

- [marker-checkpoints.js](marker-checkpoints.js) - mark page load, login, search, checkout, and logout-style checkpoints.
- [transaction-start-after-setup.js](transaction-start-after-setup.js) - start overall transaction timing after setup that should not be measured.
- [evidence-on-failure.js](evidence-on-failure.js) - collect step, navigation, element, and console-summary diagnostics when another part of the script fails; it does not fail solely because console messages exist.
- [assertion-patterns.js](assertion-patterns.js) - assert title, text, count, and URL conditions.
- [browser-console-errors.js](browser-console-errors.js) - proactively count severe browser-console entries and fail without logging message bodies.
