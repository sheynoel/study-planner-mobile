# Study Planner Mobile

Expo and React Native TypeScript client for a personal, cloud-synchronized student planner and file organizer.

## Current status

The mobile-to-backend connection, authentication, Home Dashboard, Course, Task, Calendar, Class Schedule, and File Management flows are implemented on Expo SDK 54. The authenticated experience uses a responsive Bento Student Workspace: bounded dashboard previews, a compact task list, course folders, a calendar timeline, and organized study materials. A local Appearance system provides Sage Study, Latte Notes, Sky Planner, Lavender Focus, and Dark Academia packs with system, light, and dark modes. Native access tokens and appearance preferences are stored with Expo SecureStore. SQLite, notifications, and offline synchronization are not implemented.

The sibling `study-planner-api` repository owns the product and backend planning documents:

- `../study-planner-api/docs/PRODUCT.md`
- `../study-planner-api/docs/FEATURES.md`
- `../study-planner-api/docs/DATA_MODEL.md`
- `../study-planner-api/docs/ARCHITECTURE.md`
- `../study-planner-api/docs/TASKS.md`
- [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) documents the implemented mobile session lifecycle.
- [`docs/COURSES.md`](docs/COURSES.md) documents the implemented mobile Course flow and backend assumptions.
- [`docs/TASKS.md`](docs/TASKS.md) documents the implemented mobile Task flow and backend assumptions.
- [`docs/CALENDAR.md`](docs/CALENDAR.md) documents the combined mobile event and task-deadline calendar.
- [`docs/CLASS_SCHEDULES.md`](docs/CLASS_SCHEDULES.md) documents weekly class management and local calendar occurrence generation.
- [`docs/FILES.md`](docs/FILES.md) documents mobile picking, multipart upload, authenticated download, and metadata management.
- [`docs/DASHBOARD.md`](docs/DASHBOARD.md) documents dashboard aggregation, local date ranges, partial failures, and refresh behavior.
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) documents the shared visual tokens, components, accessibility rules, and five-tab navigation constraint.
- [`docs/UI_REDESIGN.md`](docs/UI_REDESIGN.md) records the redesign audit, migration boundaries, and completed Bento workspace coverage.

Read those documents before changing product behavior or API integration.

## Planned experience

- Manage personal and course-related tasks and calendar events.
- Manage courses and recurring class schedules.
- View events, task deadlines, and class occurrences in combined month, week, and agenda calendars.
- Organize, upload, download, open, rename, delete, and filter personal or course files.
- Authenticate against the NestJS API and store credentials securely.
- Add notifications, local SQLite caching, offline synchronization, and an APK build in later roadmap phases.

## Project structure

```text
study-planner-mobile/
|-- app/                   Protected Expo Router auth and application routes
|-- assets/images/         Starter icons and images
|-- components/auth/       Reusable authentication form UI
|-- components/courses/    Reusable course cards and forms
|-- components/calendar/   Month calendar, agenda, item cards, legend, and event form
|-- components/dashboard/  Home summaries, section states, and concise cross-feature cards
|-- components/class-schedules/ Reusable class schedule cards, forms, weekday, and time controls
|-- components/files/      Reusable file cards, forms, filters, picker, and download UI
|-- components/tasks/      Reusable task cards, forms, filters, and chips
|-- components/settings/   Appearance controls and digital student profile card
|-- components/ui/         Shared buttons, cards, selectors, section headers, dialogs, and async states
|-- contexts/              Authentication and planner feature state lifecycles
|-- constants/             Central color, type, spacing, radius, shadow, and layout tokens
|-- hooks/                 Theme/color-scheme hooks
|-- lib/api/               Reusable API client and typed backend contracts
|-- lib/auth/              Token storage and form validation
|-- lib/appearance/        Local theme preference persistence
|-- lib/courses/           Course form mapping, validation, and routes
|-- lib/calendar/          Date conversion, event forms, normalization, and routes
|-- lib/class-schedules/   Schedule forms, occurrence generation, and routes
|-- lib/files/             Picker, display, download/share, and route logic
|-- lib/dashboard/         Dashboard service orchestration and local projections
|-- lib/tasks/             Task form, display, filtering, and route logic
|-- lib/config/            Mobile environment configuration
|-- docs/                  Mobile implementation documentation
|-- scripts/               create-expo-app reset utility
|-- AGENTS.md              Rules for coding agents
|-- app.json               Expo configuration
`-- package.json           Scripts and dependencies
```

Future feature UI, API clients, secure storage, local persistence, and synchronization code should remain separated as described in the backend architecture document. New directories should be introduced only when required by an explicitly requested implementation task.

## Local commands

### Configure the local API URL

Copy the example environment file:

```bash
cp .env.example .env.local
```

Set `EXPO_PUBLIC_API_URL` to an address the target device can reach:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.25:3000
```

- For a physical device, replace the example with the computer's LAN IPv4 address. Keep the computer and device on the same network and allow port `3000` through the firewall.
- For an Android emulator, `http://10.0.2.2:3000` usually reaches the host computer.
- For an iOS simulator on the same computer, `http://localhost:3000` can be used.
- Expo web also requires the backend to allow the browser origin through CORS. The current backend contract does not configure CORS, so use a native target unless backend CORS is added in a separately requested task.
- Do not put secrets in `EXPO_PUBLIC_*` variables; Expo embeds them in the application bundle.

Start the backend first, then start Expo. Reload the application after changing the environment value.

### Authentication flow

- Registration validates the form, calls `POST /auth/register`, then signs in with the submitted credentials because registration does not issue a token.
- Login saves the returned access token in Expo SecureStore on Android and iOS. Expo web uses browser local storage because SecureStore is not available on web.
- Startup reads the saved token and calls `GET /auth/me`. A valid token restores the protected session; a rejected token is deleted.
- Logout attempts `POST /auth/logout` and always performs local token cleanup, including when the API is unavailable.

The current backend does not configure CORS, so browser authentication requests require a separately configured backend origin policy. Native Expo targets are the supported local-development path for the current contract.

### Course Management flow

- The protected `/courses` route lists only the authenticated user's courses and supports retry, empty, loading, and populated states.
- Add and edit screens share validated fields for name, code, description, instructor, room, and a predefined color palette.
- Course Details is a compact scoped workspace with a course hero, Tasks/Materials/Classes metrics, and Overview, Tasks, Materials, and Schedule tabs. It requests only records belonging to that course and keeps course uploads inside Materials.
- The responsive Courses grid shows course initials, code, pending tasks, material count, and the nearest generated class occurrence. It also includes a compact full-width Personal Library entry for files without a course.
- Successful creates refresh the course list, successful edits refresh the detail record, and deletion removes local displayed state before returning to the list.
- Every course request uses the access token already restored by the authentication context; HTTP `401` clears the local session.

### Task Management flow

- The protected Task list uses a compact weekly selector, authenticated course tabs, search, and one continuous list of neutral academic task cards with relative deadline labels.
- A filter sheet composes priority, status, and due selections while course UUID and Personal filtering remain in horizontal tabs. Search, the local This Week projection, and five local sort options are layered over supported backend filters without adding API parameters.
- Add and edit screens share validated title, description, course, local due date/time, priority, and status fields.
- A task may use “No course.” Due values entered in local device time are converted to ISO UTC; a date without a time uses 23:59 local time.
- Completion and deletion update displayed state after the server confirms success, and Course data supplies names and codes for selectors and task cards.
- Every Task request uses the restored JWT through the protected Task provider; HTTP `401` clears the local session.

### Calendar Management flow

- The protected Calendar route displays a dependency-free month grid with distinct event, task-deadline, and class-meeting markers and a selected-day agenda.
- Calendar events are requested only for the visible local month using inclusive `from` and `to` ISO timestamps. Tasks are loaded from the existing Task endpoint and only records with `dueAt` are projected into the calendar.
- Event, task, and class records remain separate source types and open their respective detail routes.
- Add and edit screens share validation for title, optional description/course/location/end/color, required start, optional end, and all-day behavior.
- Local date/time inputs are converted to ISO UTC timestamps without fixed offsets. API timestamps are displayed in the device timezone.
- The calendar refreshes on visible-month changes and whenever it regains focus after event creation, editing, or deletion.
- The month grid uses React Native primitives already included with Expo SDK 54; no calendar dependency was added.

### Class Schedule Management flow

- Course Details opens a course-scoped weekly schedule list with loading, error, retry, empty, and populated states.
- Add and edit share validation for weekday, strictly increasing local `HH:mm` times, optional room, and an inclusive `YYYY-MM-DD` date range.
- Duplicate and overlapping meeting conflicts are surfaced using the backend's exact error messages.
- The combined calendar requests schedules overlapping the visible month and generates weekly occurrences locally; it never creates Calendar Event records for class meetings.
- Schedule times remain local wall-clock values. They are combined with each occurrence's local date only for display and sorting on that device.

### File Management flow

- Settings > File Library lists all personal and course-related files. Course Details > Materials scopes the same library to one course, while Courses > Personal Library shows only files with `courseId: null`.
- Shared material filters provide All, PDF, Slides, Documents, and Images categories. Slides maps to PPT/PPTX, Documents to DOC/DOCX/TXT, and Images to the supported image extensions.
- Upload uses Expo DocumentPicker with `copyToCacheDirectory`, keeps the original URI/name/MIME type, and sends native `multipart/form-data` without manually setting a boundary or reading Base64 into JavaScript.
- The picker and form enforce the documented 25 MiB default before upload; backend validation messages remain authoritative.
- Details support authenticated download into Expo's temporary cache, progress display, and opening the platform share sheet through Expo Sharing.
- Downloaded files are explicit temporary transfers, not an offline cache or synchronization layer.
- Rename/course assignment, course removal, and deletion refresh relevant File state after server confirmation.

### Home Dashboard flow

- `/` is the default authenticated route and the five bottom navigation actions are Home, Calendar, Tasks, Courses, and Files. Profile, Settings, and Appearance remain protected secondary routes.
- Home loads Courses, Tasks, a two-week Calendar Event and Class Schedule window, and Files through their existing typed services. It renders the nearest upcoming class/event, a seven-day strip, compact metrics, a chronological Today timeline including timed tasks, a bounded task focus list, course cards with next class, and recent materials.
- Class occurrences reuse the Calendar's bounded local recurrence projection; manual events and classes are sorted together by start time.
- Incomplete tasks are split into local Tasks Due Today and the next seven local dates, while recent Files are sorted newest first.
- Each source settles independently, so successful sections remain visible with section-specific Retry states when another source fails.
- Focus refreshes, pull-to-refresh, and confirmed task completion prevent stale dashboard sections after feature mutations.

From this repository:

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
npm test
npx tsc --noEmit
npx expo-doctor
```

Use the exact Expo SDK 54 documentation when making code changes: <https://docs.expo.dev/versions/v54.0.0/>.

## Scope guardrails

- Tasks, events, and files may be personal or course-related.
- Class schedules always belong to courses and each weekday meeting is stored as a separate weekly schedule record.
- API contracts come from the backend documentation and implementation, not assumptions in UI code.
- Access tokens belong in SecureStore on native devices, never SQLite or React component state alone.
- SQLite will be a later local cache/offline layer; the cloud API remains authoritative across devices.
- The backend currently uses development-only local file bytes and PostgreSQL metadata; mobile never receives internal storage paths.
