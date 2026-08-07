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
- A responsive two-column course-folder grid (single-column on narrow phones) showing initials, code, pending Tasks, material counts, and the nearest class occurrence in the next two weeks.
- A compact Course Details workspace with course identity, schedule summary, Tasks/Materials/Classes metrics, and horizontally scrollable Overview, Tasks, Materials, Schedule, and Notes tabs.
- Overview surfaces course information, next class, nearest deadline, recent materials, and a two-meeting schedule preview. The full Schedule tab retains existing class-schedule create, detail, edit, and delete flows.
- A compact full-width Personal Library entry for files without a Course.

## Route flow

```text
/courses                  Course list
/courses/new              Add course
/courses/:id              Course details
/courses/:id/edit         Edit course
```

All routes remain inside the authenticated Expo Router group. Courses are available from the five-item bottom navigation, while a missing or expired token is handled through the existing authentication guard and session cleanup.

Course Details requests `GET /tasks?courseId=:id`, `GET /files?courseId=:id`, `GET /class-schedules?courseId=:id`, and `GET /notes?courseId=:id`; its tabs do not request unrelated course records. Overview shows the nearest deadline, next generated class occurrence, recent materials, and a schedule preview. Materials reuses the shared File Library behavior with the Course fixed to its UUID.

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

Course colors are restrained to initials, dots, and side accents. Names clamp to two lines and metadata to one line so long course names, codes, and localized next-class labels do not overlap adjacent cards. Next class is generated from the existing weekly schedule definitions in the same local-time manner as Calendar; no schedule records are duplicated.

## Boundaries

This presentation pass adds no backend contracts, duplicate calendar data, notifications, SQLite, caching, or offline synchronization. Tasks, materials, and class schedules continue to use their existing modules and routes.
