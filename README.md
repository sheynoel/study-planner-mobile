# Study Planner Mobile

Expo and React Native TypeScript client for a personal, cloud-synchronized student planner and file organizer.

## Current status

The mobile-to-backend connection foundation is implemented on Expo SDK 54. The Home tab is a temporary development screen that checks the backend's public `GET /health` endpoint and reports API connectivity, PostgreSQL connectivity, and the server timestamp. Authentication, planner screens, SecureStore, SQLite, notifications, and file workflows are not implemented.

The sibling `study-planner-api` repository owns the product and backend planning documents:

- `../study-planner-api/docs/PRODUCT.md`
- `../study-planner-api/docs/FEATURES.md`
- `../study-planner-api/docs/DATA_MODEL.md`
- `../study-planner-api/docs/ARCHITECTURE.md`
- `../study-planner-api/docs/TASKS.md`

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
|-- app/                   Expo Router starter routes
|-- assets/images/         Starter icons and images
|-- components/            Starter reusable UI components
|-- constants/             Theme constants
|-- hooks/                 Theme/color-scheme hooks
|-- lib/api/               Typed API client and health contract
|-- lib/config/            Mobile environment configuration
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
- Expo web also requires the backend to allow the browser origin through CORS. The current backend contract does not configure CORS, so use a native target for this temporary check unless backend CORS is added in a separately requested task.
- Do not put secrets in `EXPO_PUBLIC_*` variables; Expo embeds them in the application bundle.

Start the backend first, then start Expo. Reload the application after changing the environment value.

From this repository:

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
```

Use the exact Expo SDK 54 documentation when making code changes: <https://docs.expo.dev/versions/v54.0.0/>.

## Scope guardrails

- Tasks, events, and files may be personal or course-related.
- Class schedules always belong to courses.
- API contracts come from the backend documentation and implementation, not assumptions in UI code.
- SQLite will be a later local cache/offline layer; the cloud API remains authoritative across devices.
- File contents will live in future cloud object storage, while PostgreSQL stores metadata.
