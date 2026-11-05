# Permission rationale — verify before submission

- storage: stores preferences and provider credentials in local extension storage.
- Provider host permissions: allow the service worker to call the configured translation provider endpoints.
- Optional host permissions: request access to the exact configured LibreTranslate server origin after the user chooses that provider.
- Content-script URL matches: required for the core feature to detect selected webpage text. This broad site scope must be justified accurately in the Chrome Web Store dashboard and reviewed against current policy.

Ensure dashboard declarations match the final manifest and actual data flows. This is not a guarantee of approval.