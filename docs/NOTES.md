# Mobile Notes

Notes are lightweight remembered information and remain separate from Tasks and Calendar Events. The mobile form accepts a title, body, or both, plus an optional Course, relevant local date/time, reminder local date/time, and pinned state. Because the unchanged backend requires a title string, a content-only Note receives a short content-derived transport title. Mobile converts entered local timestamps to ISO UTC values through the typed Note API.

`NoteProvider` owns authenticated CRUD and list state. Quick Add opens `/notes/new`; Note Details supports edit and deletion. Add Note uses the shared adaptive sheet with a fixed save footer. After the sheet animation, focus moves directly to the body so the Android keyboard opens without the optional title stealing focus. Calendar context prefills `relevantDate`; Course context locks the selected Course. Title-only, body-only, and combined Notes retain the same validation and transport mapping.

Home loads owned Notes and attaches one reminder line to a class only when the exact `courseId` matches and its relevant/reminder date falls on today in device-local time. Other relevant Notes may surface in the single context widget; Home never becomes a full Notes list.

`reminderAt` is persisted and displayed. Notification permissions and delivery remain deferred because the app has no implemented notification system.
