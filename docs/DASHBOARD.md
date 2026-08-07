# Mobile Home Dashboard

The authenticated Home route is a compact student day dashboard built from the existing Course, Task, Calendar Event, and Class Schedule providers. It adds no backend endpoint, schema, local database, notification, or synchronization behavior.

## Structure and navigation

`/` is the default authenticated route. Home is ordered as greeting/date, Classes Today, Calendar, and Tasks. Each academic section expands independently and defaults to expanded. `HomeProvider` owns the three booleans above the application stack, so they survive route navigation during the current JavaScript session without backend or device persistence.

The five bottom navigation actions remain Home, Calendar, Tasks, Courses, and Settings. Task rows open existing Task Details, class cards open Course Details, and the selected-date summary opens the full Calendar.

## Classes Today

- Existing two-week dashboard data supplies locally generated class occurrences for today.
- Occurrences are sorted by start time and rendered in a horizontal compact-card row.
- Local wall-clock start/end values determine past, current, and upcoming emphasis; a current class receives a subtle `Now` treatment.
- A class card may show at most two Note titles when the exact course UUID matches and `relevantAt` falls on the same local date, followed by a compact remaining count.
- Tasks remain in the Tasks section and are never converted into class Notes.

## Home calendar

Home reuses `CalendarProvider.loadRange` and the same monthly normalization used by the full Calendar. Previous/next month controls request the visible local month. The 42-cell grid marks task deadlines, calendar events, and locally generated class occurrences without creating records. Each date shows at most three marker dots; item or course colors are preferred, with existing source colors as fallback.

Selecting a date stays on Home, applies a theme-aware highlight, and shows a compact class/task/event count. The summary can open the full Calendar.

## Home tasks

The default local projection includes `TODO` (Assigned) and `IN_PROGRESS`, excludes `COMPLETED`, sorts all dated tasks by due timestamp (therefore overdue first), and keeps undated tasks last. It is one continuous list with no date/status groups.

The Home filter sheet composes one status, time range, course UUID or Personal, and priority. Reset restores the active-task default. Selecting Completed explicitly shows completed records; it never deletes them. Mutations remain owned by the existing Task routes and provider.

## Refresh and failures

Home refreshes the existing dashboard snapshot and visible calendar month on focus and pull-to-refresh. Existing request guards and authentication handling remain in their providers. Course, schedule, task, and calendar failures are surfaced near the affected section.

## Verification

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
npx expo-doctor
```

Focused Home tests cover chronological class projection, past/current/upcoming state, bounded same-course reminders, default active-task ordering, Completed visibility, and combined filters.
