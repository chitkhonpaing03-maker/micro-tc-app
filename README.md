# MTC Enterprise Final

GitHub Pages + Firebase static web app for Micro Training Center.

## Included
- Professional responsive/iOS-style UI and animation
- Google login + username/password login UI
- Cloud Firestore shared persistence
- Students: Paid / Day-1 Free, optional phone, short code from name + course
- Courses: new course automatically appears in student/schedule selectors
- Teacher schedule with display name and photo
- Attendance
- Finance
- Approval workflow
- Start/End date Summary + Detail reports
- E-compatible CSV export
- Logo upload using Firebase Storage
- Staff/departments/permissions fields
- Audit log
- Monthly history through date ranges; records are not auto-deleted
- Myanmar Unicode

## Setup
1. Firebase Console → Project settings → Your apps → Web app → copy SDK config into firebase-config.js.
2. Authentication → enable Google and Email/Password.
3. Create/confirm Firestore Database.
4. Deploy firestore.rules and storage.rules.
5. First Google user: Firestore `users/{UID}` → set `role: admin`, `permissions: ["*"]`, `department: General`.
6. GitHub repo → upload all files/folders → Commit → Settings → Pages → Deploy from main/root.

## Important security limitation
GitHub Pages is static. True admin-created Firebase Auth username/password accounts should be provisioned through a trusted backend/Cloud Function; never store plaintext passwords in Firestore. The username login UI uses `username@mtc.local` as an Auth alias.

## Data safety
Do not delete the Firebase project/database when updating code. Deploy UI/rules changes while keeping existing collections and document IDs. Back up before major schema changes.

## Gemini
Do not put a production Gemini private key in public GitHub JavaScript. Add a server-side proxy/Cloud Function when Gemini is enabled.

## Student portal
Public code-only student access is OFF by default, as requested. `studentCodes` is prepared for a later private portal.
