# PIRA Simple Translate

Developed by Pira Code · Chrome Extension · Manifest V3 · Version 1.0.1

Translate selected text on webpages in a compact popup or enter text manually in the extension popup. Choose a provider, source and target language, copy results, and use browser speech synthesis where available.

## Providers
- Google Web Translation: unofficial endpoint; availability and terms are controlled by Google.
- Google Cloud Translation: requires the user's own API key and may incur charges.
- DeepL: requires the user's own API key and may incur charges.
- LibreTranslate: requires a compatible user-selected server; server terms and costs vary.

## Privacy
When the user requests a translation, selected or manually entered text is sent to the configured third-party provider. Provider processing and retention are governed by that provider. Preferences use Chrome sync storage; provider API credentials use Chrome local extension storage, which is not a secure secrets vault. No analytics or advertising tracking are added by this extension. Do not translate confidential text unless comfortable sharing it with the selected provider.

## Development install
1. Extract the ZIP.
2. Open chrome://extensions and enable Developer mode.
3. Select Load unpacked and choose the directory containing manifest.json.
4. Configure a provider and target language in Settings.
5. Select text on a supported webpage or use the manual popup translator.

## Permissions
- storage: save preferences and provider credentials locally.
- Provider host access: call translation APIs.
- Optional host access: request access to the user-configured LibreTranslate server.
- Content script matches: support the core webpage text-selection feature on sites where Chrome permits content scripts.

Chrome internal pages, the Web Store, and some protected pages do not allow extension scripts. Text-to-speech depends on browser/OS voices. Provider language coverage and quality vary.