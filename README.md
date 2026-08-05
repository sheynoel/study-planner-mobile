# Study Planner Mobile

Expo and React Native TypeScript client for a personal, cloud-synchronized student planner and file organizer.

## Current status

The mobile-to-backend connection, authentication, Course Management, and Task Management flows are implemented on Expo SDK 54. Users can register, sign in, restore a saved session, manage personal and course-related tasks and courses, filter and complete tasks, and sign out. Native access tokens are stored with Expo SecureStore. Calendar events, class schedules, files, SQLite, notifications, and offline synchronization are not implemented.

The sibling `study-planner-api` repository owns the product and backend planning documents:

- `../study-planner-api/docs/PRODUCT.md`
- `../study-planner-api/docs/FEATURES.md`
- `../study-planner-api/docs/DATA_MODEL.md`
- `../study-planner-api/docs/ARCHITECTURE.md`
- `../study-planner-api/docs/TASKS.md`
- [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) documents the implemented mobile session lifecycle.
- [`docs/COURSES.md`](docs/COURSES.md) documents the implemented mobile Course flow and backend assumptions.
- [`docs/TASKS.md`](docs/TASKS.md) documents the implemented mobile Task flow and backend assumptions.

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
|-- components/tasks/      Reusable task cards, forms, filters, and chips
|-- components/ui/         Shared loading, error, and empty states
|-- contexts/              Authentication, Course, and Task state lifecycles
|-- constants/             Theme constants
|-- hooks/                 Theme/color-scheme hooks
|-- lib/api/               Reusable API client and typed backend contracts
|-- lib/auth/              Token storage and form validation
|-- lib/courses/           Course form mapping, validation, and routes
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

- The protected home route lists only the authenticated user's courses and supports retry, empty, loading, and populated states.
- Add and edit screens share validated fields for name, code, description, instructor, room, and a predefined color palette.
- Course details show the complete course record plus non-interactive placeholders for later task, schedule, and file phases.
- Successful creates refresh the course list, successful edits refresh the detail record, and deletion removes local displayed state before returning to the list.
- Every course request uses the access token already restored by the authentication context; HTTP `401` clears the local session.

### Task Management flow

- The protected Task list shows personal and course-related work together with status, priority, course, due date, and overdue treatment.
- List filters cover today, upcoming, overdue, completed, course, and priority and use the backend's UTC filter contract.
- Add and edit screens share validated title, description, course, local due date/time, priority, and status fields.
- A task may use “No course.” Due values entered in local device time are converted to ISO UTC; a date without a time uses 23:59 local time.
- Completion and deletion update displayed state after the server confirms success, and Course data supplies names and codes for selectors and task cards.
- Every Task request uses the restored JWT through the protected Task provider; HTTP `401` clears the local session.

From this repository:

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
npx expo-doctor
```

Use the exact Expo SDK 54 documentation when making code changes: <https://docs.expo.dev/versions/v54.0.0/>.

## Scope guardrails

- Tasks, events, and files may be personal or course-related.
- Class schedules always belong to courses.
- API contracts come from the backend documentation and implementation, not assumptions in UI code.
- Access tokens belong in SecureStore on native devices, never SQLite or React component state alone.
- SQLite will be a later local cache/offline layer; the cloud API remains authoritative across devices.
- File contents will live in future cloud object storage, while PostgreSQL stores metadata.
