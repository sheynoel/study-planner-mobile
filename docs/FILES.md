# Offline File Library

The mobile File Library is a device-local feature. It does not call the NestJS file API and never uploads file bytes, filenames, metadata, or local paths.

## Storage

- Expo DocumentPicker selects one or more files with `copyToCacheDirectory: true`.
- Each selection is immediately copied to `Paths.document/offline-materials`, the app-private persistent document directory.
- Stored names combine a generated local ID with a sanitized original filename, so duplicate names never overwrite one another.
- Metadata is stored in the `offline-files.db` Expo SQLite database.
- Migration 1 creates `local_files`, course/date indexes, and the local-only invariant.
- A failed metadata insert removes the just-copied file. Removal deletes the private copy and then its database record; it never touches the picker source.

Metadata includes local ID, original and display names, permanent URI, extension, MIME type, size, date added, last-opened date, course ID/name snapshot, optional description, updated date, and local-only status.

## User experience

The all-files library supports filename search, All/Personal/course filtering, PDF/Documents/Presentations/Spreadsheets/Images/Others filtering, six requested sorts, result count, clear filters, and an offline privacy notice. Course imports are locked to that course; Personal Library imports can remain personal or select a course.

Tapping a row opens it. Android converts the private `file://` URI to a temporary content URI and launches an `ACTION_VIEW` intent with read permission. iOS uses the system share/Open In sheet. Images also have an in-app detail preview. The overflow menu exposes open, information, rename, move, share/export, and confirmed removal.

## Platform notes

- Android and iOS are the supported persistent-import targets and require no broad storage permission.
- The feature uses Expo SDK 54-compatible modules, including modules bundled in Expo Go; compatible document viewers are separate installed apps.
- iOS does not expose Android-style viewer intents, so opening/exporting uses the supported share/Open In sheet.
- Persistent offline import is intentionally rejected on web because browser storage cannot provide the same app-private file durability contract.
- Uninstalling the app or clearing app data can remove the SQLite database and imported copies.
