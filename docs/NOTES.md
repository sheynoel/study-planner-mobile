# Mobile Notes

Notes are lightweight remembered information and remain separate from Tasks and Calendar Events. The mobile form accepts a title, body, or both, plus an optional Course, relevant local date/time, reminder local date/time, and pinned state. Because the unchanged backend requires a title string, a content-only Note receives a short content-derived transport title. Mobile converts entered local timestamps to ISO UTC values through the typed Note API.

`NoteProvider` owns authenticated CRUD and list state. Quick Add opens `/notes/new`; Note Details supports edit and deletion. Add Note uses the shared adaptive sheet with a fixed save footer, and locks the Course when launched from Course Details. Course Details presents pinned Notes first alongside upcoming Events in one visual board while preserving their separate APIs. Settings links to the secondary global Notes list for personal and course Notes. No sixth bottom-navigation item is added.

Home loads owned Notes and attaches a Note to a class only when the exact `courseId` matches and `relevantAt` falls on today in device-local time. Cards show up to two titles plus a compact remaining count. Undated, other-course, and text-similar Notes are not attached.

`reminderAt` is persisted and displayed. Notification permissions and delivery remain deferred because the app has no implemented notification system.
