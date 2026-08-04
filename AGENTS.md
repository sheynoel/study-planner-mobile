# Coding agent instructions

These rules apply to every change in `study-planner-mobile`.

## Before editing

1. Read this repository's `README.md` and the relevant product documentation in `../study-planner-api/docs/` before editing.
2. Read the exact Expo SDK 54 documentation at <https://docs.expo.dev/versions/v54.0.0/> before writing code. Do not assume behavior from another Expo version.
3. Inspect the existing routes, components, hooks, configuration, dependencies, tests (if present), and Git status before creating or changing files.
4. Confirm the single requested task and its acceptance criteria. Implement only that task.
5. Before changing any mobile API integration, inspect the backend API documentation and current backend implementation. At minimum read `../study-planner-api/README.md`, `../study-planner-api/docs/ARCHITECTURE.md`, the relevant feature/data-model documents, and any future API contract documents. Do not invent endpoints, payloads, errors, or authentication behavior.

## Scope and design

- Do not add undocumented features. If a requirement conflicts with the product or API documentation, stop and request clarification.
- Keep controllers, services, database logic, and UI components separated across the system; mobile code must consume documented backend contracts rather than duplicate backend controller or service responsibilities.
- Keep route/screen composition, reusable UI components, feature logic, API transport, secure storage, SQLite/database logic, synchronization, and platform integrations separated.
- UI components must not construct raw API requests or query local databases directly.
- Keep personal records first-class: tasks, events, and files may have no course; class schedules must have a course.
- Do not introduce packages, screens, backend-contract changes, or infrastructure outside the requested task.
- Preserve platform behavior across Android, iOS, and web unless the requested task explicitly has a narrower target.

## Verification and handoff

1. Run the relevant tests, Expo linting, and TypeScript checks for the change. At minimum, consider `npm run lint` and `npx tsc --noEmit`; explain any check that cannot be run.
2. When API integration changes, verify it against the documented backend contract and run relevant checks in both repositories.
3. Re-read the diff for scope, layering, platform compatibility, and documentation consistency.
4. List every created or modified file in the final response.
5. Stop after completing the requested task. Do not begin the next roadmap item without a new request.
