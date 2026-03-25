# CJCRSG-Hub Feature List

Complete feature catalog for the church management system.

**Last Updated:** 2026-03-26  
**Current Phase:** Phase 5 - Event Management (Complete)  
**Status:** 164 tests passing, all core features implemented + UI refinements

---

## Core Infrastructure

### Authentication System

- Email/password login with secure password hashing
- Google OAuth integration for one-click sign-in
- Facebook OAuth integration for social login
- Session persistence across page refreshes
- Automatic redirect to login for unauthenticated users

### Protected Routes

- Route-level authentication guards using TanStack Router
- Automatic redirect to `/login` when accessing protected pages
- Guest-only routes (login page redirects authenticated users to dashboard)
- Auth context provider for global auth state management

### Responsive Layout

- Fixed sidebar navigation for desktop (1024px+)
- Mobile hamburger menu with Sheet drawer navigation
- Church branding (CJCRSG Hub) in header and sidebar
- Touch-friendly navigation with large tap targets
- Collapsible sidebar sections for better organization

---

## Attendee Management

### Attendee CRUD

- **Create:** Form with first name, last name, email, phone, address, date of birth, status, notes
- **Read:** Paginated list with sorting and filtering
- **Update:** Edit any attendee field with validation
- **Archive:** Soft delete by setting status to "inactive"
- **View:** Detailed profile page showing all attendee information

### Search & Filter

- Real-time search by first name, last name, or email
- Debounced search input (300ms delay for performance)
- Status filter dropdown (member/visitor/inactive)
- Combined search + filter (e.g., "John" + status="member")
- Clear search button with single click

### Pagination

- Configurable page sizes: 10, 25, or 50 items per page
- Previous/Next navigation buttons
- Page number display with total count
- Persistent page size preference in localStorage
- Automatic reset to page 1 when applying filters

### Attendee Profiles

- Full profile view with all personal information
- Status badges with color coding (member=green, visitor=blue, inactive=gray)
- Join date and membership history
- Quick actions: Edit, Archive, Back to list
- Responsive card layout for mobile

---

## Event Types (Admin)

### Dynamic Event Categories

- Create custom event types (e.g., "Sunday Service", "Youth Night", "Prayer Meeting")
- Edit existing event type names and descriptions
- Delete event types (with usage check to prevent accidents)
- List all event types in sortable table

### Color Picker

- Visual color picker using react-colorful library
- Hex color input with validation
- Randomize button for quick color generation
- Color preview with real-time updates
- Color displayed as circle + hex value in table

### Inline Editing

- Click any event type row to open edit modal
- Create new event type via "Add Event Type" button
- Modal layout: Name (required), Description (optional), Color picker
- Right-aligned action buttons (Save first, then Cancel)
- Delete button in modal header for quick removal

---

## Event Management

### Event Lifecycle

- **Upcoming:** Default status for new events, shown in dashboard
- **Active:** Currently happening event (only one active at a time)
- **Completed:** Event has ended, moved to archive
- **Cancelled:** Event cancelled before or during, excluded from archive
- Status transitions enforced by backend (can't complete upcoming directly)

### Event Dashboard

- Shows active event or empty state if no active event
- Quick stats: total events, events this month, next scheduled
- "Start New Event" button in empty state
- Real-time attendance count updates via Convex subscriptions
- "View All Events" link to archive page

### Attendance Management

- **Check-in:** Search attendees and mark them present
- **Bulk Check-in:** Select multiple attendees and check in at once
- **Remove Attendance:** Remove attendee from event with confirmation
- **Real-time Updates:** Attendance list updates automatically
- **Status Badges:** Shows if attendee is member or visitor in search results
- **Pagination:** Navigate through large attendance lists

### Archive System

- Browse all completed events in table or card view
- Filter by event type and date range
- Search by event name
- Toggle between table view (detailed) and card view (visual)
- Pagination with page size selector

### Inline Editing

- Edit event name, type, date, time, location via modal
- Edit description in textarea modal
- Upload/change banner image (click banner or use upload button)
- Media gallery with image upload and delete
- Status-based action buttons (Start/Complete/Cancel)

### Media Gallery

- Upload event photos and videos
- Grid layout with thumbnails
- Click to preview full image in modal
- Delete individual media items with confirmation
- Support for image and video types

### Recent UI Improvements (2026-03-26)

- **Refactored EventDetails component** - Unified component for dashboard and detail pages with better code organization
- **Enhanced BasicInfoEditModal** - Improved form handling and validation
- **Updated EventArchiveTable** - Better data display and responsive layout
- **Improved events index page** - Better integration with backend data and filters
- **Removed redundant EventDetail component** - Consolidated into EventDetails for consistency

---

## Upcoming Features

### Attendance Reporting & Analytics

- **Individual History:** View complete attendance record per attendee
- **Event Statistics:** Total attendance, member count, visitor count
- **Top Inviters:** Leaderboard showing who invites the most visitors
- **Trend Analysis:** Attendance patterns over weeks/months
- **Invite Tracking:** See who invited each attendee to specific events
- **Export to CSV:** Download attendance data for reporting

### Dashboard & Widgets

- **Overview Dashboard:** Central hub with key metrics at a glance
- **Recent Attendance Widget:** Shows last 5-10 people who checked in
- **Upcoming Events Widget:** Displays next 3-5 scheduled events
- **Quick Stats Cards:** Total members, monthly attendance, active events
- **Action Shortcuts:** Quick links to common tasks (add attendee, start event)

### Data Export

- **CSV Export:** Export attendee lists, event attendance, or full database
- **Print-Friendly Views:** Optimized layouts for printing reports
- **Event Summaries:** Generate event reports with attendance breakdowns
- **Date Range Filtering:** Export data for specific time periods

### Notifications

- **Toast Notifications:** Success/error messages for all CRUD operations
- **Event Reminders:** Optional email notifications for upcoming events
- **Attendance Alerts:** Notify when visitor thresholds reached

---

## Configuration Decisions

| Decision                     | Choice                                                       | Reasoning                                                               |
| ---------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **Image URL Validation**     | Format only — check file extension or `data:image/` prefix   | No HEAD requests; simpler and faster                                    |
| **New Event Default Status** | Always `'upcoming'` regardless of date                       | UI shows warning for past dates but backend always defaults to upcoming |
| **Attendance Deletion**      | Hard delete — permanently removes the record                 | Simpler; no soft delete or undo needed                                  |
| **Attendance Model**         | Separate `attendanceRecords` table                           | Allows tracking timestamps per record; no document size limits          |
| **Invite Tracking**          | Both `attendees.invitedBy` AND `attendanceRecords.invitedBy` | Permanent church-level + per-event tracking                             |
| **Duplicate Check-in**       | Backend enforces — mutation throws if already checked in     | Prevents race conditions                                                |
| **Active Event Constraint**  | Only one event can be `active` at a time                     | Prevents confusion; enforces sequential events                          |
| **Pagination**               | Standard Convex `paginationOptsValidator`                    | Default page size 10; frontend controls page size                       |

---

## Testing Summary

| Category          | Count   | Status             |
| ----------------- | ------- | ------------------ |
| Convex Unit Tests | 37      | ✅ Passing         |
| Component Tests   | 100     | ✅ Passing         |
| E2E Tests         | 27      | ✅ Passing         |
| **Total**         | **164** | **✅ All Passing** |

### Test Coverage

- Authentication flows (login, session, redirects)
- Attendee CRUD operations
- Event Types CRUD with color picker
- Event lifecycle (create, start, complete, cancel)
- Attendance check-in/out operations
- Form validation and error handling
- Navigation and routing

---

## Development Workflow

1. **IMPLEMENT** - Build the feature first
2. **MANUAL TEST** - Verify it works in the browser
3. **ADD TESTS** - After confirmation, add unit/component tests

**Tech Stack:** TanStack Start + React, Convex (backend), shadcn/ui (components), TypeScript

**Key Commands:**

- `pnpm dev` - Start development server
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm dlx convex dev` - Start Convex backend

---

_For detailed implementation specifications, see individual feature documentation in `/docs` directory._
