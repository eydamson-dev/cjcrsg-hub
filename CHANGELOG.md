# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
