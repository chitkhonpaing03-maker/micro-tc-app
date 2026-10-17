# MTC Enterprise Web App — Additive Final Build

This build starts from the supplied MTC Enterprise HTML and keeps the original MTC dashboard, Page Admin, Sales, Manager, Academic, Finance, staff, batch, payment, lead-source and audit-log features. The enterprise functions are integrated into the hamburger menu instead of being scattered as separate top-level menu items.

## What is included

- Original MTC UI/design retained and extended with responsive iOS-style cards, animation and mobile navigation.
- One unified **Founder / Admin Control Center** for Admin Settings + Admin Control.
- Department-grouped hamburger menu with nested functions.
- Customer Inquiry kept separate from Student Management.
- Student Management with optional fields; missing values display as `-`.
- Paid Student / Day 1 Free Pass.
- Separate Student Code Generator: type Student Name, select Course/Class from a dropdown, then Generate a short code.
- Code history, copy/share, and automatic student/code records.
- Course Management; new courses become available to related dropdowns.
- Teacher profiles with display name, photo URL, role/department, course, batch and room.
- Teacher timetable with date, time, course, batch, room, teacher and photo.
- Attendance: Present / Absent / Late, date-based records and edit/update for the same student/date.
- Department-level permissions: View / Add / Edit / Delete / Approve / Export / Report / Settings via checkboxes.
- Staff approval plus per-department access checkboxes.
- New Google/Gmail users create an approval request notification for Founder/Admin.
- Admin can approve/lock staff accounts and assign departments.
- Customer/Student/Teacher/Course editing and deletion are permission-gated.
- Detail + Summary reports for departments, date ranges, single month and multi-month ranges.
- E/Excel (`.xlsx`, with CSV fallback) export and Excel/CSV import.
- PDF report export using the selected department and date/month filters.
- Invoice and Certificate generation from student data.
- Notifications for approval, data actions and monthly closing.
- Monthly close history; automatic previous-month closing after the configured close day without deleting historical data.
- JSON backup and Admin-only restore.
- Firebase Firestore cloud persistence plus LocalStorage cache.
- MTC logo upload/change stored as a small Firestore data URL (Storage is not required for this feature, helping avoid Storage billing/setup).
- Student portal foundation: when enabled by Admin, `?student=STUDENT_CODE` can show a student page without Gmail login.
- Gemini/OpenAI provider selection UI. Real API calls still require a secure API endpoint/proxy and a provider API key; do not put provider secrets in public GitHub HTML.

## Firebase setup

1. In Firebase Authentication, enable **Google** and **Email/Password**.
2. Create/enable **Firestore Database**.
3. Add the GitHub Pages domain (or Firebase Hosting domain) under Authentication → Settings → Authorized domains.
4. Upload the files to GitHub Pages or Firebase Hosting.
5. Deploy `firestore.rules` after reviewing it for your organization.
6. `storage.rules` is intentionally deny-all because this build does not depend on Firebase Storage; the logo is stored as a small data URL in Firestore.

## Data persistence

Every enterprise save calls the cloud sync routine and also updates the browser cache. The cloud state uses the existing `micro_training_center/shared_state` document so replacing the HTML does not intentionally recreate the database or delete the stored state. Always export a JSON backup before production updates.

## Important security note

The supplied starter Firestore rule allows authenticated users to read/write the shared state. The UI permission matrix is enforced in the app, but this is not a tamper-proof server-side authorization boundary. For a high-security production deployment, move authorization to Firestore rules/custom claims or a trusted backend.

## Free-cost note

The web app itself can be hosted on GitHub Pages, and Firestore/Auth can remain within Firebase's applicable no-cost quotas. AI provider API usage may incur separate provider charges. Firebase Storage is not required by this build.
