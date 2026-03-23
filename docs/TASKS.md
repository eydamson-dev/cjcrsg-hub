# Implementation Tasks

Complete checklist of all implementation tasks for CJCRSG-Hub.

---

## 🎯 Current Session

**Updated:** 2026-03-23

**Phase:** Phase 5 - Event Management - 🚧 IN PROGRESS  
**Current Task:** Task 5.7 - Backend Integration (Connecting UI to Convex)  
**Status:** 🚧 IN PROGRESS - Phase 3 (Backend Attendance) complete, Phase 4 (Frontend Hooks) next

**Recently Completed:**

- ✅ Phase 3 (Task 5.7): Backend Attendance - `convex/attendance/validators.ts`, `queries.ts`, `mutations.ts`
  - Validators: Field validators for attendance operations
  - Queries: `getByEvent`, `getStats`, `getByAttendee`, `getInviters`
  - Mutations: `checkIn`, `unCheckIn`, `bulkCheckIn`
  - Features: Duplicate check-in prevention, auth checks, pagination support

- ✅ Phase 2 (Task 5.7): Backend Events
  - Validators: `isValidImageUrl()`, field validators, `eventFields`, `updateEventFields`
  - Queries: `list`, `getById`, `getCurrentEvent`, `listArchive`, `getStats`
  - Mutations: `create`, `update`, `startEvent`, `completeEvent`, `cancelEvent`, `archive`
  - Features: Image URL validation, status transitions, active event constraint, pagination

- ✅ Bug Fix: useEventType hook - Properly handle undefined id (pass 'skip' to query)

- ✅ Phase 5 - Tasks 5.0-5.5 Complete (UI with mock data)
  - Task 5.0: Types and Mock Data - Event types, 15 mock events, 25 attendance records
  - Task 5.1: Empty State UI - "Start New Event" page with stats
  - Task 5.2: Navigation Components - Breadcrumbs and back links
  - Task 5.3: Archive Page UI - Table/Card view toggle with filters and pagination
  - Task 5.4: Event Detail View UI - Banner, description, media gallery, attendance table
  - Task 5.5: Event Form UI - Section-based editing with modals
    - BasicInfoEditModal, DescriptionEditModal, BannerUploader, MediaGallery
    - Edit buttons beside section titles
    - events.new route for creating events
  - New routes: `/events/archive`, `/events/$id`, `/events/new`
  - All navigation working, responsive design implemented

- ✅ Phase 4 - Event Types (Admin) - Complete
  - Tasks 4.1-4.12: Backend, hooks, components, routes, tests
  - All 164 tests passing
  - Route: `/event-types`

**Current Work (Task 5.7):**

Backend Integration - Replacing mock data with real Convex backend.

---

### ✅ Finalized Configuration Decisions

| Decision                     | Choice                                                                                                        | Reasoning                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Image URL Validation**     | Format only — check file extension (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`) or `data:image/` prefix | No HEAD requests; simpler and faster                                                                                                            |
| **New Event Default Status** | Always `'upcoming'` regardless of date                                                                        | UI shows warning for past dates but backend always defaults to upcoming                                                                         |
| **Attendance Deletion**      | Hard delete — permanently removes the record                                                                  | Simpler; no soft delete or undo needed                                                                                                          |
| **Attendance Model**         | Separate `attendanceRecords` table                                                                            | Allows tracking `checkedInAt`, `checkedInBy`, `invitedBy`, `notes` per record; no document size limits                                          |
| **Invite Tracking**          | Both `attendees.invitedBy` AND `attendanceRecords.invitedBy` (Option C)                                       | `attendees.invitedBy` = who originally brought them to church (permanent); `attendanceRecords.invitedBy` = who brought them to a specific event |
| **Duplicate Check-in**       | Backend enforces — mutation throws if already checked in                                                      | Prevents race conditions; `by_event_attendee` index used for fast lookup                                                                        |
| **Attendance List Order**    | By `checkedInAt` descending (newest first)                                                                    | Shows who just arrived; real-time feel                                                                                                          |
| **Bulk Check-in Result**     | Single final toast — "X attendees checked in (Y skipped)"                                                     | Simpler UX; no per-item progress toasts                                                                                                         |
| **Active Event Constraint**  | Only one event can be `active` at a time                                                                      | `startEvent` throws "Another event is currently active" if constraint violated                                                                  |
| **Pagination**               | Standard Convex `paginationOptsValidator`                                                                     | Default page size 10; frontend controls page size                                                                                               |

---

### 📋 Task 5.7 Sub-phases

- [x] **Phase 1:** Schema Updates — `convex/schema.ts`
- [x] **Phase 2:** Backend Events — `convex/events/validators.ts`, `queries.ts`, `mutations.ts`
- [x] **Phase 3:** Backend Attendance — `convex/attendance/queries.ts`, `mutations.ts`
- [ ] **Phase 4:** Frontend Hooks — `useEvents.ts`, `useEventMutations.ts`, `useAttendance.ts`
- [ ] **Phase 5:** Route Integration — wire up all 4 routes with real data
- [ ] **Phase 6:** Type Generation + Verification — `pnpm dlx convex dev --once`

---

### Phase 1: Schema Updates — `convex/schema.ts`

No data migration needed — no existing data in any of these tables.

#### `attendees` table — add `invitedBy` field

```typescript
invitedBy: v.optional(v.id('attendees')),
// Who originally invited this person to church (permanent record on the attendee)
// Only relevant for visitors; null/undefined for founding members
// Example: "John Smith invited Mary Jones to church" → Mary's invitedBy = John's ID
// This stays on their profile even after they become a member
```

New index:

```typescript
.index('by_invited_by', ['invitedBy'])
// Use case: "Show me all people originally invited by John"
// Use case: "How many people has Peter brought to church in total?"
```

#### `events` table — add new fields

```typescript
status: v.union(
  v.literal('upcoming'),   // Default for ALL new events (even if date is in the past)
  v.literal('active'),     // Currently happening — only ONE event can be active at a time
  v.literal('completed'),  // Event ended — completedAt timestamp is set
  v.literal('cancelled'),  // Event was cancelled before or during
),

bannerImage: v.optional(v.string()),
// URL validation (format only, no HEAD request):
// Valid: ends in .jpg, .jpeg, .png, .gif, .webp, .svg (case-insensitive)
// Valid: starts with data:image/ (base64 data URI)
// Invalid: any other format

media: v.optional(v.array(v.object({
  url: v.string(),         // Same URL validation rules as bannerImage
  type: v.union(v.literal('image'), v.literal('video')),
  caption: v.optional(v.string()),
}))),
// Array of photos/videos from the event
// Each item validated individually in mutation

updatedAt: v.number(),
// Set to Date.now() on every create and update mutation

completedAt: v.optional(v.number()),
// Set to Date.now() only when completeEvent mutation is called
// Null/undefined for all other statuses
```

New indexes:

```typescript
.index('by_status', ['status'])
// Use case: "Get all upcoming events"
// Use case: "Get all cancelled events for admin review"

.index('by_date_status', ['date', 'status'])
// Use case: "Get upcoming events after today ordered by date"
// Use case: "Get completed events in a date range for archive"

.index('by_active', ['isActive', 'status'])
// Use case: "Get the single currently active event quickly"
// Used by getCurrentEvent query for fast lookup
```

#### `attendanceRecords` table — add `invitedBy` field

```typescript
invitedBy: v.optional(v.id('attendees')),
// Who invited this attendee to THIS specific event
// Different from attendees.invitedBy (which is permanent/church-level)
// Example: John brought Mary to church originally (attendees.invitedBy = John)
//          but Peter invited Mary to this specific retreat (attendanceRecords.invitedBy = Peter)
// Optional — not all attendees are personally invited to every event
```

New index:

```typescript
.index('by_invited_by', ['invitedBy', 'checkedInAt'])
// Use case: "How many people did Peter invite to events this month?"
// Use case: "Show all people Peter invited to today's service"
// Use case: "Top inviters leaderboard for this event"
```

---

### Phase 2: Backend Events

#### `convex/events/validators.ts`

Individual field validators:

- `eventName` — `v.string()` (min 2 chars enforced in mutation)
- `eventDescription` — `v.optional(v.string())`
- `eventDate` — `v.number()` (Unix timestamp in milliseconds)
- `eventStartTime` — `v.optional(v.string())` — "HH:mm" 24-hour format e.g. "09:00"
- `eventEndTime` — `v.optional(v.string())` — "HH:mm" 24-hour format; must be after startTime (validated in mutation logic, not schema)
- `eventLocation` — `v.optional(v.string())`
- `eventStatus` — `v.union(v.literal('upcoming'), v.literal('active'), v.literal('completed'), v.literal('cancelled'))`
- `mediaItemValidator` — `v.object({ url: v.string(), type: v.union(v.literal('image'), v.literal('video')), caption: v.optional(v.string()) })`
- `eventFields` — combined object validator for create (all required + optional fields)
- `updateEventFields` — all fields optional for partial updates

Helper function:

```typescript
export function isValidImageUrl(url: string): boolean {
  // Accepts data URIs
  if (url.startsWith('data:image/')) return true
  // Accepts URLs ending in image extensions (case-insensitive)
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
}
```

#### `convex/events/queries.ts`

- **`list(paginationOpts, filters?)`** — Paginated list with optional filters
  - Filters: `status?`, `eventTypeId?`, `dateFrom?`, `dateTo?`
  - Uses `by_date_status` index when status filter is provided
  - Uses `by_date` index for date-range-only queries
  - Order: date descending (newest first)
  - Each result includes joined `eventType` data: `{ name, color }`
  - Returns Convex paginated result

- **`getById(id)`** — Single event lookup
  - Returns event with joined `eventType: { name, color }`
  - Returns `null` if not found (caller handles not-found case)

- **`getCurrentEvent()`** — The single active event
  - Uses `by_status` index with `status='active'`
  - Returns event with joined `eventType` and current `attendanceCount`
  - Returns `null` if no event is currently active
  - UI uses this to decide: show dashboard or show EmptyEventState

- **`listArchive(paginationOpts, filters?)`** — Completed events for archive page
  - Always filters `status='completed'`
  - Optional additional filters: `eventTypeId?`, `dateFrom?`, `dateTo?`
  - Order: date descending (most recent past events first)
  - Includes joined `eventType: { name, color }` and `attendanceCount`

- **`getStats()`** — Dashboard statistics widget
  - `totalEvents` — count of all events (any status)
  - `byStatus` — `{ upcoming, active, completed, cancelled }` counts
  - `thisMonth` — count of events in current calendar month
  - `nextUpcoming` — the nearest upcoming event after today (name + date)

#### `convex/events/mutations.ts`

- **`create(fields)`** — Create new event
  - Required fields: `name` (min 2 chars), `eventTypeId`, `date`
  - Optional fields: `description`, `startTime`, `endTime`, `location`, `bannerImage`, `media`
  - `status` is always set to `'upcoming'` — not accepted from input
  - Validates `eventTypeId` exists and `isActive: true` in `eventTypes` table
  - Validates `bannerImage` format if provided using `isValidImageUrl()`
  - Validates each `media[].url` format if media array is provided
  - Validates `endTime > startTime` if both provided (string comparison of "HH:mm")
  - Sets `createdAt: Date.now()`, `updatedAt: Date.now()`, `isActive: true`
  - Returns created event `_id`

- **`update(id, fields)`** — Partial update any event fields
  - All fields optional
  - Validates event exists — throws "Event not found" if not
  - Validates `bannerImage` format if provided
  - Validates `eventTypeId` exists and is active if provided
  - Validates `endTime > startTime` if both provided
  - If `status` is being changed to `'active'`, checks no other event is active first
  - Always updates `updatedAt: Date.now()`

- **`startEvent(id)`** — Transition event to active (start it)
  - Validates event exists
  - Validates event is currently `'upcoming'` or `'cancelled'` (not already active/completed)
  - Checks no other event currently has `status='active'` — throws "Another event is currently active. Complete or cancel it first."
  - Sets `status='active'`, `updatedAt: Date.now()`

- **`completeEvent(id)`** — Mark event as completed
  - Validates event exists
  - Validates event is currently `'active'` — throws "Only active events can be completed"
  - Sets `status='completed'`, `completedAt: Date.now()`, `updatedAt: Date.now()`

- **`cancelEvent(id)`** — Cancel an event
  - Validates event exists
  - Validates event is `'upcoming'` or `'active'` (can't cancel already completed/cancelled)
  - Sets `status='cancelled'`, `updatedAt: Date.now()`

- **`archive(id)`** — Soft delete (hide from all lists)
  - Validates event exists
  - Sets `isActive: false`, `updatedAt: Date.now()`
  - Event remains in database but filtered out of all queries

---

### Phase 3: Backend Attendance

#### `convex/attendance/queries.ts`

- **`getByEvent(eventId, paginationOpts)`** — All attendees for a specific event
  - Uses `by_event` index (`eventId` + `checkedInAt`)
  - For each record, joins:
    - Attendee: `firstName`, `lastName`, `status` (member/visitor/inactive), `email`, `phone`
    - `invitedBy` attendee (if set): `firstName`, `lastName`
  - Order: `checkedInAt` descending (most recent check-ins first)
  - Returns paginated results with full attendee details

- **`getStats(eventId)`** — Attendance summary counts for an event
  - `total` — total attendance records for this event
  - `members` — count where `attendee.status = 'member'`
  - `visitors` — count where `attendee.status = 'visitor'`
  - `withInvite` — count where `invitedBy` is set (visitors who were personally invited)
  - Uses `by_event` index for all counts

- **`getByAttendee(attendeeId, paginationOpts)`** — Attendance history for a person
  - Uses `by_attendee` index (`attendeeId` + `checkedInAt`)
  - For each record, joins event data: `name`, `date`, `startTime`, `location`, `status`
  - Also joins event's `eventType`: `name`, `color`
  - Order: `checkedInAt` descending (most recent events first)
  - Returns paginated results

- **`getInviters(eventId)`** — Top inviters for a specific event
  - Queries all attendance records for the event where `invitedBy` is set
  - Groups by `invitedBy` attendee ID
  - Joins each inviter's attendee data: `firstName`, `lastName`
  - Returns `{ inviter: { _id, firstName, lastName }, count: number }[]`
  - Order: count descending (top inviters first)
  - Use case: recognition widget "Top Inviters This Event"

#### `convex/attendance/mutations.ts`

- **`checkIn(eventId, attendeeId, invitedBy?)`** — Add attendee to event
  - Requires authentication — `checkedInBy` set to `ctx.auth.getUserId()`
  - Validates event exists — throws "Event not found"
  - Validates attendee exists — throws "Attendee not found"
  - Validates `invitedBy` attendee exists if provided — throws "Inviter not found"
  - Checks duplicate using `by_event_attendee` index — throws "Attendee is already checked in to this event"
  - Sets `checkedInAt: Date.now()`, `checkedInBy: userId`
  - Sets `invitedBy` if provided
  - Returns created attendance record `_id`

- **`unCheckIn(attendanceRecordId)`** — Remove attendee from event
  - Requires authentication
  - Validates record exists — throws "Attendance record not found"
  - **Hard deletes** the record using `ctx.db.delete(attendanceRecordId)`
  - No soft delete, no undo — record is permanently removed
  - UI must show confirmation dialog before calling this mutation

- **`bulkCheckIn(eventId, attendees[])`** — Check in multiple attendees at once
  - `attendees`: array of `{ attendeeId: Id<'attendees'>, invitedBy?: Id<'attendees'> }`
  - For each attendee:
    - Checks for duplicate using `by_event_attendee` index
    - If already checked in: skip (no error thrown, increment `skippedCount`)
    - If not checked in: create record, increment `successCount`
  - Sets `checkedInAt: Date.now()` and `checkedInBy: userId` for all new records
  - Returns `{ successCount: number, skippedCount: number }`
  - Frontend shows single toast: "X attendees checked in (Y already checked in)"

---

### Phase 4: Frontend Hooks

#### `src/features/events/hooks/useEvents.ts`

- **`useEventsList(options?)`** — Paginated list with filters
  - Options: `{ status?, eventTypeId?, dateFrom?, dateTo?, paginationOpts? }`
  - Uses `convexQuery(api.events.list, args)` with TanStack Query
  - Passes `'skip'` when no valid options provided
  - Returns `{ data, isLoading, error, fetchNextPage, hasNextPage }`

- **`useEvent(id?)`** — Single event with joined eventType
  - Passes `'skip'` when `id` is `undefined`
  - Returns event data including `eventType: { name, color }`
  - Returns `null` if event not found

- **`useCurrentEvent()`** — The single active event
  - No args — always queries for `status='active'`
  - Returns `null` when no event is active (UI renders `EmptyEventState`)
  - Includes `attendanceCount` for display on dashboard

- **`useEventStats()`** — Dashboard statistics
  - Returns `{ totalEvents, byStatus, thisMonth, nextUpcoming }`
  - Used in `EmptyEventState` quick stats section

- **`useArchiveEvents(options?)`** — Completed events for archive page
  - Options: `{ eventTypeId?, dateFrom?, dateTo?, paginationOpts? }`
  - Always queries `status='completed'`

#### `src/features/events/hooks/useEventMutations.ts`

- **`useCreateEvent()`** — Create event
  - On success: toast "Event created successfully", navigate to `/events/${newId}`
  - On error: toast error message from Convex

- **`useUpdateEvent()`** — Update event
  - On success: toast "Event updated", invalidate `useEvent(id)` and `useEventsList`
  - On error: toast error message

- **`useStartEvent()`** — Start event (set active)
  - On success: toast "Event started — now live!"
  - On error: if message contains "Another event is currently active" → toast specific helpful message
  - Invalidates `useCurrentEvent` and `useEventsList`

- **`useCompleteEvent()`** — Complete event
  - On success: toast "Event completed successfully"
  - Invalidates `useCurrentEvent` and `useArchiveEvents`
  - On error: toast error message

- **`useCancelEvent()`** — Cancel event
  - On success: toast "Event cancelled"
  - Invalidates `useEventsList` and `useCurrentEvent`
  - On error: toast error message

- **`useArchiveEvent()`** — Soft delete event
  - On success: toast "Event archived"
  - Invalidates `useEventsList` and `useArchiveEvents`
  - On error: toast error message

#### `src/features/events/hooks/useAttendance.ts`

- **`useAttendanceByEvent(eventId?)`** — Live attendance list for an event
  - Passes `'skip'` when `eventId` is `undefined`
  - Real-time updates via Convex subscription (auto-updates when someone checks in/out)
  - Returns each record with full attendee details + `invitedBy` name
  - Supports pagination via `paginationOpts`

- **`useAttendanceStats(eventId?)`** — Attendance counts for an event
  - Returns `{ total, members, visitors, withInvite }`
  - Passes `'skip'` when `eventId` is `undefined`
  - Real-time updates via Convex subscription

- **`useCheckIn()`** — Add attendee to event
  - Args: `{ eventId, attendeeId, invitedBy? }`
  - Optimistic update: attendee appears in list immediately before server confirms
  - On error: rollback optimistic update + toast specific message:
    - "Already checked in" if duplicate
    - Generic error otherwise
  - On success: silent (list already updated optimistically)

- **`useUnCheckIn()`** — Remove attendee from event
  - Args: `{ attendanceRecordId }`
  - Hard delete — no undo
  - UI **must** show confirmation dialog before calling (hook does not confirm)
  - On success: toast "Attendee removed from event"
  - On error: toast error message
  - Invalidates attendance list and stats

- **`useBulkCheckIn()`** — Check in multiple attendees at once
  - Args: `{ eventId, attendees: { attendeeId, invitedBy? }[] }`
  - On success: single toast "X attendees checked in (Y already checked in)"
  - On error: toast error message
  - Invalidates attendance list and stats

---

### Phase 5: Route Integration

Replace all mock data imports with real hooks:

- **`src/routes/events.index.tsx`**
  - Use `useCurrentEvent()` — returns null or active event
  - If null: render `EmptyEventState` with `useEventStats()` for quick stats
  - If active: render `CurrentEventDashboard` (Task 5.6)

- **`src/routes/events.archive.tsx`**
  - Use `useArchiveEvents(options)` for real paginated data
  - Connect filter dropdowns to query options (eventTypeId, dateFrom, dateTo)
  - Connect search input to filter (search by event name on frontend)
  - Implement real pagination controls

- **`src/routes/events.$id.tsx`**
  - Use `useEvent(id)` for event data — show skeleton while loading
  - Use `useAttendanceByEvent(id)` for live attendance list
  - Use `useAttendanceStats(id)` for counts
  - Wire `BasicInfoEditModal` → `useUpdateEvent()`
  - Wire `DescriptionEditModal` → `useUpdateEvent()`
  - Wire `BannerUploader` → `useUpdateEvent()` with bannerImage URL
  - Wire media gallery upload → `useUpdateEvent()` with updated media array
  - Wire trash icons on media items → `useUpdateEvent()` with item removed
  - Wire "Start Event" button → `useStartEvent()`
  - Wire "Complete Event" button → `useCompleteEvent()`
  - Wire "Cancel Event" button → `useCancelEvent()`

- **`src/routes/events.new.tsx`**
  - Use `useCreateEvent()` on form submit
  - On success: navigate to `/events/${newId}`
  - Show field-level validation errors from Convex

---

### Phase 6: Type Generation + Verification

```bash
pnpm dlx convex dev --once
```

- Regenerates `convex/_generated/api.ts` with new functions
- Regenerates `convex/_generated/dataModel.d.ts` with updated table types
- Verify no TypeScript errors: `pnpm dev:ts`
- Verify app loads without errors: `pnpm dev`

---

### ✅ Success Criteria

- [ ] Schema updates apply without errors (no data migration needed — no existing data)
- [ ] `attendees.invitedBy` saves the original church inviter (permanent on attendee profile)
- [ ] `attendanceRecords.invitedBy` saves the per-event inviter (can differ from attendees.invitedBy)
- [ ] New events always default to `status='upcoming'` regardless of date
- [ ] Image URL validation: format only — extension check or `data:image/` prefix (no HEAD request)
- [ ] Only one event can be active at a time — `startEvent` throws if another is active
- [ ] `completeEvent` sets `completedAt` timestamp
- [ ] `checkIn` prevents duplicates — backend throws "Attendee is already checked in"
- [ ] `unCheckIn` hard deletes the record permanently (no soft delete, no undo)
- [ ] `bulkCheckIn` returns `{ successCount, skippedCount }` — single toast on frontend
- [ ] `getInviters` query returns top inviters sorted by invite count descending
- [ ] All queries return real data (no mock data imports remaining in routes)
- [ ] Archive page shows real completed events with working pagination and filters
- [ ] Real-time updates work — attendance list updates without page refresh (Convex subscription)
- [ ] Toast notifications for all CRUD operations
- [ ] Events index shows `EmptyEventState` when no active event
- [ ] Events index shows active event dashboard when event is active
- [ ] `getStats()` returns correct counts for dashboard quick stats

**Upcoming Tasks (Phase 5):**

- ⏳ Task 5.6: Dashboard UI (Active Event with attendance)
- ⏳ Task 5.8: Testing

---

## 🔄 Development Workflow (Updated 2026-03-21)

### Implementation-First Workflow

For **ALL tasks** (backend AND frontend):

1. **IMPLEMENT** - Build the feature first
   - Write the code
   - Make it functional
   - Don't write tests yet

2. **MANUAL TEST** - You verify it works
   - Run the app (`pnpm dev`)
   - Test the feature manually
   - Confirm requirements are met

3. **ADD TESTS** - After your confirmation ("works", "LGTM", etc.)
   - Backend: Add convex-test unit tests
   - Frontend: Add component tests OR rely on E2E tests
   - Update test counts in documentation

**Why this change?**

- UI requirements often evolve during implementation
- Heavy mocking makes tests brittle for React components
- Manual testing catches UX issues unit tests miss
- Backend can still be unit tested effectively after implementation

**TDD Implementation (Task 2.2):**

Completed comprehensive unit tests for attendee queries:

- ✅ Created `tests/unit/convex/attendees/queries.test.ts`
- ✅ 15 tests covering list, getById, search, and count operations
- ✅ List tests: pagination, status filter, ordering by date
- ✅ getById tests: returns attendee, returns null for non-existent
- ✅ Search tests: first name, last name, email, status filter, case insensitive, result limiting
- ✅ Count tests: total count, filtered by status, zero results
- ✅ All tests passing (22 total tests for attendee queries + mutations)

**TDD Progress:**

**Phase 1 - Infrastructure (Completed):**

- ✅ Tasks 1.1-1.6: All infrastructure setup complete

**Phase 2 - Critical Convex Unit Tests (Completed):**

- ✅ Task 2.1: Test Attendee Mutations (7/7 tests passing)
- ✅ Task 2.2: Test Attendee Queries (15/15 tests passing)
- **Total: 22/22 tests passing**

**Next:** Phase 3 - Shared Component Tests OR Phase 4 - Event Types

**Starting Phase 4 (Event Types):**

Phase 4 plan has been detailed in TASKS.md with 12 specific tasks:

- Task 4.1: Install react-colorful dependency
- Task 4.2-4.4: Backend (validators, queries, mutations)
- Task 4.5: Generate Convex types
- Task 4.6-4.7: Frontend hooks
- Task 4.8-4.9: UI components (EventTypeForm, EventTypeList)
- Task 4.10: Route page
- Task 4.11: Navigation
- Task 4.12: Testing

**Starting Phase 4 (Event Types):**

Phase 4 plan has been detailed in TASKS.md with 12 specific tasks:

- Task 4.1: Install react-colorful dependency
- Task 4.2-4.4: Backend (validators, queries, mutations)
- Task 4.5: Generate Convex types
- Task 4.6-4.7: Frontend hooks
- Task 4.8-4.9: UI components (EventTypeForm, EventTypeList)
- Task 4.10: Route page
- Task 4.11: Navigation
- Task 4.12: Testing

**Key Design Decisions:**

- Single page at `/event-types` (not under settings)
- Table layout with click-to-edit modal
- Color picker (react-colorful) with inline randomize button
- Delete button in modal header + per row
- Right-aligned Save/Cancel buttons (Save first)

**Previously Completed (Task 3.17 - Clickable Table Rows):**

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

- **Task 4.12: Manual Testing** - Verify Event Types CRUD functionality
- **Begin Phase 5: Event Management**
  - Create event queries (upcoming, past, by type)
  - Build EventList and EventForm components
  - Create event routes (/events, /events/new, /events/:id)

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

### Overview

Create a single-page admin interface at `/event-types` for managing dynamic event types (e.g., "Sunday Service", "Retreat", "Youth Event") with custom colors. Features inline row editing via modal and a color picker with randomize functionality.

### Design Specifications

**Modal Layout:**

- Title: "Edit Event Type" or "Create Event Type"
- Header includes: Trash icon (delete) + Close (X) button
- Form fields:
  - Name (required)
  - Description (optional)
  - Color: Hex input with inline randomize button (🎲), color picker below (same width as input)
- Footer: [Save] [Cancel] buttons (right-aligned, Save first)

**Table Layout:**

- Columns: Color (circle + hex), Name, Description, Actions (trash icon)
- Click row to open edit modal
- Delete button per row
- Empty state when no types exist

---

### Task 4.1: Install Dependencies

- [x] Install `react-colorful` color picker library
- [x] Verify installation and TypeScript types

### Task 4.2: Create Backend Validators

- [x] Create `convex/eventTypes/validators.ts`
  - Define eventTypeName validator (string, min 1 char)
  - Define eventTypeDescription validator (optional string)
  - Define eventTypeColor validator (optional hex color string)

### Task 4.3: Create Backend Queries

- [x] Create `convex/eventTypes/queries.ts`
  - `list` query: Get all event types, order by name, filter by isActive
  - `getById` query: Get single event type by ID
  - `checkAssociations` query: Check if event type is used by any events

### Task 4.4: Create Backend Mutations

- [x] Create `convex/eventTypes/mutations.ts`
  - `create` mutation: Insert new event type with name, description, color, isActive=true, createdAt
  - `update` mutation: Update existing event type fields
  - `remove` mutation: Delete event type (with association check)

### Task 4.5: Generate Convex Types

- [x] Run `pnpm dlx convex dev --once` to generate types for new modules
- [x] Verify types are created in `_generated/api.ts`

### Task 4.6: Create Frontend Hooks - Queries

- [x] Create `src/features/events/hooks/useEventTypes.ts` (implemented ✓, **9 tests passing**)
  - `useEventTypesList()` - Hook for listing event types
  - `useEventType(id)` - Hook for getting single event type
  - `useCheckEventTypeAssociations(id)` - Hook for checking if deletable
  - Tests: `tests/unit/events/hooks/useEventTypes.test.ts`

### Task 4.7: Create Frontend Hooks - Mutations

- [x] Create `src/features/events/hooks/useEventTypeMutations.ts` (implemented ✓, **12 tests passing**)
  - `useCreateEventType()` - Create mutation with toast notifications
  - `useUpdateEventType()` - Update mutation with toast notifications
  - `useDeleteEventType()` - Delete mutation with confirmation dialog
  - Tests: `tests/unit/events/hooks/useEventTypeMutations.test.ts`

### Task 4.8: Create EventTypeForm Component

- [x] Create `src/features/events/components/EventTypeForm.tsx` (implemented ✓, **15 tests passing**)
  - Form with react-hook-form + zod validation
  - Name field (required, min 2 chars)
  - Description field (optional)
  - Color picker section:
    - Hex input with randomize button (🎲 icon)
    - react-colorful picker below
  - Right-aligned Save/Cancel buttons
  - Supports create and edit modes
  - Randomize button generates random hex color
  - Sync between hex input and color picker
  - Support create and edit modes
  - Submit handler with loading states
  - Tests: `tests/unit/events/components/EventTypeForm.test.tsx`

### Task 4.9: Create EventTypeList Component

- [x] Create `src/features/events/components/EventTypeList.tsx` (implemented ✓, **12 tests passing**)
  - shadcn Table component
  - Columns: Color (colored circle + hex value), Name, Description, Actions (trash icon)
  - Click row opens edit modal
  - Delete button per row with confirmation dialog
  - Empty state component when no event types
  - "Add Event Type" button at top
  - Loading skeleton state
  - Error state with retry button
  - Tests: `tests/unit/events/components/EventTypeList.test.tsx` (6 AlertDialog tests skipped)

### Task 4.10: Create Event Types Route Page

**Status:** ✅ Completed

- [x] Create `src/routes/event-types.tsx`
  - Route configuration with auth guard
  - Page layout with header, description
  - Integrate EventTypeList component
  - Modal state management (open/close, create vs edit mode)
  - Toast notifications for CRUD operations

### Task 4.11: Add Navigation Link

**Status:** ✅ Completed

- [x] Update `src/lib/navigation.ts`
  - Add "Event Types" nav item
  - Route: `/event-types`
  - Icon: Palette icon (from lucide-react)
  - Description: "Manage event types and categories"

### Task 4.12: Test Implementation

**Status:** ✅ Completed

- [x] Created route page tests (`tests/unit/events/routes/event-types.test.tsx`)
  - 8 tests covering: initial render, dialog management, form submission
- [x] Created E2E tests (`tests/e2e/specs/event-types.spec.ts`)
  - 16 tests covering: navigation, CRUD, validation, color picker, 2 browsers
  - Fixed: unique names for parallel test runs, `.first()` for strict mode
- [x] All 164 unit tests passing
- [x] All 16 E2E tests passing

---

### Technical Notes

**Color Management:**

- Store as hex string (e.g., "#3b82f6")
- react-colorful outputs hex values
- Randomize: Generate hex from Math.random()

**Delete Behavior:**

- Check if event type has associated events via query
- If yes: Show alert "Cannot delete - used by X events"
- If no: Show confirmation dialog then delete

**State Management:**

- Modal open/close with local state
- Form state with react-hook-form
- Server state with TanStack Query + Convex

---

## Phase 5: Event Management

### Design Overview

**Architecture:** Event Dashboard + Archive

- Main page (`/events`) shows current/active event with attendance management
- Empty state with "Start New Event" button when no active event
- Archive page (`/events/archive`) for past events with table/card views
- Event detail pages for viewing past events
- Manual status control (user starts/completes events)

**Event Status Lifecycle:**

- `upcoming` → User creates event for future date
- `active` → User clicks "Start Event" or event date arrives
- `completed` → User clicks "Complete Event"
- `cancelled` → User cancels event (optional)

**Route Structure:**

```
/events                 → Current event dashboard or empty state
/events/archive         → Past events archive (table/card views)
/events/new             → Create event form
/events/:id             → View event details (with inline editing)
```

**Note:** Edit functionality is handled inline on the detail page via modals (not a separate route)

---

### Phase 5A: UI Development (Mock Data First)

#### Task 5.0: Setup Types and Mock Data

**Status:** Pending

**Description:** Create TypeScript types and comprehensive mock data for UI development.

**Files to Create:**

- `src/features/events/types.ts` - Event types, status enums, interfaces
- `src/features/events/mocks/mockEvents.ts` - Mock event data (15 events)
- `src/features/events/mocks/mockAttendees.ts` - Mock attendance records

**Types to Define:**

```typescript
type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'

interface Event {
  _id: string
  name: string
  eventTypeId: string
  eventType?: { name: string; color: string } // Joined from eventTypes
  description?: string
  date: number // Timestamp
  startTime?: string // "HH:mm"
  endTime?: string // "HH:mm"
  location?: string
  status: EventStatus
  bannerImage?: string
  media?: Array<{ url: string; type: 'image' | 'video'; caption?: string }>
  isActive: boolean
  createdAt: number
  updatedAt: number
  completedAt?: number
  attendanceCount?: number // Computed
}

interface AttendanceRecord {
  _id: string
  eventId: string
  attendeeId: string
  attendee?: {
    _id: string
    firstName: string
    lastName: string
    status: 'member' | 'visitor' | 'inactive'
  }
  checkedInAt: number
  checkedInBy: string
  notes?: string
}
```

**Mock Data Requirements:**

- 15 mock events (mix: 2 active, 5 upcoming, 8 completed)
- 25 mock attendance records for active event
- Event types: Sunday Service, Youth Night, Prayer Meeting, Retreat

**Success Criteria:**

- [ ] All TypeScript types defined and exported
- [ ] Mock events cover all status types
- [ ] Mock attendance includes various check-in times
- [ ] Types match schema structure

---

#### Task 5.1: Empty State UI

**Status:** Pending

**Description:** Create the "No Active Event" page with Start button and quick stats.

**Files to Create:**

- `src/features/events/components/EmptyEventState.tsx`
- `src/features/events/components/StartEventButton.tsx`
- `src/features/events/components/QuickStats.tsx`

**UI Specification:**

```
Layout:
- Centered card with dashed border (empty state style)
- 80px circular button with Plus icon (primary color)
- "Start New Event" heading (H2, bold)
- "Create an event to begin tracking attendance" subtext
- Quick stats bar at bottom of card

Quick Stats (Mock Data):
- Events this month: 12
- Total events: 156
- Last event: March 15, 2026
- Next scheduled: March 23, 2026

Interactions:
- Button hover: scale(1.05), shadow increase, subtle pulse
- Button click: Navigate to /events/new (mock)
- Stats are static display (no interaction)
```

**Mock Data to Display:**

```typescript
const mockStats = {
  eventsThisMonth: 12,
  totalEvents: 156,
  lastEvent: 'March 15, 2026',
  nextScheduled: 'March 23, 2026',
}
```

**Success Criteria:**

- [ ] Card is centered vertically and horizontally
- [ ] Button is visually prominent (primary color, large)
- [ ] Quick stats display 4 metrics
- [ ] Hover effects work correctly
- [ ] Responsive on mobile (smaller button, stacked stats)
- [ ] Matches existing app styling

---

#### Task 5.2: Navigation Components

**Status:** Pending

**Description:** Create breadcrumb and navigation components for event pages.

**Files to Create:**

- `src/components/navigation/Breadcrumb.tsx` (if not exists)
- `src/features/events/components/EventsBreadcrumb.tsx`

**UI Specification:**

```
Breadcrumbs:
- Events index: "Home > Events"
- Event archive: "Home > Events > Archive"
- Event detail: "Home > Events > Archive > [Event Name]"

Link Styles:
- Home: Clickable link
- Events: Clickable link
- Archive: Clickable link
- Event Name: Current page (not clickable, bold)

Separator: ">" or "/"

Page Links (on main pages):
- Events index: "View Archive →" (top right)
- Archive page: "← Back to Events"
- Event detail: "← Back to Archive"
```

**Success Criteria:**

- [ ] Breadcrumb renders correctly on all event routes
- [ ] All links are clickable (mock navigation)
- [ ] Current page is styled differently (bold, not link)
- [ ] Responsive (may hide on very small screens)
- [ ] Consistent with app navigation style

---

#### Task 5.3: Archive Page UI

**Status:** Pending

**Description:** Create the archive page with table and card view toggle for past events.

**Files to Create:**

- `src/routes/events.archive.tsx` - Archive route
- `src/features/events/components/EventArchive.tsx` - Main component
- `src/features/events/components/EventArchiveTable.tsx` - Table view
- `src/features/events/components/EventArchiveCards.tsx` - Card view
- `src/features/events/components/EventFilters.tsx` - Filter bar

**Mock Data:** Use 8 completed mock events

**UI Specification:**

```
Header Section:
- Title: "Event Archive"
- View toggle: [Table] [Cards] (pill buttons, one active)
- Filters bar below title

Filter Bar:
- Event Type: Dropdown [All Types ▼]
- Date Range: Dropdown [All Dates ▼] or date picker
- Search: Input with search icon, placeholder "Search events..."
- Clear Filters: Text button (visible when filters active)

Table View:
Columns:
| Banner | Event Name | Date | Type | Attendance | Actions |
- Banner: 60px thumbnail
- Event Name: Bold text
- Date: Formatted date (e.g., "Mar 15, 2026")
- Type: Badge with color dot
- Attendance: Number with icon
- Actions: "View" button

Card View:
- 3 columns on desktop, 2 tablet, 1 mobile
- Card content:
  - Banner image (top, 16:9 aspect)
  - Event name (bold, H3)
  - Date (muted, small)
  - Type badge (colored)
  - Attendance: "👤 48" bottom right
- Entire card is clickable

Pagination:
- "Showing 1-10 of 156 events"
- Previous / Next buttons
- Page numbers: [1] [2] [3] ... [16]

Empty State (no results):
- "No events found" icon (Calendar with X)
- "Try adjusting your filters"
- "Clear Filters" button
```

**Interactions:**

- Toggle view: Instantly switch table ↔ cards
- Filter change: Filter mock data locally
- Search: Filter by event name
- Pagination: Switch pages
- Click row/card: Navigate to /events/:id

**Success Criteria:**

- [ ] Both table and card views render correctly
- [ ] View toggle works and persists state
- [ ] All filters work with mock data
- [ ] Pagination displays correct range
- [ ] Clicking event navigates to detail view
- [ ] Empty state shows when no results
- [ ] Route: `/events/archive` accessible

---

#### Task 5.4: Event Detail View UI

**Status:** Pending

**Description:** Create read-only event detail page for viewing past/completed events.

**Files to Create:**

- `src/routes/events.$id.tsx` - Detail route
- `src/features/events/components/EventDetail.tsx` - Main component
- `src/features/events/components/EventDetailHeader.tsx` - Banner + info
- `src/features/events/components/EventMediaGallery.tsx` - Media display
- `src/features/events/components/EventAttendanceSummary.tsx` - Stats + list

**Mock Data:** One complete mock event with 25 attendance records, 6 media items

**UI Specification:**

```
Header Section:
┌──────────────────────────────────────────────────────────────┐
│  [BANNER IMAGE - Full Width, 21:9 aspect]                  │
│                                                              │
│  Sunday Service                                   [Completed]│
│  March 16, 2026 • 9:00 AM - 11:00 AM • Main Sanctuary      │
│  [Sunday Service Badge - Blue]                               │
└──────────────────────────────────────────────────────────────┘

Description Section:
┌──────────────────────────────────────────────────────────────┐
│  Description                                                 │
│  ───────────────────────────────────────────────────────    │
│  Weekly Sunday service with worship, teaching, and          │
│  communion. Join us for fellowship after the service.      │
└──────────────────────────────────────────────────────────────┘

Media Gallery Section:
┌──────────────────────────────────────────────────────────────┐
│  Media Gallery (6)                              [Expand]    │
│  ───────────────────────────────────────────────────────    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ [IMG 1] │ │ [IMG 2] │ │ [IMG 3] │ │ [Video]│            │
│  │         │ │         │ │         │ │   ▶    │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│  ┌─────────┐ ┌─────────┐                                    │
│  │ [IMG 4] │ │ [IMG 5] │                                    │
│  └─────────┘ └─────────┘                                    │
└──────────────────────────────────────────────────────────────┘

Attendance Summary Section:
┌──────────────────────────────────────────────────────────────┐
│  Attendance Summary                                          │
│  ───────────────────────────────────────────────────────    │
│                                                              │
│  Total: 48 attendees                                        │
│  Members: 35  •  Visitors: 13                              │
│                                                              │
│  [View Full List] (expandable)                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Name              │ Status  │ Check-in    │ Time    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ John Doe           │ Member  │ 9:05 AM    │ 2m      │   │
│  │ Jane Smith         │ Visitor │ 9:12 AM    │ 9m      │   │
│  │ ...                                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

Action Buttons:
┌──────────────────────────────────────────────────────────────┐
│  [Edit Event]  [Restore Event]  [Delete Event]              │
└──────────────────────────────────────────────────────────────┘
Note: "Restore Event" only visible for completed events
Note: "Delete Event" requires confirmation dialog
```

**Media Item Types:**

- Images: Displayed in grid, clickable for lightbox
- Videos: Thumbnail with play icon, clickable for modal player

**Success Criteria:**

- [ ] Banner image displays properly (placeholder if none)
- [ ] All event details visible
- [ ] Status badge shows correct color
- [ ] Media gallery displays images/videos in grid
- [ ] Attendance summary shows correct counts
- [ ] Expandable attendee list works
- [ ] Action buttons visible (non-functional in mock)
- [ ] Back navigation works
- [ ] Route: `/events/:id` with mock data

---

#### Task 5.5: Event Form UI

**Status:** Pending

**Description:** Create event forms using section-based editing. Detail page has editable blocks with modals, create page uses full form layout.

**Architecture:**

- **Event Detail Page (`/events/$id`)**: Display event in editable sections. Each section has inline edit capability:
  - Basic Info: Edit button opens modal
  - Description: Edit button opens modal
  - Banner: Click to upload (no modal, direct upload)
  - Media Gallery: Upload button + trash icons on items
- **Create Event Page (`/events/new`)**: Full-page form with all sections displayed as editable inputs (same layout as detail view but all fields editable)

**Files to Create:**

**Routes:**

- `src/routes/events.new.tsx` - Create route (full-page form)
- ~~`src/routes/events.$id.edit.tsx`~~ - **REMOVED** (editing happens via modals on detail page)

**Components:**

- `src/features/events/components/BasicInfoEditModal.tsx` - Modal for editing name, type, date, time, location
- `src/features/events/components/DescriptionEditModal.tsx` - Modal for editing description textarea
- `src/features/events/components/BannerUploader.tsx` - Banner upload trigger + preview
- `src/features/events/components/MediaGallery.tsx` - Grid with upload button + delete icons

**Form Fields:**

```typescript
interface EventFormData {
  name: string // Required
  eventTypeId: string // Required (select from eventTypes)
  date: string // Required (date picker, default: today)
  startTime: string // Optional (time picker)
  endTime: string // Optional (time picker)
  location: string // Optional
  description: string // Optional (textarea)
  bannerImage: string // Optional (URL or file upload)
  media: Array<{
    // Optional (file uploads only)
    url: string
    type: 'image' | 'video'
    caption: string
  }>
}
```

**Event Detail Page Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ Sunday Service                                    [Edit ✏️] │ ← Basic Info Block
│ March 23, 2026 • 9:00 AM - 11:00 AM • Main Sanctuary       │
│ [Sunday Service Badge]                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Description                                         [Edit ✏️] │ ← Description Block
│ ───────────────────────────────────────────────────────    │
│ Weekly Sunday service with worship, teaching...            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Banner Image                                              │ ← Banner Block
│ ───────────────────────────────────────────────────────    │
│ [████████████████████████████████████████████]            │
│ Click image or [Upload 📤] button to change                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Media Gallery (6)                               [+ Upload] │ ← Gallery Block
│ ───────────────────────────────────────────────────────    │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│ │ [img1] │ │ [img2] │ │ [img3] │ │ [vid] ▶│                 │
│ │  🗑️   │ │  🗑️   │ │  🗑️   │ │  🗑️   │                 │ ← Trash icon per item
│ └────────┘ └────────┘ └────────┘ └────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

**Modal Layout (Basic Info Example):**

```
┌──────────────────────────────────────────────┐
│ Edit Basic Info                         [×] │
│ ─────────────────────────────────────────── │
│                                              │
│ Event Name *                                 │
│ ┌────────────────────────────────────────┐  │
│ │ Sunday Service                          │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ Event Type *          Date *                 │
│ ┌───────────────┐    ┌───────────────┐      │
│ │ Sunday Svc ▼ │    │ Mar 23, 2026 │      │
│ └───────────────┘    └───────────────┘      │
│                                              │
│ Start Time    End Time    Location           │
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│ │ 9:00 AM ▼│ │11:00 AM ▼│ │Main Sanctuary│  │
│ └──────────┘ └──────────┘ └──────────────┘  │
│                                              │
│        [Cancel]  [Save Changes]              │
└──────────────────────────────────────────────┘
```

**Create Event Page Layout:**

Same sections as detail page, but all fields are editable inputs (not display + modal):

```
┌──────────────────────────────────────────────────────────────┐
│ Create New Event                                             │
│ ═══════════════════════════════════════════════════════════ │
│                                                              │
│ Event Name *                                                 │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Event Type *              Date *                             │
│ ┌─────────────────────┐    ┌─────────────────────┐          │
│ │                     │    │                     │          │
│ └─────────────────────┘    └─────────────────────┘          │
│                                                              │
│ [Description textarea]                                      │
│                                                              │
│ [Banner upload area]                                        │
│                                                              │
│ [Media gallery (empty with upload button)]                  │
│                                                              │
│        [Cancel]  [Create Event]                              │
└──────────────────────────────────────────────────────────────┘
```

**Field Validations:**

- Name: Required, min 2 characters
- Event Type: Required (dropdown)
- Date: Required (date picker)
- End Time: Must be after Start Time (if both provided)
- Banner URL: Valid URL format or empty
- Past Date Warning: Show alert if date < today

**Modal Behavior:**

- All modals have [Cancel] and [Save] buttons
- Cancel: Closes modal, discards changes
- Save: Validates, saves changes (mock), closes modal, shows toast

**Section Edit Behavior:**

| Section       | Edit Trigger                 | Action                            |
| ------------- | ---------------------------- | --------------------------------- |
| Basic Info    | Edit ✏️ button               | Opens modal with all basic fields |
| Description   | Edit ✏️ button               | Opens modal with textarea         |
| Banner        | Click image or Upload button | Opens file picker (no modal)      |
| Media Gallery | + Upload button              | Opens file picker                 |
| Media Item    | 🗑️ Trash icon                | Removes item with confirmation    |

**Success Criteria:**

- [ ] Basic Info block displays with Edit button
- [ ] Description block displays with Edit button
- [ ] Banner displays with click-to-upload and upload button
- [ ] Media Gallery displays with Upload button and trash icons
- [ ] Basic Info modal opens with all fields
- [ ] Description modal opens with textarea
- [ ] Modals have Cancel and Save buttons
- [ ] Date picker works and defaults to today
- [ ] Time pickers work
- [ ] Event type dropdown populated (mock data)
- [ ] Banner file upload shows placeholder
- [ ] Media upload shows placeholder
- [ ] Delete item shows confirmation dialog
- [ ] Validation messages display correctly
- [ ] Past date warning shows when appropriate
- [ ] Create page has all sections as editable form
- [ ] Create page Cancel navigates back
- [ ] Route `/events/new` works
- [ ] Route `/events/$id/edit` removed

---

#### Task 5.6: Dashboard UI - Active Event

**Status:** Pending

**Description:** Create the main events dashboard showing active event with attendance management.

**Files to Create:**

- `src/routes/events.index.tsx` - Main dashboard route
- `src/features/events/components/CurrentEventDashboard.tsx` - Main component
- `src/features/events/components/EventBanner.tsx` - Banner display
- `src/features/events/components/EventInfo.tsx` - Event details
- `src/features/events/components/AttendanceManager.tsx` - Live attendance

**Mock Data:** One active event with 42 attendance records

**UI Specification:**

```
Header with Status:
┌──────────────────────────────────────────────────────────────┐
│  Events                                               [LIVE] │
│  (LIVE badge: pulsing green dot + "LIVE" text)              │
└──────────────────────────────────────────────────────────────┘

Event Banner Section:
┌──────────────────────────────────────────────────────────────┐
│  [BANNER IMAGE - 21:9 aspect]                              │
│                                                              │
│  Sunday Service                            [Upcoming ▼]       │
│  March 23, 2026 • 9:00 AM - 11:00 AM                       │
│  Main Sanctuary                                             │
│  [Sunday Service Badge - Blue]                              │
└──────────────────────────────────────────────────────────────┘

Event Details (collapsible):
┌──────────────────────────────────────────────────────────────┐
│  ▼ Description                                              │
│  Weekly Sunday service with worship, teaching, and          │
│  communion. Join us for fellowship after the service.      │
│                                                              │
│  📍 Main Sanctuary                                          │
│  👥 42 attendees checked in                                 │
└──────────────────────────────────────────────────────────────┘

Attendance Manager Section:
┌──────────────────────────────────────────────────────────────┐
│  Attendance                                    Count: 42 👤 │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  [Search attendee to add...                    ] [+ Add]    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Name              │ Status  │ Check-in    │ Action  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ John Doe           │ Member  │ 9:05 AM    │   ✕     │   │
│  │ Jane Smith         │ Visitor │ 9:12 AM    │   ✕     │   │
│  │ Bob Johnson        │ Member  │ 9:08 AM    │   ✕     │   │
│  │ Mary Williams      │ Member  │ 9:15 AM    │   ✕     │   │
│  │ ...                                                 [Load More]│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Showing 1-10 of 42                              [Load More]│
└──────────────────────────────────────────────────────────────┘

Action Buttons:
┌──────────────────────────────────────────────────────────────┐
│  [Edit Event]  [Complete Event ✓]  [Cancel Event]              │
└──────────────────────────────────────────────────────────────┘
```

**Attendance Search/Add:**

```
When clicking [+ Add]:
- Opens dropdown/modal with search input
- Search results show attendees not yet checked in
- Shows: Name, Status badge, Quick Add button
- Clicking attendee adds them immediately (optimistic)

When clicking ✕ (remove):
- Confirmation: "Remove [Name] from attendance?"
- Removes immediately (optimistic)
```

**Success Criteria:**

- [ ] LIVE badge displays with animation
- [ ] Event banner displays correctly
- [ ] Event info shows all details
- [ ] Attendance count updates
- [ ] Search input works (filters mock attendees)
- [ ] Add attendee shows in list immediately
- [ ] Remove attendee shows confirmation
- [ ] Load more pagination works
- [ ] Action buttons visible and styled
- [ ] Responsive on mobile (stacked layout)
- [ ] Route: `/events` with mock active event

---

#### Task 5.7: Integration - Connect UI to Backend

**Status:** Pending

**Description:** Replace mock data with real Convex queries and mutations.

**Changes Required:**

**Backend Files to Create:**

- `convex/events/validators.ts` - Validation rules
- `convex/events/queries.ts` - Query functions
- `convex/events/mutations.ts` - Mutation functions
- Update `convex/schema.ts` - Add event fields

**Frontend Hooks to Create:**

- `src/features/events/hooks/useEvents.ts`
- `src/features/events/hooks/useEventMutations.ts`
- `src/features/events/hooks/useAttendance.ts`

**Integration Steps:**

1. Update schema with new fields (status, bannerImage, media, etc.)
2. Create validators for event data
3. Implement queries: getCurrentEvent, getById, listArchive
4. Implement mutations: create, update, complete, checkIn, remove
5. Create React hooks wrapping Convex queries/mutations
6. Replace mock data usage with hooks in all components
7. Add optimistic updates for attendance operations
8. Add toast notifications for all operations

**Schema Updates:**

```typescript
// New fields in events table
.status: v.union(
  v.literal('upcoming'),
  v.literal('active'),
  v.literal('completed'),
  v.literal('cancelled')
)
.bannerImage: v.optional(v.string())
.media: v.optional(v.array(v.object({
  url: v.string(),
  type: v.union(v.literal('image'), v.literal('video')),
  caption: v.optional(v.string())
})))
.updatedAt: v.number()
.completedAt: v.optional(v.number())
```

**Success Criteria:**

- [ ] Schema migration runs without errors
- [ ] All queries return real data
- [ ] Create event works and redirects to dashboard
- [ ] Edit event updates and shows changes
- [ ] Complete event moves to archive
- [ ] Add attendee creates attendance record immediately
- [ ] Remove attendee deletes record immediately
- [ ] Archive page shows real past events
- [ ] Real-time updates work (attendance count)
- [ ] Toast notifications appear for all operations

---

#### Task 5.8: Testing

**Status:** Pending

**Description:** Write comprehensive tests for event management.

**Test Files to Create:**

```
tests/unit/
├── convex/events/
│   ├── queries.test.ts
│   └── mutations.test.ts
├── components/events/
│   ├── EventForm.test.tsx
│   ├── EventArchive.test.tsx
│   ├── CurrentEventDashboard.test.tsx
│   └── AttendanceManager.test.tsx

tests/e2e/specs/
└── events.spec.ts
```

**Unit Tests to Write:**

- Event queries: list, filter, pagination
- Event mutations: create, update, complete, delete
- Attendance: check-in, remove (prevent duplicates)
- Validation: required fields, date logic

**Component Tests:**

- EventForm: validation, field updates, submit
- EventArchive: filters, view toggle, pagination
- AttendanceManager: add, remove, search
- EmptyState: rendering, button click

**E2E Tests:**

- Create event flow
- Add/remove attendance
- Complete event
- View archive
- Edit event
- Filter archive

**Success Criteria:**

- [ ] All unit tests pass
- [ ] All component tests pass
- [ ] All E2E tests pass
- [ ] Coverage > 80% for events feature

---

### Phase 5 Summary

| Task | Description         | Mock | Backend | Tests |
| ---- | ------------------- | ---- | ------- | ----- |
| 5.0  | Types & Mock Data   | ✓    | -       | -     |
| 5.1  | Empty State UI      | ✓    | -       | -     |
| 5.2  | Navigation          | ✓    | -       | -     |
| 5.3  | Archive Page        | ✓    | -       | -     |
| 5.4  | Event Detail        | ✓    | -       | -     |
| 5.5  | Event Form          | ✓    | -       | -     |
| 5.6  | Dashboard UI        | ✓    | -       | -     |
| 5.7  | Backend Integration | -    | ✓       | -     |
| 5.8  | Testing             | -    | -       | ✓     |

**Estimated Total Time:**

- UI Development (Mock): 6-8 hours
- Backend Integration: 4-6 hours
- Testing: 3-4 hours
- **Total: 13-18 hours**

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
