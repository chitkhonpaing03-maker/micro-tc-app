# MTC Enterprise — Final Deploy Checklist

## Firebase
- [ ] Authentication → Google = Enabled
- [ ] Authentication → Email/Password = Enabled
- [ ] Firestore Database exists and existing data is still present
- [ ] Storage enabled
- [ ] Deploy `firestore.rules`
- [ ] Deploy `storage.rules`
- [ ] Confirm Web SDK config in `firebase-config.js`
- [ ] Add GitHub Pages domain to Firebase Authentication → Authorized domains

## First admin
- [ ] Sign in once with the intended first Google account
- [ ] Confirm the account appears in Firestore `users`
- [ ] Confirm its `role` is `admin`
- [ ] Confirm `permissions` is `["*"]`
- [ ] After setup, do not delete the admin user document

## App tests
- [ ] Login / logout
- [ ] Add Course
- [ ] Add Student → Paid
- [ ] Add Student → Day-1 Free Pass
- [ ] Student without phone saves successfully
- [ ] Student Code is short and unique
- [ ] Course selector updates after adding a Course
- [ ] Add Teacher/Staff profile and photo
- [ ] Add Teacher Schedule
- [ ] Mark Attendance
- [ ] Add Income and Expense
- [ ] Check current-month Finance
- [ ] Generate Summary Report with Start / End Date
- [ ] Generate Detail Report with Start / End Date
- [ ] Export E
- [ ] Upload MTC logo
- [ ] Check Audit Log in Firestore

## Existing data
- [ ] Do NOT delete `shared_state`
- [ ] Back up Firestore before migration
- [ ] If needed, use Settings → Legacy Migration
- [ ] Verify migrated counts before using the new collections

## Staff accounts
- [ ] Never store plaintext passwords in Firestore
- [ ] For automatic Admin-created username/password accounts, deploy a trusted Firebase Cloud Function / Admin SDK backend


## GitHub Pages
- [ ] Upload project to GitHub `main`
- [ ] Settings → Pages → Source = GitHub Actions
- [ ] `.github/workflows/pages.yml` succeeds
- [ ] Add GitHub Pages host to Firebase Auth → Authorized domains
- [ ] Test Google login on the deployed URL
- [ ] Test MY / EN toggle on desktop and mobile
- [ ] Verify supplied logo and navy/yellow/white wave theme
