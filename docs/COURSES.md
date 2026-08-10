# Mobile Course Management

This document records the mobile portion of roadmap phase 4. It consumes the existing authenticated NestJS Course contract without changing backend behavior or adding offline persistence.

## Implemented scope

- Typed Course models, create/update requests, and list/detail/create/update/delete responses.
- Runtime response validation around the reusable API client.
- A protected Course provider that sources the Bearer token from the authentication context and owns displayed course state.
- Course list, add, details, and edit routes.
- Reusable course card, course form, app header, loading, error, and empty-state components.
- Local form validation matching backend maximum lengths and hexadecimal color requirements.
- Confirmation-based deletion with immediate removal from displayed state.
- List refresh after create, detail refresh after edit, and focus refreshes when returning to Course screens.
- A fixed-height two-column course grid on narrow phones showing only the course title, subtitle, color identity, and a pending-task badge when needed.
- A compact Course Details workspace with one identity/schedule card, immediately visible course Tasks, a combined Events & Notes board, and a recent Materials preview.
- Tapping the schedule summary opens a grouped schedule sheet; its Edit schedules action retains existing class-schedule create, detail, edit, and delete routes without a permanent Schedule tab.
- A compact Personal Library utility row above the course grid for files without a Course.
- Personal Library is a one-column, full-width utility row with the same responsive page margins; actual Course folders remain in the two-column grid below it.

The Add Course route is presented as a full-screen modal with a sticky Cancel/New Course/Create header. It labels the existing `name` and `code` contract as Main Title and Subtitle, omits the course-level room field, and groups optional details, color, and schedules into compact cards. A schedule block accepts multiple weekday chips with shared time, room, and semester dates; mobile expands those selections into one existing ClassSchedule create call per weekday.

## Route flow

```text
/courses                  Course list
/courses/new              Add course
/courses/:id              Course details
/courses/:id/edit         Edit course
```

All routes remain inside the authenticated Expo Router group. Courses are available from the five-item bottom navigation, while a missing or expired token is handled through the existing authentication guard and session cleanup.

Course Details requests course-filtered Tasks, Calendar Events, Notes, Class Schedules, and recent Files. The Tasks filter sheet always retains the current course scope. Add Task, Add Note, and Add Event preselect the current course. The combined Events & Notes presentation does not merge their models or endpoints. Full Materials and the existing schedule routes retain the course UUID as their local scope. The redundant Course Calendar shortcut was removed from this screen; the global Calendar route and existing deep links remain intact.

Delete Course is not presented during normal Course Details browsing. Edit Course contains a clearly labeled Danger Zone after the save action. It reuses the existing confirmation dialog, authenticated `DELETE /courses/:id` request, backend relationship behavior, and successful navigation back to the Courses list.

## Backend contract assumptions

- Every Course endpoint requires `Authorization: Bearer <accessToken>`.
- Successful responses use a `data` envelope.
- `GET /courses` returns `{ data: { courses: Course[] } }`.
- Create, detail, and update return `{ data: { course: Course } }`.
- Delete returns `{ data: { message: string } }`.
- Course IDs and `userId` are UUID strings; dates are ISO 8601 strings.
- `code`, `description`, `instructor`, and `room` are nullable.
- `color` is a six-digit `#RRGGBB` string and defaults to `#0A7EA4` when omitted by a client.
- Whitespace-only optional strings become `null` and `userId` is never sent by mobile.
- Missing and unowned courses both return HTTP `404` with `COURSE_NOT_FOUND`.

## Physical Android verification

1. Start PostgreSQL and the NestJS API, then confirm the Course migration is applied.
2. Set `EXPO_PUBLIC_API_URL` to the development computer's LAN IPv4 address and port `3000`; do not use `localhost` from the phone.
3. Keep the Android phone and computer on the same network and allow inbound TCP traffic to port `3000` through the computer firewall.
4. Start Expo with `npm start`, scan the QR code in Expo Go, and sign in or register.
5. Verify the initial loading state, then the empty state and its Add Course action for a new account.
6. Create a course with every field, confirm it opens in details, then return to confirm it appears in the list.
7. Edit every field, save, and confirm the details screen and list card reflect the changes.
8. Force an unreachable API address temporarily and use Retry to verify the list error state, then restore the URL and reload Expo.
9. Delete a course, cancel once, then confirm deletion and verify the course is absent from the list.
10. Sign out and confirm Course routes are no longer accessible.

## Presentation rules

Course cards use a thick colored folder header with the active-task count inside it; zero counts are hidden. Names clamp to two lines, subtitles to one, and all cards remain the same height. Add/Edit Course uses preset swatches plus a visual hue-and-shade picker, while storage remains hexadecimal. Course time controls display 12-hour AM/PM values while retaining the backend's `HH:mm` wall-clock contract; date fields use a reusable calendar sheet.

## Boundaries

This presentation pass adds no backend contracts, duplicate calendar data, notifications, SQLite, caching, or offline synchronization. Tasks, materials, and class schedules continue to use their existing modules and routes.
