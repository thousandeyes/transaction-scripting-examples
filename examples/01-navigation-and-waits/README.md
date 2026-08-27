# 01 Navigation And Waits

Use these examples when a script is flaky because the page, URL, or element is not ready yet.

- [wait-for-page-ready.js](wait-for-page-ready.js) - wait for URL, title, body, and visible element state.
- [retry-click-with-implicit-timeout.js](retry-click-with-implicit-timeout.js) - retry a click until the implicit timeout expires, using a short poll interval only between bounded attempts.
- [replace-sleep-with-explicit-wait.js](replace-sleep-with-explicit-wait.js) - turn fixed sleeps into state-based waits.
- [scroll-element-into-view.js](scroll-element-into-view.js) - scroll a located element into the viewport and wait for its position to settle.
- [find-first-available-element.js](find-first-available-element.js) - choose the first visible element from an ordered list of legitimate UI alternatives.
- [reusable-wait-action-patterns.js](reusable-wait-action-patterns.js) - keep common wait, text entry, retry click, and optional-dismiss helpers inside a self-contained script, including bounded polling for transient click failures.
