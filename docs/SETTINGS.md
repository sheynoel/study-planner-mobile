# Settings, Appearance, and notification preferences

Settings owns how the application looks, behaves, and stores reminder preferences. Student Profile owns only the authenticated student's identity. Neither surface introduces or changes a backend contract.

## Settings structure

- Appearance opens mode, coordinated theme, and accent controls.
- Notifications opens locally persisted reminder choices.
- Account contains Student Profile and Sign out.
- About shows the app version from Expo configuration.
- File Library and Calendar Preferences are intentionally absent. Materials and Personal Library remain in course workspaces, and Calendar Display remains inside Calendar.

## Appearance architecture

`AppearanceProvider` persists `mode`, `themePack`, and an optional `accentColor`. Theme packs supply coordinated light and dark surface palettes. A custom accent derives only global interface roles such as primary action, selected tab, and subtle primary containers. It never updates Course records or replaces Course colors used by tasks, class cards, folders, or calendar indicators.

Stored legacy theme identifiers migrate locally to the closest current theme. Native storage uses Expo SecureStore; web uses local storage. The custom picker uses the already-installed `reanimated-color-picker` and requires no typed hex input.

## Notification preferences

The notification provider persists a master preference and Task, Event, Note, and Class reminder choices. Turning the master preference off visually disables subordinate switches while preserving their values.

This release does not install a notification execution package, request OS notification permission, schedule local notifications, or promise delivery. The screen states this limitation directly. A future execution layer can consume these preferences after notification behavior is explicitly designed and implemented.
