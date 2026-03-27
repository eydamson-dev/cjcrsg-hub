# CJCRSG-Hub Feature List

Complete feature catalog for the church management system.

**Last Updated:** 2026-03-27  
**Current Phase:** Phase 7 - Attendance Inviter Tracking  
**Status:** 🚧 In Progress | Task 7.1 - Create Modals & Enhanced AttendanceManager

---

## Completed Tasks

### Phase 1: Foundation

- ✅ Project setup with TanStack Start, Convex, shadcn/ui
- ✅ Authentication system (Email, Google, Facebook OAuth)
- ✅ Protected routes with route guards
- ✅ Responsive layout with sidebar and mobile navigation
- ✅ Navigation configuration

### Phase 2: Attendee Management

- ✅ Attendee CRUD operations
- ✅ Attendee list with pagination
- ✅ Search by name, email, phone
- ✅ Filter by status (member/visitor/inactive)
- ✅ Attendee profile pages
- ✅ Archive functionality

### Phase 3: Event Types (Admin)

- ✅ Event type CRUD with color picker
- ✅ Inline editing via modal
- ✅ Delete with usage check
- ✅ Color-coded display

### Phase 4: Event Management

- ✅ Event lifecycle (upcoming → active → completed/cancelled)
- ✅ Event dashboard with real-time attendance
- ✅ Event creation and editing
- ✅ Status transitions with validation
- ✅ Archive page with client-side filtering
- ✅ Inline editing modals
- ✅ Media gallery with upload/delete

### Phase 5: Attendance

- ✅ Check-in functionality
- ✅ Bulk check-in
- ✅ Remove attendance
- ✅ Real-time updates via Convex subscriptions
- ✅ Attendance stats and counts

### Phase 6: Event History & EventList Component

- ✅ **New Route:** `/events/history` - Event History page
  - Server-side pagination with URL params (page, type, status, q)
  - Cursor-based pagination with history management
  - Debounced search (300ms)
  - Page size persistence in localStorage (10, 25, 50)
  - Breadcrumbs with "Events > History" and back link
- ✅ **Reusable Component:** `EventList` component
  - View modes: Table (default) and Cards
  - Filters: Search, Event Type, Status (all 4 statuses)
  - Server-side pagination controls
  - Loading skeleton states
  - Empty states
- ✅ **Convex Queries:** `listActive`, `countActive`, `countArchived`, updated `listArchive`
  - Support filtering by eventTypeId, status, search
  - Uses `by_active_date` index
  - Returns paginated data with joins
- ✅ **React Hooks:** `useActiveEvents`, `useActiveEventCount`, `useArchivedEvents`, `useArchivedEventCount`
- ✅ **Refactored:** Event Archive page with server-side pagination
  - Now uses EventList component
  - Added back link to events index
- ✅ **Navigation:** Added Event History button to events index page
  - Button order: Create Event | Event History | Archive

### Phase 7: Attendance Inviter Tracking

**Status:** 🚧 In Progress
**Goal:** Enhance attendance tracking with inviter selection, inline attendee creation, and grouped view by inviter

#### Task 7.1: Create Supporting Modals

**Status:** ✅ Completed
**Files Created:**

- `src/features/events/components/CreateAttendeeModal.tsx`
  - ✅ Wraps `AttendeeForm` in Dialog component
  - ✅ Props: `open: boolean`, `onSave: (attendee: Attendee) => void`, `onClose: () => void`
  - ✅ Uses existing `useCreateAttendee` hook
  - ✅ Returns created attendee data to parent component
  - ✅ Modal with max height and scroll support for long forms
- `src/features/events/components/InviterSelectionModal.tsx`
  - ✅ Searchable list of all attendees (anyone can be inviter)
  - ✅ "Walk-in" option at top (no inviter) with prominent button
  - ✅ Shows attendee name + status badge (Member/Visitor)
  - ✅ Props: `open: boolean`, `onSelect: (inviterId: string | null) => void`, `onClose: () => void`
  - ✅ Uses `useSearchAttendees` hook for search
  - ✅ Can exclude specific attendee IDs (for preventing self-invitation)
  - ✅ Visual distinction between walk-in and inviter options

#### Task 7.2: Enhance AttendanceManager Component

**Status:** ⏳ Pending
**File to Modify:** `src/features/events/components/AttendanceManager.tsx`

**A. View Mode Toggle**

- Add `viewMode` state: `'list' | 'byInviter'`
- Add Tabs component above table with two options:
  - "List View" - Current table view
  - "By Inviter" - Grouped expandable view
- Default to 'list' view

**B. Enhanced Table (List View)**

- Add "Invited By" column between "Check-in Time" and "Actions"
- Shows inviter name (e.g., "John Smith") or "Walk-in" if no inviter
- Clicking inviter name does nothing (non-interactive)

**C. Grouped View (By Inviter)**

- Accordion-style expandable groups using shadcn Collapsible
- Each group header shows: Inviter name + count badge
- Click header toggles expand/collapse
- Groups:
  - Individual inviters (alphabetically sorted)
  - "Walk-in" group at bottom (attendees with no inviter)
- Subrows show: Attendee name, status, check-in time
- Same actions dropdown as list view

**D. Enhanced Check-in Flow**

**Single Check-in:**

1. User searches and clicks attendee in dropdown
2. Opens `InviterSelectionModal`
3. User selects inviter or "Walk-in"
4. Calls `checkIn` mutation with `invitedBy` field
5. Closes modal, clears search, refreshes list

**Bulk Check-in:**

1. User selects multiple attendees via checkboxes
2. Clicks "Add X" button (X = selected count)
3. Opens `InviterSelectionModal`
4. User selects inviter (same inviter applies to all)
5. Calls `bulkCheckIn` mutation with `invitedBy` field
6. Closes modal, clears selection, refreshes list

**Create Attendee Flow:**

1. User searches with no results
2. Shows option in dropdown: "Create new attendee: '{searchQuery}'"
3. User clicks option → opens `CreateAttendeeModal`
4. User fills form and saves
5. Modal closes, new attendee automatically appears in search
6. User selects new attendee → continues to inviter selection

#### Task 7.3: Update Types & Interfaces

**Status:** ⏳ Pending
**File:** `src/features/events/components/AttendanceManager.tsx`

Update `AttendanceRecordItem` interface:

```typescript
interface AttendanceRecordItem {
  _id: string
  eventId: string
  attendeeId: string
  checkedInAt: number
  checkedInBy: string
  notes?: string
  invitedBy?: string // Add this field
  attendee: {
    _id: string
    firstName: string
    lastName: string
    status: 'member' | 'visitor' | 'inactive'
    email?: string
    phone?: string
  } | null
  inviter?: {
    // Add this field
    _id: string
    firstName: string
    lastName: string
  } | null
}
```

#### Task 7.4: Testing & Validation

**Status:** ⏳ Pending

- Manual test: Single check-in with inviter
- Manual test: Bulk check-in with inviter
- Manual test: Create attendee inline
- Manual test: Toggle between list and by-inviter views
- Manual test: Expand/collapse inviter groups
- Manual test: Walk-in (no inviter) flows correctly

---

## Testing Summary

| Category          | Count   | Status             |
| ----------------- | ------- | ------------------ |
| Convex Unit Tests | 114     | ✅ Passing         |
| Component Tests   | 410     | ✅ Passing         |
| E2E Tests         | 64      | ✅ Passing         |
| **Total**         | **588** | **✅ All Passing** |

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
