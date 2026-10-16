# 🎓 MTC Enterprise Final

Professional responsive management web app for **Micro Training Center (MTC)** using Firebase Authentication, Cloud Firestore and Firebase Storage.

## What is included

- Professional responsive dashboard, glass/soft UI, motion and mobile layout
- MTC logo upload and branding settings
- Google sign-in
- Username + Password login UI using the Firebase Email/Password provider with an `@mtc.local` alias
- Admin / staff / teacher profiles, departments, display names and photos
- Student registration with **Paid** or **Day-1 Free Pass**
- Optional phone number — blank is allowed
- Short Student Code generated from **Student Name + selected Course**
- Student Code is copied to clipboard after generation when the browser permits it
- Course selector instead of typing a course name
- New courses automatically become available to Student and Schedule selectors after refresh
- Teacher schedule with teacher photo, display name, course, batch, day, time and room
- Attendance
- Finance with income/expense and monthly `period` fields
- Date-range Summary and Detail reports
- E-compatible CSV exports (`Download E` / `Export E`)
- Approval workflow
- Audit log
- Departments
- Private Student Portal setting is **OFF** by default
- Safe legacy `shared_state` migration tool that copies data without deleting the source
- Firestore and Storage security rules

## Important: username/password staff creation

A browser-only GitHub Pages app must **not** create Firebase Auth users with an Admin SDK secret and must never store plaintext passwords in Firestore.

The included app therefore provides the safe login UI and staff profile management. To make **Admin → Create Staff Username/Password** fully automatic, deploy a trusted Firebase Cloud Function using the Firebase Admin SDK. The project is deliberately structured so this can be added without changing the Firestore data model.

For a no-cost first deployment, Google login can be used for the first admin/staff accounts. Firebase Email/Password accounts can also be created from Firebase Console while testing.

## Existing data safety

**Do not delete the Firebase project or existing Firestore documents.** The app uses separate collections for the new normalized data model and does not automatically delete legacy data.

The Settings page contains a **Legacy Migration** tool. Enter the exact collection name that contains the existing `shared_state` document and run the import. The source document is not deleted.

## Firebase setup

1. Firebase Console → Authentication → Sign-in method → keep **Google** and **Email/Password** enabled.
2. Firebase Console → Firestore Database → keep the existing database/data.
3. Deploy `firestore.rules`.
4. Enable Firebase Storage and deploy `storage.rules`.
5. Confirm the Firebase Web SDK config in `firebase-config.js`.
6. Upload this project to GitHub.
7. GitHub → Settings → Pages → Deploy from `main` / root.
8. Firebase Authentication → Settings → Authorized domains → add the GitHub Pages domain.

## First login

The first authenticated account that creates a profile while `settings/main.setupComplete` is not `true` becomes the initial `admin`. The app then marks setup complete. Verify the first admin profile before inviting other staff.

## Firestore collections used

`users`, `students`, `studentCodes`, `courses`, `batches`, `attendance`, `transactions`, `approvals`, `staff`, `departments`, `auditLogs`, `settings`.

The old `shared_state` structure can remain untouched during migration.

## Student Portal

The portal is intentionally OFF. When a domain and a controlled public route are ready, a code-only student page can be added without requiring Gmail login. Keep it disabled until security rules for that public use case are reviewed.

## Gemini

Do not put a production Gemini private API key in public GitHub JavaScript. Use a server-side proxy / Cloud Function when Gemini features are enabled.
