# Mobile Design System

The mobile UI uses a token-based, student-friendly system in `constants/theme.ts`. Each theme pack supplies coordinated light and dark palettes while shared typography, spacing, radii, shadows, and control sizing keep every feature visually related.

## Theme packs

- **Default**, **Lavender**, **Rose**, **Ocean**, **Forest**, **Sunset**, **Peach**, **Mint**, **Sky**, and **Mono** provide coordinated light/dark surfaces and restrained accents.

Appearance supports System, Light, and Dark modes, ten theme packs, twenty curated accent choices, and a spectrum-based custom accent picker. Theme, mode, and optional accent override are stored locally with Expo SecureStore on native devices and browser storage on web. Accent overrides derive only global interface roles; Course colors remain record-owned identifiers and are never rewritten.

## Foundations

- Spacing follows a 4-point scale. Screens use 20 points of horizontal padding, cards use 16 points, and forms use an 18-point vertical gap.
- Controls use a 50-point standard height and never fall below a 44-point touch target.
- Radius tokens cover compact controls, inputs, cards, feature heroes, and pill-shaped chips.
- Typography uses a compact hierarchy: 28–30 point screen titles, 19–21 point section titles, 15–16 point card titles, 13–14 point body text, 11–12 point metadata, and 10–11 point navigation/chip labels.
- Cards use the shared neutral surface, subtle border, and platform-appropriate shadow.
- Course colors appear only as bars, dots, or swatches. They do not replace primary actions or neutral content surfaces.

## Shared components

- `AppScreen` owns safe-area layout, neutral background, bottom-bar clearance, and readable content width.
- `BentoCard`, `MetricCard`, `HorizontalCarousel`, and `LoadingSkeleton` provide the responsive workspace composition.
- `AppButton` supplies primary, secondary, danger, and ghost actions with loading and disabled states.
- `PrimaryButton`, `SecondaryButton`, and `IconButton` expose common action intent without duplicating button styling.
- `AppCard` supplies consistent surface, border, radius, padding, and shadow.
- `AppTextInput`, `AppSelectField`, and `FilterChip` provide named form and filter primitives over the existing validated controls.
- `ChoiceChip` standardizes compact select and filter controls and adds a visible check mark to selected values.
- `SectionHeader` aligns section titles and optional actions.
- `FloatingQuickAdd` and `BottomActionSheet` expose only existing create/upload destinations from the five-tab workspace.
- `LoadingState`, `EmptyState`, `ErrorState`, and `ErrorBanner` provide consistent feedback.
- `showDestructiveConfirmation` standardizes irreversible-action confirmation on native and web.
- Task status and priority chips combine text with symbols so color is never the only signal.
- `CourseFolderCard`, `TaskPreviewCard`, `FilePreviewCard`, `WeekStrip`, and `TimelineItem` provide consistent domain presentation without owning API behavior.

## Usage rules

New UI should use theme colors through `useThemeColor` or `useAppearance`, and layout values through `DesignTokens`. Feature-specific colors are supporting indicators only. API calls, navigation, validation, and feature state remain outside these visual components.

The main bottom navigation is limited to Home, Calendar, Tasks, Courses, and Settings. Home and Calendar alone use the global Task/Event/Note floating menu. Tasks and Courses have direct header `+` actions, Settings has none, and Course Details uses one Course-scoped Task/Event & Note/Materials menu.

Course cards use responsive numeric widths, two-line title clamping, one-line metadata, and restrained course accents to prevent overlap on narrow devices. Home mixes a day-flow hero, seven-column flex strip, horizontal class carousel, at most one full-width Spotlight, and compact task rows; Course Details keeps bounded previews without turning either surface into a full feature screen.

Quick Add uses a separate anchored-popup primitive: a content-sized themed surface above the 50-point FAB, subtle fade/scale/lift motion, a persistent `+` glyph, outside/drag/Back/navigation dismissal, and nested compact choices. Add Task, Event, Note, and Material metadata instead share the existing adaptive bottom-sheet primitive with dim backdrop, rounded surface, drag handle, feature-specific initial snaps, keyboard expansion, and unsaved-change guards. No third-party sheet dependency is added.

Reusable form date fields use a themed `react-native-calendars` month sheet. Reusable time fields use `@react-native-community/datetimepicker` with a visible 12-hour AM/PM preview while preserving the existing local `HH:mm` storage boundary. Custom Course color selection uses `reanimated-color-picker`; selection is communicated by fill, border, and ring treatments instead of decorative checkmarks.

The global Calendar also uses `react-native-calendars` with a fixed-height custom day renderer. Month cells use tiny color rails plus text, never color alone, and cap previews before showing `+N`. Calendar display toggles use switches and density uses filled/outlined chips without checkmark decoration.

Student Profile owns signed-in identity only: name, student role, and email. Settings owns application preferences, account actions, and version information. Notification controls persist local choices but deliberately do not request permission or schedule delivery until notification execution is separately implemented.

Motion is restrained to press feedback, modal-sheet presentation, and subtle skeleton pulsing. Theme changes are applied live through `AppearanceProvider`; they do not alter API state or navigation.
