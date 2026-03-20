# Implementation Tasks

Complete checklist of all implementation tasks for CJCRSG-Hub.

---

## 🎯 Current Session

**Updated:** 2026-03-21

**Phase:** Phase 3 - ✅ COMPLETE (All Tasks 3.1-3.17 Done)
**Current Task:** Task 3.17 - Make attendee table rows clickable to navigate to view page
**Status:** ✅ Task 3.17 Complete | ✅ Phase 3 Complete

**Completed This Session (Task 3.17 - Clickable Table Rows):**

- ✅ **AttendeeList.tsx** - Made table rows clickable:
  - Added `onClick` handler to `TableRow` that navigates to attendee detail view
  - Added `cursor-pointer` and `hover:bg-muted/50` classes for visual feedback
  - Removed redundant "View" option from dropdown menu
  - Added `e.stopPropagation()` to dropdown trigger and items to prevent navigation when clicking actions
  - Users can now click anywhere on a row to view details

- ✅ **Bug Fixes:**
  - Fixed hydration error: "In HTML, <button> cannot be a descendant of <button>"
    - Removed `<Button>` inside `<DropdownMenuTrigger>` (both render buttons)
    - Replaced with styled div using Tailwind classes
  - Fixed localStorage SSR error: "localStorage is not defined"
    - Moved localStorage access from useState to useEffect
  - Fixed TypeScript errors in form.tsx and seed.ts
    - Updated useFormField hook to use proper react-hook-form API
    - Fixed FormLabel and FormDescription components
    - Removed unused `statuses` variable from seed.ts

**Files Modified:** 4 files

- `AttendeeList.tsx` - Row click handler, removed View from dropdown
- `button.tsx` - Added "use client" directive
- `form.tsx` - Fixed react-hook-form API usage
- `seed.ts` - Removed unused variable
- `attendees.index.tsx` - Fixed localStorage SSR issue

**Testing:**

- ✅ Console errors resolved (no hydration errors)
- ✅ Table rows navigate to detail page on click
- ✅ Dropdown menu works without triggering navigation
- ✅ Edit and Archive actions work correctly
- ✅ TypeScript compiles without errors

**Reminders:**

- Use `pnpm` (not npm)
- Test before asking to commit
- Create feature branches
- Wait for user approval before committing
- **Update `TASKS.md` "Current Session" section when starting/completing tasks**

**Next Steps:**

- **Begin Phase 4: Event Types (Admin)**
  - Create event type queries and mutations
  - Build EventTypeList and EventTypeForm components
  - Create settings page for admin

---

## 🐛 Bug Fixes (Outside Task List)

### ✅ Page Reload Authentication Redirect Issue

**Status:** Fixed and merged
**PR:** #15

**Problem:** Reloading any page (except attendees) would redirect to index/dashboard
**Solution:** Implemented two-layer authentication protection with route-level `beforeLoad` guards

**Changes:**

- Added `beforeLoad` guards with `requireAuth()` to all protected routes
- Added `beforeLoad` guards with `requireGuest()` to login page
- Created `AuthContextInjector` to sync auth state with router context
- Updated `ProtectedRoute` to handle visual loading states only

**Files Modified:**

- `src/routes/__root.tsx`, `src/router.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/routes/login.tsx`
- All protected route files (index, events, attendees/\*)
- `CHANGELOG.md` (added entry under [Unreleased] → Fixed)

---

## Prerequisites

Before starting implementation, ensure you have:

- [x] Node.js 18+ installed (`node -v` to check)
- [x] pnpm installed globally (`npm install -g pnpm`)
- [x] Git configured with GitHub SSH keys
- [x] Repository cloned: `git clone git@github.com:eydamson-dev/cjcrsg-hub.git`
- [x] Convex CLI available (`pnpm dlx convex -h` to verify)

---

## ✅ Completed Setup

- [x] Initialize git repository
- [x] Setup GitHub remote (git@github.com:eydamson-dev/cjcrsg-hub.git)
- [x] Configure .gitignore
- [x] Create comprehensive AGENTS.md documentation
- [x] Create README.md with project overview

---

## Phase 1: Foundation Setup

### 1.1 Initialize shadcn/ui with canary version

- [x] Run `pnpm dlx shadcn@canary init` to initialize the component library
  - This will configure Tailwind CSS v4 with the new @tailwindcss/vite plugin
  - Creates `components.json` configuration file with project settings
  - Sets up CSS variables and theme system in `src/styles/app.css`
  - During setup: Choose "New York" style and "Zinc" base color
  - Verified by checking that shadcn theme variables exist in app.css
  - Tested by importing a button component and verifying it renders

**💡 Tip:** Use the shadcn MCP tool or ask the AI about shadcn components.
The shadcn skill is installed at `.agents/skills/shadcn/` for comprehensive guidance.

### 1.2 Setup Convex Auth

- [x] Install Convex Auth packages:

  ```bash
  pnpm add @convex-dev/auth @auth/core@0.37.0
  ```

- [x] Initialize Convex Auth (creates auth tables, configuration):

  ```bash
  npx @convex-dev/auth
  ```

  This will:
  - Add `authTables` to `convex/schema.ts`
  - Create necessary auth configuration files
  - Setup initial auth structure

- [x] Configure authentication providers in Convex:
  - **Password auth:** Enabled by default (no email verification)
  - **Google OAuth:** Added to `convex/auth.ts` (credentials pending setup)
    - Provider configured with environment variables: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
    - UI buttons ready, credentials need to be added to Convex dashboard
  - **Facebook OAuth:** Added to `convex/auth.ts` (credentials pending setup)
    - Provider configured with environment variables: `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET`
    - UI buttons ready, credentials need to be added to Convex dashboard

- [x] Update React provider in `src/router.tsx`:
  - Replaced `ConvexProvider` with `ConvexAuthProvider` from `@convex-dev/auth/react`
  - Kept existing TanStack Query integration
  - Auth context is available

- [x] Create auth client configuration:
  - Create `src/lib/auth.ts` for auth helper functions
  - Add `useAuth` hook integration
  - Setup auth session management

- [x] Create unified login page at `src/routes/login.tsx`:
  - Design with tabs or sections:
    - **Password Login:** Email + password fields
    - **OAuth Login:** Google and Facebook sign-in buttons
  - Used shadcn/ui components: `Card`, `Tabs`, `Input`, `Button`, `Form`
  - Added loading states and error handling

- [x] Combined login/signup in `src/routes/login.tsx`:
  - Password registration form (email + password)
  - OAuth signup options (Google, Facebook)
  - No email verification step (as requested)
  - Redirect to dashboard after successful signup

- [ ] Test all three auth methods:
  - [ ] Password login works (create test account)
  - [ ] Google OAuth login works (test with Google account) - requires credentials
  - [ ] Facebook OAuth login works (test with Facebook account) - requires credentials
  - [ ] Protected routes require authentication
  - [ ] Session persists after page refresh
  - [ ] User can sign out and sign back in with different method

### 1.3 Configure environment variables

- [x] Verify `.env.local` exists and is in `.gitignore`
  - Add required variables:

    ```
    # Convex
    CONVEX_DEPLOYMENT=          # Auto-set by convex dev
    VITE_CONVEX_URL=http://127.0.0.1:3210  # Local Convex URL
    ```

  - Note: OAuth credentials (Google/Facebook) are configured in the Convex dashboard
    as server-side environment variables, not in .env.local

- [x] Create `.env.example` template file for documentation
- [x] Both files added to `.gitignore`
- [x] Verified environment variables load correctly in the app

### 1.4 Create base layout with navigation

- [x] Create `src/components/layout/Layout.tsx` component
  - Design responsive sidebar navigation for desktop
  - Create mobile bottom navigation for screens < 768px
  - Add navigation items with icons:
    - Dashboard (LayoutDashboard icon)
    - Attendees (Users icon)
    - Events (CalendarDays icon)
    - Attendance (CheckSquare icon)
    - Settings (Settings icon)
  - Install and use shadcn/ui: `Sidebar`, `Button`, `Separator`, `Sheet` (mobile)
  - Add church branding/logo area in header
  - Create `src/routes/_layout.tsx` route wrapper
  - Test responsive behavior by resizing browser window

### 1.5 Setup protected routes

- [x] Create `src/components/auth/ProtectedRoute.tsx` wrapper component
  - Implement auth check using Convex `useAuth` hook
  - Redirect unauthenticated users to `/login`
  - Add loading state while checking authentication status
  - Test that protected routes require authentication

### 1.5b Fix Route Guard Timing Issue

- [x] Create auth context provider (`src/lib/auth-context.tsx`)
  - Provide auth state globally via React Context
  - Include `isAuthenticated`, `isLoading`, and `token` values
  - Wrap app with AuthProvider in root route
- [x] Create route guard utilities (`src/lib/auth-guard.ts`)
  - Implement `requireAuth` guard for protected routes
  - Implement `requireGuest` guard for auth pages (login/signup)
  - Handle loading states properly (wait for auth before redirect)
- [x] Update router to include auth context
  - Modify `src/router.tsx` to provide auth context
  - Ensure auth state is available in `beforeLoad` hooks
- [x] Add route-level protection to all protected routes
  - [x] Dashboard (`/`) - `beforeLoad: requireAuth`
  - [x] Attendees (`/attendees`) - `beforeLoad: requireAuth`
  - [x] Events (`/events`) - `beforeLoad: requireAuth`
  - [x] Login (`/login`) - `beforeLoad: requireGuest`
- [x] Update ProtectedRoute component to use auth context
  - Import and use `useAuthContext` hook
  - Show loading state during auth initialization
  - Prevent premature redirects
- [x] Create branded AuthLoadingScreen component
  - Create `src/components/auth/AuthLoadingScreen.tsx`
  - Include CJCRSG Hub branding with cross icon
  - Add branded spinner and loading message
  - Use in ProtectedRoute and route guards
- [x] Test page refresh scenarios
  - [x] Refresh while authenticated: Stay on page (no login flash)
  - [x] Refresh while logged out: Redirect to login
  - [x] Access login while authenticated: Redirect to dashboard
  - [x] No "Already signed in" flash on refresh

### 1.5c Fix Hydration Errors

- [x] Fix Sidebar nested button hydration error
  - **Issue:** DropdownMenuTrigger contained Button component, creating nested `<button>` elements
  - **Location:** `src/components/layout/Sidebar.tsx` - lines 84-95
  - **Fix:** Removed Button wrapper, applied Tailwind classes directly to DropdownMenuTrigger
  - **Result:** No more HTML nesting errors
- [x] Fix LoginPage setState during render error
  - **Issue:** navigate() called during component render phase
  - **Location:** `src/routes/login.tsx` - lines 26-27
  - **Fix:** Wrapped navigation in useEffect hook
  - **Result:** Navigation happens after render, not during
- [x] Remove leftover template file (anotherPage.tsx)
- [x] Verify fixes with browser console (0 hydration errors)

### 1.6 Create Attendees and Events Routes

- [x] Create `src/routes/attendees.index.tsx`
  - Route guard: `beforeLoad: requireAuth`
  - ProtectedRoute wrapper component
  - Layout wrapper
  - Placeholder content for attendee management
  - (Full attendee management comes in Phase 3)
- [x] Create `src/routes/events.index.tsx`
  - Route guard: `beforeLoad: requireAuth`
  - ProtectedRoute wrapper component
  - Layout wrapper
  - Placeholder content for event management
  - (Full event management comes in Phase 4)
- [x] Update sidebar navigation links
  - Attendees → `/attendees`
  - Events → `/events`
  - Ensure links work and navigate properly

**Commands:**

```bash
# Initialize shadcn/ui (requires canary for TanStack Start)
pnpm dlx shadcn@canary init

# Install Convex Auth packages
pnpm add @convex-dev/auth @auth/core@0.37.0

# Initialize Convex Auth (sets up tables and config)
npx @convex-dev/auth

# Add base components
pnpm dlx shadcn@canary add button card input form dialog table badge
pnpm dlx shadcn@canary add select date-picker tabs toast command tabs
```

---

## Phase 2: Database Schema & Auth

### 2.1 Create schema.ts with all tables

- [x] Update `convex/schema.ts` with complete database schema
  - Define all four core tables with proper validators
  - Add indexes for efficient queries:
    - attendees: by_status, by_email, by_phone
    - events: by_date, by_eventTypeId
    - attendance_records: by_eventId, by_attendeeId
  - Use `v.id()` for foreign key references
  - Add `searchIndex` for attendee full-text search
  - Run `pnpm dlx convex dev --once` to apply schema
  - Verify schema in Convex dashboard

### 2.2 Configure Convex Auth

- [x] Verify `convex/auth.config.ts` exists (created by `npx @convex-dev/auth`)
  - Configure OAuth providers (Google, Facebook) in the file
  - Set up password authentication (enabled by default)
  - Ensure email verification is disabled (as requested)
  - Test that auth configuration loads without errors
  - Run `pnpm dlx convex dev --once` to apply auth configuration

### 2.3 Verify Convex Auth integration

- [x] Check that Convex Auth is properly integrated
  - Verify `ConvexAuthProvider` is used in `src/router.tsx`
  - Confirm auth context is available throughout the app
  - Test that auth routes are handled automatically by Convex Auth
  - No custom API routes needed (Convex Auth handles this internally)

### 2.4 Create login/signup pages

- [x] Create `src/routes/login.tsx` route file
  - Build login form with email/password fields
  - Add OAuth buttons: "Continue with Google" and "Continue with Facebook"
  - Use shadcn/ui components: `Card`, `Tabs`, `Input`, `Button`, `Form`
  - Implement form validation with react-hook-form + Zod
  - Integrate with Convex Auth using `useAuth` hook
  - Add error handling and display error messages
  - Combined login/signup in single page with tabs

### 2.5 Test authentication flow

- [x] Manually test complete auth flow:
  - Sign up new user
  - Sign in with credentials
  - Access protected routes
  - Sign out
  - Verify redirect to login when unauthenticated
- [x] Test edge cases:
  - Wrong password shows error
  - Non-existent user shows error
  - Session persists after page refresh

---

## Phase 3: Attendee Management

### 3.1 Create attendee queries (list, get, search)

- [x] Create `convex/attendees/queries.ts` file
  - Implement `list` query with pagination support
  - Add `getById` query to fetch single attendee
  - Create `search` query using Convex searchIndex
  - Support filtering by status (member, visitor, inactive)
  - Add sorting options (by name, by joinDate)
  - Write corresponding validators in `convex/attendees/validators.ts`

### 3.2 Create attendee mutations (create, update)

- [x] Create `convex/attendees/mutations.ts` file
  - Implement `create` mutation for new attendees
  - Add `update` mutation for existing attendees
  - Create `archive` mutation to soft-delete (set inactive)
  - Add input validation with validators
  - Set `updatedAt` timestamp on every update
  - Generate unique IDs automatically

### 3.3 Build AttendeeList component with data table

- [x] Create `src/features/attendees/components/AttendeeList.tsx`
  - Use shadcn/ui `Table` component as base
  - Implement TanStack Table for sorting/filtering
  - Add columns: Name, Email, Phone, Status, Join Date, Actions
  - Add status badges with color coding
  - Implement pagination controls
  - Add "New Attendee" button linking to creation form

### 3.4 Build AttendeeForm component

- [x] Create `src/features/attendees/components/AttendeeForm.tsx`
  - Use shadcn/ui form components: `Form`, `Input`, `Label`, `Select`
  - Implement react-hook-form with Zod validation schema
  - Add fields: firstName, lastName, email, phone, dateOfBirth, address, status, notes
  - Add DatePicker for dateOfBirth field
  - Implement form submission handler
  - Support both create and edit modes

### 3.5 Create route files (placeholders)

- [x] Create `src/routes/attendees.index.tsx` - List view with basic wiring
- [x] Create `src/routes/attendees.new.tsx` - Placeholder route
- [x] Create `src/routes/attendees.$id.tsx` - Placeholder route
- [x] Create `src/routes/attendees.$id.edit.tsx` - Placeholder route
- [x] Ensure all routes are protected (require auth)

### 3.6 Wire up /attendees/new route (Create Attendee)

- [x] Replace placeholder with AttendeeForm component
- [x] Integrate `useCreateAttendee` mutation hook
- [x] Handle form submission with create mutation
- [x] Add validation before submission
- [x] Show loading state on submit button
- [x] Add success toast notification after creation
- [x] Navigate to attendee list on success
- [x] Show error toast on failure with specific message
- [x] Handle duplicate email error gracefully

### 3.7 Wire up /attendees/$id/edit route (Edit Attendee)

- [x] Replace placeholder with AttendeeForm component
- [x] Fetch attendee data with `useAttendee` hook
- [x] Show loading skeleton while fetching data
- [x] Handle "not found" error state
- [x] Pre-populate form with existing attendee data
- [x] Integrate `useUpdateAttendee` mutation hook
- [x] Handle form submission with update mutation
- [x] Add success toast notification after update
- [x] Navigate to attendee details on success
- [x] Show error toast on failure

### 3.8 Wire up /attendees/$id route (Attendee Details)

- [x] Replace placeholder with actual attendee display
- [x] Fetch attendee data with `useAttendee` hook
- [x] Show loading skeleton while fetching
- [x] Display all attendee fields in organized card layout
  - Personal info card: Name, email, phone, date of birth
  - Church info card: Status, join date, address
  - Notes card: Additional notes
- [x] Handle "attendee not found" state with helpful message
- [x] Add edit button linking to edit route
- [x] Add archive button with confirmation
- [x] Add "Back to list" navigation

### 3.9 Wire up archive action in AttendeeList

- [x] Add AlertDialog for archive confirmation
- [x] Display attendee name in confirmation message
- [x] Integrate `useArchiveAttendee` mutation hook
- [x] Call archive mutation on confirmation
- [x] Show loading state during archive
- [x] Show success toast after archiving
- [x] Refresh attendee list after archive (optimistic or refetch)
- [x] Handle error cases with error toast
- [x] Disable archive button for already inactive attendees

### 3.10 Install and configure toast notification system

- [x] Install sonner toast library (already present in \_\_root.tsx)
- [x] Toast notifications working across all attendee pages
- [x] Success toasts on create, update, archive operations
- [x] Error toasts on mutation failures

### 3.11 Implement debounced search functionality

- [x] Replace local search state with backend search integration
- [x] Integrate `useSearchAttendees` hook with 300ms debounce
- [x] Add clear search button (X icon) in search input
- [x] Show "Searching..." loading state while fetching
- [x] Display search results count
- [x] Sync search query with URL params (`?q=search-term`)
- [x] Read search param from URL on page load
- [x] Combine search + status filter (both work together)
- [x] Handle empty search results state
- [x] Add "No results found" message with clear search option

### 3.12 Add pagination with total count display

- [x] Display "Showing X to Y of Z attendees" text above table
- [x] Wire up pagination controls to backend pagination
- [x] Handle next/previous page navigation
- [x] Show disabled state when on first/last page
- [x] Maintain page number in URL params
- [x] Reset to page 1 when applying filters/search
- [x] Add dynamic page size selector (10, 25, 50)
- [x] Add localStorage persistence for page size preference
- [x] Fix UI alignment issues (button/filter height, clear button positioning)
- [x] Fix layout twitch with reserved space for search hint message

### 3.13 Add empty states for attendee list ✅

- [x] Empty state for no attendees at all with Users icon and "Add Attendee" button
- [x] Empty state for no search results with SearchX icon and "Clear search" button
- [x] Empty state for filter with no results with FilterX icon and "Clear filter" button
- [x] Use shadcn Empty component for consistent styling

### 3.14 Add loading skeletons

- [x] Loading skeletons in edit form during initial load
- [x] Loading skeletons in details view during fetch
- [x] Create AttendeeTableSkeleton component for list view

### 3.15 Improve error states

- [x] Handle "not found" errors with helpful messages
- [x] Create ErrorState component with retry/back buttons
- [x] Add error boundary for attendee pages

### 3.16 Mobile responsiveness pass ✅

- [x] Test attendee list on mobile viewport (375px)
- [x] Test attendee form on mobile
- [x] Test attendee details on mobile

### 3.17 Make attendee table rows clickable to navigate to view page

- [x] Add onClick handler to TableRow component to navigate to attendee detail view
- [x] Add cursor-pointer and hover styling to table rows
- [x] Remove "View" option from dropdown menu (redundant since row click handles it)
- [x] Add stopPropagation to dropdown menu to prevent navigation when clicking actions
- [x] Test navigation works correctly when clicking anywhere on the row
- [x] Verify dropdown menu still works without triggering navigation

---

## Phase 4: Event Types (Admin)

### 4.1 Create event type queries

- [ ] Create `convex/eventTypes/queries.ts`
  - Implement `list` query to get all active event types
  - Add `getById` query for single event type
  - Support filtering by isActive status
  - Order by name alphabetically
  - Create validators in `convex/eventTypes/validators.ts`

### 4.2 Create event type mutations

- [ ] Create `convex/eventTypes/mutations.ts`
  - Implement `create` mutation with name, description, color
  - Add `update` mutation for modifying existing types
  - Create `toggleActive` mutation to soft-delete
  - Ensure only admins can modify event types

### 4.3 Build EventTypeList component

- [ ] Create `src/features/events/components/EventTypeList.tsx`
  - Display event types as cards or table rows
  - Show color indicator for each type
  - Add "Edit" and "Delete" action buttons
  - Implement confirmation dialog for delete
  - Add "New Event Type" button
  - Handle empty state

### 4.4 Build EventTypeForm component

- [ ] Create `src/features/events/components/EventTypeForm.tsx`
  - Form fields: name, description, color picker
  - Use shadcn/ui `Form`, `Input`, `ColorPicker` (or custom)
  - Validate that name is unique
  - Support create and edit modes

### 4.5 Create settings page for admin

- [ ] Create `src/routes/settings.tsx` route
  - Add tabs: Event Types, General Settings, Admin Users
  - Implement Event Types tab with list and form
  - Add access control (admin only)
  - Style with shadcn/ui `Tabs` component

---

## Phase 5: Event Management

### 5.1 Create event queries

- [ ] Create `convex/events/queries.ts`
  - Implement `listUpcoming` for future events
  - Add `listPast` for historical events
  - Create `getById` for single event details
  - Add `listByType` filter
  - Support date range filtering
  - Order by date (upcoming: asc, past: desc)

### 5.2 Create event mutations

- [ ] Create `convex/events/mutations.ts`
  - Implement `create` mutation
  - Add `update` mutation
  - Create `cancel` mutation (set isActive false)
  - Validate that event type exists
  - Ensure date is in the future for new events

### 5.3 Build EventList component

- [ ] Create `src/features/events/components/EventList.tsx`
  - Display events in card or table format
  - Show: name, date, time, location, type (with color)
  - Add filter tabs: Upcoming, Past, All
  - Implement sorting (by date, by name)
  - Add "New Event" button
  - Show attendance count per event

### 5.4 Build EventForm component

- [ ] Create `src/features/events/components/EventForm.tsx`
  - Form fields: name, description, eventType (select), date, startTime, endTime, location
  - Use shadcn/ui `Select` for event type dropdown
  - Add DatePicker for date selection
  - Validate date is not in the past
  - Ensure end time is after start time
  - Support create and edit modes

### 5.5 Create routes: /events, /events/new, /events/$id

- [ ] Create `src/routes/events.index.tsx` - Event list
- [ ] Create `src/routes/events.new.tsx` - Create event
- [ ] Create `src/routes/events.$id.tsx` - Event details
- [ ] Create `src/routes/events.$id.edit.tsx` - Edit event
  - Set up route tree with proper nesting
  - Add breadcrumbs

### 5.6 Add event filtering by type

- [ ] Add dropdown filter to EventList
  - Populate filter options from event types
  - Filter events dynamically on selection
  - Show "Clear Filter" button when active
  - Update URL params with filter state

---

## Phase 6: Attendance Tracking

### 6.1 Create attendance queries

- [ ] Create `convex/attendance/queries.ts`
  - Implement `getByEvent` to list all attendees for an event
  - Add `getByAttendee` to show attendance history
  - Create `getStats` for event attendance statistics
  - Support date range queries
  - Add pagination for large events

### 6.2 Create attendance mutations

- [ ] Create `convex/attendance/mutations.ts`
  - Implement `checkIn` mutation
  - Add `unCheckIn` mutation (remove attendance)
  - Create `bulkCheckIn` for multiple attendees
  - Validate event exists and is active
  - Prevent duplicate check-ins
  - Set checkedInAt to current timestamp
  - Record checkedInBy (admin user ID)

### 6.3 Build AttendanceRecorder component

- [ ] Create `src/features/attendance/components/AttendanceRecorder.tsx`
  - Display current event info at top
  - Show real-time attendee list with checkboxes
  - Add "Select All" functionality
  - Display current attendance count
  - Add "Save" button to persist changes
  - Auto-refresh when others check in (Convex real-time)

### 6.4 Build AttendeeSelector (search & select)

- [ ] Create `src/features/attendance/components/AttendeeSelector.tsx`
  - Implement search input with debounce
  - Show search results in dropdown/command palette
  - Display attendee info: name, email, phone
  - Add "Quick Check-in" button next to results
  - Use shadcn/ui `Command` component

### 6.5 Build EventAttendanceList (real-time view)

- [ ] Create `src/features/attendance/components/EventAttendanceList.tsx`
  - Display all attendees who checked in
  - Show check-in time and checked-in-by user
  - Update in real-time via Convex subscriptions
  - Add option to remove check-in (undo)
  - Export to CSV button

### 6.6 Create routes: /attendance, /attendance/$eventId

- [ ] Create `src/routes/attendance.index.tsx` - Select event to record
- [ ] Create `src/routes/attendance.$eventId.tsx` - Record attendance
  - Show list of today's/upcoming events on index
  - Add navigation back to events list

### 6.7 Implement quick check-in flow

- [ ] Optimize for mobile/tablet usage
  - Large tap targets for easy selection
  - Auto-save on check (optional setting)
  - Sound or visual feedback on check-in
  - Test with actual check-in scenarios

---

## Phase 7: Dashboard & Polish

### 7.1 Create dashboard with stats

- [ ] Create `src/routes/dashboard.tsx` as default route
  - Implement grid layout for stat cards
  - Show metrics:
    - Total members count
    - Today's attendance (if event today)
    - This week's total attendance
    - New members this month
  - Use shadcn/ui `Card` components
  - Add icons to each stat
  - Fetch data from multiple Convex queries

### 7.2 Add recent attendance widget

- [ ] Create `src/features/dashboard/components/RecentAttendanceWidget.tsx`
  - Show last 5-10 attendance records
  - Display: attendee name, event name, check-in time
  - Link to full attendance page
  - Update in real-time

### 7.3 Add upcoming events widget

- [ ] Create `src/features/dashboard/components/UpcomingEventsWidget.tsx`
  - Show next 3-5 upcoming events
  - Display: event name, date, time, location
  - Add "Record Attendance" quick action button
  - Color-code by event type

### 7.4 Implement toast notifications

- [ ] Install and configure `sonner` or `@radix-ui/react-toast`
  - Add `src/components/ui/toaster.tsx`
  - Add toast calls for: Success, Error, Info operations
  - Position toasts top-right
  - Ensure auto-dismiss after 3-5 seconds

### 7.5 Add loading states

- [ ] Create `src/components/ui/skeleton.tsx` with shadcn
  - Add skeleton screens for: Attendee list, Event list, Form submission, Dashboard
  - Use appropriate skeleton shapes for content
  - Add loading spinners for buttons during submission

### 7.6 Responsive design pass

- [ ] Test all pages on mobile (375px), tablet (768px), desktop (1024px+)
  - Fix overflow issues on small screens
  - Ensure tables are scrollable horizontally on mobile
  - Test navigation on touch devices
  - Optimize images and assets
  - Test on actual mobile device if possible

---

_Last Updated: 2026-03-20_
