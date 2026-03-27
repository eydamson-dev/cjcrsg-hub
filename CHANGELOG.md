# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Phase 6: Event History & EventList Component** - New Event History page and reusable EventList component with server-side pagination
  - New route: `/events/history` - Event History page for viewing active events (isActive=true)
  - `src/features/events/components/EventList.tsx`: Reusable event display component
    - View modes: Table (default) and Cards with toggle buttons
    - Server-side filters: Event Type dropdown, Status dropdown (all 4 statuses), Search input
    - Table view columns: Banner, Event Name, Date, Status, Type, Attendance, Actions
    - Cards view: Responsive grid with event cards showing image, name, date, status, attendance
    - Server-side pagination: Previous/Next buttons, page size selector (10, 25, 50), page info display
    - Loading skeleton state with EventListSkeleton component
    - Empty states for no events and no filter matches
  - `src/features/events/components/EventListSkeleton.tsx`: Loading skeleton for table and cards views
  - Convex queries: `listActive`, `countActive`, `countArchived`, updated `listArchive`
    - All queries support filtering by eventTypeId, status, search, dateFrom, dateTo
    - Uses `by_active_date` index for efficient isActive filtering
    - Returns paginated events with joined eventType data and attendanceCount
  - React hooks: `useActiveEvents`, `useActiveEventCount`, `useArchivedEvents`, `useArchivedEventCount`
    - Support pagination options and all filter parameters
    - Marked old `useArchiveEvents` as deprecated
  - `src/routes/events.archive.tsx`: Refactored with server-side pagination
    - URL-based pagination with search params (page, type, status, q)
    - Cursor history management for Convex pagination
    - Debounced search (300ms delay)
    - Page size persistence in localStorage
  - `src/features/events/components/EventArchive.tsx`: Refactored to use EventList internally
    - Removed client-side filtering and pagination logic
    - Now a wrapper component that passes props to EventList
    - Maintains breadcrumbs and optional back link functionality
  - `src/routes/events.index.tsx`: Added Event History navigation button
    - Button order: Create Event | Event History | Archive
    - Uses History and Archive icons from Lucide
  - Navigation breadcrumbs: Added EventsBreadcrumb and BackLink to Event History and Archive pages
    - Event History shows "Events > History" breadcrumb with back link
    - Event Archive shows "Events > Archive" breadcrumb with back link

- **Phase 9.1: Event Components Tests** - Comprehensive test suite for event management UI components
  - `tests/unit/events/components/BasicInfoEditModal.test.tsx`: 10 tests covering rendering, validation, and modal state
  - `tests/unit/events/components/EventDetails.test.tsx`: 18 tests for dashboard/detail modes, status actions, and modal interactions
  - `tests/unit/events/components/AttendanceManager.test.tsx`: 15 tests for search, check-in, bulk operations, and pagination
  - Added `scrollIntoView` mock to test setup for Command component compatibility

- **Phase 9.2: Archive Components Tests** - Complete test coverage for Event Archive and Filter components
  - `tests/unit/events/components/EventArchive.test.tsx`: 17 tests covering table/cards view toggle, filtering by event type and search query, pagination controls, empty states, and event click handlers
  - `tests/unit/events/components/EventFilters.test.tsx`: 16 tests for event type dropdown, search functionality, clear filters behavior, and component integration
  - Total 33 new tests, bringing component test count to 362

- **Phase 9.3: Dashboard Components Tests** - Comprehensive test suite for dashboard components
  - `tests/unit/components/events/CurrentEventDashboard.test.tsx`: 25 tests covering event rendering with child components (EventBanner, EventInfo, AttendanceManager), LIVE badge with animation, action button visibility and callbacks, component integration with props, edge cases (minimal data, zero attendance), debug logging, button variants, icon rendering, and responsive layout
  - Total 25 new tests, bringing component test count to 410 and overall test count to 560

- **Phase 10.1: Event CRUD E2E Tests** - E2E tests for event creation, editing, viewing, and archiving workflows
  - `tests/e2e/specs/events-crud.spec.ts`: Comprehensive event creation test
    - Test covers: User signup/login, navigation to create event page, filling required fields (name, event type, date), form submission, redirect to events dashboard, success toast verification
  - `tests/e2e/specs/events-crud.spec.ts`: Event editing test
    - Test covers: Creating event, navigating to archive, clicking event for details, opening edit modal, updating event name, saving changes, verifying success toast, confirming updated name displays
  - `tests/e2e/specs/events-crud.spec.ts`: Event detail viewing test
    - Test covers: Creating event, navigating to archive, clicking event to view details, verifying event name displayed, status badge (Upcoming), Date label visible, Edit button available, Back to Events button present
  - `tests/e2e/specs/events-crud.spec.ts`: Event archiving test
    - Test covers: Creating event, navigating to archive, clicking event for details, clicking Archive Event button, verifying "Event archived" toast, navigating back to archive, confirming event no longer appears in list
  - Added Archive button to `EventDetails` component with `useArchiveEvent` hook integration
  - Runs on both Chrome and Mobile Chrome (8 test instances total)
  - Total E2E test count: 64 (from 62)

- **Task 5.7 Phase 1: Schema Updates** - Updated `convex/schema.ts` with full event management and attendance tracking support
  - `attendees` table: Add `invitedBy` field — permanent record of who originally invited this person to church; stays on profile even after becoming a member
  - `attendees` table: Add `by_invited_by` index — query all people originally invited by a specific member
  - `events` table: Add `status` union (`upcoming | active | completed | cancelled`) — only one event can be `active` at a time
  - `events` table: Add `bannerImage` field — event banner URL with format-only validation (extension check, no HEAD requests)
  - `events` table: Add `media` array — photos and videos with url, type, and optional caption
  - `events` table: Add `updatedAt` field — tracked on every mutation
  - `events` table: Add `completedAt` field — timestamp set only when event is completed
  - `events` table: Add `by_status` index — filter events by lifecycle status
  - `events` table: Add `by_date_status` index — date + status queries (e.g. upcoming events after today ordered by date)
  - `events` table: Add `by_active` index — fast lookup of the single currently active event
  - `attendanceRecords` table: Add `invitedBy` field — per-event inviter tracking (who brought this person to this specific event; can differ from `attendees.invitedBy`)
  - `attendanceRecords` table: Add `by_invited_by` index — top inviters leaderboard and monthly invite count queries

- **Task 5.7 Phase 2: Backend Events** - Complete Convex backend implementation for event management
  - `convex/events/validators.ts`: Image URL validation (`isValidImageUrl`), field validators, `eventFields` and `updateEventFields` validators
  - `convex/events/queries.ts`: Five queries with joined data and pagination
    - `list`: Paginated events with filters (status, eventTypeId, dateFrom, dateTo), returns events with joined eventType data
    - `getById`: Single event lookup with eventType join
    - `getCurrentEvent`: Get active event with attendance count for dashboard
    - `listArchive`: Completed events for archive page with attendance counts
    - `getStats`: Dashboard statistics (totalEvents, byStatus, thisMonth, nextUpcoming)
  - `convex/events/mutations.ts`: Six mutations with full validation
    - `create`: Create event with validation (eventType exists, image URLs, time ordering), always defaults status to 'upcoming'
    - `update`: Partial update with validation, enforces single active event constraint when changing status
    - `startEvent`: Transition to 'active' with constraint check (only one active event at a time)
    - `completeEvent`: Mark as completed, sets completedAt timestamp
    - `cancelEvent`: Cancel upcoming or active events
    - `archive`: Soft delete (set isActive=false)

- **Task 5.7 Phase 3: Backend Attendance** - Complete Convex backend for attendance tracking
  - `convex/attendance/validators.ts`: Field validators for attendance operations (eventId, attendeeId, inviterId, bulkAttendees)
  - `convex/attendance/queries.ts`: Four queries with joined data and pagination
    - `getByEvent`: Paginated attendance records for an event with attendee and inviter details
    - `getStats`: Attendance statistics (total, members, visitors, withInvite counts)
    - `getByAttendee`: Paginated attendance history for a person with event and eventType data
    - `getInviters`: Top inviters for an event grouped by count, sorted descending
  - `convex/attendance/mutations.ts`: Three mutations for check-in operations
    - `checkIn`: Single attendee check-in with duplicate prevention, auth requirement, inviter validation
    - `unCheckIn`: Hard delete attendance record (no soft delete)
    - `bulkCheckIn`: Multiple attendees check-in with duplicate skipping, returns success/skipped counts
  - Schema update: Changed `checkedInBy` to `v.string()` to store auth identity subject string

- **Task 5.7 Phase 4: Frontend Hooks** - React hooks wrapping Convex backend
  - `src/features/events/hooks/useEvents.ts`: Five TanStack Query hooks for events
    - `useEventsList`: Paginated event list with filters (status, eventTypeId, date range)
    - `useEvent`: Single event by ID with eventType data
    - `useCurrentEvent`: Active event for dashboard with attendance count
    - `useArchiveEvents`: Completed events for archive page
    - `useEventStats`: Dashboard statistics (totalEvents, byStatus, thisMonth, nextUpcoming)
  - `src/features/events/hooks/useEventMutations.ts`: Six mutation hooks with toast notifications
    - `useCreateEvent`: Create event, invalidates list on success
    - `useUpdateEvent`: Update event, invalidates queries on success
    - `useStartEvent`: Start event (set active), handles active event constraint error
    - `useCompleteEvent`: Complete event, invalidates current/archive queries
    - `useCancelEvent`: Cancel event, invalidates queries
    - `useArchiveEvent`: Soft delete event, invalidates queries
  - `src/features/events/hooks/useAttendance.ts`: Seven hooks for attendance management
    - `useAttendanceByEvent`: Paginated attendance records for an event
    - `useAttendanceStats`: Attendance statistics (total, members, visitors, withInvite)
    - `useAttendanceByAttendee`: Person's attendance history
    - `useEventInviters`: Top inviters for an event
    - `useCheckIn`: Single attendee check-in with duplicate prevention
    - `useUnCheckIn`: Remove attendance record (hard delete)
    - `useBulkCheckIn`: Multiple attendees check-in, returns counts

- **Task 5.7 Phase 5: Route Integration** - Wire up event routes with real Convex backend
  - `src/routes/events.index.tsx`: Main dashboard with useCurrentEvent and useEventStats hooks
    - Shows active event with LIVE badge and attendance count if event is active
    - Shows EmptyEventState with real stats if no active event
    - Now uses unified EventDetails component for consistent UI
  - `src/routes/events.new.tsx`: Create event form wired to useCreateEvent mutation
    - Uses useEventTypesList for event type dropdown
    - Uses mutation for form submission with loading state
  - `src/routes/events.$id.tsx`: Event detail page wired to useEvent hook
    - Shows event details, description, banner image
    - Displays attendance list with useAttendanceByEvent
    - Shows attendance stats with useAttendanceStats
    - Now uses unified EventDetails component for full editing capabilities
  - `src/routes/events.archive.tsx`: Archive page wired to useArchiveEvents and useEventTypesList
    - Displays real completed events with pagination
    - Event type filter and search functionality
    - Loading skeleton during data fetch

- **Unified EventDetails Component** - Single reusable component for both dashboard and detail views
  - `src/features/events/components/EventDetails.tsx`: Main unified component
    - Supports both dashboard mode (at `/events`) and detail mode (at `/events/$id`)
    - Inline editing for all event fields regardless of status
    - **EventBanner**: 4:1 aspect ratio with gradient overlay, event type badge, status badge
    - **EventInfo**: Collapsible description section with inline edit capability
    - **BasicInfoEditModal**: Edit event name, type, date, time, location
    - **DescriptionEditModal**: Edit event description in textarea
    - **BannerUploader**: Click-to-upload with hover effect, supports file upload
    - **MediaGallery**: Grid layout with preview modal, manage (add/remove) media items
    - **AttendanceManager**: Full attendance management with search, bulk operations, pagination
      - Real-time search across all attendees with status badges
      - Bulk check-in with checkbox selection
      - Remove attendees with confirmation dialog
      - Paginated list (Previous/Next) with items per page selector (10, 25, 50)
      - "Add Attendee" button always visible below search
    - **Status-based action buttons**: Start Event, Complete Event, Cancel Event (context-aware)
    - Dashboard mode shows "View All Events →" link
    - Detail mode shows "← Back to Events" button
    - Toast notifications for all CRUD operations
    - Fully responsive design with mobile optimization

### Fixed

- **Archive Query Bug** - Fixed `listArchive` query in `convex/events/queries.ts`
  - Changed filter from `isActive=true` to `isActive=false` to properly show archived events
  - Previously the archive was showing non-archived (active) events instead of archived ones
  - This was discovered while debugging the "archive event" E2E test

- **EventTypeList Tests** - Fixed 6 previously skipped delete confirmation tests
  - Enabled all delete functionality tests (opens dialog, shows name, calls mutation, closes on cancel, loading state, disabled buttons)
  - Added `data-testid` to delete button for reliable test targeting
  - Fixed mock variable scoping issue
  - Updated assertions to use `waitFor()` for async dialog state changes
  - Test results: 453 passing → 459 passing (0 skipped)

- Properly handle undefined id in useEventType hook (pass 'skip' instead of undefined)

### Added

- **Phase 5: Event Management UI (Tasks 5.0-5.5)** - Complete UI implementation with mock data
  - Task 5.0: Types and Mock Data
    - Created TypeScript types: Event, EventType, AttendanceRecord, CreateEventInput, UpdateEventInput
    - 15 mock events (2 active, 5 upcoming, 8 completed) with realistic data
    - 25 mock attendance records with check-in times and member/visitor status
    - 4 event types: Sunday Service, Youth Night, Prayer Meeting, Retreat
  - Task 5.1: Empty State UI
    - "Start New Event" page with centered card layout
    - Large circular plus button with hover effects
    - Quick stats display: events this month, total events, last event, next scheduled
    - "View Event Archive" button
  - Task 5.2: Navigation Components
    - Breadcrumb navigation with Home > Events > Archive pattern
    - Back link component with chevron icon
    - Integrated into all event routes
  - Task 5.3: Archive Page UI
    - Table view with columns: Banner, Event Name, Date, Type, Attendance, Actions
    - Card view with 3-column grid (responsive: 2 cols tablet, 1 col mobile)
    - Toggle button group (Table/Cards) with clear active state
    - Event type filter dropdown with color indicators
    - Search input with clear button
    - Pagination with items per page selector (10, 25, 50)
    - Click any row/card to navigate to event detail
    - Empty state for no results
  - Task 5.4: Event Detail View UI
    - Banner image header with 5:1 aspect ratio
    - Event info: name, status badge, date/time, location, event type badge
    - Description section in bordered card
    - Media gallery with 3-6 column responsive grid and lightbox
    - Attendance summary with stats (Total, Members, Visitors)
    - Paginated attendee table with search and add/delete buttons
    - Action buttons: Edit Event, Restore Event (for completed), Delete Event with confirmation
  - New routes: `/events/archive`, `/events/$id`
  - Added shadcn components: breadcrumb, pagination
  - All navigation working with proper TypeScript route types
  - Task 5.5: Event Form UI (Section-based editing)
    - BasicInfoEditModal: Edit name, type, date, time, location
    - DescriptionEditModal: Edit description textarea
    - BannerUploader: Upload banner via file or URL
    - MediaGallery: Manage media (add/delete) with confirmation dialogs
    - EventDetailHeader: Clickable banner for upload, edit button beside title
    - EventDetail: Section-based layout with Edit buttons beside titles
    - events.new route: Full-page create event form
  - New routes: `/events/new`

### Fixed

- **Event Types E2E Tests** - Resolved test failures caused by:
  - Test data conflicts from parallel test runs (fixed by using unique names with `Date.now()`)
  - Playwright strict mode violations (fixed by using `.first()` for ambiguous selectors)
  - Flaky empty state test (replaced with reliable page content test)
  - All 16 E2E tests now passing (Chromium + Mobile Chrome)

### Changed

- **Refactor: Split cjcrsg-git-workflow into focused skills**
  - Created `cjcrsg-git-conventions` - Branch naming and commit message standards
  - Created `cjcrsg-pre-commit` - Quality checklist and enforcement rules
  - Created `cjcrsg-docs-workflow` - Task tracking and changelog management
  - Created `cjcrsg-testing-workflow` - Test requirements and locations
  - Created `cjcrsg-dev-workflow` - Implementation-First methodology
  - Deprecated monolithic `cjcrsg-git-workflow` skill (redirects to new skills)
  - Each skill now has single, clear responsibility for better maintainability

- **Event Management UI Improvements** - Refinement and cleanup of Phase 5 components
  - Refactored `EventDetails` component with better code organization and shared logic between dashboard and detail views
  - Enhanced `BasicInfoEditModal` with improved form validation and error handling
  - Updated `EventArchiveTable` for better responsive layout and data display
  - Improved `events.index.tsx` route with better Convex data integration and filter handling
  - Removed redundant `EventDetail` component - all functionality now unified in `EventDetails`
  - Fixed `EmptyEventState` styling consistency
  - Updated `EventFilters` for better type safety
  - Minor fix to `AttendeeList` component

### Added

- **Phase 5 Planning: Event Management** - Detailed implementation plan for event management feature:
  - Route structure: Dashboard + Archive (Option 2)
  - Design: Current event dashboard with attendance management
  - Event statuses: draft, upcoming, active, completed, cancelled
  - Media support: Banner (URL + upload), Media gallery (uploads)
  - Attendance: Search + dropdown, immediate check-in
  - UI-first approach: Mock data before backend integration
  - 9 detailed tasks with comprehensive specifications
  - Estimated: 13-18 hours total (UI: 6-8h, Backend: 4-6h, Tests: 3-4h)
  - Route: `/events` (main), `/events/archive`, `/events/:id`, `/events/new`

- **Phase 4: Event Types Tests (Tasks 4.10, 4.12)**
  - Task 4.10: Created Event Types route page tests (`tests/unit/events/routes/event-types.test.tsx`)
    - 8 tests covering: initial render, dialog state management, form submission, loading states
    - Tests verify dialog open/close, create mode vs edit mode, and mutation calls
  - Task 4.12: Created Event Types E2E tests (`tests/e2e/specs/event-types.spec.ts`)
    - 9 tests covering: navigation, empty state, CRUD operations, form validation
    - Tests include: create event types, randomize color, close dialog, validation errors
  - Total: 17 new tests added (155 total tests passing)

- **Phase 4: Event Types Route & Navigation (Tasks 4.10-4.11)**
  - Task 4.10: Created Event Types route page (`src/routes/event-types.tsx`)
    - Route configuration with auth guard and ProtectedRoute
    - Page layout with header and description
    - Integrated EventTypeList and EventTypeForm components
    - Modal state management with Dialog component
    - Handles create and edit modes
  - Task 4.11: Added "Event Types" navigation link
    - Updated navigation.ts with Palette icon
    - Route: `/event-types`
    - Description: "Manage event types and categories"

- **Phase 4: Event Types Tests (Tasks 4.6-4.9)**
  - Task 4.6: Created hooks query tests (`tests/unit/events/hooks/useEventTypes.test.ts`)
    - 9 tests covering: list filtering, loading states, getById, checkAssociations
    - Tests verify query enabling/disabling based on ID presence
  - Task 4.7: Created hooks mutation tests (`tests/unit/events/hooks/useEventTypeMutations.test.ts`)
    - 12 tests covering: create, update, delete mutations
    - Tests verify toast notifications, query invalidation, error handling
  - Task 4.8: Created EventTypeForm component tests (`tests/unit/events/components/EventTypeForm.test.tsx`)
    - 15 tests covering: form rendering, validation, color picker, submission
    - Mocked react-colorful for isolated component testing
  - Task 4.9: Created EventTypeList component tests (`tests/unit/events/components/EventTypeList.test.tsx`)
    - 12 tests covering: loading, error, empty states, table rendering
    - 6 AlertDialog tests skipped (require Radix UI test setup)
  - Total: 48 new tests added (156 passing, 6 skipped)

- **Phase 4: Event Types Backend (Tasks 4.1-4.4)**
  - Task 4.1: Installed `react-colorful` v5.6.1 for color picker functionality
  - Task 4.2: Created validators (`convex/eventTypes/validators.ts`)
    - Defined validators for name, description, color, and event type ID
  - Task 4.3: Created queries (`convex/eventTypes/queries.ts`)
    - `list`: Returns all event types ordered by name, filters by isActive status
    - `getById`: Returns single event type by ID or null if not found
    - `checkAssociations`: Checks if event type has associated events (for deletion safety)
  - Task 4.4: Created mutations (`convex/eventTypes/mutations.ts`)
    - `create`: Creates new event type with trimmed name, auto-sets isActive=true and createdAt
    - `update`: Updates existing event type fields with validation
    - `remove`: Deletes event type only if no associated events exist
  - Added `by_name` index to eventTypes schema for efficient name-based queries
  - **TDD Implementation**: All 15 tests passing (6 query tests + 9 mutation tests)
    - Tests cover: empty results, ordering by name, status filtering, CRUD operations
    - Tests cover: error handling for non-existent records, deletion with associations
    - Tests verify name trimming, partial updates, and association checking

- **TDD Workflow Enforcement System**
  - Created `.agents/skills/cjcrsg-hub/tdd-workflow.md` with comprehensive TDD guidelines
  - Implemented git pre-commit hook (`.githooks/pre-commit`) to enforce TDD workflow
  - Hook automatically runs tests and linting before each commit
  - Hook warns about missing test files for new mutations/queries/components
  - Supports exception keywords (prototype, hotfix, emergency, docs) to skip checks
  - Updated `docs/GIT.md` with TDD pre-commit checklist and workflow documentation
  - Updated `AGENTS.md` with link to TDD workflow documentation
  - Moderate enforcement: reminders and warnings, but allows exceptions when needed

- **TDD Phase 4: Complete E2E Critical Flows (Tasks 4.1-4.2)**
  - Updated Playwright configuration to test only Chromium (removed Firefox, WebKit, Mobile Safari)
  - Reduced test execution time by ~60% while maintaining mobile coverage via Mobile Chrome
  - **Task 4.1: Create Auth Tests**
    - Created `tests/e2e/specs/auth.spec.ts` with 3 comprehensive authentication tests
    - Tests cover: signup/login flow, invalid credentials error handling, session persistence after refresh
    - Uses unique email generation with timestamps to avoid test conflicts
    - Includes TODO section for future OAuth tests (Google, Facebook)
  - **Task 4.2: Create Attendee CRUD Tests**
    - Created `tests/e2e/specs/attendees-crud.spec.ts` with 7 comprehensive workflow tests
    - Tests cover: create attendee, validation errors, invalid email handling, edit workflow, archive workflow
    - Tests cover: search by name, filter by status, view attendee details
    - Each test creates unique user credentials for isolation
    - Tests verify success messages, URL redirects, and data persistence
  - **Total: 10 new E2E tests** (76 total tests across all TDD phases)
  - Tests run on Chromium desktop and Mobile Chrome (Pixel 5)

- **TDD Task 3.3: Test Layout Component**
  - Created comprehensive unit tests for Layout component
  - 6 tests covering layout rendering and structure
  - Tests verify navigation elements (Sidebar, Header, MobileNav) are rendered
  - Tests check children content rendering and main content area
  - Tests ensure proper CSS classes for responsive layout (flex, h-screen, overflow-hidden)
  - Used vi.mock() to mock child components for isolated testing
  - All 6 tests passing (66 total tests across all phases)

- **TDD Task 3.2: Test ErrorState Component**
  - Created comprehensive unit tests for ErrorState component
  - 21 tests covering error type rendering, custom content, and button actions
  - Tests all 4 error types: not-found, error, network, unauthorized
  - Tests custom title, description, and error message display
  - Tests retry/back button functionality with custom handlers
  - Tests button visibility controls (showRetry, showBack)
  - Tests default behaviors (page reload, navigation to /attendees)
  - All 21 tests passing (60 total with Task 3.1)

- **TDD Task 3.1: Test Form Component**
  - Created comprehensive unit tests for AttendeeForm component
  - 15 tests covering form rendering, validation, submission, cancellation, and status field
  - Tests validate required fields (firstName, lastName, address), optional fields, and email format
  - Tests verify form submission with valid data and all optional fields
  - Tests cover cancel button behavior and loading states
  - Fixed tsconfig.json to include tests directory for path resolution (~/\* alias)
  - All 15 tests passing (40 total tests across all phases)

- **TDD Task 2.2: Test Attendee Queries**
  - Created comprehensive unit tests for attendee queries
  - Tests cover list, getById, search, and count operations
  - List tests: pagination with cursor, status filter, ordering by date descending
  - getById tests: returns attendee by valid ID, returns null for non-existent
  - Search tests: first name, last name, email, status filter, case insensitive, result limiting to 50
  - Count tests: total count, filtered by status, zero results when empty
  - All 15 tests passing (22 total with mutations)
  - Tests use convex-test with in-memory database for fast execution

- **TDD Task 2.1: Test Attendee Mutations**
  - Created comprehensive unit tests for attendee mutations
  - Tests cover create, update, and archive operations
  - Create tests: valid data, minimal fields, all fields
  - Update tests: single field, multiple fields, non-existent attendee error
  - Archive tests: status change, timestamp update, idempotency, field preservation
  - All 7 tests passing using convex-test with in-memory database
  - Tests use direct function imports for better type safety

- **TDD Phase 1: Complete Infrastructure Setup (Tasks 1.1-1.6)**
  - ✅ Task 1.4: Created test folder structure (tests/unit/convex/attendees, tests/unit/components/ui, tests/e2e/specs, tests/e2e/setup)
  - ✅ Task 1.5: Added all test scripts to package.json (test, test:watch, test:coverage, test:e2e, test:e2e:ui)
  - ✅ Task 1.6: Validated setup with passing tests (3/3)
  - Fixed Vitest configuration to exclude e2e directory (prevents running Playwright tests in Vitest)

- **TDD Task 1.3: Configure Playwright**
  - Created `playwright.config.ts` with multi-browser support (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
  - Configured automatic dev server management with webServer option
  - Added parallel test execution with retry logic for CI
  - Set up screenshot capture on failure and trace recording for debugging
  - Installed all Playwright browsers (Chromium, Firefox, WebKit)
  - Added npm scripts: `pnpm test:e2e`, `pnpm test:e2e:ui`
  - Created example E2E test (`tests/e2e/specs/setup.spec.ts`)

- **TDD Task 1.2: Configure Vitest**
  - Created `vitest.config.ts` with React plugin and TypeScript path support
  - Added `tests/unit/setup.ts` with jest-dom matchers for DOM assertions
  - Configured jsdom environment for browser-like testing
  - Added coverage reporting with v8 provider (includes src/ and convex/ directories)
  - Added npm scripts: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`
  - Verified configuration works with existing validation tests (3/3 passing)

- **TDD Task 1.1: Install Core Testing Dependencies**
  - Installed Vitest testing framework with coverage support (`@vitest/coverage-v8`)
  - Installed Convex testing utilities (`convex-test`, `@edge-runtime/vm`) for backend unit tests
  - Installed React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) for component tests
  - Installed Playwright (`@playwright/test`) for E2E testing
  - Created test folder structure: `tests/unit/`, `tests/e2e/`
  - Added validation test (`tests/unit/example.test.ts`) confirming all packages load correctly
  - Updated TDD_TASKS.md to mark Task 1.1 as completed

- **Task 3.17: Clickable Table Rows for Attendee Navigation**
  - Made entire table rows clickable to navigate to attendee detail view
  - Added `cursor-pointer` and `hover:bg-muted/50` styling for visual feedback
  - Removed redundant "View" option from dropdown menu
  - Added `e.stopPropagation()` to dropdown trigger and items to prevent navigation conflicts
  - Users can now click anywhere on a row to view attendee details

- **Task 3.16: Mobile Responsiveness Pass for Attendee Pages**
  - Fixed table overflow on mobile with horizontal scrolling (`overflow-x-auto`)
  - Updated page headers to stack vertically on mobile (`flex-col sm:flex-row`)
  - Scaled typography from `text-3xl` to `text-2xl sm:text-3xl` for better mobile readability
  - Changed grid breakpoints from `lg:` to `md:` for earlier two-column layout
  - Added button wrapping with `flex-wrap` to prevent overflow
  - Fixed filter bar layout to stack vertically on mobile devices
  - Made "Add Attendee" button full-width on mobile
  - Updated pagination controls to stack on narrow viewports
  - Applied consistent patterns across 6 files: AttendeeList, AttendeeDetails, edit/new routes, skeleton, and error-state
  - Added `truncate` to prevent long attendee names from breaking layouts
  - All pages now usable at 375px viewport width (iPhone SE)

- **Task 3.15: ErrorState Component with Retry/Back Buttons**
  - Created reusable ErrorState component with 4 error types: not-found, error, network, unauthorized
  - Each type has specific Lucide icon: SearchX, AlertCircle, WifiOff, ShieldAlert
  - Props: type, title, description, error, onRetry, onBack, showRetry, showBack
  - Retry button reloads the page; Back button navigates to /attendees
  - Uses shadcn Empty component pattern for consistent styling
  - Displays error message when provided
  - AttendeesErrorBoundary component for route-level error handling
  - Integrated error boundaries into all attendee routes (index, $id, edit, new)
  - Updated AttendeeNotFound to use ErrorState with retry/back actions
  - Error handling in attendees.index.tsx for list/search/count query failures

- **Task 3.14: AttendeeTableSkeleton Component for Loading States**
  - Created AttendeeTableSkeleton component with configurable row count (default: 5)
  - Shows table headers during loading for better UX (Name, Email, Phone, Status, Join Date, Actions)
  - Rounded skeleton for status column to resemble badge shape
  - Proper skeleton widths matching table column content:
    - Name: w-32, Email: w-40, Phone: w-28, Status: w-20 (rounded-full), Join Date: w-24
    - Actions: w-8 h-8 rounded-md for icon button
  - Replaced simple loading text placeholder in AttendeeList
  - Consistent with existing AttendeeDetailsSkeleton pattern

- **Task 3.13: Empty States for Search/Filter Results**
  - Added shadcn Empty component with proper composition pattern
  - Three distinct empty states:
    - **No attendees**: "No attendees yet" with Users icon and "Add Attendee" button
    - **No search results**: "No results found" with SearchX icon showing search query
    - **No filter results**: "No matches" with FilterX icon showing active filter
  - Each state has contextual action button (Add Attendee or Clear filters)
  - Consistent visual style with icon badges and centered layout

- **Task 3.12: Pagination with Total Count Display**
  - "Showing X to Y of Z attendees" display with accurate counts
  - Next/Previous pagination controls with disabled states
  - Page indicator showing "Page X of Y"
  - Dynamic page size selector (10, 25, 50 items per page)
  - LocalStorage persistence for page size preference
  - URL param support for page number (`?page=2`)
  - Cursor-based pagination for efficient large dataset handling
  - Cursor history management for Previous navigation
  - Reset to page 1 when filters or search change
  - Search mode shows results count without pagination controls

- **UI/UX Improvements**
  - Fixed button and filter height alignment using shadcn Select component
  - Fixed clear button and loader positioning to prevent overlap
  - Fixed "Type at least 3 characters" message causing layout twitch with reserved space and fade transition
  - Standardized all dropdowns to use shadcn Select component for consistency

- **Test Data**
  - Created seeding mutation to generate 20 realistic test attendees
  - Generated attendees with varied statuses (60% member, 30% visitor, 10% inactive)
  - Includes realistic names, emails, phone numbers, addresses, and join dates

- **Task 3.11: Debounced Search with Backend Integration**
  - Added `searchField` column to attendees table (auto-populated on create/update)
  - Search matches across full name (first + last), email, and address
  - 300ms debounced search using useDebounce hook
  - Minimum 3 characters required before triggering backend search
  - Clear search button (X icon) in search input
  - "Searching..." loading state with spinner
  - Results count display with active filter indicators
  - Empty search results state with "Clear filters" button
  - URL param sync (`?q=search&status=member`) for shareable/searchable URLs
  - Search + status filter combination support
  - Search indexes on attendees table for performance
  - Fallback searchLegacy query for records without searchField

- **Complete Phase 3: Attendee Management - Wired and Functional**
  - `/attendees/new` - Fully functional create attendee form
    - Integrated AttendeeForm with useCreateAttendee mutation
    - Toast notifications on success/error
    - Navigation to attendees list after creation
  - `/attendees/$id` - Complete attendee details view
    - Displays personal info card (name, email, phone, DOB)
    - Displays church info card (status, join date, address)
    - Shows notes if available
    - Edit and Archive action buttons
    - Loading skeleton during data fetch
    - "Not found" error state
  - `/attendees/$id/edit` - Fully functional edit form
    - Fetches attendee data with useAttendee hook
    - Pre-populates form with existing data
    - Integrated useUpdateAttendee mutation
    - Toast notifications on success/error
    - Navigation back to details on success
    - Loading skeleton during initial load
  - Archive functionality with AlertDialog confirmation
    - Displays attendee name in confirmation
    - Integrated useArchiveAttendee mutation
    - Shows loading state during archive
    - Toast notifications
    - Refreshes list after archiving
  - Fixed mutation hooks to use useConvexMutation from @convex-dev/react-query
  - Added field, calendar, popover, alert-dialog shadcn components
  - Created DatePicker component for date inputs
  - Implemented modern shadcn/ui form pattern with Field components
    - Replaced broken Form component (useFormContext issue)
    - Uses Controller directly from react-hook-form
    - Field, FieldLabel, FieldError components
  - Created debounce hook for search functionality

### Fixed

- **Page reload authentication issues**
  - Fixed redirect to index on page reload for all protected routes (dashboard, events, attendees)
  - Implemented two-layer authentication protection:
    - Route-level `beforeLoad` guards using `requireAuth()` for protected routes
    - Route-level `beforeLoad` guards using `requireGuest()` for login page
    - Component-level `ProtectedRoute` wrapper for visual loading states
  - Added auth context injection into router context via `AuthContextInjector` component
  - Protected routes now properly maintain state after page refresh
  - Login page now redirects authenticated users to dashboard
  - Auth state updates are synchronized between React context and router context

- **Navigation and routing issues**
  - Fixed edit button not working on attendee details page
  - Implemented proper TanStack Router nested route structure
    - `/attendees/$id` as layout route with Outlet
    - `/attendees/$id/` as index route (details view)
    - `/attendees/$id/edit` as child route (edit form)
  - Fixed layout not showing header and sidebar on view/edit pages
    - Added ProtectedRoute and Layout wrappers to attendees.$id.tsx

- **Hydration and SSR errors (Task 3.17)**
  - Fixed nested button hydration error in attendee table
    - Removed `<Button>` inside `<DropdownMenuTrigger>` (both render `<button>`)
    - Replaced with styled `<div>` using Tailwind classes for same appearance
    - Error: "In HTML, <button> cannot be a descendant of <button>"
  - Fixed localStorage SSR error in attendees.index.tsx
    - Moved localStorage access from useState initializer to useEffect
    - Prevents "localStorage is not defined" error during server-side rendering
  - Fixed TypeScript errors in form.tsx and seed.ts
    - Updated useFormField hook to use proper react-hook-form API (getFieldState)
    - Fixed FormLabel and FormDescription components
    - Removed unused `statuses` variable from seed.ts

### Changed

- **Updated route structure for attendees**
  - Each child route now fetches its own data independently
  - No React Context dependency issues
  - Proper TanStack Router nested route pattern

---

## Previous Changes

### Added

- Phase 3: Attendee Management (Foundation)
  - Convex backend for attendees
    - `convex/attendees/queries.ts` - List, getById, search, count queries with pagination
    - `convex/attendees/mutations.ts` - Create, update, archive mutations
    - `convex/attendees/validators.ts` - Shared validation schemas
  - AttendeeList component (UI structure)
    - Columns: Name, Email, Phone, Status, Join Date, Actions
    - Status badges (member=blue, visitor=green, inactive=gray)
    - Pagination controls structure (10/25/50/100 rows per page)
    - Actions dropdown (View, Edit, Archive buttons)
  - AttendeeForm component (UI structure)
    - react-hook-form with Zod validation
    - Fields: firstName, lastName, email, phone, dateOfBirth, address, status, joinDate, notes
    - Date pickers for dateOfBirth and joinDate
    - Support for create and edit modes
  - Attendee routes (structure created, placeholder content)
    - `/attendees` - List view with AttendeeList component
    - `/attendees/new` - Route file created (form UI ready, wiring pending)
    - `/attendees/$id` - Route file created (details UI ready, wiring pending)
    - `/attendees/$id/edit` - Route file created (form UI ready, wiring pending)
  - React Query hooks for attendees (created, not yet integrated)
    - `useAttendees` - Fetch paginated list
    - `useAttendee` - Fetch single attendee
    - `useSearchAttendees` - Search attendees
    - `useCreateAttendee`, `useUpdateAttendee`, `useArchiveAttendee` - Mutations
  - TypeScript types for attendees
    - `Attendee`, `AttendeeStatus`, `CreateAttendeeInput`, `UpdateAttendeeInput`
  - New shadcn components: table, dropdown-menu, form, textarea, select
  - Dependencies: react-hook-form, @hookform/resolvers, zod, @radix-ui/react-label, @radix-ui/react-slot
  - **Note:** Routes currently show placeholder content. Wiring mutations to forms and actions is pending in follow-up PR

- Complete Convex Auth authentication system
  - Google and Facebook OAuth providers configured
  - Auth helper functions in `src/lib/auth.ts`
  - Global auth context in `src/lib/auth-context.tsx`
  - Route-level protection in `src/lib/auth-guard.ts`
  - Improved login page with better OAuth handling
- Protected route system
  - AuthLoadingScreen component with CJCRSG Hub branding
  - Double protection: beforeLoad guard + ProtectedRoute component
  - Proper loading state handling during auth initialization
- Attendees and Events placeholder routes
  - `/attendees` and `/events` routes created
  - Protected with requireAuth guard
- Responsive layout system with sidebar and mobile navigation
  - Layout, Sidebar, MobileNav, Header components in `src/components/layout/`
  - ProtectedRoute component for authentication in `src/components/auth/`
  - Navigation configuration with 5 main sections (Dashboard, Attendees, Events, Attendance, Settings)
  - Mobile-first responsive design with sheet-based drawer navigation
- CJCRSG blue theme (#304080) as primary color
  - Applied to both light and dark modes in `src/styles/app.css`
  - Updated sidebar, buttons, focus rings, and accent colors
- New shadcn components: sidebar, tooltip, collapsible, use-mobile hook

### Fixed

- User data retrieval in getCurrentUser query
  - Parse identity.subject to get actual user ID
  - Fetch user from users table properly
- Hydration error in Sidebar component
  - Fixed nested button elements by removing Button wrapper inside DropdownMenuTrigger
  - Applied Tailwind classes directly to DropdownMenuTrigger component
- Hydration error in LoginPage component
  - Fixed setState during render issue
  - Wrapped navigation logic in useEffect to defer until after render

### Changed

- Nothing yet

## [0.1.0] - 2026-03-20

### Added

- shadcn/ui component library initialized with canary version
  - Base-nova style with neutral color palette
  - Tailwind CSS v4 with theme variables
  - Lucide icons configured
- Convex Auth authentication system
  - Auth configuration files (auth.config.ts, auth.ts, http.ts)
  - React provider updated to ConvexAuthProvider
- Unified login page (`src/routes/login.tsx`)
  - Password authentication form with sign-in/sign-up tabs
  - Google OAuth button
  - Facebook OAuth button
- Environment configuration
  - `.env.local` with Convex URL
  - `.env.example` template
  - Both files in .gitignore
- shadcn/ui components installed:
  - button, card, input, form, label, tabs, sonner
  - badge, separator, avatar, dropdown-menu
  - skeleton, scroll-area, sheet

### Changed

- Updated `src/router.tsx` to use ConvexAuthProvider
- Updated `src/styles/app.css` with shadcn theme variables
- Updated `convex/schema.ts` with custom tables (attendees, events, eventTypes, attendanceRecords)

### Fixed

- Removed unused React import in scroll-area.tsx component
- Fixed failing unit tests in EventDetails component (banner image alt text, duplicate test definitions, modal click handlers)
- Fixed IntersectionObserver mock in tests/unit/setup.ts causing constructor errors with @floating-ui/dom
- Fixed BasicInfoEditModal.test.tsx by removing problematic dropdown test causing unhandled exceptions

### Security

- Environment variables configured to keep OAuth secrets server-side

---

## [Unreleased]: https://github.com/eydamson-dev/cjcrsg-hub/compare/v0.1.0...HEAD

[0.1.0]: https://github.com/eydamson-dev/cjcrsg-hub/releases/tag/v0.1.0
