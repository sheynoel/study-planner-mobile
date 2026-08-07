# Mobile Design System

The mobile UI uses a token-based, student-friendly system in `constants/theme.ts`. Each theme pack supplies coordinated light and dark palettes while shared typography, spacing, radii, shadows, and control sizing keep every feature visually related.

## Theme packs

- **Sage Study** uses quiet greens and paper-like neutrals.
- **Latte Notes** uses warm coffee, cream, and notebook tones.
- **Sky Planner** uses clear blues and airy cool neutrals.
- **Lavender Focus** uses soft violets for calm concentration.
- **Dark Academia** uses parchment, library wood, and ink tones.

Settings supports Follow system, Light, and Dark display modes. Theme-pack and mode preferences are stored locally with Expo SecureStore on native devices and browser storage on web. Selection updates the active palette immediately and does not alter server data.

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

The main bottom navigation is limited to Home, Calendar, Tasks, Courses, and Files. Profile, Settings, and Appearance remain secondary routes. The floating Quick Add is visually smaller while preserving a 50-point target, and every tab retains at least a 44-point touch target.

Course cards use responsive numeric widths, two-line title clamping, one-line metadata, and restrained course accents to prevent overlap on narrow devices. Home and Course Details use compact metrics, short card stacks, and horizontal previews to keep the workspace organized without turning every section into a full feature screen.

Task filters and sorting use bottom sheets rather than inline dropdown-like rows. File Library, course Materials, and Personal Library share one material filter and presentation layer so category definitions and mutation refresh behavior stay consistent.

The Profile & Settings screen includes a digital student card with the signed-in name, student role, active course count, near-term task count, and current theme accent. Its counts reuse existing dashboard data and introduce no new API contract.

Motion is restrained to press feedback, modal-sheet presentation, and subtle skeleton pulsing. Theme changes are applied live through `AppearanceProvider`; they do not alter API state or navigation.
