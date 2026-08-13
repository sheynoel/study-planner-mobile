# Mobile authentication

The mobile authentication lifecycle uses explicit startup states and rotating refresh tokens from the NestJS API.

## Session lifecycle

- `initializing`: SecureStore is being read and the saved session is being validated. The native splash remains visible and no route group or feature provider is mounted prematurely.
- `authenticated`: `/auth/me` accepted the access token, or an expired access token was refreshed successfully.
- `authenticated-offline`: a persisted session exists but validation failed because of connectivity or timeout. Credentials remain intact and validation retries every 30 seconds and when the app becomes active.
- `unauthenticated`: no saved session exists, or access and refresh authentication were conclusively rejected.

Login persists one JSON credential bundle containing the access token, refresh token, and last confirmed public user. Native Android and iOS use Expo SecureStore. Sensitive tokens are never written to AsyncStorage or SQLite. The old access-token-only key is read once for migration and removed after a new session is saved.

Protected requests that receive HTTP `401` perform one shared refresh request. Concurrent failures wait for that operation, update SecureStore and in-memory state, and retry each original request once. Refresh and login requests cannot recursively trigger refresh. A network failure during refresh is surfaced as connectivity failure without deleting credentials; an invalid, expired, revoked, or already-rotated refresh token clears the session.

Logout attempts `POST /auth/logout` with the refresh token, then always deletes the local credential bundle and clears authenticated state. Offline logout therefore succeeds locally, although the remote session remains usable until it expires or is otherwise revoked.

## Navigation and courses

The root protected stack is anchored to `(app)`, and the authenticated stack is anchored to `index`. Protected-route fallback therefore cannot select `courses/new` during authentication changes. Course list rendering distinguishes `idle/loading`, `error`, successful-empty, and successful-populated states; an empty array during loading never opens or renders Add Course as an automatic destination.

## Platform notes

Expo web retains the existing browser local-storage fallback because SecureStore is native-only. Production secrets are server environment variables; `EXPO_PUBLIC_API_URL` is not a secret.
