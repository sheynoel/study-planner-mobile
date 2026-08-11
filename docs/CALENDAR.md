# Mobile Calendar Management

This document records the mobile Calendar Management flow. It combines protected Calendar Event and Task data with locally expanded Class Schedule occurrences without changing backend models or adding local persistence.

## Implemented scope

- Typed Calendar Event models, create/update requests, filters, and response envelopes with runtime validation.
- A protected Calendar provider that loads events for the visible month, loads dated tasks, refreshes after mutations, and handles rejected JWTs through the authentication lifecycle.
- A normalized UI projection that preserves `event`, `task`, `class_schedule`, and locally projected dated `note` source identity.
- A `react-native-calendars` month grid with fixed six-week geometry, selected/today states, previous/next/swipe navigation, direct month/year selection, tiny content previews, and bounded overflow.
- A compact selected-day timeline containing visible personal and course-related classes, events, task deadlines, and dated Notes.
- Persisted Calendar-only display preferences for source visibility, compact/detailed density, and hidden Course IDs.
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
- Each normalized item retains `sourceType` and `sourceId`, so events, tasks, classes, and dated Notes open their respective routes.
- Course names come from the existing Course provider. Personal records remain first-class and use no synthetic course.
- Notes are fetched through the existing Note API. A Note is projected only when `reminderAt` or `relevantAt` exists; pinned or undated Notes never enter Calendar. When both timestamps fall on the same local date, the Note appears once for that date.

## Date and time behavior

- Forms present reusable calendar selection and 12-hour AM/PM time controls. Their existing mappers retain local `YYYY-MM-DD` and `HH:mm` values before ISO conversion.
- All-day mode hides time fields and sends local midnight converted to an ISO timestamp; `isAllDay` remains the backend's presentation flag.
- End date/time is optional and cannot be earlier than the effective start.
- API timestamps are parsed as instants and displayed with the device's locale and timezone.
- No manual timezone offsets are used. Shared utilities own parsing, local formatting, month boundaries, and ISO conversion.
- Class Schedule `startTime` and `endTime` are local wall-clock `HH:mm` strings, not UTC values. Occurrences combine those values with local dates before display; the strings are never parsed as UTC timestamps.

## Calendar presentation

- Each month cell has a fixed height and shows at most two one-line previews. Additional visible items collapse into `+N`, so busy dates cannot resize a week.
- Compact density emphasizes short titles/course codes. Detailed density prefixes a short local time while retaining the same item limit and cell height.
- Preview ordering favors overdue/due Tasks, then Events, Classes, and dated Notes, with chronological order inside equal priority.
- Course colors appear as tiny accents rather than full-cell fills. Course code/name text and accessible labels keep meaning independent of color; personal items use the active theme accent.
- The agenda uses a narrow time column, course-color rail, title, human source/course metadata, and a compact empty-day message.

## Month navigation and display preferences

The main planner month view now uses the already installed `react-native-calendars` package with a custom day renderer; the package renders calendar geometry while application data remains in the existing normalized read model. The reusable Month & Year sheet offers 12 month buttons, previous/next year controls, Cancel, and Go. Direct jumps clamp the previously selected day to the target month's valid last day.

The title header has a compact overflow menu for Calendar Display, Jump to month, and Today. This keeps previous month, tappable month/year, and next month as the only controls in the month-navigation row. Responsive top padding separates the title from navigation, and an additional margin separates navigation from the calendar grid.

The Calendar floating Add action is context-aware. Its tiny popup is anchored immediately above the FAB and contains only Task, Event, and Note; it is not a bottom sheet. It forwards the current in-memory `selectedDate` as a route parameter: Task uses it as `dueDate`, Event as `startDate`, and Note as `relevantDate`. Add Event now uses the same expandable, keyboard-aware sheet architecture as Add Task and Add Note. No Course is assigned by Calendar context and every prefilled date remains editable.

`showClasses`, `showTasks`, `showEventsNotes`, `hiddenCourseIds`, and `density` are presentation-only preferences stored under `study-planner.calendar-display`. Native platforms reuse Expo SecureStore and web uses localStorage, matching the existing appearance preference pattern. Filtering occurs after normalization, so hiding a source or Course never deletes records, edits schedules, changes Course Details, or changes Home Classes Today.

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
5. Open Calendar and verify month navigation, direct month/year jumps, selected dates, event/task/class/dated-note previews, and the selected-day agenda.
6. Create personal, course-related, timed, all-day, open-ended, and multi-day events. Confirm validation rejects missing titles and reversed ranges.
7. Add due dates to personal and course Tasks, then verify their previews and agenda rows open the existing Task details route.
8. Verify completed and overdue Task cards are visually and textually distinct.
9. Edit an event, including removing its Course or end time, and confirm details and calendar refresh.
10. Cancel event deletion once, then confirm it and verify the event disappears from the calendar.
11. Change months and verify visible data refreshes; temporarily stop the API to verify error and Retry states.
12. Sign out and confirm Calendar routes are no longer accessible.

## Deferred work

Recurring Calendar Events, occurrence overrides, attendance, Google Calendar synchronization, files, notifications, SQLite, caching, and offline synchronization remain outside this phase.
