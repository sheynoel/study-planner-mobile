# Mobile Calendar Management

This document records the mobile Calendar Management flow. It combines protected Calendar Event and Task data with locally expanded Class Schedule occurrences without changing backend models or adding local persistence.

## Implemented scope

- Typed Calendar Event models, create/update requests, filters, and response envelopes with runtime validation.
- A protected Calendar provider that loads events for the visible month, loads dated tasks, refreshes after mutations, and handles rejected JWTs through the authentication lifecycle.
- A normalized UI projection that preserves `event`, `task`, and `class_schedule` source identity.
- A dependency-free month grid with previous/next month navigation, selected-date behavior, and distinct event/task/class markers.
- A selected-day agenda containing personal and course-related events and task deadlines.
- Calendar Event add, detail, edit, and confirmation-based delete routes.
- Reusable month calendar, agenda, item card, event form, and legend components.
- Clear loading, error, retry, empty, validation, and submitting states.

## Route flow

```text
/calendar                    Combined month calendar and selected-day agenda
/calendar/new                Add calendar event
/calendar/:id                Calendar event details
/calendar/:id/edit           Edit calendar event
/tasks/:id                   Existing Task details route used by deadline cards
/class-schedules/:id         Class Schedule details used by class occurrences
```

All routes remain inside the authenticated Expo Router group. Home, Calendar, Tasks, Courses, and Settings are available through the protected bottom navigation.

## Data loading and normalization

- The visible local month's first instant and last instant are converted to ISO timestamps for `GET /calendar-events?from=...&to=...`.
- The backend's inclusive overlap behavior includes events that begin before the month and continue into it.
- `GET /tasks` supplies Task records because the backend has no arbitrary task date-range filter. Mobile drops tasks without `dueAt` and limits normalized deadline items to the visible month.
- `GET /class-schedules?from=YYYY-MM-DD&to=YYYY-MM-DD` supplies only weekly definitions whose inclusive date ranges overlap the visible month.
- Mobile clips each schedule to the visible month and its own start/end dates, finds the first matching weekday, and advances in seven-day local-date steps. It emits one stable `class_schedule:<scheduleId>:<date>` item per visible occurrence.
- Class occurrence generation never writes Calendar Event records and deduplicates by schedule and local date.
- Multi-day events are projected onto each local calendar date they overlap.
- Each normalized item retains `sourceType` and `sourceId`, so event, task, and class items open their respective routes.
- Course names come from the existing Course provider. Personal records remain first-class and use no synthetic course.

## Date and time behavior

- Forms accept local `YYYY-MM-DD` dates and 24-hour `HH:mm` times, consistent with the Task form.
- All-day mode hides time fields and sends local midnight converted to an ISO timestamp; `isAllDay` remains the backend's presentation flag.
- End date/time is optional and cannot be earlier than the effective start.
- API timestamps are parsed as instants and displayed with the device's locale and timezone.
- No manual timezone offsets are used. Shared utilities own parsing, local formatting, month boundaries, and ISO conversion.
- Class Schedule `startTime` and `endTime` are local wall-clock `HH:mm` strings, not UTC values. Occurrences combine those values with local dates before display; the strings are never parsed as UTC timestamps.

## Calendar presentation

- Event, task, and class markers use separate colors, while agenda cards also include explicit `EVENT`, `TASK`, or `CLASS` badges so meaning never depends on color alone.
- Task cards include priority and status chips. Completed tasks use reduced opacity and struck-through titles; overdue incomplete tasks receive an explicit overdue label.
- Event cards show local time or all-day status and include location when present.
- Event display colors accept the backend's optional string contract; only valid six-digit hex colors are used directly as card accents, with a safe fallback otherwise.

## Picker dependency decision

The main planner month view remains the existing React Native `View` and `Pressable` implementation, so its combined event/task/class projection is unchanged. Form date selection now uses the reusable themed `react-native-calendars` sheet, and timed events use Expo-compatible `@react-native-community/datetimepicker` with a 12-hour AM/PM presentation. Existing local-to-ISO conversion and backend contracts remain unchanged.

## Backend contract assumptions

- Every Calendar Event and Task endpoint requires `Authorization: Bearer <accessToken>`.
- Calendar Event list accepts optional inclusive `from`, `to`, and `courseId` filters and returns `{ data: { events: CalendarEvent[] } }` sorted by `startAt`.
- Calendar Event create/detail/update return `{ data: { event: CalendarEvent } }`; delete returns `{ data: { message: string } }`.
- `courseId`, `description`, `location`, `endAt`, and `color` are nullable.
- `startAt` is required, `endAt` cannot precede it, and timestamps use ISO 8601.
- `isAllDay` defaults to `false` and does not change the timestamp field contract.
- An invalid course returns `INVALID_CALENDAR_EVENT_COURSE`; missing and unowned events return `CALENDAR_EVENT_NOT_FOUND`.
- Task list has no arbitrary `from`/`to` range filter, so the client must fetch the current user's Task list before projecting dated tasks.
- Class Schedule list accepts inclusive date-only `from` and `to` filters and returns overlapping weekly schedule definitions, not generated occurrences.

## Physical Android verification

1. Start PostgreSQL and the NestJS API with all Calendar Event migrations applied.
2. Configure `EXPO_PUBLIC_API_URL` with the development computer's LAN IPv4 address and port `3000`.
3. Keep the Android phone and computer on the same network and allow inbound TCP port `3000` through the firewall.
4. Start Expo with `npm start`, scan the QR code in Expo Go, and sign in.
5. Open Calendar and verify month navigation, selected dates, event/task/class markers, and the selected-day agenda.
6. Create personal, course-related, timed, all-day, open-ended, and multi-day events. Confirm validation rejects missing titles and reversed ranges.
7. Add due dates to personal and course Tasks, then verify their markers and agenda cards open the existing Task details route.
8. Verify completed and overdue Task cards are visually and textually distinct.
9. Edit an event, including removing its Course or end time, and confirm details and calendar refresh.
10. Cancel event deletion once, then confirm it and verify the event disappears from the calendar.
11. Change months and verify visible data refreshes; temporarily stop the API to verify error and Retry states.
12. Sign out and confirm Calendar routes are no longer accessible.

## Deferred work

Recurring Calendar Events, occurrence overrides, attendance, Google Calendar synchronization, files, notes, notifications, SQLite, caching, and offline synchronization remain outside this phase.
