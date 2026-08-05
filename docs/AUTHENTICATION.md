# Mobile authentication

This document records the mobile portion of roadmap phase 3. It implements the existing NestJS access-token contract without changing backend endpoints or introducing refresh tokens.

## Implemented scope

- Typed requests and runtime-checked responses for registration, login, current-user lookup, and logout.
- Login and registration forms with local validation, disabled submitting states, activity indicators, and backend error messages.
- An authentication context that owns the current user, in-memory access token, startup loading state, login, registration, restoration, and logout.
- Native token persistence through Expo SecureStore. Expo web uses local storage as the platform fallback described by Expo's Router authentication guidance.
- Expo Router protected groups: logged-out users can reach only login and registration; logged-in users can reach only the authenticated placeholder.

## Session lifecycle

1. Login calls `POST /auth/login` and persists the returned access token before publishing the authenticated state.
2. Registration calls `POST /auth/register`, then `POST /auth/login` with the accepted credentials because registration does not return a token.
3. On startup, the context reads the stored token and calls `GET /auth/me`.
4. A successful current-user response restores both the token and user in memory.
5. HTTP `401` deletes the rejected stored token. A transient network failure leaves the stored token available for a later startup attempt and displays the logged-out flow with a restoration error.
6. Logout attempts `POST /auth/logout`, then deletes the local token and clears authenticated state even if the API call fails.

## Storage and platform notes

The `expo-secure-store` config plugin enables Android backup exclusions, and the iOS app configuration declares that SecureStore does not add non-exempt encryption. Tokens use a single application-specific key and are never written to SQLite.

The backend currently has no CORS configuration. Native Android and iOS development are supported with a reachable `EXPO_PUBLIC_API_URL`; web requests require an allowed browser origin in a separately requested backend task.

## Deferred work

Refresh tokens, token blocklisting, courses, tasks, calendar management, files, notifications, SQLite, offline synchronization, and other planner features remain outside this task.
