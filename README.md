# MTC Enterprise Web App — Final Build

This package keeps the supplied original MTC app and adds the requested enterprise modules inside the same hamburger/menu navigation.

## Included
- Original MTC Dashboard, Page Admin, Sales, Manager, Academic, Finance, Founder/Admin modules
- Customer Inquiry separate from Student Management
- Paid Student / Day 1 Free Pass
- Short Student Code Generator with history, copy and share
- Course Management
- Teacher profile and schedule/timetable
- Attendance
- Detail/Summary reporting foundation + date/month filtering
- E (CSV) import/export
- PDF report, invoice and certificate
- Notifications
- Gemini/OpenAI provider configuration UI
- Staff username/password account workflow (Firebase Email/Password under the hood)
- Department, roles and permission matrix
- Monthly close history without deleting old data
- Backup JSON
- Firebase Firestore cloud persistence + local cache
- Responsive iOS-style UI preserved from the original

## Firebase setup
1. Enable Authentication: Google and Email/Password.
2. Create Firestore Database.
3. Add the deployed site domain under Authentication > Settings > Authorized domains.
4. Upload `index.html` to GitHub Pages or Firebase Hosting.
5. Deploy the included Firestore rules only after reviewing them for your organization.

## Data safety
The app writes to the existing `micro_training_center/shared_state` document and also keeps a browser LocalStorage cache. The additive enterprise fields are merged into the existing state so existing records are not intentionally deleted by this build. Always export a JSON backup before replacing a production file.

## AI safety
The UI supports Gemini/OpenAI provider selection, but production API keys should not be embedded in a public GitHub HTML file. Use a secure server/proxy or Firebase Cloud Function for real API calls.

## Important security note
The included starter Firestore rule allows authenticated users to read/write the shared state. The in-app permission matrix controls the UI, but it is not a tamper-proof server-side authorization boundary. For a real enterprise deployment, move role/permission enforcement to Firestore rules/custom claims or a trusted backend.
