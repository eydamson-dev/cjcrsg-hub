# CJCRSG-Hub Feature List

Complete feature catalog for the church management system.

**Last Updated:** 2026-03-28  
**Current Phase:** Phase 9 - Complete  
**Status:** ✅ Completed | Task 9.1 - Testing & Documentation Updates

**Next Up:**

- ⏳ Future: Attendance reporting & analytics
- ⏳ Future: Dashboard statistics widgets
- ⏳ Future: Data export to CSV

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

**Status:** ✅ Completed
**File Modified:** `src/features/events/components/AttendanceManager.tsx`

**A. View Mode Toggle**

- ✅ Added `viewMode` state: `'list' | 'byInviter'`
- ✅ Added Tabs component above table with two options:
  - "List View" - Current table view
  - "By Inviter" - Grouped expandable view
- ✅ Default to 'list' view

**B. Enhanced Table (List View)**

- ✅ Added "Invited By" column between "Check-in Time" and "Actions"
- ✅ Shows inviter name (e.g., "John Smith") or "Walk-in" if no inviter
- ✅ Clicking inviter name is non-interactive

**C. Grouped View (By Inviter)**

- ✅ Accordion-style expandable groups using shadcn Collapsible
- ✅ Each group header shows: Inviter name + count badge
- ✅ Click header toggles expand/collapse
- ✅ Groups:
  - Individual inviters (alphabetically sorted)
  - "Walk-in" group at bottom (attendees with no inviter)
- ✅ Subrows show: Attendee name, status, check-in time, actions dropdown

**D. Enhanced Check-in Flow**

**Single Check-in:**

1. ✅ User searches and clicks attendee in dropdown
2. ✅ Opens `InviterSelectionModal`
3. ✅ User selects inviter or "Walk-in"
4. ✅ Calls `checkIn` mutation with `invitedBy` field
5. ✅ Closes modal, clears search, refreshes list

**Bulk Check-in:**

1. ✅ User selects multiple attendees via checkboxes
2. ✅ Clicks "Add X" button (X = selected count)
3. ✅ Opens `InviterSelectionModal`
4. ✅ User selects inviter (same inviter applies to all)
5. ✅ Calls `bulkCheckIn` mutation with `invitedBy` field
6. ✅ Closes modal, clears selection, refreshes list

**Create Attendee Flow:**

1. ✅ User searches with no results
2. ✅ Shows option in dropdown: "Create new attendee: '{searchQuery}'"
3. ✅ User clicks option → opens `CreateAttendeeModal`
4. ✅ User fills form and saves
5. ✅ Modal closes, new attendee automatically appears in search
6. ✅ User selects new attendee → continues to inviter selection

#### Task 7.3: Update Types & Interfaces

**Status:** ✅ Completed
**File:** `src/features/events/components/AttendanceManager.tsx`

Updated `AttendanceRecordItem` interface with `invitedBy` and `inviter` fields:

```typescript
interface AttendanceRecordItem {
  _id: string
  eventId: string
  attendeeId: string
  checkedInAt: number
  checkedInBy: string
  notes?: string
  invitedBy?: string // ✅ Added
  attendee: {
    _id: string
    firstName: string
    lastName: string
    status: 'member' | 'visitor' | 'inactive'
    email?: string
    phone?: string
  } | null
  inviter?: {
    // ✅ Added
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

### Phase 7 Refined: Attendance Workflow Redesign

**Status:** 🚧 Ready for Implementation
**Goal:** Simplify check-in flow - default to "Walk-in", assign inviters later via table actions

#### Refined Workflow Overview

**Core Changes:**

1. **Remove inviter selection from initial check-in** - All attendees default to "Walk-in"
2. **Add inviter assignment later** - Via Actions dropdown in table rows
3. **Support multi-select in table** - For bulk inviter assignment
4. **Group view quick-add** - "+ Add" button on each inviter group

#### Task 7.5: Simplify Search Flow

**Status:** ✅ Completed
**File:** `src/features/events/components/AttendanceManager.tsx`

**Changes:**

- Remove `InviterSelectionModal` trigger from search check-in
- Default all check-ins to "Walk-in" (no inviter)
- Keep multi-select checkboxes in search dropdown
- Add "Add X" button in dropdown footer
- After adding, clear search and close dropdown
- Toast: "X attendees checked in"

**UI:**

```
Search Results:
┌─────────────────────────────────────┐
│ ☐ John Smith        [Member]        │
│ ☐ Jane Doe          [Visitor]       │
│ ☐ Bob Wilson        [Member]        │
│                                     │
│ [Cancel]              [Add 3]       │
└─────────────────────────────────────┘
```

#### Task 7.6: Add Table Multi-Select (List View)

**Status:** ✅ Completed
**File:** `src/features/events/components/AttendanceManager.tsx`

**Changes:**

- ✅ Add checkbox column (first column)
- ✅ Header checkbox selects all visible rows on current page
- ✅ Show "X selected" count badge
- ✅ "Clear" button to deselect all
- ✅ Selection clears when: switching views, changing pages
- ✅ Persist selection on data refresh (same page)

**Bulk Actions Dropdown** (appears when ≥1 selected):

- ✅ "Assign Inviter" → Opens `InviterSelectionModal`
- ✅ "Remove Selected" → Deletes attendance records

**Keyboard Shortcuts:**

- ✅ Space: Toggle checkbox
- ✅ Escape: Close modals
- ✅ Ctrl/Cmd+A: Select all visible

#### Task 7.7: Add Row Actions - Assign/Remove Inviter

**Status:** ✅ Completed
**File:** `src/features/events/components/AttendanceManager.tsx`

**Actions Dropdown per Row:**

```
Actions ▼
├── View Profile
├── Assign Inviter → Opens InviterSelectionModal
├── Remove Inviter → Sets to "Walk-in"
└── Remove → Deletes attendance record
```

**Flow for Assign Inviter:**

1. ✅ Click "Assign Inviter"
2. ✅ `InviterSelectionModal` opens with title: "Assign Inviter to [Name]"
3. ✅ Select inviter or "Walk-in"
4. ✅ Save updates `invitedBy` field
5. ✅ Toast: "John Smith invited by Mary Johnson"
6. ✅ Table refreshes showing inviter name

**Backend Changes:**

- ✅ Created `updateInviter` mutation in `convex/attendance/mutations.ts`
- ✅ Added `useUpdateInviter` hook in `useAttendance.ts`
- ✅ Supports both assigning and removing inviter (set to null = walk-in)

**Flow for Remove Inviter:**

1. Click trash icon → "Remove Inviter"
2. Sets `invitedBy` to `null`
3. Attendee becomes "Walk-in"
4. Toast: "Inviter removed for John Smith"

#### Task 7.8: By Inviter View - Group Quick-Add

**Status:** ✅ Completed
**File:** `src/features/events/components/AttendanceManager.tsx`

**Group Header UI:**

```
┌────────────────────────────────────────────────────┐
│ Mary Johnson                              [5] [+] │
├────────────────────────────────────────────────────┤
│ ☐ | John Smith    | Member | 9:00 AM | [...]     │
│ ☐ | Alice Brown   | Visitor| 9:15 AM | [...]     │
└────────────────────────────────────────────────────┘
```

**Specifications:**

- ✅ **NO group header checkbox** (individual row checkboxes only)
- ✅ **"+ Add" button** on each group header
- ✅ Selection locked to **one group only** (cannot select across groups)
- ✅ Clicking "+ Add" opens `AttendeeSearchModal` with that inviter pre-selected

**Auto-Hide Empty Groups:**

- ✅ When group reaches 0 attendees, remove immediately from list
- ✅ Fade out animation before removal
- ✅ If attendee removed from group and count becomes 0, hide group

#### Task 7.9: Create AttendeeSearchModal Component

**Status:** ✅ Completed
**File:** `src/features/events/components/AttendeeSearchModal.tsx` (New)

**Props:**

```typescript
interface AttendeeSearchModalProps {
  open: boolean
  inviterName: string // "Mary Johnson" or "Walk-in"
  onSelect: (attendeeIds: string[]) => void
  onClose: () => void
}
```

**Features:**

- ✅ Title: "Add Attendees to [Inviter Name]'s Invites"
- ✅ Search input with debounce (300ms)
- ✅ Filters out already-checked-in attendees
- ✅ Multi-select checkboxes (no limit)
- ✅ "Create new attendee" option when no results found
  - ✅ Opens `CreateAttendeeModal`
  - ✅ After creation, auto-adds to current inviter
  - ✅ Returns to search modal with new attendee selected
- ✅ "Add X" button saves attendance with pre-selected inviter
- ✅ Toast: "3 attendees added to Mary's invites"

**UI:**

```
┌─────────────────────────────────────────────────────────┐
│ Add Attendees to Mary Johnson's Invites          [X]   │
├─────────────────────────────────────────────────────────┤
│ Search for attendees...                                 │
│                                                         │
│ ☐ John Smith        [Member]                            │
│ ☐ Sarah Lee         [Visitor]                           │
│ ☐ Mike Brown        [Member]                            │
│                                                         │
│ [Create new attendee: "SearchQuery"]                    │
│                                                         │
│ [2 selected]                              [Add 2]       │
└─────────────────────────────────────────────────────────┘
```

#### Task 7.10: Update InviterSelectionModal

**Status:** ⏳ Pending
**File:** `src/features/events/components/InviterSelectionModal.tsx`

**Enhancements:**

- Add `title` prop for customization
  - Single: "Assign Inviter to [Attendee Name]"
  - Bulk: "Assign Inviter to X Attendees"
- Keep "Walk-in" option at top
- Support both single and bulk contexts

#### Task 7.11: Update AttendanceRecordItem Interface

**Status:** ✅ Completed
**File:** `src/features/events/components/AttendanceManager.tsx`

**No changes needed** - interface already supports `invitedBy` and `inviter` fields

#### Task 7.12: Testing & Validation (Refined)

**Status:** ✅ Completed

**Test Checklist:**

- ✅ Search and check-in defaults to "Walk-in"
- ✅ Can check-in multiple attendees from search (all walk-in)
- ✅ Table multi-select works in List View
- ✅ Table multi-select works in By Inviter view (one group only)
- ✅ Can assign inviter via row Actions
- ✅ Can remove inviter (reverts to walk-in)
- ✅ Can bulk assign inviter to multiple selected rows
- ✅ Group view "+ Add" button works
- ✅ Creating attendee from group view auto-assigns that inviter
- ✅ Empty groups auto-hide
- ✅ Keyboard shortcuts work (Space, Escape, Ctrl+A)
- ✅ Selection clears on view switch and page change

**Code Quality:**

- ✅ All TypeScript compilation successful (0 errors in source files)
- ✅ ESLint passes without errors
- ✅ All imports resolved correctly
- ✅ Backend mutations tested and working

---

## Next Tasks

### Task 8.1: Refactor AttendanceManager with Add Attendance Button

**Status:** ✅ Completed 2026-03-28  
**Priority:** HIGH  
**Goal:** Replace search bar with dedicated "Add Attendance" button and enhance AttendeeSearchModal for general attendance addition

**Implementation Approach:** Manual testing each phase, no commits until you approve

**Completed Work Summary:**

✅ **Phase 1-4: AttendeeSearchModal Enhancement**

- Added `mode` prop (`groupAdd` | `generalAdd`) for flexible usage
- Implemented inviter selection with InviterSelectionModal integration
- Created unified Command list with search results + selected attendees
- Selected attendees appear at bottom with "Selected" label and remove functionality
- Fixed bug where selected attendees weren't visible when clearing search
- Added "New attendee?" link below search field with search query pre-population

✅ **Phase 5-6: AttendanceManager Refactoring**

- Removed inline search bar from AttendanceManager (~150 lines removed)
- Added "Add Attendance" button in CardHeader with Plus icon
- Integrated AttendeeSearchModal with `mode="generalAdd"`
- Updated InviterSelectionModal to return full Attendee object (enables name display)
- Added `name` prop to CreateAttendeeModal for pre-populating first name

✅ **Phase 7: Manual Testing**

- Verified modal opens and closes correctly
- Tested inviter selection (Walk-in and named inviters)
- Tested attendee search and selection
- Confirmed selected attendees persist when clearing search
- Verified "New attendee?" link pre-populates first name
- Tested bulk check-in with selected attendees
- Confirmed no console errors

---

#### Implementation Phases

| Phase     | Component           | Focus                          | Status   | Files Modified          |
| --------- | ------------------- | ------------------------------ | -------- | ----------------------- |
| 1         | AttendeeSearchModal | Interface & structure updates  | ✅       | AttendeeSearchModal.tsx |
| 2         | AttendeeSearchModal | Inviter selection button       | ✅       | AttendeeSearchModal.tsx |
| 3         | AttendeeSearchModal | Selected attendees section     | ✅       | AttendeeSearchModal.tsx |
| 4         | AttendeeSearchModal | Final integration & polish     | ✅       | AttendeeSearchModal.tsx |
| 5         | AttendanceManager   | Remove search bar              | ✅       | AttendanceManager.tsx   |
| 6         | AttendanceManager   | Add button & modal integration | ✅       | AttendanceManager.tsx   |
| 7         | Both                | Manual testing                 | ✅       | Manual testing          |
| **Total** |                     |                                | **Done** |                         |

**Phase Details:**

**Phase 1:** Update interface with new props (`mode`, `inviterName`, `title`), add internal state, implement dynamic title logic, add placeholder for selected attendees section

**Phase 2:** Add inviter selection button (only in generalAdd mode), integrate InviterSelectionModal as sub-modal, handle inviter selection state

**Phase 3:** Build "Selected Attendees (X)" section below search results with Name + Status badge + Trash icon for each attendee, plus "Clear All" button

**Phase 4:** Wire everything together, update `handleSave` to pass `inviterId`, ensure proper state reset, handle edge cases

**Phase 5:** Remove search input and dropdown (~150 lines), remove related states and handlers, remove searchRef and useDebounce, clean up all search-related JSX

**Phase 6:** Add "Add Attendance" button in CardHeader, add modal state, implement modal with `mode="generalAdd"`, handle onSelect callback with bulkCheckIn mutation

**Phase 7:** Manual testing - open modal, test inviter selection, test attendee search/selection, test selected attendees section, test bulk check-in, verify no console errors

---

#### Part A: Modify AttendeeSearchModal Component

**File:** `src/features/events/components/AttendeeSearchModal.tsx`

**Interface Changes:**

```typescript
interface AttendeeSearchModalProps {
  open?: boolean
  mode?: 'groupAdd' | 'generalAdd' // 'groupAdd' = with inviter, 'generalAdd' = standalone
  inviterName?: string // For groupAdd mode title
  title?: string // Optional custom title override
  onSelect: (attendeeIds: string[], inviterId: string | null) => void
  onClose: () => void
  excludeAttendeeIds?: string[]
}
```

**Key Features:**

1. **Dynamic Title:**
   - `groupAdd` mode: "Add Attendees to {inviterName}'s Invites"
   - `generalAdd` mode: "Add Attendance"

2. **Inviter Selection Button** (generalAdd mode only):
   - Button displays: "Inviter: Walk-in" (default) or "Inviter: [Name]"
   - Clicking opens `InviterSelectionModal`
   - Selected inviter ID stored in component state
   - `null` = Walk-in (default)

3. **Selected Attendees Section:**
   - Shows below search results: "Selected Attendees (X)"
   - Lists marked attendees with:
     - Name
     - Status badge (Member/Visitor)
     - Trash icon to unmark individual attendees
   - "Clear All" button to remove all selections
   - Scrollable with max-height if many selected

4. **UI Layout for generalAdd Mode:**

   ```
   ┌─────────────────────────────────────────────────────────┐
   │ Add Attendance                                   [X]   │
   ├─────────────────────────────────────────────────────────┤
   │ ┌──────────────────────────────────────────────┐      │
   │ │ Inviter: Walk-in                   [Change]    │      │
   │ └──────────────────────────────────────────────┘      │
   ├─────────────────────────────────────────────────────────┤
   │ Search for attendees...                                 │
   │                                                         │
   │ ☐ John Smith        [Member]                            │
   │ ☐ Sarah Lee         [Visitor]                           │
   │                                                         │
   │ [Create new attendee: "SearchQuery"]                    │
   ├─────────────────────────────────────────────────────────┤
   │ Selected Attendees (3)                         [Clear]  │
   │ ┌─────────────────────────────────────────────────────┐ │
   │ │ John Smith    [Member]                    [🗑️]      │ │
   │ │ Sarah Lee     [Visitor]                   [🗑️]      │ │
   │ └─────────────────────────────────────────────────────┘ │
   ├─────────────────────────────────────────────────────────┤
   │ [Cancel]                                [Add 3]       │
   └─────────────────────────────────────────────────────────┘
   ```

5. **Workflow:**
   - Modal opens with "Inviter: Walk-in" button
   - User clicks [Change] → opens `InviterSelectionModal`
   - After selecting inviter, return to this modal with updated button text
   - User searches and selects attendees via checkboxes
   - Selected attendees appear in bottom section with trash icons
   - Clicking trash unmarks that attendee
   - Clicking [Add X] calls `onSelect(attendeeIds, inviterId)`

#### Part B: Modify AttendanceManager Component

**File:** `src/features/events/components/AttendanceManager.tsx`

**Changes:**

1. **Remove Search Bar:**
   - Delete search input and dropdown (~150 lines)
   - Remove states: `searchQuery`, `showSearchResults`, `selectedAttendees`, `pendingAttendees`
   - Remove handlers: `handleBulkCheckIn`, `handleCreateAttendee`, `handleInviterSelect`, `handleAttendeeCreated`
   - Remove `searchRef`, `useDebounce` for search

2. **Add "Add Attendance" Button:**
   - **Placement:** In CardHeader next to attendee count (Option A)
   - **UI:**
     ```tsx
     <Button
       onClick={() => setShowAddAttendanceModal(true)}
       variant="outline"
       size="sm"
     >
       <Plus className="mr-2 h-4 w-4" />
       Add Attendance
     </Button>
     ```

3. **New State:**

   ```typescript
   const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false)
   ```

4. **Modal Implementation:**

   ```tsx
   <AttendeeSearchModal
     open={showAddAttendanceModal}
     mode="generalAdd"
     onSelect={async (attendeeIds, inviterId) => {
       const attendeesToCheckIn = attendeeIds.map((id) => ({
         attendeeId: id,
         invitedBy: inviterId || undefined,
       }))
       await bulkCheckIn.mutateAsync({ eventId, attendees: attendeesToCheckIn })
       setShowAddAttendanceModal(false)
     }}
     onClose={() => setShowAddAttendanceModal(false)}
     excludeAttendeeIds={attendance.map((r) => r.attendeeId)}
   />
   ```

5. **CardHeader Update:**
   ```tsx
   <CardHeader>
     <div className="flex items-center justify-between">
       <CardTitle>Checked-in Attendees</CardTitle>
       <div className="flex items-center gap-3">
         <Button
           onClick={() => setShowAddAttendanceModal(true)}
           variant="outline"
           size="sm"
         >
           <Plus className="mr-2 h-4 w-4" />
           Add Attendance
         </Button>
         <div className="flex items-center gap-2">
           <Users className="size-4 text-muted-foreground" />
           <span className="text-2xl font-bold">{totalCount}</span>
         </div>
       </div>
     </div>
   </CardHeader>
   ```

#### Part C: Reuse InviterSelectionModal

**Integration in AttendeeSearchModal:**

```tsx
const [showInviterModal, setShowInviterModal] = useState(false)
const [currentInviterId, setCurrentInviterId] = useState<string | null>(null)

// Helper to get inviter name from ID
const getInviterName = (id: string | null) => {
  if (!id) return 'Walk-in'
  // Could fetch from attendees list or pass inviter list as prop
  return 'Selected Inviter' // Simplified
}

// In render:
<Button
  variant="outline"
  onClick={() => setShowInviterModal(true)}
  className="w-full justify-between"
>
  <span>Inviter: {getInviterName(currentInviterId)}</span>
  <span className="text-muted-foreground text-sm">Change</span>
</Button>

// ... later in JSX:
<InviterSelectionModal
  open={showInviterModal}
  onSelect={(inviterId) => {
    setCurrentInviterId(inviterId)
    setShowInviterModal(false)
  }}
  onClose={() => setShowInviterModal(false)}
  excludeAttendeeIds={[]} // All attendees can be inviters
/>
```

**Acceptance Criteria:**

- [ ] Search bar removed from AttendanceManager
- [ ] "Add Attendance" button visible in CardHeader
- [ ] Clicking button opens AttendeeSearchModal in generalAdd mode
- [ ] Modal shows "Add Attendance" title
- [ ] Inviter button shows "Inviter: Walk-in" by default
- [ ] Clicking inviter button opens InviterSelectionModal
- [ ] After selecting inviter, modal returns with updated inviter name
- [ ] Search for attendees works with checkboxes
- [ ] Selected attendees appear in separate section
- [ ] Trash icon unmarks individual attendees
- [ ] Clear All button removes all selections
- [ ] Add button shows count and is disabled when 0 selected
- [ ] Clicking Add checks in all selected with chosen inviter
- [ ] Default inviter is Walk-in (null)

---

### Phase 9: Testing & Documentation Updates

**Status:** ✅ Completed 2026-03-28

**Summary:**

Fixed all failing tests after Phase 8 refactoring:

1. **Unit Test Fixes:**
   - ✅ Fixed `AttendanceManager.test.tsx` - Updated for new "Add Attendance" button UI
   - ✅ Fixed `EventArchive.test.tsx` - Updated mocks for new EventList architecture
   - ✅ Fixed `convex/events/queries.test.ts` - Fixed listArchive tests to set isActive=false
   - ✅ Suppressed stderr warnings in test setup (hydration, convex-test warnings)
   - ✅ Fixed EventFilters Select mock HTML validation error

2. **E2E Test Fixes:**
   - ✅ Fixed 6 failing tests in `events-crud.spec.ts`
   - ✅ Changed `/events/archive` → `/events/history` navigation in 3 tests
   - ✅ Fixed archive test expectations (archived events should appear in archive)
   - ✅ All 42 E2E tests now passing (4 skipped by design)

**Test Results:**

- **Unit Tests:** 553 passing (33 test files)
- **E2E Tests:** 42 passing (4 skipped)
- **Total:** 595 tests passing

---

## Testing Summary

| Category          | Count   | Status             |
| ----------------- | ------- | ------------------ |
| Convex Unit Tests | 114     | ✅ Passing         |
| Component Tests   | 410     | ✅ Passing         |
| E2E Tests         | 42      | ✅ Passing         |
| **Total**         | **595** | **✅ All Passing** |

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
