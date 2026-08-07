# Mobile Home Dashboard

The authenticated Home route combines existing Course, Task, Calendar Event, Class Schedule, and File services into an online-only student overview. It adds no backend endpoint, local database, notification, or synchronization behavior.

## Routes and navigation

`/` is the default authenticated Home Dashboard. The five main bottom navigation actions are Home, Calendar, Tasks, Courses, and Files. Profile, Settings, and Appearance remain protected secondary destinations.

## Data loading

The dashboard requests sources independently so a failed section does not hide successful sections:

- `GET /courses` supplies course names and colors.
- `GET /tasks` supplies dated tasks for local-day and next-seven-day projection.
- `GET /calendar-events?from=...&to=...` requests events overlapping today through the next two weeks.
- `GET /class-schedules?from=YYYY-MM-DD&to=YYYY-MM-DD` requests schedule definitions active in that same window.
- `GET /files` supplies the backend's newest-first File list.

The backend lacks arbitrary local date-range Task filtering and File pagination/limit parameters. Mobile therefore loads the owned Task and File lists, then keeps only the dashboard ranges and display limits. This is a contract limitation, not a response mismatch.

The screen refreshes whenever it gains focus and on pull-to-refresh. A request sequence guard prevents an older refresh from replacing a newer snapshot. Failed sources are cleared and receive a section-specific Retry state so stale data is not presented as current.

## Local date and sorting behavior

- Local `Date` constructors define today's start/end and the next-seven-day deadline window; no fixed timezone offset is added.
- Existing `generateClassScheduleOccurrences` logic is reused through `normalizeCalendarItems` for the bounded two-week window.
- Today combines class occurrences, manual events, and incomplete timed tasks, then sorts them chronologically. No Calendar records are copied or persisted.
- The next schedule hero selects the nearest currently active or future class/event in the loaded window and includes the date when it is not today.
- Tasks Due Today excludes completed tasks, sorts by due time, and displays up to five.
- Upcoming Deadlines starts tomorrow, ends after seven complete upcoming local dates, excludes today's/completed tasks, and sorts nearest first.
- Recent Files sorts by `createdAt` descending and displays four.

## Partial failures and mutations

Course-label, Task, Event, Class Schedule, and File errors are tracked independently. Working cards remain visible when another service fails. Completing a task uses the shared Task provider, immediately replaces the dashboard copy with the confirmed server response, and removes it from incomplete dashboard sections. Returning from create, edit, upload, complete, or delete routes performs a fresh dashboard load.

## Verification

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
npx expo-doctor
```

Automated dashboard tests cover mixed and empty accounts, personal and course-related records, elapsed and future schedules, timed tasks in Today, completed-task removal, recent-file ordering, section limits, and usable partial data.
