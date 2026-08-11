# Mobile File Management

This document records the online-only mobile File Management flow consuming the protected NestJS File API.

## Implemented scope

- Typed safe metadata, Course summary, upload/update requests, list filters, and response envelopes with runtime response validation.
- Protected File provider using the existing JWT session lifecycle for list, detail, upload, update, delete, and download operations.
- Compact File list, Personal Library, upload, detail, and edit routes. Files are no longer a primary tab; the all-files view is available from Settings, while Course Details shows three recent files before opening the full course-scoped Materials library.
- Reusable File card, type icon, filter bar, picker field, upload form, metadata form, and download button.
- Search, course, and all supported file-extension filters.
- Loading, empty, error, retry, upload, edit, download-progress, and delete states with duplicate-action protection.

## Routes

```text
/files                 Combined personal and course-related list
/files?courseId=:id    Course-filtered list
/files/personal        Files with no Course association
/files/upload          Pick and upload one file
/files/:id             File metadata and download/delete actions
/files/:id/edit        Rename or change/remove Course assignment
```

All routes are inside the authenticated Expo Router group.

The three library entry points share `FileLibrary`, `MaterialFilterBar`, category mapping, and the existing File provider:

- Course Details > Materials fixes the real Course UUID in backend requests.
- Courses > Personal Library requests owned files and locally keeps only `courseId: null` because the backend has no personal-only sentinel.
- Settings > File Library shows all files and supports a real Course UUID or Personal selection.

Material categories are presentation filters: PDF is `pdf`; Slides is `ppt`/`pptx`; Documents is `doc`/`docx`/`txt`; Images is `png`/`jpg`/`jpeg`/`webp`. Category pseudo-values are never sent as `fileType` API parameters.

## Upload behavior

Expo DocumentPicker is configured with the supported MIME types, `multiple: false`, `copyToCacheDirectory: true`, and `base64: false`. Cancellation returns quietly. Upload metadata now uses the shared expandable sheet. Course Details > Materials opens the picker automatically after the popup closes, locks the current Course in the compact metadata form, and returns to Course Details after success so focus refresh reloads its preview. Library uploads use the same sheet and existing selectable Course behavior.

The API service creates `FormData` containing the URI-backed native file part and optional text fields. The shared API client sends that body without assigning `Content-Type`, allowing the native request implementation to create the correct multipart boundary. The file is never converted to Base64 or read completely into JavaScript memory.

The UI checks the documented 25 MiB default when picker size metadata is available. The backend remains authoritative and its validation message is shown if its configured limit or type validation differs.

## Authenticated download and opening

The File provider supplies the current Bearer token to Expo FileSystem's download request headers. Bytes stream directly from `GET /files/:id/download` into a sanitized filename below Expo's temporary cache directory. Progress is displayed when the server reports content length.

After a successful download, Expo Sharing opens the platform share/action sheet so a compatible application can open or save the file. If sharing is unavailable, the user receives a helpful message. Tokens are never placed in URLs, and backend paths or storage keys are never visible.

These downloads are explicitly initiated temporary transfers. No background prefetching, permanent offline index, SQLite records, or synchronization logic is created.

## Backend assumptions

- All File endpoints require `Authorization: Bearer <accessToken>`.
- Lists accept composable `courseId`, normalized extension `fileType`, and `search` filters.
- Safe File responses include `id`, nullable `courseId`/Course, display/original names, MIME type, nullable extension, byte size, and timestamps.
- Upload is one multipart `file` plus optional `displayName` and `courseId`, returning HTTP `201`.
- Update accepts `displayName` and nullable `courseId`; delete returns a message envelope.
- Download returns attachment bytes and useful content headers; missing/unowned metadata or missing physical bytes returns `FILE_NOT_FOUND`.
- The documented default upload maximum is 25 MiB. The backend does not currently expose its configured limit through an endpoint, so mobile uses that documented default for early feedback and still surfaces authoritative backend errors.

No endpoint or response-shape mismatch was found.

## Physical Android verification

1. Start PostgreSQL and the NestJS API with the File migration applied and a writable local uploads directory.
2. Set `EXPO_PUBLIC_API_URL` to the computer's LAN IPv4 address on port `3000` and keep phone/computer on the same network.
3. Run `npm start`, scan the QR code with Expo Go, and sign in.
4. Open Settings > File Library and verify loading, empty, search, Course, Personal, type-category, and Retry states.
5. Tap Upload File, cancel the picker, and confirm no error appears. Pick each supported document/image family and verify name, MIME type, and readable size.
6. Upload a personal file and a course-related file. Verify the submit button is disabled and shows an uploading state.
7. Try an unsupported or larger-than-25-MiB file and verify clear client/backend feedback.
8. Open details, download the file, observe progress/state, and open or share it with a compatible installed app.
9. Rename the file, assign/change/remove its Course, and verify list/details refresh.
10. Open a Course, select Materials, and verify only files assigned to that Course are shown. Then open Personal Library from Courses and verify it excludes every course file.
11. Cancel deletion once, then confirm it and verify the File disappears from the list.
12. Stop the API to test Error/Retry, then sign out and verify File routes are no longer accessible.

## Deferred work

Folder nesting, previews, cross-user sharing, automatic offline caching, SQLite, background synchronization, notes, and notifications remain outside this phase.
