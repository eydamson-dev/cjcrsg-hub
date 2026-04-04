# CJCRSG-Hub Feature List

Complete feature catalog for the church management system.

**Last Updated:** 2026-04-03  
**Current Phase:** Phase 16 - Complete  
**Status:** ✅ All Tasks 16.1-16.7 Complete

---

## Next Up

### Attendance Reporting & Analytics

**Goal:** Generate attendance reports by event, date range, or attendee

**Features:**

- [ ] Export attendance to CSV/Excel
- [ ] Attendance trends over time (charts)
- [ ] Per-attendee attendance history report
- [ ] Per-event attendance summary
- [ ] Filter reports by date range, event type, status

**Backend:**

- Query: `getAttendanceReport` with date range filters
- Query: `getAttendeeAttendanceHistory` with pagination
- Query: `getEventAttendanceSummary`

**Frontend:**

- Reports route: `/reports/attendance`
- Date range picker component
- Export button with format selection
- Charts using recharts

---

### Dashboard Statistics Widgets

**Goal:** Overview widgets showing key metrics

**Features:**

- [ ] Total attendees widget (members vs visitors)
- [ ] Recent attendance trend (last 4 weeks)
- [ ] Upcoming events widget
- [ ] Quick action buttons (Check-in, Add Attendee)

**Components:**

- `StatCard` - Reusable stat display
- `AttendanceTrendChart` - Mini line chart
- `QuickActions` - Shortcut buttons

---

## Completed Phases

### Phase 1: Foundation ✅

Project setup with TanStack Start, Convex, shadcn/ui. Authentication system with protected routes. Responsive layout with sidebar and mobile navigation.

**Files:**

- `src/components/layout/` (Header, Sidebar, MobileNav, Layout)
- `src/lib/navigation.ts`
- `src/components/auth/ProtectedRoute.tsx`

---

### Phase 2: Attendee Management ✅

Attendee CRUD operations with pagination. Search by name, email, phone. Filter by status. Profile pages and archive functionality.

**Files:**

- `convex/attendees/` (queries.ts, mutations.ts, validators.ts)
- `src/features/attendees/` (components, hooks, routes)
- `src/routes/attendees.*.tsx`

---

### Phase 3: Event Types (Admin) ✅

Event type CRUD with color picker. Inline editing via modal. Delete with usage check. Color-coded display.

**Files:**

- `convex/eventTypes/`
- `src/features/events/components/EventTypeForm.tsx`
- `src/features/events/components/EventTypeList.tsx`
- `src/routes/event-types.tsx`

---

### Phase 4: Event Management ✅

Event lifecycle (upcoming → active → completed/cancelled). Event dashboard with real-time attendance. Status transitions with validation. Archive page. Inline editing modals. Media gallery.

**Files:**

- `convex/events/` (queries.ts, mutations.ts, validators.ts, files.ts)
- `src/features/events/components/EventDetails.tsx`
- `src/features/events/components/EventArchive.tsx`
- `src/features/events/components/BannerUploader.tsx`
- `src/features/events/components/MediaGallery.tsx`

---

### Phase 5: Attendance ✅

Check-in functionality with bulk check-in. Remove attendance. Real-time updates via Convex subscriptions. Attendance stats and counts.

**Files:**

- `convex/attendance/` (queries.ts, mutations.ts)
- `src/features/events/components/AttendanceManager.tsx`
- `src/features/events/hooks/useAttendance.ts`

---

### Phase 6: Event History & EventList Component ✅

New `/events/history` route with server-side pagination. Reusable `EventList` component with table/cards view modes. Filters and search. Updated archive with pagination.

**Files:**

- `src/routes/events.history.tsx`
- `src/features/events/components/EventList.tsx`
- `src/features/events/components/EventFilters.tsx`
- `convex/events/queries.ts` (listActive, countActive, listArchive)

---

### Phase 7: Attendance Workflow Redesign ✅

Simplified check-in flow with "Walk-in" default. Inviter assignment via Actions dropdown. Table multi-select for bulk operations. Group view quick-add.

**Files:**

- `src/features/events/components/AttendanceManager.tsx`
- `src/features/events/components/AttendeeSearchModal.tsx`
- `src/features/events/components/InviterSelectionModal.tsx`
- `convex/attendance/mutations.ts` (updateInviter)

---

### Phase 8: Add Attendance Button ✅

Refactored AttendanceManager with dedicated "Add Attendance" button. Enhanced AttendeeSearchModal with inviter selection and selected attendees section.

**Files:**

- `src/features/events/components/AttendeeSearchModal.tsx`
- `src/features/events/components/AttendanceManager.tsx`

---

### Phase 9: Events Components ✅

Critical event components: BasicInfoEditModal, EventDetails, AttendanceManager. Archive components: EventArchive, EventFilters. Dashboard: CurrentEventDashboard, QuickStats.

**Files:**

- `src/features/events/components/BasicInfoEditModal.tsx`
- `src/features/events/components/CurrentEventDashboard.tsx`
- `src/features/events/components/QuickStats.tsx`

---

### Phase 10: Sunday Service Page ✅

Dedicated `/events/sunday-service` route. Reusable `EventsContent` component. Default times 09:00-11:00. Filtered history/archive links.

**Files:**

- `src/routes/events.sunday-service.tsx`
- `src/features/events/components/EventsContent.tsx`
- `convex/events/queries.ts` (getCurrentEventByType, getStatsByEventType)

---

### Phase 11: Image Upload ✅

Persistent image uploads for event banners and media galleries using Convex storage. Paste support (Ctrl+V). File upload with progress.

**Files:**

- `convex/events/files.ts`
- `src/features/events/hooks/useFileUpload.ts`
- `src/features/events/components/BannerUploader.tsx`

---

### Phase 12: Spiritual Retreat Page ✅

Dedicated `/events/spiritual-retreat` route. Default times 08:00-17:00. Green color theming. Filtered history/archive links.

**Files:**

- `src/routes/events.spiritual-retreat.tsx`
- `src/lib/navigation.ts` (Spiritual Retreat nav item)

---

### Phase 13: Spiritual Retreat Enhancement ✅

Teachers management (qualified status validation). Schedule builder with day tabs and time conflict detection. Staff assignments with roles.

**Files:**

- `convex/retreat/` (queries.ts, mutations.ts, validators.ts)
- `src/features/events/components/RetreatDetails.tsx`
- `src/features/events/components/RetreatTeachers.tsx`
- `src/features/events/components/RetreatSchedule.tsx`
- `src/features/events/components/RetreatStaff.tsx`
- `src/features/events/hooks/useRetreat.ts`

---

### Phase 14: Event-Specific Forms & Extensions ✅

Extension table architecture for specialized event types. `spiritualRetreatEventExtensions` table. EventFormFactory for type-specific forms. Generic and Spiritual Retreat forms.

**Files:**

- `convex/schema.ts` (extension tables)
- `src/features/events/forms/` (EventFormFactory, GenericEventForm, SpiritualRetreatForm)
- `src/features/events/forms/fields/` (BasicInfoFields, DescriptionField, BannerUploadField)
- `src/routes/events.new.tsx`
- `src/routes/events.$id.edit.tsx`

---

### Phase 15: Unified Event Creation Architecture ✅

Standardized event creation using GenericEventDetails. Consistent EventPageHeader across dedicated pages. Smart redirection to appropriate pages. Deleted deprecated form components.

**Files:**

- `src/features/events/components/EventPageHeader.tsx`
- `src/features/events/components/GenericEventDetails.tsx` (renamed)
- `src/features/events/components/SundayServiceDetails.tsx`
- `src/features/events/components/RetreatDetails.tsx` (isCreating mode)
- Deleted: `src/features/events/forms/` directory

---

### Phase 16: Auth Module with Admin Roles & Account Linking ✅

Admin role system (super_admin, admin, moderator, user) with CLI promotion. Attendee-user auto-linking by email. Manual linking/unlinking (admin only). Admin dashboard. Settings > Account page. OAuth account linking (Google/Facebook).

**Files:**

- `convex/auth.ts` (OAuth config with account linking)
- `convex/admin.ts` (CLI promotion)
- `convex/users.ts` (user queries)
- `convex/account.ts` (account management)
- `convex/attendees/admin.ts` (linking mutations)
- `convex/lib/authHelpers.ts` (role checking)
- `src/routes/settings.admin.tsx` (admin dashboard)
- `src/routes/settings.account.tsx` (account management)
- `src/features/attendees/components/AdminSection.tsx`
- `src/hooks/useCurrentUserRole.ts`

---

## Phase Summary

| Phase | Name                   | Status | Key Deliverables               |
| ----- | ---------------------- | ------ | ------------------------------ |
| 1     | Foundation             | ✅     | Layout, Auth, Navigation       |
| 2     | Attendee Management    | ✅     | CRUD, Search, Profiles         |
| 3     | Event Types            | ✅     | Admin CRUD, Colors             |
| 4     | Event Management       | ✅     | Lifecycle, Dashboard           |
| 5     | Attendance             | ✅     | Check-in, Bulk, Real-time      |
| 6     | Event History          | ✅     | EventList, Pagination          |
| 7     | Attendance Workflow    | ✅     | Walk-in default, Inviter UI    |
| 8     | Add Attendance Button  | ✅     | AttendeeSearchModal            |
| 9     | Events Components      | ✅     | Dashboard, Archive             |
| 10    | Sunday Service Page    | ✅     | Dedicated route                |
| 11    | Image Upload           | ✅     | Convex storage                 |
| 12    | Spiritual Retreat Page | ✅     | Basic dedicated page           |
| 13    | Retreat Enhancement    | ✅     | Teachers, Schedule, Staff      |
| 14    | Event-Specific Forms   | ✅     | Extension tables, Form factory |
| 15    | Unified Event Creation | ✅     | GenericEventDetails, Headers   |
| 16    | Auth Module Complete   | ✅     | Roles, Linking, OAuth          |

---

_For implementation details of completed phases, see Git history or ask._
