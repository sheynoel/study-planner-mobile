# Mobile Class Schedule Management

This document records the course-scoped mobile Class Schedule flow and its integration with the combined calendar.

## Implemented scope

- Typed schedule, weekday, request, filter, and response contracts with runtime response validation.
- Authenticated CRUD service using the existing API client and JWT/session lifecycle.
- Course schedule list, add, details, and edit screens inside the protected Expo Router group.
- Reusable `ClassScheduleCard`, `ClassScheduleForm`, `WeekdayPicker`, and `TimeRangeField` components.
- Client validation for valid weekday, exact local `HH:mm` values, strictly increasing times, optional 100-character room, valid dates, and a non-decreasing inclusive date range.
- Confirmation-based deletion and refresh after create, update, and delete.
- Exact backend error messages for duplicate meetings, cross-course conflicts, invalid input, and inaccessible records.
- Local visible-range occurrence generation for the combined calendar.

## Routes

```text
/courses/:id/schedules          Course's weekly meeting list
/courses/:id/schedules/new      Add a meeting for the fixed selected course
/class-schedules/:id            Meeting details
/class-schedules/:id/edit       Edit weekday, times, room, and active dates
```

Course Details exposes the first route from its Schedule section. The add form fixes `courseId` to that selected course, and the edit form does not offer course reassignment.

## Occurrence generation

The backend stores weekly recurrence definitions, not individual class occurrences. For each visible calendar month the client:

1. Requests schedules whose date ranges overlap the visible inclusive `from` and `to` date keys.
2. Clips each schedule's `startDate`/`endDate` to the visible range.
3. Parses the clipped first date as a local calendar date and advances to the schedule's weekday.
4. Emits occurrences in seven-day local-date increments until the clipped end date.
5. Combines each occurrence date with the schedule's `startTime` and `endTime` as local date-time strings without a UTC suffix for ordering and display.
6. Deduplicates using `class_schedule:<scheduleId>:<YYYY-MM-DD>`.

Only visible-range occurrences are generated. No `POST /calendar-events` call is made, so editing or deleting a class schedule cannot leave duplicate Calendar Event records.

## Backend contract assumptions

- All endpoints require `Authorization: Bearer <accessToken>`.
- `GET /class-schedules` accepts optional `courseId`, inclusive date-only `from`, and inclusive date-only `to`, returning `{ data: { schedules: ClassSchedule[] } }`.
- Create, detail, and update return `{ data: { schedule: ClassSchedule } }`; delete returns `{ data: { message: string } }`.
- `courseId` is required, `room` is nullable, weekdays are uppercase `MONDAY` through `SUNDAY`, dates use `YYYY-MM-DD`, and times use zero-padded 24-hour `HH:mm`.
- Times describe local wall-clock values and carry no timezone or UTC offset.
- Duplicate schedules return HTTP `409` with `CLASS_SCHEDULE_DUPLICATE`; overlapping schedules return HTTP `409` with `CLASS_SCHEDULE_CONFLICT` and a user-facing conflict message.
- Missing or unowned courses and schedules use the backend's non-disclosing HTTP `404` responses.
- Each separate weekday meeting is one schedule record.
- Add Course may optionally collect several meeting forms and create those same schedule records sequentially after Course creation. A failed later meeting never rolls back or hides the confirmed Course; the UI reports the partial count and opens the Schedule tab for recovery.

No backend contract mismatch was found during implementation.

## Physical Android verification

1. Start PostgreSQL and the NestJS API with the Class Schedule migration applied.
2. Set `EXPO_PUBLIC_API_URL` to the development computer's LAN IPv4 address on port `3000`.
3. Keep the phone and computer on the same network, allow inbound TCP port `3000`, run `npm start`, and scan the QR code in Expo Go.
4. Sign in, open a Course, tap Schedule, and verify loading plus an empty state with Add Class.
5. Add a weekly class. Verify weekday, local start/end times, optional room, and active dates in the list and details.
6. Try invalid times and dates, an end before its start, an exact duplicate, and an overlap; verify field or backend conflict messages and disabled submitting behavior.
7. Edit every supported field, save, and verify details and the course schedule list refresh.
8. Open Calendar, navigate to a month inside the schedule range, and verify each matching weekday has a class marker and `CLASS` agenda card with time, course, room, and course color.
9. Tap a calendar class occurrence and verify it opens the schedule details route.
10. Navigate outside the schedule date range and verify no occurrences are generated.
11. Cancel deletion once, then delete the schedule and verify it disappears from the course list and calendar after focus refresh.
12. Stop the API temporarily and verify error/Retry behavior, then sign out and confirm protected routes are inaccessible.

## Deferred work

Attendance, exceptions and occurrence overrides, multi-week recurrence rules, general recurring Calendar Events, files, notes, notifications, SQLite, and offline synchronization remain out of scope.
