# CJCRSG-Hub Feature List

Complete feature catalog for the church management system.

**Last Updated:** 2026-03-27  
**Current Phase:** Phase 6 - Event History & EventList Component  
**Status:** ✅ Completed

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
