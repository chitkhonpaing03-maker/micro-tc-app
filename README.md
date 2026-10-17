# Micro Training Center — Enterprise Final

## Included
- `index.html` — original MTC Enterprise OS + MTC+ additions.
- `firestore.rules` — authenticated access for legacy shared state and MTC+ collections.
- `storage.rules` — authenticated staff-photo storage.
- `firebase.json` — Firebase rules configuration.

## Data persistence
MTC+ saves locally first and then syncs each record to Firestore. If Firebase Auth is not ready or the network is unavailable, records remain in local storage and are queued for cloud sync. After Google login/Auth restoration, the app merges cloud records with local records and uploads local-only records instead of replacing them.

## Existing design / data
The original Enterprise OS UI and existing features remain in `index.html`; MTC+ is an additive workspace. Do not replace the Firebase project ID/config unless you intentionally move the app to another Firebase project.

## GitHub Pages
Upload `index.html` to the repository root (or rename it to `index.html` as provided). Firebase SDKs and existing CDN assets are loaded by the page.

## Firebase
Publish the included rules to the same Firebase project before using cloud persistence:
- Firestore rules: `firestore.rules`
- Storage rules: `storage.rules`

Authentication providers used by the current app:
- Google
- Email/Password (required for the Admin-created account feature)
