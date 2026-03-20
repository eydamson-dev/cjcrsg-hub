# Implementation Tasks

Complete checklist of all implementation tasks for CJCRSG-Hub.

---

## 🎯 Current Session

**Updated:** 2026-03-20

**Phase:** Phase 1 - Foundation Setup  
**Current Task:** Phase 1 complete - Ready for Phase 2
**Status:** ✅ Completed

**Recent Fixes:**

1. ✅ Fixed hydration error in sidebar
   - Root cause: `getCurrentUser` was returning undefined for user data
   - Issue: `ctx.auth.getUserIdentity()` returns identity with `subject` containing `"userId|accountId"`
   - Fix: Parse `identity.subject.split('|')[0]` to get actual user ID
   - Fetch user from `users` table using the parsed user ID
   - Now correctly returns user's name, email, and image

2. ✅ Phase 1 fully implemented and tested
   - Route guard timing issue fixed with auth context
   - ProtectedRoute component uses `useAuthContext` hook
   - AuthLoadingScreen component for branded loading state
   - Attendees and Events routes created with protection

**Completed:**

- ✅ shadcn/ui initialized with canary version
- ✅ Convex Auth packages installed and configured
- ✅ Login page created with password + OAuth auth
- ✅ Environment variables configured
- ✅ Base layout with navigation created
  - Desktop sidebar with CJCRSG branding
  - Mobile navigation with hamburger menu
  - ProtectedRoute component for auth checking
  - Responsive design for all screen sizes
  - Navigation items: Dashboard, Attendees, Events, Attendance, Settings
- ✅ OAuth providers added to `convex/auth.ts`
  - Google OAuth provider configured (credentials pending)
  - Facebook OAuth provider configured (credentials pending)
  - Auth utilities created in `src/lib/auth.ts`
  - OAuth buttons show inline error messages
- ✅ Schema updated with authTables (fixes registration)
- ✅ Password authentication working
- ✅ Auth context provider (`AuthProvider`) implemented
- ✅ Route guards implemented (requireAuth, requireGuest)
- ✅ ProtectedRoute component improved with AuthLoadingScreen
- ✅ Attendees and Events routes created with placeholder content
- ✅ Sign out functionality working on both desktop and mobile

**Implementation Notes:**

- Route guards use double protection: `beforeLoad` (route-level) + ProtectedRoute (component-level)
- AuthLoadingScreen shows CJCRSG Hub branding with cross icon
- Attendees and Events pages have placeholder content (Phase 3 features)
- OAuth credentials still pending (Google/Facebook setup deferred)
- `getCurrentUser` query follows standard Convex Auth pattern: parse subject → fetch from users table

**Reminders:**

- Use `pnpm` (not npm)
- Test before asking to commit
- Create feature branches
- Wait for user approval before committing

**Next Steps:**

- Move to Phase 2: Database Schema & Auth (already completed)
- Begin Phase 3: Attendee Management

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

- [ ] Create `convex/attendees/queries.ts` file
  - Implement `list` query with pagination support
  - Add `getById` query to fetch single attendee
  - Create `search` query using Convex searchIndex
  - Support filtering by status (member, visitor, inactive)
  - Add sorting options (by name, by joinDate)
  - Write corresponding validators in `convex/attendees/validators.ts`

### 3.2 Create attendee mutations (create, update)

- [ ] Create `convex/attendees/mutations.ts` file
  - Implement `create` mutation for new attendees
  - Add `update` mutation for existing attendees
  - Create `archive` mutation to soft-delete (set inactive)
  - Add input validation with validators
  - Set `updatedAt` timestamp on every update
  - Generate unique IDs automatically

### 3.3 Build AttendeeList component with data table

- [ ] Create `src/features/attendees/components/AttendeeList.tsx`
  - Use shadcn/ui `Table` component as base
  - Implement TanStack Table for sorting/filtering
  - Add columns: Name, Email, Phone, Status, Join Date, Actions
  - Add status badges with color coding
  - Implement pagination controls
  - Add "New Attendee" button linking to creation form

### 3.4 Build AttendeeForm component

- [ ] Create `src/features/attendees/components/AttendeeForm.tsx`
  - Use shadcn/ui form components: `Form`, `Input`, `Label`, `Select`
  - Implement react-hook-form with Zod validation schema
  - Add fields: firstName, lastName, email, phone, dateOfBirth, address, status, notes
  - Add DatePicker for dateOfBirth field
  - Implement form submission handler
  - Show success/error toast notifications
  - Support both create and edit modes

### 3.5 Create routes: /attendees, /attendees/new, /attendees/$id

- [ ] Create `src/routes/attendees.index.tsx` - List view
- [ ] Create `src/routes/attendees.new.tsx` - Create new attendee
- [ ] Create `src/routes/attendees.$id.tsx` - View attendee details
- [ ] Create `src/routes/attendees.$id.edit.tsx` - Edit attendee
  - Set up proper route structure in TanStack Router
  - Add breadcrumbs for navigation context
  - Ensure all routes are protected (require auth)

### 3.6 Add search functionality

- [ ] Add search input to AttendeeList component
  - Implement debounced search (300ms delay)
  - Use Convex `search` query with searchIndex
  - Show search results in real-time
  - Add clear search button
  - Maintain search query in URL params for shareability

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
