# CJCRSG-Hub Feature List

Complete feature catalog for the church management system.

**Last Updated:** 2026-03-30  
**Current Phase:** Phase 13 - Spiritual Retreat Enhancement  
**Status:** ⏳ Planned | Teachers, Lessons, and Staff Management

**Next Up:**

- ⏳ Phase 13.1: Database Schema & Validators (Waiting for approval)
- ⏳ Phase 13.2: Backend - Retreat Module (Queries & Mutations)
- ⏳ Phase 13.3: Frontend Types & Hooks
- ⏳ Phase 13.4: Tabbed UI Components (Teachers, Schedule, Staff)
- ⏳ Phase 13.5: Integration with Spiritual Retreat page
- ⏳ Phase 13.6: Testing

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

## Phase 10: Sunday Service Dedicated Page

**Status:** 🚧 In Progress  
**Route:** `/events/sunday-service`  
**Goal:** Create a dedicated page for Sunday Service events with the same functionality as the general Events page, but specialized for Sunday Service type.

### Overview

Extract `EventsContent` from `src/routes/events.index.tsx` into a reusable configurable component that supports any event type, then create a dedicated Sunday Service page using it.

### Implementation Phases

| Phase | Task                                                         | Status      |
| ----- | ------------------------------------------------------------ | ----------- |
| 1     | Backend queries (getCurrentEventByType, getStatsByEventType) | ✅ Complete |
| 2     | Frontend hooks (useCurrentEvent, useEventStats)              | ✅ Complete |
| 3     | Extract EventsContent component                              | ✅ Complete |
| 4     | Update EmptyEventState                                       | ✅ Complete |
| 5     | Update QuickStats                                            | ✅ Complete |
| 6     | Update events.index.tsx                                      | ✅ Complete |
| 7     | Create sunday-service route                                  | ✅ Complete |
| 8     | Update navigation                                            | ✅ Complete |
| 9     | Update sidebar with accordion                                | ✅ Complete |

---

#### Phase 1: Backend (Convex) ✅ Complete

**File:** `convex/events/queries.ts`

**Added 2 new queries:**

1. **`getCurrentEventByType`** - Get the currently active event filtered by event type
   - Returns null if no event of that type is active
   - Includes attendance count

2. **`getStatsByEventType`** - Get event statistics filtered by event type
   - Returns stats for events of a specific type only
   - Total events, byStatus counts, thisMonth count, nextUpcoming

**Lines added:** ~114

**Verified:** Both queries tested successfully via Convex CLI

---

#### Phase 2: Frontend Hooks

**File:** `src/features/events/hooks/useEvents.ts`

**Modify 2 hooks:**

1. **`useCurrentEvent`** - Add optional `eventTypeId?: string` parameter
   - Use `getCurrentEventByType` when `eventTypeId` provided
   - Use `getCurrentEvent` when no `eventTypeId`

2. **`useEventStats`** - Add optional `eventTypeId?: string` parameter
   - Use `getStatsByEventType` when `eventTypeId` provided
   - Use `getStats` when no `eventTypeId`

**Estimated:** ~20 lines modified

---

#### Phase 3: Extract Reusable EventsContent Component

**New File:** `src/features/events/components/EventsContent.tsx`

**Props Interface:**

```typescript
interface EventsContentProps {
  // Identity
  title: string
  subtitle?: string
  eventColor?: string // For header color indicator

  // Event Type Configuration
  eventTypeId?: string
  eventTypeName?: string // For default name generation

  // Quick Start Configuration
  defaultEventName: (date: Date) => string
  defaultStartTime?: string // e.g., "09:00"
  defaultEndTime?: string // e.g., "11:00"

  // Empty State
  emptyStateTitle: string
  emptyStateDescription?: string
  quickStartLabel: string

  // Stats Configuration
  statsComponent?: React.ComponentType<StatsProps> // Default: QuickStats
}
```

**Features:**

- Configurable header with optional event type color dot
- Uses `useCurrentEvent({ eventTypeId })` for filtered current event
- Uses `useEventStats({ eventTypeId })` for filtered stats
- Supports custom stats component via `statsComponent` prop
- Handles unsaved event workflow with configurable defaults
- Navigation buttons for Event History and Archive

**Estimated:** ~350 lines (new file)

---

#### Phase 4: Update EmptyEventState

**File:** `src/features/events/components/EmptyEventState.tsx`

**Changes:**

- Add `statsComponent?: React.ComponentType<StatsProps>` prop
- Add `quickStartLabel?: string` prop (for customizable button text)
- Use custom stats component when provided, otherwise default QuickStats
- Display quick start button with custom label

**Estimated:** ~30 lines modified

---

#### Phase 5: Update QuickStats

**File:** `src/features/events/components/QuickStats.tsx`

**Changes:**

- Add optional label props with defaults:
  - `eventsThisMonthLabel?: string` (default: "Events This Month")
  - `totalEventsLabel?: string` (default: "Total Events")
  - `lastEventLabel?: string` (default: "Last Event")
  - `nextScheduledLabel?: string` (default: "Next Scheduled")

This allows custom stats components to pass different labels while reusing QuickStats logic.

**Estimated:** ~20 lines modified

---

#### Phase 6: Update Events Index Page

**File:** `src/routes/events.index.tsx`

**Changes:**

- Import `EventsContent` from components
- Replace inline `EventsContent` function with imported component
- Pass configuration for general Events:
  ```typescript
  <EventsContent
    title="Events"
    subtitle="Manage church events and services"
    defaultEventName={(date) =>
      `New Event - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    emptyStateTitle="No Active Event"
    quickStartLabel="Start Event"
  />
  ```

**Estimated:** ~250 lines removed, ~20 lines added

---

#### Phase 7: Create Sunday Service Route

**New File:** `src/routes/events.sunday-service.tsx`

**Implementation:**

- Route: `/events/sunday-service`
- Find "Sunday Service" event type by name
- Use `EventsContent` with Sunday Service configuration:
  - Title: "Sunday Service" with color dot
  - Default name: "Sunday Service - March 30, 2026"
  - Default times: 09:00 - 11:00
  - Event type ID filter
  - Custom stats labels via wrapper component

**Sample Configuration:**

```typescript
<EventsContent
  title="Sunday Service"
  subtitle="Manage Sunday worship services"
  eventColor={sundayServiceType.color}
  eventTypeId={sundayServiceType._id}
  eventTypeName="Sunday Service"
  defaultEventName={(date) =>
    `Sunday Service - ${date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })}`
  }
  defaultStartTime="09:00"
  defaultEndTime="11:00"
  emptyStateTitle="No Sunday Service Today"
  emptyStateDescription="Start a new Sunday Service to begin tracking attendance."
  quickStartLabel="Start Sunday Service"
  statsComponent={SundayServiceStats}  // Custom wrapper with custom labels
/>
```

**Custom Stats Component Example:**

```typescript
function SundayServiceStats(props: StatsProps) {
  return (
    <QuickStats
      {...props}
      eventsThisMonthLabel="Sunday Services This Month"
      totalEventsLabel="Total Sunday Services"
      lastEventLabel="Last Service"
      nextScheduledLabel="Next Service"
    />
  )
}
```

**Estimated:** ~80 lines (new file)

---

#### Phase 8: Update Navigation

**File:** `src/lib/navigation.ts`

**Changes:**

- Add `children` array to Events nav item
- Add sub-items:
  - "All Events" (`/events`) with List icon
  - "Sunday Service" (`/events/sunday-service`) with Church icon

**Estimated:** ~15 lines modified

---

#### Phase 9: Update Sidebar with Accordion

**File:** `src/components/layout/Sidebar.tsx`

**Changes:**

- Make Events menu item expandable using shadcn Accordion
- Show sub-items (All Events, Sunday Service) when expanded
- Highlight active sub-item
- Use Church icon for Sunday Service

**Estimated:** ~40 lines modified

---

### Summary of Changes

| Phase     | File(s)                                              | Lines Changed        | Description                                  |
| --------- | ---------------------------------------------------- | -------------------- | -------------------------------------------- |
| 1         | `convex/events/queries.ts`                           | +80                  | 2 new backend queries                        |
| 2         | `src/features/events/hooks/useEvents.ts`             | +20                  | Modify 2 hooks with optional eventTypeId     |
| 3         | `src/features/events/components/EventsContent.tsx`   | +350                 | New reusable component                       |
| 4         | `src/features/events/components/EmptyEventState.tsx` | +30                  | Add statsComponent and quickStartLabel props |
| 5         | `src/features/events/components/QuickStats.tsx`      | +20                  | Add optional label props                     |
| 6         | `src/routes/events.index.tsx`                        | -250, +20            | Use EventsContent component                  |
| 7         | `src/routes/events.sunday-service.tsx`               | +80                  | New Sunday Service route                     |
| 8         | `src/lib/navigation.ts`                              | +15                  | Add sub-nav for Events                       |
| 9         | `src/components/layout/Sidebar.tsx`                  | +40                  | Accordion for Events menu                    |
| **Total** | **9 files**                                          | **~405 lines added** |                                              |

### Acceptance Criteria

- [ ] `/events/sunday-service` route accessible from sidebar
- [ ] Shows "Sunday Service" header with event type color dot
- [ ] If active Sunday Service exists, shows EventDetails in dashboard mode
- [ ] If no active Sunday Service, shows empty state with "Start Sunday Service" button
- [ ] Quick start creates event named "Sunday Service - [Date]" with 9AM-11AM default time
- [ ] Stats show "Sunday Services This Month" and "Total Sunday Services"
- [ ] Events sidebar menu has accordion with "All Events" and "Sunday Service" sub-items
- [ ] Sunday Service uses Church icon from lucide-react
- [ ] Navigation between sub-items works correctly
- [ ] All existing functionality on general Events page still works

### Dependencies

- Requires "Sunday Service" event type to exist in database
- Uses existing hooks: useCurrentEvent, useEventStats, useCreateEvent, useStartEvent
- Uses existing components: EventDetails, EmptyEventState, QuickStats
- Uses shadcn Accordion component for sidebar

---

### Phase 10.10: Breadcrumb Navigation Enhancement

**Status:** ✅ Complete 2026-03-28

**Summary:**

Enhanced breadcrumb navigation to respect event type context across the app:

1. **Phase 10.10.1**: Updated `EventsBreadcrumb` component
   - Added `parentEventTypeId`, `parentEventTypeName`, `showParentLink` props
   - Generates correct Events URL based on parent event type
   - Created `BackLink` component with dynamic back label

2. **Phase 10.10.2**: Updated Sunday Service page
   - Added hardcoded `SUNDAY_SERVICE_NAME` constant
   - Passes parent context to breadcrumbs

3. **Phase 10.10.3**: Created fallback route
   - New file: `src/routes/events.$slug.tsx`
   - Dynamic event type lookup by slug
   - Redirects to `/events` if not found

4. **Phase 10.10.4**: Updated History page
   - Passes parent context to breadcrumbs

5. **Phase 10.10.5**: Updated Archive page
   - Passes parent context to EventArchive component
   - Fixed test mock for BackLink component

6. **Phase 10.10.6**: Updated Event Detail page
   - Added breadcrumbs and back link based on event type
   - Navigates to correct parent page (e.g., Sunday Service)

**Test Results:** 553 tests passing

---

### Phase 10.11: Loading State Improvements

**Status:** ✅ Complete 2026-03-28

**Summary:**

Improved loading state handling to prevent flash of error messages:

1. **Create reusable LoadingSpinner and PageLoader components**
   - New file: `src/components/ui/loading-spinner.tsx`
   - `LoadingSpinner` with configurable size (sm/md/lg) and optional message
   - `PageLoader` for common page loading states

2. **Add loader prop to EventsContent**
   - Accepts custom ReactNode to show while loading
   - Backward compatible - uses default spinner if not provided
   - Parent components pass PageLoader via loader prop

3. **Fix isPending checks in event type pages**
   - Add `isPending` check to Sunday Service page
   - Add `isPending` check to fallback slug route
   - Prevents "not found" message from flashing during page load

**Files Modified:**

- `src/components/ui/loading-spinner.tsx` (new)
- `src/features/events/components/EventsContent.tsx` - added loader prop
- `src/routes/events.index.tsx` - added loader prop
- `src/routes/events.sunday-service.tsx` - added loader prop and isPending check
- `src/routes/events.$slug.tsx` - added loader prop and isPending check

**Test Results:** 553 tests passing

**Problem:**

- On Sunday Service History/Archive page, clicking "Events" breadcrumb goes to `/events` (general page)
- Should go to `/events/sunday-service` (specific page)
- "Back" button should say "Back to Sunday Service" and navigate correctly

**Approach:** Hardcoded Names with Fallback

#### Implementation Details

**Q1: Event Type Lookup:** Hardcode by NAME instead of ID

```typescript
const SUNDAY_SERVICE_NAME = 'Sunday service' // Hardcoded in each page
const sundayServiceType = eventTypes?.find(
  (et) => et.name === SUNDAY_SERVICE_NAME,
)
```

**Q2: Fallback Route Behavior:**

- Try to find event type by slug (dynamic lookup)
- If found: render generic EventsContent
- If NOT found: redirect to `/events`

**Q3: Skip slug generation for hardcoded pages** - each page has its own hardcoded name

#### Phase 10.10.1: Update EventsBreadcrumb Component

**File:** `src/features/events/components/EventsBreadcrumb.tsx`

**Add props:**

```typescript
interface EventsBreadcrumbProps {
  items: BreadcrumbItemData[]
  parentEventTypeId?: string
  parentEventTypeName?: string
  showParentLink?: boolean
}
```

**Logic:**

```typescript
const getEventsUrl = () => {
  if (parentEventTypeId && parentEventTypeName) {
    const slug = parentEventTypeName.toLowerCase().replace(/\s+/g, '-')
    return `/events/${slug}`
  }
  return '/events'
}

const backText = parentEventTypeName
  ? `Back to ${parentEventTypeName}`
  : 'Back to Events'
```

#### Phase 10.10.2: Update Sunday Service Page

**File:** `src/routes/events.sunday-service.tsx`

**Add hardcoded constant:**

```typescript
const SUNDAY_SERVICE_NAME = 'Sunday service'
const sundayServiceType = eventTypes?.find(
  (et) => et.name === SUNDAY_SERVICE_NAME,
)
```

#### Phase 10.10.3: Create Fallback Route

**File:** `src/routes/events.$slug.tsx` (NEW)

**Logic:**

1. Get slug from URL params (e.g., "prayer-meeting")
2. Convert to name format: "prayer meeting"
3. Find event type by name (case-insensitive)
4. **If found:** Render EventsContent with that event type
5. **If not found:** Redirect to `/events`

**Implementation:**

```typescript
const searchName = slug.replace(/-/g, ' ')
const eventType = eventTypes?.find(
  (et) => et.name.toLowerCase() === searchName.toLowerCase()
)

if (!eventType) {
  return <Navigate to="/events" />
}

return <EventsContent
  title={eventType.name}
  subtitle={`Manage ${eventType.name} events`}
  eventTypeId={eventType._id}
  // ... other props
/>
```

#### Phase 10.10.4: Update History Page

**File:** `src/routes/events.history.tsx`

**Add parent context:**

```typescript
const searchParams = useSearch({ from: '/events/history' })
const parentEventType = searchParams.type
  ? eventTypes?.find(et => et._id === searchParams.type)
  : undefined

<EventsBreadcrumb
  items={[{ label: 'History' }]}
  parentEventTypeId={parentEventType?._id}
  parentEventTypeName={parentEventType?.name}
/>
```

#### Phase 10.10.5: Update Archive Page

**File:** `src/routes/events.archive.tsx`

Same as Phase 10.10.4.

#### Phase 10.10.6: Update Event Detail Page

**File:** `src/routes/events.$id.tsx`

```typescript
const eventType = eventTypes?.find(et => et._id === event?.eventTypeId)

<EventsBreadcrumb
  items={[{ label: event?.name }]}
  parentEventTypeId={event?.eventTypeId}
  parentEventTypeName={eventType?.name}
/>
```

#### Testing Checklist

- [ ] Sunday Service page: "Events" breadcrumb goes to `/events/sunday-service`
- [ ] Sunday Service History: Breadcrumb shows "Home > Events > Sunday Service > History"
- [ ] History "Events" link → goes to `/events/sunday-service`
- [ ] History "Back" button → says "Back to Sunday Service", goes to `/events/sunday-service`
- [ ] Sunday Service Archive: Same breadcrumb behavior
- [ ] Event Detail page: Back button respects parent event type
- [ ] Fallback route works for unhandled event types
- [ ] Fallback redirects to `/events` if event type not found

---

## Phase 11: Image Upload with Convex Storage

**Status:** ✅ Complete 2026-03-30

**Goal:** Implement persistent image uploads for event banners and media galleries using Convex storage.

### Problem

1. **Validation was too restrictive** - The `isValidImageUrl` validator only accepted URLs ending with specific extensions (.jpg, .jpeg, .png, .gif, .webp, .svg) or data URIs. It rejected blob URLs from `URL.createObjectURL()` and URLs without extensions.

2. **Images didn't persist** - The original implementation used `URL.createObjectURL()` which creates temporary blob URLs that only exist in the current browser session. These become invalid after page reload.

### Solution

#### Phase 1: Fix Validation

**File:** `convex/events/validators.ts`

Updated `isValidImageUrl` to accept:

- Data URIs (`data:image/...`)
- Blob URLs (`blob:...`)
- Any HTTP/HTTPS URL (no longer requires file extension)

---

#### Phase 2: Convex File Storage Backend

**File:** `convex/events/files.ts` (NEW)

Created mutations for file upload handling:

| Mutation            | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `generateUploadUrl` | Creates a pre-signed upload URL for client-side upload    |
| `updateBanner`      | Updates event bannerImage with storage ID or external URL |
| `addMediaItem`      | Adds media item to event's media array                    |
| `removeMediaItem`   | Removes media item from event's media array               |
| `getFileUrl`        | Gets CDN URL from storage ID                              |

**File:** `convex/events/queries.ts`

Added URL resolution helpers:

- `resolveBannerUrl(ctx, bannerImage)` - Converts storage IDs to CDN URLs
- `resolveMediaUrls(ctx, media)` - Converts media array storage IDs to CDN URLs

Updated queries to resolve URLs:

- `getById` - Resolves banner and media URLs
- `getCurrentEvent` - Resolves banner and media URLs
- `getCurrentEventByType` - Resolves banner and media URLs
- `list` - Resolves banner URLs
- `listActive` - Resolves banner URLs
- `listArchive` - Resolves banner URLs

---

#### Phase 3: Frontend Hooks and Components

**File:** `src/features/events/hooks/useFileUpload.ts` (NEW)

Upload hook providing:

- `uploadFile(file: File)` - Uploads file to Convex storage
- `uploadFromUrl(url: string)` - Validates external URL
- `generateDownloadUrl(storageId)` - Gets CDN URL for storage ID

**File:** `src/features/events/components/BannerUploader.tsx`

- Now supports both Convex storage AND external URLs
- Added Ctrl+V paste support:
  - Pasted image files are uploaded to Convex storage
  - Pasted image URLs are validated and set as banner
- Toast notifications for success/error
- Hint text for users about paste functionality

**File:** `src/features/events/components/MediaGallery.tsx`

- Now uses Convex storage only (no external URLs)
- Drag-and-drop upload support
- 10MB file size limit

**File:** `src/features/events/components/EventDetails.tsx`

- Passes eventId to BannerUploader and MediaGallery

---

#### Phase 4: Fix Thumbnail Display in List Views

**Problem:** Thumbnails were broken in history and archive list views.

**Cause:** The `list`, `listActive`, and `listArchive` queries weren't resolving banner URLs from storage IDs.

**Fix:** Added `resolveBannerUrl` call to all three queries to convert storage IDs to CDN URLs before returning results.

---

### Files Created

| File                                         | Description            |
| -------------------------------------------- | ---------------------- |
| `convex/events/files.ts`                     | File storage mutations |
| `src/features/events/hooks/useFileUpload.ts` | Upload hook            |

### Files Modified

| File                                                   | Changes                                            |
| ------------------------------------------------------ | -------------------------------------------------- |
| `convex/events/validators.ts`                          | Fixed isValidImageUrl validation                   |
| `convex/events/queries.ts`                             | Added URL resolution helpers, updated list queries |
| `src/features/events/components/BannerUploader.tsx`    | Added Convex storage + paste support               |
| `src/features/events/components/MediaGallery.tsx`      | Changed to Convex storage only                     |
| `src/features/events/components/EventDetails.tsx`      | Pass eventId to upload components                  |
| `tests/unit/components/events/BannerUploader.test.tsx` | Updated mock                                       |

### Test Results

- All 553 tests passing

---

## Phase 12: Spiritual Retreat Page

**Status:** ✅ Complete 2026-03-30

**Goal:** Create a dedicated event page for Spiritual Retreat events, similar to Sunday Service page.

### Implementation

**New File:** `src/routes/events.spiritual-retreat.tsx`

- Route: `/events/spiritual-retreat`
- Looks for "Retreat" event type
- Default times: 08:00 - 17:00 (full day retreat)
- Title: "Spiritual Retreat"
- Subtitle: "Manage spiritual retreat events"
- Uses green color from Retreat event type
- Filtered history and archive links

**Updated:** `src/lib/navigation.ts`

- Added Spiritual Retreat to Events sub-menu
- Uses Mountain icon from lucide-react
- Accessible at `/events/spiritual-retreat`

---

## Phase 13: Spiritual Retreat Enhancement

**Status:** ⏳ Planned  
**Goal:** Add teachers, teaching lessons, and staff personnel management to Spiritual Retreat events with tabbed UI interface  
**Estimated Time:** 11.5 hours  
**Priority:** HIGH

### Requirements Summary

- **Teachers:** Must have qualified status (Pastor, Leader, Elder, or Deacon)
- **Schedule:** 1-3 day retreats with lesson/activity timeline, no overlapping sessions
- **Staff:** Any attendee can be staff, free-form role text
- **UI:** Tabbed layout (Overview | Teachers | Schedule | Staff | Attendance)
- **Layout:** Easy to switch between tabs and accordion layouts

---

### Phase 13.1: Database Schema & Validators ⏳ WAITING FOR APPROVAL

**Time:** 1 hour  
**Files:** `convex/schema.ts`, `convex/events/validators.ts`

#### Schema Changes

Add to `events` table in `convex/schema.ts`:

```typescript
retreatTeachers: v.optional(v.array(v.object({
  attendeeId: v.id('attendees'),
  subject: v.optional(v.string()),
  bio: v.optional(v.string()),
}))),
retreatLessons: v.optional(v.array(v.object({
  id: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  teacherId: v.optional(v.id('attendees')),
  day: v.optional(v.number()), // 1, 2, 3 for multi-day
  startTime: v.string(), // "HH:mm" format
  endTime: v.string(), // "HH:mm" format
  location: v.optional(v.string()),
  type: v.union(
    v.literal('teaching'),
    v.literal('meal'),
    v.literal('break'),
    v.literal('worship'),
    v.literal('registration'),
    v.literal('closing'),
    v.literal('other')
  ),
}))),
retreatStaff: v.optional(v.array(v.object({
  attendeeId: v.id('attendees'),
  role: v.string(),
  responsibilities: v.optional(v.string()),
  isLead: v.optional(v.boolean()),
})))
```

#### Validators

Add to `convex/events/validators.ts`:

- `qualifiedTeacherStatuses` array: ['Pastor', 'Leader', 'Elder', 'Deacon']
- `validateTeacherStatus(attendeeId)` - Check if attendee has qualified status
- `validateLessonOverlap(eventId, lesson)` - Check for time conflicts on same day
- `validateLessonTimes(startTime, endTime)` - Ensure end > start

**Acceptance Criteria:**

- [ ] Schema updated with three new optional fields
- [ ] Validators created for teacher status and lesson overlap
- [ ] TypeScript types generated (`pnpm dlx convex dev --once`)

---

### Phase 13.2: Backend - Retreat Module ⏳ WAITING FOR APPROVAL

**Time:** 2 hours  
**New Folder:** `convex/retreat/`  
**Files:** `queries.ts`, `mutations.ts`, `validators.ts`

#### Queries (4 total)

1. **`getRetreatDetails(ctx, eventId)`**
   - Fetch event with teachers, lessons, staff populated with attendee data
   - Join attendee info for all references

2. **`getQualifiedTeachers(ctx)`**
   - List all attendees with Pastor/Leader/Elder/Deacon status
   - Used for teacher selection dropdown

3. **`checkTeacherLessons(ctx, eventId, teacherId)`**
   - Check if teacher has assigned lessons
   - Used before allowing teacher removal

4. **`getLessonConflicts(ctx, eventId, lesson)`**
   - Return list of conflicting lessons (same day, overlapping time)
   - Used for overlap validation

#### Mutations (12 total)

**Teacher Management:**

- `addTeacher(ctx, eventId, attendeeId, subject?, bio?)`
  - Validate attendee has qualified status
  - Prevent duplicates
- `removeTeacher(ctx, eventId, attendeeId)`
  - Check if teacher has lessons (return warning flag)
  - Allow removal with force flag
- `updateTeacher(ctx, eventId, attendeeId, subject?, bio?)`

**Lesson Management:**

- `addLesson(ctx, eventId, lesson)`
  - Validate no time conflicts (same day)
  - Validate teacher exists (if provided)
  - Validate times (end > start)
- `updateLesson(ctx, eventId, lessonId, updates)`
  - Re-validate conflicts if time/day changed
- `removeLesson(ctx, eventId, lessonId)`
- `reorderLessons(ctx, eventId, lessonIds)`

**Staff Management:**

- `addStaff(ctx, eventId, attendeeId, role, responsibilities?, isLead?)`
  - Any attendee status allowed
- `updateStaff(ctx, eventId, attendeeId, role?, responsibilities?, isLead?)`
- `removeStaff(ctx, eventId, attendeeId)`

**Overlap Detection Logic:**

```typescript
const hasOverlap = lessons
  .filter((l) => l.day === newLesson.day && l.id !== newLesson.id)
  .some(
    (l) => newLesson.startTime < l.endTime && newLesson.endTime > l.startTime,
  )
```

**Acceptance Criteria:**

- [ ] All 4 queries implemented and tested via Convex dashboard
- [ ] All 12 mutations implemented with proper validation
- [ ] Teacher status validation rejects non-qualified attendees
- [ ] Overlap detection prevents conflicting lessons on same day
- [ ] Removal warnings returned when teacher has assigned lessons

---

### Phase 13.3: Frontend Types & Hooks ⏳ WAITING FOR APPROVAL

**Time:** 1.5 hours  
**Files:** `src/features/events/types.ts`, `src/features/events/hooks/useRetreat.ts`

#### TypeScript Types

Add to `src/features/events/types.ts`:

```typescript
export interface RetreatTeacher {
  attendeeId: string
  subject?: string
  bio?: string
  attendee?: Attendee // Joined data
}

export interface RetreatLesson {
  id: string
  title: string
  description?: string
  teacherId?: string
  day: number
  startTime: string
  endTime: string
  location?: string
  type:
    | 'teaching'
    | 'meal'
    | 'break'
    | 'worship'
    | 'registration'
    | 'closing'
    | 'other'
  teacher?: Attendee // Joined data
}

export interface RetreatStaff {
  attendeeId: string
  role: string
  responsibilities?: string
  isLead?: boolean
  attendee?: Attendee // Joined data
}

export interface RetreatDetails {
  teachers: RetreatTeacher[]
  lessons: RetreatLesson[]
  staff: RetreatStaff[]
}

export type LessonType =
  | 'teaching'
  | 'meal'
  | 'break'
  | 'worship'
  | 'registration'
  | 'closing'
  | 'other'

export const LESSON_TYPE_COLORS: Record<LessonType, string> = {
  teaching: 'bg-green-100 text-green-700',
  meal: 'bg-yellow-100 text-yellow-700',
  break: 'bg-gray-100 text-gray-700',
  worship: 'bg-green-100 text-green-700',
  registration: 'bg-blue-100 text-blue-700',
  closing: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
}
```

#### Custom Hook

**File:** `src/features/events/hooks/useRetreat.ts`

```typescript
export function useRetreatDetails(eventId: string) {
  // Query: getRetreatDetails
}

export function useQualifiedTeachers() {
  // Query: getQualifiedTeachers
}

export function useRetreatMutations() {
  // All 12 mutations wrapped with TanStack Query
  return {
    addTeacher: useMutation(api.retreat.addTeacher),
    removeTeacher: useMutation(api.retreat.removeTeacher),
    updateTeacher: useMutation(api.retreat.updateTeacher),
    addLesson: useMutation(api.retreat.addLesson),
    updateLesson: useMutation(api.retreat.updateLesson),
    removeLesson: useMutation(api.retreat.removeLesson),
    addStaff: useMutation(api.retreat.addStaff),
    updateStaff: useMutation(api.retreat.updateStaff),
    removeStaff: useMutation(api.retreat.removeStaff),
  }
}
```

**Acceptance Criteria:**

- [ ] All TypeScript types defined with proper optional fields
- [ ] Lesson type color mapping created
- [ ] Custom hook provides all retreat queries and mutations
- [ ] Hook integrates with TanStack Query for caching

---

### Phase 13.4: Tabbed UI Components ⏳ WAITING FOR APPROVAL

**Time:** 4 hours  
**Architecture:** Swappable layout system (tabs | accordion)  
**Files:** 4 new components

#### Component 1: RetreatDetails.tsx (Container)

**File:** `src/features/events/components/RetreatDetails.tsx`

**Props:**

```typescript
interface RetreatDetailsProps {
  event: Event
  layout?: 'tabs' | 'accordion'
}
```

**Features:**

- Manages active tab state
- Renders tab navigation with 5 tabs:
  - Overview (existing EventDetails content)
  - Teachers
  - Schedule
  - Staff
  - Attendance (existing AttendanceManager)
- Passes layout prop to control presentation
- Easy to switch: change `layout="tabs"` to `layout="accordion"`

**Tab Navigation:**

```tsx
<Tabs defaultValue="overview" className="space-y-6">
  <TabsList variant="line" className="w-full justify-start">
    <TabsTrigger value="overview" className="gap-2">
      <BookOpen className="size-4" />
      Overview
    </TabsTrigger>
    <TabsTrigger value="teachers" className="gap-2">
      <UserCircle className="size-4" />
      Teachers
    </TabsTrigger>
    <TabsTrigger value="schedule" className="gap-2">
      <Clock className="size-4" />
      Schedule
    </TabsTrigger>
    <TabsTrigger value="staff" className="gap-2">
      <Users className="size-4" />
      Staff
    </TabsTrigger>
    <TabsTrigger value="attendance" className="gap-2">
      <Mountain className="size-4" />
      Attendance
    </TabsTrigger>
  </TabsList>

  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="teachers">...</TabsContent>
  <TabsContent value="schedule">...</TabsContent>
  <TabsContent value="staff">...</TabsContent>
  <TabsContent value="attendance">...</TabsContent>
</Tabs>
```

#### Component 2: RetreatTeachers.tsx

**File:** `src/features/events/components/RetreatTeachers.tsx`

**Features:**

- Display teachers as cards with avatar, name, status badge, subject, assigned sessions
- "Add Teacher" button opens searchable dropdown
- Search filters: only Pastor/Leader/Elder/Deacon attendees
- Actions per teacher: Edit subject/bio, Remove (with warning if has lessons)
- Empty state with helpful message

**Warning Dialog on Remove:**

```
┌─────────────────────────────────────────┐
│ Remove Teacher?                [X]     │
├─────────────────────────────────────────┤
│                                         │
│ John Smith has 2 assigned lessons:     │
│ • Session 1: "Spiritual Renewal"       │
│ • Session 2: "Power of Prayer"         │
│                                         │
│ Removing this teacher will unassign    │
│ them from these lessons.               │
│                                         │
│ [Cancel]          [Remove Anyway]      │
└─────────────────────────────────────────┘
```

**Teacher Card:**

- Avatar with initials
- Name + status badge (Pastor/Leader/Elder/Deacon)
- Email
- Subject topic (editable)
- Assigned sessions count
- Actions dropdown

#### Component 3: RetreatSchedule.tsx

**File:** `src/features/events/components/RetreatSchedule.tsx`

**Features:**

- Day tabs: Day 1, Day 2, Day 3 (only show days with lessons + next empty day)
- Timeline view with time slots
- Visual overlap detection (red border + warning icon)
- Color-coded lesson types:
  - Teaching: Green
  - Meal: Yellow
  - Break: Gray
  - Worship: Green
  - Registration: Blue
  - Closing: Purple
  - Other: Gray

**Add/Edit Lesson Modal:**

```
┌─────────────────────────────────────────┐
│ Add Schedule Item               [X]     │
├─────────────────────────────────────────┤
│                                         │
│ Day *          [Day 1 ▼]                │
│                                         │
│ Start Time *   [09:00]                  │
│                                         │
│ End Time *     [10:30]                  │
│                                         │
│ Type *         [Teaching ▼]             │
│                [Teaching|Meal|Break|...]│
│                                         │
│ Title *        [Session 1: Renewal    │
│                _____________________]   │
│                                         │
│ Teacher        [John Smith ▼]           │
│                (Optional)               │
│                                         │
│ Location       [Main Chapel            │
│                _____________________]   │
│                                         │
│ Description    [Optional details...    │
│                _____________________]   │
│                                         │
│ ⚠️ Warning: Overlaps with "Coffee      │
│    Break" (10:00 - 10:30)              │
│                                         │
│        [Cancel]        [Save Item]     │
└─────────────────────────────────────────┘
```

**Overlap Detection:**

- Real-time validation as user changes times
- Red warning alert shows conflicting lesson name
- Save button disabled while conflict exists
- Backend double-checks before saving

**Timeline View:**

```
 8:00 AM ─┬─ [Meal] Registration & Breakfast
          │   Location: Dining Hall
 9:00 AM ─┼─ [Teaching] Session 1: "Spiritual Renewal"
          │   Teacher: John Smith | Location: Main Chapel
10:30 AM ─┼─ [Break] Coffee Break
12:00 PM ─┼─ [Meal] Lunch
 2:00 PM ─┼─ [Teaching] Session 2: "Power of Prayer"
          │   Teacher: Sarah Johnson
 3:30 PM ─┼─ [Worship] Prayer & Ministry Time
 4:30 PM ─┴─ [Closing] Closing & Departure
```

#### Component 4: RetreatStaff.tsx

**File:** `src/features/events/components/RetreatStaff.tsx`

**Features:**

- Grid layout: 2 columns on desktop, 1 on mobile
- "Add Staff" button opens searchable dropdown (any attendee)
- Free-form role text input
- Optional responsibilities textarea
- "Lead Contact" checkbox (only one lead per role type recommended)

**Staff Card:**

```
┌─────────────────────────────────────────┐
│ Avatar │ David Chen                     │
│  [DC]  │ d.chen@church.com              │
│        │ ┌────────────────────────────┐ │
│        │ │ Badge: Sound Tech          │ │
│        │ │ Role: Audio/Visual Setup   │ │
│        │ └────────────────────────────┘ │
│        │ [Edit] [Remove]               │
└─────────────────────────────────────────┘
```

**Add Staff Modal:**

```
┌─────────────────────────────────────────┐
│ Add Staff Member                [X]     │
├─────────────────────────────────────────┤
│                                         │
│ Search Person  [Search attendees...     │
│               _____________________]    │
│               [Dropdown results]        │
│                                         │
│ Role *         [Sound Tech            │
│               _____________________]    │
│                                         │
│ Responsibilities [Setup microphones...  │
│               _____________________]    │
│                                         │
│ ☑ Lead Contact for this role            │
│                                         │
│        [Cancel]        [Add Staff]     │
└─────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] RetreatDetails container renders 5 tabs with icons
- [ ] Layout prop allows easy switching (tabs | accordion)
- [ ] Teachers tab shows qualified attendees only in search
- [ ] Warning dialog shown before removing teacher with lessons
- [ ] Schedule shows day tabs (Day 1, 2, 3) based on lesson data
- [ ] Visual overlap detection with red borders and warning icons
- [ ] Save button disabled when time conflicts exist
- [ ] Staff grid responsive (2 cols → 1 col on mobile)
- [ ] Free-form role text with responsibilities field
- [ ] All empty states implemented with helpful messages

---

### Phase 13.5: Integration ⏳ WAITING FOR APPROVAL

**Time:** 1 hour  
**File:** `src/routes/events.spiritual-retreat.tsx`

#### Implementation Options

**Option A: Replace EventsContent with RetreatDetails (Recommended)**

Replace the generic `EventsContent` with `RetreatDetails` for full control:

```typescript
function SpiritualRetreatPage() {
  const { data: eventTypes, isPending } = useEventTypesList()
  const retreatType = eventTypes?.find((et) => et.name === RETREAT_NAME)

  // Fetch retreat-specific event
  const { data: retreatEvent } = useCurrentEvent({
    eventTypeId: retreatType?._id
  })

  if (!retreatEvent) {
    return <EmptyEventState ... />
  }

  return (
    <RetreatDetails
      event={retreatEvent}
      layout="tabs" // Easy to switch to "accordion"
    />
  )
}
```

**Option B: Extend EventsContent with custom component prop**

If we want to keep the existing wrapper:

```typescript
<EventsContent
  // ...existing props
  customDetailsComponent={RetreatDetails}
  customDetailsProps={{ layout: 'tabs' }}
/>
```

#### Breadcrumb Updates

Update breadcrumbs to show retreat context:

```
Home > Events > Spiritual Retreat > [Active Tab Name]
```

**Acceptance Criteria:**

- [ ] Spiritual Retreat page uses RetreatDetails component
- [ ] All 5 tabs functional and accessible
- [ ] Breadcrumbs reflect retreat context
- [ ] Navigation between tabs works smoothly
- [ ] Back button returns to correct parent page

---

### Phase 13.6: Testing ⏳ WAITING FOR APPROVAL

**Time:** 2 hours  
**Test Files:** 6 new test files

#### Convex Tests (18 tests)

**File:** `tests/unit/convex/retreat/mutations.test.ts`

1. Teacher validation (6 tests)
   - ✅ Accepts Pastor as teacher
   - ✅ Accepts Leader as teacher
   - ✅ Accepts Elder as teacher
   - ✅ Accepts Deacon as teacher
   - ❌ Rejects Member as teacher
   - ❌ Rejects Visitor as teacher

2. Overlap detection (6 tests)
   - ✅ Allows non-overlapping lessons on same day
   - ❌ Rejects overlapping lessons on same day
   - ✅ Allows same time on different days
   - ✅ Handles edge cases (back-to-back sessions)
   - ✅ Detects partial overlaps
   - ✅ Allows updating lesson without conflict

3. Teacher removal warnings (3 tests)
   - ✅ Allows removal when no lessons assigned
   - ⚠️ Returns warning when lessons assigned
   - ✅ Force removal unassigns lessons

4. Staff CRUD (3 tests)
   - ✅ Allows any attendee as staff
   - ✅ Updates role/responsibilities
   - ✅ Removes staff member

#### Component Tests (12 tests)

**File:** `tests/unit/components/events/RetreatTeachers.test.tsx` (4 tests)

- Renders teacher list
- Shows warning dialog on remove
- Filters search to qualified attendees only
- Handles empty state

**File:** `tests/unit/components/events/RetreatSchedule.test.tsx` (4 tests)

- Renders timeline with day tabs
- Shows overlap warning
- Disables save on conflict
- Handles empty state

**File:** `tests/unit/components/events/RetreatStaff.test.tsx` (4 tests)

- Renders staff grid
- Allows any attendee in search
- Handles role text input
- Handles empty state

**Acceptance Criteria:**

- [ ] 18 Convex tests passing
- [ ] 12 Component tests passing
- [ ] All teacher validation scenarios covered
- [ ] All overlap detection scenarios covered
- [ ] Warning dialog behavior tested

---

## Visual Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header Area                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Event Banner                                                            │ │
│ │ "Spring Spiritual Retreat 2026"                    [Green Badge]           │ │
│ │ March 15, 2026 • 8:00 AM - 5:00 PM    Retreat    [Active Badge]           │ │
│ │ Mountain View Camp                                                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ [Overview] [Teachers] [Schedule] [Staff] [Attendance]                     │ │
│ │  (line variant tabs with green accent when active)                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ TEACHERS TAB:                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Teachers (3)                              [+ Add Teacher]              │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Avatar│ John Smith      │ Topic: "Renewal"    │ Session 1              │ │
│ │  [JS] │ Senior Pastor   │ 9:00 AM             │ [Actions ▼]            │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Avatar│ Sarah Johnson   │ Topic: "Prayer"     │ Session 2              │ │
│ │  [SJ] │ Worship Leader  │ 11:00 AM            │ [Actions ▼]            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ SCHEDULE TAB:                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ [Day 1] [Day 2] [Day 3]                    [+ Add Item]                │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ 8:00 AM ━ [Meal] Registration & Breakfast                             │ │
│ │ 9:00 AM ━ [Teaching] Session 1: "Spiritual Renewal" - John Smith       │ │
│ │ 11:00 AM ━ [Teaching] Session 2: "Power of Prayer" - Sarah Johnson    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ STAFF TAB:                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Staff Assignments (6)                       [+ Add Staff]                │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ ┌────────────────────┐  ┌────────────────────┐                         │ │
│ │ │ David Chen         │  │ Lisa Wong          │                         │ │
│ │ │ [Sound Tech]       │  │ [Registration]     │                         │ │
│ │ │ Audio/Visual       │  │ Check-in Desk      │                         │ │
│ │ └────────────────────┘  └────────────────────┘                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

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
