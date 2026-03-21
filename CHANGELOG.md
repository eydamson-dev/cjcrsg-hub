# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

### Security

- Environment variables configured to keep OAuth secrets server-side

---

## [Unreleased]: https://github.com/eydamson-dev/cjcrsg-hub/compare/v0.1.0...HEAD

[0.1.0]: https://github.com/eydamson-dev/cjcrsg-hub/releases/tag/v0.1.0
