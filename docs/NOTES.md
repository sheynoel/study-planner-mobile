# Mobile Notes

Notes are lightweight remembered information and remain separate from Tasks and Calendar Events. A Note requires only a title and may include details, an optional Course, a relevant local date/time, a reminder local date/time, and a pinned state. Mobile converts entered local timestamps to ISO UTC values through the typed Note API.

`NoteProvider` owns authenticated CRUD and list state. Quick Add opens `/notes/new`; Note Details supports edit and deletion. Course Details includes a horizontally scrollable Notes tab with course-scoped list/create/open behavior. Settings links to the secondary global Notes list for personal and course Notes. No sixth bottom-navigation item is added.

Home loads owned Notes and attaches a Note to a class only when the exact `courseId` matches and `relevantAt` falls on today in device-local time. Cards show up to two titles plus a compact remaining count. Undated, other-course, and text-similar Notes are not attached.

`reminderAt` is persisted and displayed. Notification permissions and delivery remain deferred because the app has no implemented notification system.
