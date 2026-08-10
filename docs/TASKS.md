# Mobile Task Management

This document records the mobile portion of roadmap phase 5. It consumes the protected NestJS Task contract without changing backend behavior or adding offline persistence.

## Implemented scope

- Typed Task models, status and priority values, requests, filters, and response envelopes with runtime validation.
- A protected Task provider that sources the JWT from the authentication context and owns displayed Task state.
- Task list, modal-sheet add, details, and edit routes within the authenticated Expo Router group.
- Combined personal and course-related display using Course names and codes from the existing Course provider.
- Reusable weekly selector, course tabs, filter and sort sheets, compact academic Task card, course selector, calendar date picker, 12-hour time picker, forms, status chip, and priority controls plus existing loading, error, and empty states.
- Course UUID/personal tabs plus selected-date, priority, status, due, and search filtering. Completed tasks stay out of the default active view and are available through the Completed status filter.
- Deadline soonest/latest, created newest/oldest, priority, course, and alphabetical sorting.
- Client validation for title, description, local due date/time, course, status, and priority.
- Completion with duplicate-request protection, editing with server refresh, and confirmation-based deletion.

## Route flow

```text
/tasks                    Task list
/tasks/new                Add task
/tasks/:id                Task details
/tasks/:id/edit           Edit task
```

The Task list is available through the five-item authenticated bottom navigation. It presents one continuous compact active list with shallow rows, one-line titles, course-color edge accents, relative deadlines, and small priority indicators. The leading checkbox completes a task through the existing endpoint and removes it from the active view after success. Completed history uses the same compact row treatment through the filter sheet.

Supported `status`, `priority`, `courseId`, `today`, `upcoming`, and `overdue` values remain server filters. Search, Personal, This Week, and presentation sorting are applied locally to the server result because the backend has no corresponding query parameters. The filter sheet never sends the `personal` or `this_week` UI values to the API.

## Date and time behavior

- Add Task displays a themed calendar month grid and 12-hour AM/PM time picker; internal form values remain local `YYYY-MM-DD` and `HH:mm` strings for the existing mapper.
- A date without a time becomes 23:59 local time.
- Mobile converts the local value to an ISO 8601 UTC timestamp before sending `dueAt`.
- Existing UTC timestamps are converted back to local date and time when editing or displaying a task.
- The backend owns `today`, `upcoming`, and `overdue` filter boundaries in UTC. The mobile overdue marker compares the current instant and hides overdue treatment once a task is completed.

## Add Task presentation

`/tasks/new` is a transparent bottom sheet so the originating Tasks or Course screen remains visible behind a dim overlay. It opens at roughly 75% height, expands to 96% on upward drag or keyboard focus, and collapses before downward-drag dismissal. Backdrop, back-button, and drag dismissal all retain the unsaved-change guard. Add Task remains reachable in the fixed footer. Creation presents title, compact course selection, optional due date/time, priority, and optional details. Status is not requested and remains the existing `TODO`/Assigned default.

## Backend contract assumptions

- Every Task endpoint requires `Authorization: Bearer <accessToken>`.
- `GET /tasks` returns `{ data: { tasks: Task[] } }` and accepts composable `status`, `priority`, `courseId`, and `due` parameters.
- Create, detail, update, and completion return `{ data: { task: Task } }`.
- Delete returns `{ data: { message: string } }`.
- `courseId`, `description`, `dueAt`, and `completedAt` are nullable.
- `status` is `TODO`, `IN_PROGRESS`, or `COMPLETED`; priority is `LOW`, `MEDIUM`, or `HIGH`.
- `completedAt` and `userId` are server-managed and are never sent by mobile.
- An invalid selected course returns HTTP `400` with `INVALID_TASK_COURSE`; missing and unowned tasks return HTTP `404` with `TASK_NOT_FOUND`.

## Physical Android verification

1. Start PostgreSQL and the NestJS API with the Task migration applied.
2. Configure `EXPO_PUBLIC_API_URL` with the computer's LAN IPv4 address and port `3000`.
3. Keep the phone and computer on the same network and allow inbound TCP port `3000` through the firewall.
4. Start Expo with `npm start`, scan the QR code in Expo Go, and sign in.
5. Open Tasks from the bottom navigation and verify loading, empty, Add Task, and retry behavior.
6. Create a personal task, then create a course-related task and confirm the selector shows Course name and code.
7. Enter invalid title/date/time values and confirm validation; create valid dated tasks and confirm local display.
8. Exercise every course, date, status, priority, and due filter plus every sort option and verify overdue treatment.
9. Open details, edit every field, remove a Course association, save, and confirm detail/list refresh.
10. Mark a task complete from the list checkbox, verify the pending indicator and active-row removal, then select Completed in Filter Tasks and verify the checked history row.
11. Cancel deletion once, then confirm deletion and verify the task is absent from the list.
12. Sign out and verify Task routes are no longer accessible.

## Deferred work

Calendar events, class schedules, file management, notes, notifications, SQLite, caching, and offline synchronization remain outside this phase.
