# Study Planner Mobile

Expo and React Native TypeScript client for a personal, cloud-synchronized student planner and file organizer.

## Current status

This repository is still the Expo SDK 54 `create-expo-app` starter with Expo Router, example tabs, a modal, themed components, and template image assets. Planner screens, backend integration, authentication, SecureStore, SQLite, notifications, and file workflows are planned but are not implemented.

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
|-- scripts/               create-expo-app reset utility
|-- AGENTS.md              Rules for coding agents
|-- app.json               Expo configuration
`-- package.json           Scripts and dependencies
```

Future feature UI, API clients, secure storage, local persistence, and synchronization code should remain separated as described in the backend architecture document. New directories should be introduced only when required by an explicitly requested implementation task.

## Local commands

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

