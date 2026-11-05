# PIRA Simple Translate 1.0.1 — Test report

## Checks performed locally
- JavaScript syntax checks for service worker, content script, popup script and options script: passed.
- Manifest JSON parsing: passed.
- ZIP root structure with manifest.json at root: passed.

## Not tested in a live Chrome session
- Google Web Translation live response.
- Google Cloud Translation with a valid API key.
- DeepL with valid credentials.
- LibreTranslate with a real configured server and optional permission grant.
- Real webpage selection, speech voices, Chrome installation and Web Store review.

Do not treat these items as passed. Complete live tests before submitting to the Chrome Web Store.