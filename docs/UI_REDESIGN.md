# Bento Student Workspace UI Redesign

## Audit date and scope

This audit covers every Expo Router screen and shared component in `study-planner-mobile` before the Bento Student Workspace migration. The redesign is presentation-only: authentication, API services, response contracts, state providers, validation, filters, date conversion, upload/download behavior, and mutations remain authoritative and unchanged.

React Native Paper is not currently installed. The project already has Expo Router, React Navigation, Expo Vector Icons, Reanimated, SecureStore, and a functioning token/theme context. Adding Paper would duplicate the existing primitives and increase migration risk, so this redesign extends the local Material-inspired system instead.

## Existing routes

### Authentication

- `/(auth)/login` — login form and session error presentation.
- `/(auth)/register` — registration form and automatic post-registration login.

### Primary workspace

- `/` — authenticated dashboard.
- `/calendar` — combined month and selected-day event/task/class view.
- `/tasks` — filtered personal and course-related task list.
- `/courses` — course list.
- `/files` — filtered personal and course-related file list.

### Create, detail, and edit

- `/tasks/new`, `/tasks/:id`, `/tasks/:id/edit`.
- `/calendar/new`, `/calendar/:id`, `/calendar/:id/edit`.
- `/courses/new`, `/courses/:id`, `/courses/:id/edit`.
- `/courses/:id/schedules`, `/courses/:id/schedules/new`.
- `/class-schedules/:id`, `/class-schedules/:id/edit`.
- `/files/upload`, `/files/:id`, `/files/:id/edit`.

### Account and preferences

- `/settings` — student card, appearance choices, and logout before this migration.

## Existing reusable components

- Theme-aware `ThemedText`, `ThemedView`, `AppHeader`, and five-item `AppSectionTabs`.
- `AppButton`, `AppCard`, `ChoiceChip`, `SectionHeader`, `FloatingActionButton`, loading/error/empty states, and a destructive confirmation helper.
- Feature cards and forms for Courses, Tasks, Calendar Events, Class Schedules, and Files.
- Dashboard projection cards for next schedule, tasks, today schedule, deadlines, and files.
- Five persistent theme packs with system/light/dark selection through `AppearanceProvider`.
- Expo Vector Icons and Reanimated are already available for iconography and restrained motion.

## Repeated UI problems

- Home is a long sequence of equally weighted vertical sections, so high-priority information does not stand out.
- Tasks, Courses, and Files use single-column `FlatList` presentations that resemble CRUD records more than a student workspace.
- Calendar has sound date logic but its agenda is a sequence of generic cards rather than a timeline.
- Detail screens use long property lists with separate custom hero colors and duplicated divider/label styles.
- Several forms and detail routes still contain raw hex colors, old teal action styles, and feature-local chip/select implementations.
- Header actions vary between Profile, Edit, and direct Sign out; account actions are not consistently separated from workspace navigation.
- Loading is generally full-screen spinner based even where card structure is predictable.
- Floating add actions are feature-specific and do not expose the requested global quick-create destinations.
- Some screens use dense one-line JSX, making visual regressions harder to review and styles harder to consolidate.
- Course color, event/task/class source color, priority, and status sometimes compete for visual emphasis.

## Screens relying on plain lists

- Tasks: one continuous task list below three horizontal filter rows.
- Courses: one full-width card per course.
- Files: one full-width card per file after filters.
- Course schedules: one full-width card per meeting.
- Calendar agenda: one generic card per selected-day item.
- Home: repeated full-width cards in a single vertical flow.

## Consolidation targets

- Add `AppScreen` for safe-area, background, header, bottom-navigation clearance, and constrained content width.
- Evolve `AppCard` into `BentoCard`; add `MetricCard`, `LoadingSkeleton`, and horizontal carousel primitives.
- Keep `AppButton` as the implementation and expose intent-specific primary/secondary and icon controls.
- Keep `FormField` as the text-input implementation and add named `AppTextInput`/select wrappers for future forms.
- Reuse `ChoiceChip` for filter/select behavior and keep status/priority-specific wrappers.
- Replace per-screen floating buttons with one accessible `FloatingQuickAdd` and modal bottom action sheet.
- Add domain presentation components: `CourseFolderCard`, `TaskPreviewCard`, `FilePreviewCard`, and `TimelineItem`.
- Keep confirmation behavior centralized; do not replace native confirmation semantics with an untested custom dialog.

## Migration order

1. Extend semantic tokens, typography roles, motion timings, elevations, and source colors.
2. Add shared screen, bento, metric, carousel, skeleton, icon, sheet, and preview components.
3. Redesign the five-item navigation and global quick-add sheet while preserving current destinations.
4. Recompose Home into bounded bento sections using existing dashboard data.
5. Present Tasks as one continuous compact list with relative urgency labels, course tabs, and a weekly selector.
6. Convert Courses to a two-column folder grid and Course Details to a workspace layout.
7. Add a collapsible month, week strip, and timeline treatment to Calendar without changing date logic.
8. Group Files into recent, course, and personal resource sections while retaining filters and upload/download actions.
9. Apply shared fields, cards, actions, and semantic colors to forms and remaining detail routes.
10. Separate Profile, Settings, and Appearance outside the five tabs and retain local preference persistence.
11. Apply the same surface hierarchy and typography to authentication.
12. Run narrow-screen, accessibility, route, mutation, theme, and static verification.

## Implemented coverage

- The five-tab workspace uses Home, Calendar, Tasks, Courses, and Settings with one accessible global quick-add sheet. File routes remain available contextually.
- Home is a bounded bento dashboard with metrics, the next schedule, one continue-working task, course folders, a short timeline, and recent materials.
- Tasks use a compact month summary, weekly selector, course tabs, filter/sort sheets, and one continuous academic card list while retaining completion and supported backend filters.
- Courses use a responsive two-column folder grid plus Personal Library; Course Details has Overview, Tasks, Materials, and Schedule tabs backed by course-scoped requests.
- Calendar keeps the existing month/date logic and combines a collapsible month, week strip, legend, and selected-day timeline.
- The shared File Library supports all-files, one-course, and personal scopes with exact multi-extension material categories.
- Task, event, file, course, and class detail/form surfaces now share semantic cards, controls, spacing, and destructive actions.
- Profile, Appearance, and Settings live outside the main tabs. Authentication uses the same student-workspace typography and surfaces.

## Intentionally not introduced

- No new server fields, requests, routes, cache, offline behavior, or product features were added.
- “Pinned” resources and school/program/year profile metadata remain absent because no supporting contract exists.
- The native/web confirmation helper remains the destructive-dialog implementation to preserve tested platform behavior.

## Regression boundaries

- The global quick-add sheet only navigates to existing create/upload routes. Class Schedule creation still requires choosing an owned Course.
- Home and course workspaces show bounded previews with View All routes; they do not introduce new queries or backend aggregation.
- “Pinned” file behavior is not implemented because no pin field or endpoint exists; Recent Materials is used instead.
- Optional school, program, and academic-year fields remain decorative omissions because they have no current user contract or local profile model.
- All user-owned records and personal-without-course behavior remain unchanged.
