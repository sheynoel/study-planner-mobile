# Mobile Home

The authenticated Home route is a compact, today-focused composition of the existing Course, Task, Calendar Event, Note, and Class Schedule data. It adds no backend endpoint, schema, local database, notification, synchronization behavior, or duplicate record.

## Structure and navigation

`/` is the default authenticated route. Home is ordered as greeting/current date, Today hero, compact seven-day strip, responsive context widgets, a horizontal Classes Today carousel, and a bounded Tasks preview. Classes and Tasks expand independently and default to expanded; `HomeProvider` keeps that state only for the current JavaScript session.

The five bottom navigation actions remain Home, Calendar, Tasks, Courses, and Settings. A non-today day in the strip opens the existing Calendar route with that date selected. Home never becomes an arbitrary-date agenda and does not expose month navigation, calendar display settings, task filtering, or task sorting.

Home Quick Add is a content-sized popup anchored above its FAB and contains only Task, Event, and Note. The FAB morphs from `+` to `×` while open. All seven dates, including today, route to Calendar with that date selected instead of changing Home state.

## Week strip

The strip shows today centered between three nearby past and future dates. Today remains the selected Home date. Tiny activity dots reuse normalized task, event, Note, and locally generated class-occurrence data, preferring Course colors for associated items and never displaying event text.

## Today hero and context widgets

The hero is the visual anchor without becoming an analytics card. It counts only classes that have not ended and active tasks whose due timestamp falls on the device-local current day. Its next item is the current class, next class, or today's next Event in that order; when none exists it renders a compact clear-day message.

Below the week strip, Next Class and Don't Forget use equal-height cards in two columns and stack below 380 points. Next Class is omitted when no class remains. Don't Forget selects the most relevant Note/reminder first, then an important active Task, then the next Event. If only one widget has content, it expands across the row. Course text accompanies each Course-color accent.

## Classes Today

- Existing two-week dashboard data supplies locally generated class occurrences for the device-local current date.
- Occurrences sort by local start time and render as uniform 152-by-108-point cards in a horizontal carousel with a Course-color accent.
- Local wall-clock start/end values determine subtle past, current, and upcoming emphasis; a current class receives a small `Now` label.
- A class may show one Note title when the exact Course UUID matches and either `relevantAt` or `reminderAt` falls on today.
- An empty day uses a small message with a Calendar route instead of reserving carousel space.

## Important tasks

Home uses the shared `AcademicTaskCard` from the full Tasks screen and shows at most four active tasks. Completed tasks are always excluded. Ordering is overdue, due today, due within seven days, later dated, then undated; exact deadline precedes priority as the tie-break context. `View all` opens the full Tasks screen, where filtering, sorting, course tabs, search, and completed history remain available.

The Home checkbox calls `DashboardProvider.completeTask`, which delegates to the same `TaskProvider.completeTask` mutation used by Tasks. The confirmed response marks the task completed and removes it from Home's active projection without deleting it.

## Refresh and failures

Home refreshes the existing dashboard snapshot, nearby Calendar range, and Notes on focus and pull-to-refresh. Local date keys and local day boundaries are shared with Calendar normalization and recurring class occurrence generation. Existing request guards and authentication handling remain in their providers; source failures are shown near the affected section.

## Verification

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
npx expo-doctor
```

Focused Home tests cover chronological classes, class states, same-course Note matching, reminder relevance, bounded deadline-first task ordering, and local date behavior.
