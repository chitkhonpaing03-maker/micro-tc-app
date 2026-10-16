# Security Notes

- Never store plain passwords in Firestore.
- Never publish a production Gemini private API key in GitHub JavaScript.
- Admin role changes must remain admin-only.
- Keep Firestore/Storage rules deployed.
- Keep audit logs for sensitive actions.
- Do not delete Firestore data just to update the UI.
- Student Portal is OFF by default.
- A public code-only student portal requires separate security review before enabling.
- Automatic Admin-created Firebase Auth accounts require a trusted backend / Cloud Function using the Firebase Admin SDK.
