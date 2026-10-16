# Update-safe data migration

The existing Firestore data must remain untouched.

The current MTC app uses normalized collections such as `students`, `courses`, `batches`, `attendance`, `transactions`, and `staff`. The old database can remain in place while the new app is tested.

## Legacy `shared_state`

If the old database stores one document named `shared_state` inside a collection, use:

**Settings → Legacy Migration → enter the exact collection name → Import shared_state safely**

The importer copies supported arrays and does not delete the original document.

Because Firestore client SDKs cannot enumerate arbitrary collection names, the exact legacy collection name must be entered manually.

## Before migration

1. Keep the old database unchanged.
2. Make a backup/export if the data is important.
3. Run migration once.
4. Verify Students, Courses, Batches and other records.
5. Only then start entering new data.
