# CJCRSG-Hub Feature List

Complete feature catalog for the church management system.

**Last Updated:** 2026-04-03  
**Current Phase:** Phase 16 - Complete Auth Module with Admin Roles & Account Linking - In Progress  
**Status:** 🚧 Tasks 16.1-16.6 Complete, 16.7 In Progress

**Next Up:**

- Task 16.7: OAuth Setup & E2E Testing
- Future: Attendance reporting & analytics
- Future: Dashboard statistics widgets

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

---

---

## Phase 10: Sunday Service Dedicated Page

**Status:** ✅ Complete 2026-03-30

Created dedicated `/events/sunday-service` route with reusable `EventsContent` component supporting event type filtering, custom stats labels, and breadcrumb navigation.

**Files:**

- `src/routes/events.sunday-service.tsx` - Sunday Service page
- `src/features/events/components/EventsContent.tsx` - Reusable event content wrapper
- `convex/events/queries.ts` - Added `getCurrentEventByType` and `getStatsByEventType`

**Key Features:**

- Route: `/events/sunday-service`
- Default times: 09:00 - 11:00
- Green color theming
- Tabbed layout with accordion option
- Filtered history/archive links

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

## Phase 11: Image Upload with Convex Storage

**Status:** ✅ Complete 2026-03-30

**Goal:** Implement persistent image uploads for event banners and media galleries using Convex storage.

**Files Created:**

| File                                         | Description            |
| -------------------------------------------- | ---------------------- |
| `convex/events/files.ts`                     | File storage mutations |
| `src/features/events/hooks/useFileUpload.ts` | Upload hook            |

**Files Modified:**

| File                                                   | Changes                                            |
| ------------------------------------------------------ | -------------------------------------------------- |
| `convex/events/validators.ts`                          | Fixed isValidImageUrl validation                   |
| `convex/events/queries.ts`                             | Added URL resolution helpers, updated list queries |
| `src/features/events/components/BannerUploader.tsx`    | Added Convex storage + paste support               |
| `src/features/events/components/MediaGallery.tsx`      | Changed to Convex storage only                     |
| `src/features/events/components/EventDetails.tsx`      | Pass eventId to upload components                  |
| `tests/unit/components/events/BannerUploader.test.tsx` | Updated mock                                       |

**Test Results:** All 553 tests passing

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

### Phase 13.1: Database Schema & Validators ✅ COMPLETE 2026-03-31

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

### Phase 13.2: Backend - Retreat Module ✅ COMPLETE 2026-03-31

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

### Phase 13.3: Frontend Types & Hooks ✅ COMPLETE 2026-03-31

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

## Phase 14: Event-Specific Forms & Extensions

**Status:** ⏳ In Progress  
**Goal:** Create type-specific forms for events using an extension table architecture  
**Estimated Total Time:** ~8.5 hours

**Overview:**
Instead of embedding all event type fields in a single `events` table, this phase implements an extension table pattern where generic events use the base `events` table, and specialized event types (like Spiritual Retreat) store their specific data in separate extension tables. This keeps the schema clean and makes it easy to add new event types in the future.

**Key Decisions:**

- Extension table name: `spiritualRetreatEventExtensions`
- Event type detection: Hardcoded by name (e.g., "Spiritual Retreat")
- Generic events: No extension data, simple form
- Specialized events: Full tabbed interface with extension data

---

### Task 14.1: Schema Cleanup and Extension Table Creation

**Time:** 45 minutes  
**Status:** ✅ Complete  
**Files:** `convex/schema.ts`

**Description:**
Remove retreat-specific fields from the generic `events` table and create a new extension table for Spiritual Retreat data. Since we'll wipe all event data, no migration is needed.

**Steps:**

1. **Remove from `events` table:**
   - `retreatTeachers` field (lines 80-88)
   - `retreatLessons` field (lines 90-112)
   - `retreatStaff` field (lines 114-123)

2. **Add new table `spiritualRetreatEventExtensions`:**

   ```typescript
   spiritualRetreatEventExtensions: defineTable({
     eventId: v.id('events'),
     teachers: v.array(
       v.object({
         attendeeId: v.id('attendees'),
         subject: v.optional(v.string()),
         bio: v.optional(v.string()),
       }),
     ),
     lessons: v.array(
       v.object({
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
           v.literal('other'),
         ),
       }),
     ),
     staff: v.array(
       v.object({
         attendeeId: v.id('attendees'),
         role: v.string(),
         responsibilities: v.optional(v.string()),
         isLead: v.optional(v.boolean()),
       }),
     ),
   }).index('by_event', ['eventId'])
   ```

3. **Regenerate Convex types:**
   ```bash
   pnpm dlx convex dev --once
   ```

**Acceptance Criteria:**

- [ ] Schema compiles without errors
- [ ] All existing event data wiped (manual action)
- [ ] New extension table appears in Convex dashboard
- [ ] `events` table only has generic fields

---

### Task 14.2: Update Event Backend Mutations

**Time:** 1.5 hours  
**Status:** ✅ Complete  
**Files:** `convex/events/mutations.ts`, `convex/events/queries.ts`

**Description:**
Update existing event mutations to handle extension tables and support event-type-specific creation.

**Steps:**

1. **Update `create` mutation in `convex/events/mutations.ts`:**
   - After creating event, fetch the event type
   - If `eventType.name === 'Spiritual Retreat'`, create empty record in `spiritualRetreatEventExtensions`
   - Return both event and extension IDs

2. **Update `getById` query in `convex/events/queries.ts`:**
   - After fetching event, check if `eventType.name === 'Spiritual Retreat'`
   - If yes, query `spiritualRetreatEventExtensions` table
   - Return combined object: `{ ...event, retreatData: extension | null }`

3. **Update `update` mutation:**
   - Handle case where generic fields are updated (no extension change)
   - Ensure extension data stays intact when updating generic fields

**Code Example:**

```typescript
// In getById query
const event = await ctx.db.get(args.id)
if (!event) return null

const eventType = await ctx.db.get(event.eventTypeId)
let retreatData = null

if (eventType?.name === 'Spiritual Retreat') {
  retreatData = await ctx.db
    .query('spiritualRetreatEventExtensions')
    .withIndex('by_event', (q) => q.eq('eventId', event._id))
    .first()
}

return { ...event, eventType, retreatData }
```

**Acceptance Criteria:**

- [ ] Creating a Spiritual Retreat also creates empty extension record
- [ ] Fetching a Spiritual Retreat includes retreatData in response
- [ ] Generic events work as before (no extension data)
- [ ] All existing event mutations continue to work

---

### Task 14.3: Migrate Phase 13 Retreat Mutations to Extension Table

**Time:** 1.5 hours  
**Status:** ✅ Complete  
**Files:** `convex/retreat/mutations.ts`, `convex/retreat/queries.ts`

**Description:**
Update all Phase 13 retreat mutations to use the new extension table instead of embedded fields in the events table.

**Steps:**

1. **Update teacher mutations:**
   - `addTeacher`: Insert into `spiritualRetreatEventExtensions` teachers array
   - `removeTeacher`: Remove from teachers array, validate no assigned lessons first
   - `updateTeacher`: Update subject/bio in teachers array

2. **Update lesson mutations:**
   - `addLesson`: Insert into lessons array with overlap validation
   - `updateLesson`: Update lesson fields with overlap validation
   - `removeLesson`: Remove from lessons array
   - `reorderLessons`: Reorder lessons array

3. **Update staff mutations:**
   - `addStaff`: Insert into staff array
   - `updateStaff`: Update role/responsibilities
   - `removeStaff`: Remove from staff array

4. **Update queries:**
   - `getRetreatDetails`: Fetch from extension table instead of events
   - `checkTeacherLessons`: Check in extension table's lessons array
   - `getLessonConflicts`: Check in extension table's lessons array

**Key Changes:**

- Change from: `ctx.db.patch(eventId, { retreatTeachers: ... })`
- Change to: Update `spiritualRetreatEventExtensions` record directly

**Acceptance Criteria:**

- [ ] All 12 retreat mutations updated to use extension table
- [ ] 4 retreat queries updated to use extension table
- [ ] Teacher status validation still works (Pastor/Leader/Elder/Deacon only)
- [ ] Lesson overlap detection still works
- [ ] All 37 Phase 13 tests still pass after updates

---

### Task 14.4: Create Reusable Form Field Components

**Time:** 1.5 hours  
**Status:** ✅ Complete  
**Files:** `src/features/events/forms/fields/BasicInfoFields.tsx`, `DescriptionField.tsx`, `BannerUploadField.tsx`

**Description:**
Extract reusable field components from existing modals to use in both generic and specialized forms. These components will work with react-hook-form.

**Components to Create:**

1. **BasicInfoFields.tsx** (extracted from BasicInfoEditModal):
   - Event name input (required, min 2 chars)
   - Date picker (using existing date picker component)
   - Start time dropdown (30-min increments, 00:00 to 23:30)
   - End time dropdown (must be after start time)
   - Location input (optional)
   - Props: `control`, `errors`, `defaultValues`

2. **DescriptionField.tsx** (extracted from DescriptionEditModal):
   - Textarea for event description
   - Character count display (optional)
   - Props: `control`, `name`, `label`

3. **BannerUploadField.tsx** (extracted from BannerUploader):
   - Image upload with Convex storage integration
   - Preview display
   - Remove/change functionality
   - Support for URL input or file upload
   - Props: `eventId`, `currentUrl`, `onUpload`, `onRemove`

**Props Interface Pattern:**

```typescript
interface FieldProps {
  control: Control<any>
  name?: string
  label?: string
  error?: FieldError
}
```

**Acceptance Criteria:**

- [ ] Each field component accepts `control` from react-hook-form
- [ ] Validation rules embedded in components (zod schemas)
- [ ] Error messages display correctly
- [ ] Components work in both create and edit modes
- [ ] Styling consistent with existing modals (shadcn/ui)

---

### Task 14.5: Create Generic Event Form

**Time:** 1 hour  
**Status:** ✅ Complete  
**Files:** `src/features/events/forms/GenericEventForm.tsx`

**Description:**
Create a simple form for generic events (no extensions) using the reusable field components from Task 14.4.

**Features:**

1. **Form Structure:**
   - Section 1: Basic Info (name, date, time, location)
   - Section 2: Description (textarea)
   - Section 3: Banner Image (upload field)

2. **Validation:**
   - Name: required, min 2 characters
   - Date: required
   - Start time: optional but if set, end time must be after
   - End time: optional but must be after start time

3. **Actions:**
   - Submit button with loading state
   - Cancel button (optional, based on context)
   - Success/error toast notifications

**Props:**

```typescript
interface GenericEventFormProps {
  mode: 'create' | 'edit'
  event?: EventWithType // Pre-populated data for edit mode
  onSave: (data: EventFormData) => void
  onCancel?: () => void
}
```

**Acceptance Criteria:**

- [ ] Form validates all required fields
- [ ] Shows loading state during submit
- [ ] Success toast on creation/update
- [ ] Error toast on failure with message
- [ ] Works for any event type without extension data
- [ ] Responsive layout (mobile-friendly)

---

### Task 14.6: Create Spiritual Retreat Form

**Time:** 2 hours  
**Status:** ✅ Complete  
**Files:** `src/features/events/forms/SpiritualRetreatForm.tsx`, `tests/unit/events/forms/SpiritualRetreatForm.test.tsx`

**Test Results:** 16 tests passing, 0 skipped

**Implementation:**
Created `SpiritualRetreatForm.tsx` (372 lines) with 4 tabs:

- **Overview Tab:** BasicInfoFields, DescriptionField, BannerUploadField, summary cards
- **Teachers Tab:** Reuses existing `RetreatTeachers` component
- **Schedule Tab:** Reuses existing `RetreatSchedule` component
- **Staff Tab:** Reuses existing `RetreatStaff` component

Also created `eventSchemas.ts` with validation schemas and `timeOptions.ts` utility.

**Description:**
Create specialized tabbed form for Spiritual Retreats using existing Phase 13 components integrated with the new form structure.

**Tab Structure:**

1. **Overview Tab:**
   - BasicInfoFields component
   - DescriptionField component
   - BannerUploadField component
   - Summary cards showing counts:
     - "3 Teachers assigned"
     - "8 Lessons scheduled"
     - "5 Staff members"

2. **Teachers Tab:**
   - Integrate existing `RetreatTeachers` component
   - Add/remove teachers
   - Validate qualified status (Pastor/Leader/Elder/Deacon only)
   - Show warning dialog when removing teacher with assigned lessons
   - Edit subject and bio for each teacher

3. **Schedule Tab:**
   - Integrate existing `RetreatSchedule` component
   - Day tabs (Day 1, Day 2, Day 3) - only show days with content
   - Timeline view of lessons
   - Color-coded by lesson type (teaching=green, meal=yellow, etc.)
   - Add/edit lessons with overlap detection
   - Drag to reorder lessons

4. **Staff Tab:**
   - Integrate existing `RetreatStaff` component
   - Grid layout (2 columns desktop, 1 column mobile)
   - Add any attendee as staff
   - Role text input (free-form)
   - Responsibilities textarea
   - Lead contact checkbox

**Header/Actions:**

- Event type badge: "Spiritual Retreat" (green)
- Save button (commits all tabs at once)
- Cancel button
- Unsaved changes indicator (if user tries to leave)

**State Management:**

- Use react-hook-form for generic fields
- Use local state for retreat-specific data (teachers, lessons, staff)
- On save: combine both into single API call

**Acceptance Criteria:**

- [ ] All 4 tabs render correctly with proper content
- [ ] Teachers tab validates qualified status (rejects Member/Visitor)
- [ ] Schedule tab detects time overlaps and prevents saving conflicts
- [ ] Changes persist when switching tabs (unsaved state)
- [ ] Save button commits all data at once
- [ ] Works in both create and edit modes
- [ ] Shows unsaved changes warning if user tries to navigate away

---

### Task 14.7: Create Event Form Factory

**Time:** 30 minutes  
**Status:** ✅ Complete  
**Files:** `src/features/events/forms/EventFormFactory.tsx`

**Description:**
Create the main orchestrator component that renders the appropriate form based on event type name. This is the single entry point for all event forms.

**Implementation:**

```typescript
// EventFormFactory.tsx
export function EventFormFactory({
  mode,
  eventTypeName,
  event,
  onSave,
  onCancel
}: EventFormFactoryProps) {
  switch(eventTypeName) {
    case 'Spiritual Retreat':
      return (
        <SpiritualRetreatForm
          mode={mode}
          event={event}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    // Future event types:
    // case 'Sunday Service':
    //   return <SundayServiceForm ... />;
    default:
      return (
        <GenericEventForm
          mode={mode}
          event={event}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
  }
}

interface EventFormFactoryProps {
  mode: 'create' | 'edit';
  eventTypeName: string;
  event?: EventWithExtensionData;
  onSave: (data: any) => void;
  onCancel?: () => void;
}
```

**Usage Examples:**

```typescript
// Creating from "All Events" page
<EventFormFactory
  mode="create"
  eventTypeName="Spiritual Retreat"
  onSave={handleCreate}
/>

// Editing any event type
<EventFormFactory
  mode="edit"
  eventTypeName={event.eventType.name}
  event={event}
  onSave={handleUpdate}
/>
```

**Acceptance Criteria:**

- [ ] Detects "Spiritual Retreat" and renders specialized form
- [ ] All other types render generic form
- [ ] Props correctly passed to child forms
- [ ] Type-safe with TypeScript
- [ ] Easy to add new event types (just add case to switch)

---

### Task 14.8: Update Event Creation Route

**Time:** 45 minutes  
**Status:** ✅ Complete  
**Files:** `src/routes/events.new.tsx`

**Description:**
Replace the 345-line inline form with the new EventFormFactory. The route handles event type selection and passes the appropriate form.

**Implementation:**

1. **Event type selector dropdown:**
   - Lists all active event types with color dots
   - Default to previously selected or first type
   - URL param support (`?type=...`)

2. **Integrated EventFormFactory:**
   - Renders GenericEventForm for standard events
   - Renders SpiritualRetreatForm (4 tabs) for retreats
   - Passes proper callbacks for save/cancel

3. **Smart navigation on save:**
   - Spiritual Retreat → `/events/spiritual-retreat`
   - Other events → `/events`

**Acceptance Criteria:**

- [x] Form renders based on selected event type
- [x] Creating Spiritual Retreat shows specialized form with tabs
- [x] Creating generic event shows simple form
- [x] After creation, redirects to appropriate page
- [x] No console errors
- [x] Form is responsive

---

### Task 14.9: Update Event Edit Route

**Time:** 30 minutes  
**Status:** ✅ Complete  
**Files:** `src/routes/events.$id.edit.tsx`, `src/routes/events.$id.tsx`

**Description:**
Create edit route using EventFormFactory with pre-populated data.

**Implementation:**

1. **Created `events.$id.edit.tsx`:**
   - Fetches event data using `useEvent` hook
   - Renders `EventFormFactory` in edit mode
   - Handles update via `useUpdateEvent` mutation
   - Smart navigation after save (retreat → spiritual-retreat page, others → event detail)

2. **Updated `events.$id.tsx` parent route:**
   - Added `<Outlet />` for child routes
   - Added `useMatchRoute` check to prevent duplicate layout rendering
   - Only renders detail view when no child route is active

3. **Handles update:**
   - Calls `updateEvent` mutation with form data
   - Shows success toast
   - Navigates back to appropriate page

**Acceptance Criteria:**

- [x] Pre-populates form with existing data
- [x] Editing Spiritual Retreat shows all tabs with saved data
- [x] Editing generic event shows basic form
- [x] Updates persist correctly to backend
- [x] Redirects after successful save
- [x] Handles 404 (event not found) gracefully

---

### Task 14.10: Update Spiritual Retreat Dedicated Page

**Time:** 30 minutes  
**Status:** ⏳ Pending  
**Files:** `src/routes/events.spiritual-retreat.tsx`

**Description:**
Ensure the dedicated retreat page uses the new form for creating and editing retreats consistently.

**Updates Needed:**

1. **Creation flow:**
   - When clicking "Start Spiritual Retreat" or "Create Retreat"
   - Open modal or navigate to creation with `EventFormFactory`
   - Pre-select "Spiritual Retreat" type (not changeable)

2. **Editing flow:**
   - When editing existing retreat from dedicated page
   - Use same `EventFormFactory` with edit mode
   - Ensure all tabs (Teachers, Schedule, Staff) work correctly

3. **Integration check:**
   - Verify Phase 13 components still integrate properly
   - Teachers component loads from extension table
   - Schedule component loads lessons from extension table
   - Staff component loads from extension table

**Acceptance Criteria:**

- [ ] Dedicated page can create new retreats with full form
- [ ] Can edit existing retreats from dedicated page
- [ ] All Phase 13 features still functional:
  - Add/remove teachers
  - Add/remove/edit lessons
  - Add/remove staff
  - Overlap detection
  - Qualified status validation
- [ ] Consistent UX with generic creation page

---

### Task 14.11: Wipe Event Data and Test

**Time:** 30 minutes  
**Status:** ⏳ Pending  
**Files:** Manual testing, no code changes

**Description:**
Clear all existing event data and perform comprehensive testing of the new form system.

**Data Wipe Steps:**

1. Go to Convex dashboard (local or cloud)
2. Navigate to `events` table
3. Select all and delete (or use query runner)
4. Verify `spiritualRetreatEventExtensions` table is empty
5. Keep `eventTypes` data (don't delete types)

**Test Scenarios:**

1. **Generic Event Creation:**
   - Navigate to `/events/new`
   - Select generic event type (e.g., "Youth Event")
   - Fill basic info only
   - Save and verify redirect
   - Check event appears in list

2. **Spiritual Retreat Creation (All Events page):**
   - Navigate to `/events/new`
   - Select "Spiritual Retreat"
   - Verify tabbed form appears
   - Fill Overview tab
   - Add teachers
   - Add lessons with different days/times
   - Add staff
   - Save and verify

3. **Spiritual Retreat Creation (Dedicated page):**
   - Navigate to `/events/spiritual-retreat`
   - Click "Start Spiritual Retreat"
   - Verify full form opens
   - Create retreat with all data
   - Verify appears on dedicated page

4. **Editing:**
   - Edit generic event (should show simple form)
   - Edit retreat (should show tabbed form with all data)
   - Make changes and save
   - Verify changes persist

5. **Validation:**
   - Try to save without required fields
   - Try to create overlapping lessons (should prevent)
   - Try to add non-qualified teacher (should prevent)

6. **Regression Testing:**
   - Run full test suite: `pnpm test`
   - All 553+ tests should pass
   - No console errors
   - No TypeScript errors: `pnpm dev:ts`

**Acceptance Criteria:**

- [ ] All existing event data wiped
- [ ] All 553+ existing tests still pass
- [ ] Generic event creation works
- [ ] Retreat creation works with all tabs (Teachers, Schedule, Staff)
- [ ] Editing works for both types
- [ ] Phase 13 features functional (overlap detection, status validation)
- [ ] No console errors or warnings
- [ ] Responsive on mobile and desktop

---

## Summary

| Task      | Time         | Focus             | Dependencies |
| --------- | ------------ | ----------------- | ------------ |
| 14.1      | 45 min       | Schema changes    | None         |
| 14.2      | 1.5 hrs      | Backend mutations | 14.1         |
| 14.3      | 1.5 hrs      | Migrate Phase 13  | 14.1, 14.2   |
| 14.4      | 1.5 hrs      | Reusable fields   | None         |
| 14.5      | 1 hr         | Generic form      | 14.4         |
| 14.6      | 2 hrs        | Retreat form      | 14.3, 14.4   |
| 14.7      | 30 min       | Factory pattern   | 14.5, 14.6   |
| 14.8      | 45 min       | Create route      | 14.7         |
| 14.9      | 30 min       | Edit route        | 14.7         |
| 14.10     | 30 min       | Dedicated page    | 14.6, 14.7   |
| 14.11     | 30 min       | Testing           | All above    |
| **Total** | **~8.5 hrs** |                   |              |

---

## Phase 15: Unified Event Creation Architecture

**Status:** ⏳ Planned  
**Goal:** Standardize all event creation to use GenericEventDetails, create consistent dedicated page headers, and clean up deprecated components.  
**Estimated Time:** 5.5 hours

**Overview:**
Create a unified architecture where:

- `/events/new` uses `GenericEventDetails` for ALL basic event creation
- Dedicated pages (Sunday Service, Spiritual Retreat) handle their own specialized creation flow with local state
- All creations redirect to the appropriate dedicated page after saving
- Consistent headers across all dedicated pages via reusable component

**Key Decisions:**

- Delete EventFormFactory and all specialized form components
- EventDetails renamed to GenericEventDetails
- RetreatDetails supports isCreating mode (Overview editable, other tabs disabled)
- Sunday Service gets its own SundayServiceDetails component (wrapper for now, extensible later)
- Smart redirection based on event type name after creation

---

### Task 15.1: Create EventPageHeader Component

**Time:** 30 minutes  
**Status:** ✅ Complete  
**Files:** `src/features/events/components/EventPageHeader.tsx`

**Description:**
Created a reusable header component for all dedicated event pages with consistent layout.

**Features:**

- Title with color dot indicator
- Subtitle (optional)
- Event History button (links to filtered history)
- Archive button (links to filtered archive)
- Create Event button (navigates to `/events/new`)
- Responsive: flex-col on mobile, flex-row on desktop
- URL generation with type filters when eventTypeId provided

**Acceptance Criteria:**

- [x] Header layout matches current EventsContent header exactly
- [x] Buttons generate correct URLs with type filters when eventTypeId provided
- [x] Responsive: flex-col on mobile, flex-row on desktop
- [x] Color dot shows event type color

---

### Task 15.2: Rename EventDetails to GenericEventDetails

**Time:** 45 minutes  
**Status:** ✅ Complete  
**Files:**

- `src/features/events/components/GenericEventDetails.tsx` (renamed from EventDetails.tsx)
- Updated imports in: `EventsContent.tsx`, `events.$id.tsx`, `RetreatDetails.tsx`
- Updated imports in: `tests/unit/events/components/EventDetails.test.tsx`, `tests/unit/components/EventDetails.test.tsx`

**Description:**
Renamed component to clarify its purpose as the generic event creation/viewing component.

**Steps:**

1. Renamed file from EventDetails.tsx to GenericEventDetails.tsx
2. Updated component name and all exports
3. Updated all import statements across codebase
4. Verified no broken references
5. All 661 tests passing

**Acceptance Criteria:**

- [x] File renamed successfully
- [x] All imports updated (no build errors)
- [x] Component exports properly renamed
- [x] Application compiles without errors
- [x] No functional changes to component behavior

---

### Task 15.3: Create SundayServiceDetails Component

**Time:** 30 minutes  
**Status:** ✅ Complete  
**Files:** `src/features/events/components/SundayServiceDetails.tsx`

**Description:**
Create dedicated component for Sunday Service page. Initially just wraps GenericEventDetails, but designed for future extension.

**Props Interface:**

```typescript
interface SundayServiceDetailsProps {
  event: Event
  isCreating?: boolean
  onSave?: (data: unknown) => void
  onCancel?: () => void
}
```

**Implementation Notes:**

```typescript
// NOTE: Future enhancement - add sermon series, worship leader,
// offering tracking, sermon notes, etc.
```

**Acceptance Criteria:**

- [x] Component created with proper TypeScript types
- [x] Supports isCreating mode with save/cancel handlers
- [x] Wraps GenericEventDetails appropriately
- [x] Includes future enhancement comment/note
- [x] Renders without errors in both modes

---

### Task 15.4: Update Sunday Service Page

**Time:** 45 minutes  
**Status:** ✅ Complete  
**Files:** `src/routes/events.sunday-service.tsx`

**Description:**
Replace EventsContent with custom implementation using SundayServiceDetails and local creation flow.

**Changes:**

- Removed `EventsContent` usage
- Added `isCreating` state and `unsavedEvent` state management
- Implemented `handleStartUnsavedEvent()` - sets default Sunday Service values
- Implemented `handleSaveUnsaved()` - creates event via API and starts it
- Implemented `handleCancelUnsaved()` - clears state
- Integrated `EventPageHeader` component for consistent header
- Conditional rendering:
  - `unsavedEvent`: Show SundayServiceDetails with `isCreating=true`
  - `currentEvent`: Show SundayServiceDetails normally
  - No event: Show EmptyEventState with "Start Sunday Service" button

**Acceptance Criteria:**

- [x] Clicking "Start Sunday Service" shows creation form
- [x] Creation form uses SundayServiceDetails with isCreating=true
- [x] Save creates event and shows normal view
- [x] Cancel returns to empty state
- [x] Header uses EventPageHeader component
- [x] Header is consistent with other dedicated pages
- [x] Event History and Archive buttons filter by Sunday Service type
- [x] All 661 tests passing

---

### Task 15.5: Update RetreatDetails with isCreating Mode

**Time:** 1 hour  
**Status:** ✅ Complete  
**Files:** `src/features/events/components/RetreatDetails.tsx`

**Description:**
Add isCreating prop that enables creation mode: Overview tab editable, other tabs visible but disabled.

**Props Added:**

```typescript
interface RetreatDetailsProps {
  event: Event
  layout?: 'tabs' | 'accordion'
  isCreating?: boolean // NEW
  onSave?: () => void // NEW
  onCancel?: () => void // NEW
}
```

**UI Changes for isCreating=true:**

- Overview tab: Shows GenericEventDetails with form fields (BasicInfo, Description, Banner)
- Teachers tab: Visible but disabled (grayed out, with tooltip)
- Schedule tab: Visible but disabled (grayed out, with tooltip)
- Staff tab: Visible but disabled (grayed out, with tooltip)
- Attendance tab: Visible (not hidden during creation)
- Save/Cancel buttons handled by GenericEventDetails

**Tooltip for disabled tabs:** "Save event to access [Tab Name]"

**Acceptance Criteria:**

- [x] Overview tab shows editable form fields in creation mode
- [x] Other tabs (Teachers, Schedule, Staff) visible but disabled with tooltips
- [x] Disabled tabs show appropriate tooltip on hover
- [x] Cancel button returns to empty state
- [x] After save, component shows all tabs enabled
- [x] Normal mode behavior unchanged when isCreating=false

---

### Task 15.6: Update Spiritual Retreat Page

**Time:** 30 minutes  
**Status:** ✅ Complete  
**Files:** `src/routes/events.spiritual-retreat.tsx`

**Description:**
Replaced `SpiritualRetreatForm` with `RetreatDetails` using `isCreating` mode.

**Changes:**

- Added `isCreating` state management
- Added `unsavedEvent` state management
- Implemented handleStartUnsavedEvent() - sets default retreat values
- Implemented handleSaveUnsaved() - creates event via API and starts it
- Implemented handleCancelUnsaved() - clears state
- Use EventPageHeader component for consistent header
- Conditional rendering:
  - `unsavedEvent`: Show RetreatDetails with isCreating=true
  - `currentEvent`: Show RetreatDetails normally
  - No event: Show EmptyEventState with "Start Spiritual Retreat" button

**Default Values for Creation:**

- Name: `Spiritual Retreat - {today's date}`
- Date: Today
- Start Time: 08:00
- End Time: 17:00
- Location: ''
- Description: ''

**Acceptance Criteria:**

- [x] Uses EventPageHeader for consistent header
- [x] Clicking "Start Spiritual Retreat" shows RetreatDetails (isCreating mode)
- [x] Overview tab editable, other tabs visible but disabled
- [x] Save creates event and shows full RetreatDetails
- [x] Cancel returns to empty state
- [x] No page redirect needed (stays on same page, state changes)

---

### Task 15.7: Update /events/new Route

**Time:** 1 hour  
**Status:** ✅ Complete  
**Files:** `src/routes/events.new.tsx`

**Description:**
Replace EventFormFactory with GenericEventDetails for all event creation. Add smart redirection.

**Changes:**

- Removed EventFormFactory import and usage
- Replaced with GenericEventDetails for all event creation
- Added unsaved event state management
- When event type selected: Show GenericEventDetails with isUnsaved=true
- Handle save: Create event → Start event → Redirect to appropriate page
- Implemented smart redirection based on event type name

**Redirection Logic:**

```typescript
const EVENT_TYPE_ROUTES: Record<string, string> = {
  'Sunday Service': '/events/sunday-service',
  'Spiritual Retreat': '/events/spiritual-retreat',
}

const DEFAULT_TIMES: Record<string, { start: string; end: string }> = {
  'Sunday Service': { start: '09:00', end: '11:00' },
  'Spiritual Retreat': { start: '08:00', end: '16:00' },
}
```

**Acceptance Criteria:**

- [x] Event type selector dropdown still works
- [x] GenericEventDetails shown for creation (not EventFormFactory)
- [x] All event types can be created via this route
- [x] Spiritual Retreat created here redirects to /events/spiritual-retreat
- [x] Sunday Service created here redirects to /events/sunday-service
- [x] Generic events redirect to /events/${eventId}
- [x] Cancel returns to event type selector
- [x] URL param ?type= still supported for pre-selection

---

### Task 15.8: Delete Deprecated Components

**Time:** 30 minutes  
**Status:** ✅ Complete  
**Files Deleted:**

- `src/features/events/forms/` - Entire directory (EventFormFactory, GenericEventForm, SpiritualRetreatForm, schemas, fields, utils)
- `tests/unit/events/forms/` - Entire directory (all form tests)
- Updated `src/routes/events.$id.edit.tsx` - Replaced EventFormFactory with GenericEventDetails

**Description:**
Remove all files no longer needed after architecture change.

**Changes:**

- Deleted entire `src/features/events/forms/` directory
- Deleted entire `tests/unit/events/forms/` directory
- Updated edit route to use GenericEventDetails with isUnsaved mode
- Added smart redirection for edit route (Sunday Service/Spiritual Retreat to dedicated pages)
- No remaining imports of deprecated components

**Acceptance Criteria:**

- [x] All deprecated files deleted
- [x] No import errors in remaining files
- [x] Application compiles successfully
- [x] 591 tests passing (70 form tests removed)
- [x] No console errors from missing modules

---

### Task 15.9: Testing & Validation

**Time:** 1 hour  
**Status:** ✅ Complete  
**Files:** Manual testing across all affected routes

**Testing Completed:**

- ✅ All 591 unit/component tests passing
- ✅ TypeScript compilation successful (no new errors)
- ✅ Lint passes cleanly
- ✅ Build successful
- ✅ Toast error handling added for duplicate/active events
- ✅ All three creation routes updated with error handling:
  - `/events/new` - Generic event creation
  - `/events/sunday-service` - Sunday Service creation
  - `/events/spiritual-retreat` - Spiritual Retreat creation

**Test Scenarios Covered (via automated tests):**

1. Event creation flow with GenericEventDetails
2. RetreatDetails isCreating mode with disabled tabs
3. Smart redirection logic (Sunday Service/Spiritual Retreat/Generic)
4. Cancel behavior returns to previous state
5. Event type selection with default times
6. URL param support for pre-selection

**Acceptance Criteria:**

- [x] All test scenarios pass (591 tests)
- [x] No console errors
- [x] TypeScript compilation successful
- [x] All existing tests pass (`pnpm test`)
- [x] Error handling for duplicate/active events with toast notifications
- [x] Functional correctness verified via test suite

---

### Task 15.10: Documentation Update

**Time:** 15 minutes  
**Status:** ✅ Complete  
**Files:** `docs/TASKS.md`, `docs/SESSION.md`, `CHANGELOG.md`

**Description:**
Update Phase 15 tasks with completion status after implementation.

**Acceptance Criteria:**

- [x] All completed tasks marked with ✅
- [x] Any skipped tasks documented with reason
- [x] Total time spent recorded
- [x] Next phase added to "Next Up" section

---

## Phase 15 Summary Table

| Task      | Time         | Description                | Dependencies     |
| --------- | ------------ | -------------------------- | ---------------- |
| 15.1      | 30 min       | EventPageHeader component  | None             |
| 15.2      | 45 min       | Rename EventDetails        | None             |
| 15.3      | 30 min       | SundayServiceDetails       | 15.2             |
| 15.4      | 45 min       | Update Sunday Service page | 15.1, 15.3       |
| 15.5      | 1 hr         | RetreatDetails isCreating  | 15.2             |
| 15.6      | 30 min       | Update Spiritual Retreat   | 15.1, 15.5       |
| 15.7      | 1 hr         | Update /events/new         | 15.2             |
| 15.8      | 30 min       | Delete deprecated files    | 15.4, 15.6, 15.7 |
| 15.9      | 1 hr         | Testing & validation       | All above        |
| 15.10     | 15 min       | Documentation update       | 15.9             |
| **Total** | **~5.5 hrs** |                            |                  |

**Next Up:**

- Future: Attendance reporting & analytics
- Future: Dashboard statistics widgets

---

## Phase 15 Summary

**All 10 tasks complete.** Phase 15 successfully implemented a unified event creation architecture:

- **EventPageHeader** component for consistent headers across all dedicated event pages
- **GenericEventDetails** replaces EventDetails as the generic event creation/viewing component
- **SundayServiceDetails** wrapper for future Sunday Service-specific features
- **RetreatDetails** supports `isCreating` mode with disabled tabs and tooltips
- **Smart redirection** routes events to appropriate dedicated pages based on type
- **Deprecated forms deleted** (EventFormFactory, GenericEventForm, SpiritualRetreatForm)
- **Toast error handling** for duplicate/active events
- **591 tests passing** (70 deprecated form tests removed)

---

## Architecture After Phase 15

### Component Hierarchy

```
/events/new
    ↓
GenericEventDetails (isUnsaved=true)
    ↓
Save → Redirect to dedicated page

/events/sunday-service
    ↓
Empty State → [Start] → SundayServiceDetails (isCreating)
    ↓
Save → SundayServiceDetails (normal)

/events/spiritual-retreat
    ↓
Empty State → [Start] → RetreatDetails (isCreating)
    ↓
Save → RetreatDetails (normal with all tabs)
```

### Key Features

- **Consistent Headers:** All dedicated pages use EventPageHeader
- **Local Creation:** Dedicated pages handle their own unsaved state
- **Smart Redirection:** /events/new redirects to appropriate page
- **Simplified Codebase:** EventFormFactory and forms deleted
- **Extensible:** SundayServiceDetails ready for future enhancements

---

## Completed Tasks

### Phase 16: Admin Roles & Account Linking (Tasks 16.1-16.2)

- ✅ **Task 16.1: Admin Roles Schema & CLI Promotion** - Custom users table with role field, CLI promotion functions
- ✅ **Task 16.2: Attendee-User Auto-Linking Backend** - Auto-linking on registration, admin linking mutations

**Implementation Details:**

- Custom `users` table extending Convex Auth with `role` field (super_admin, admin, moderator, user)
- `convex/lib/authHelpers.ts` - Role checking helpers with hierarchy
- `convex/admin.ts` - CLI functions: `promoteUser`, `demoteUser`, `listUsersWithRoles`
- `convex/lib/attendeeLinking.ts` - Auto-linking logic for attendee-user connection
- `convex/auth.ts` - `afterUserCreatedOrUpdated` callback for automatic linking
- `convex/attendees/admin.ts` - Admin mutations: `linkToUser`, `unlinkFromUser`, `listUnlinked`
- `userId` field on attendees table with `by_user` index
- Safety checks prevent unlinking if it's the only auth method

---

## Phase 16: Complete Auth Module with Admin Roles & Account Linking

**Status:** ⏳ Planned - Ready for Implementation  
**Goal:** Complete OAuth implementation with Google/Facebook, enable account linking for email-registered users, add admin roles with attendee-user linking capabilities  
**Estimated Time:** 13 hours  
**Priority:** HIGH

### Overview

This phase completes the authentication system by:

1. **Admin Role System** - Super Admin, Admin, Moderator roles with CLI-based promotion
2. **Account Linking** - Users can link Google/Facebook to existing email accounts
3. **Attendee-User Linking** - Connect attendee records to user accounts (auto & manual)
4. **Admin UI** - Dashboard for managing user roles and linking attendee accounts
5. **OAuth Completion** - Full Google/Facebook OAuth setup and E2E testing

**Key Design Decisions:**

- **CLI Promotion:** Admins promoted via `npx convex run admin/promoteUser` (CLI access = authorization)
- **Auto-Linking (Option A):** On registration, automatically link attendee by matching email
- **Manual Linking (Option B):** Admins can manually link/unlink attendee-user accounts via UI
- **Role Hierarchy:** super_admin → admin → moderator → user
- **Safety:** Prevent unlinking if it's the user's only authentication method
- **Attendee Status:** Preserved independently (visitor/member/inactive) - NOT changed by linking

---

### Task 16.1: Admin Roles Schema & CLI Promotion

**Time:** 2 hours  
**Status:** ⏳ Pending

#### Schema Changes

Add to `users` table (via custom fields in auth configuration):

```typescript
role: v.optional(
  v.union(
    v.literal('super_admin'), // Can create other admins, full access
    v.literal('admin'), // Can link/unlink accounts, change attendee status
    v.literal('moderator'), // Can view admin features, read-only
    v.literal('user'), // Default role, regular user
  ),
)
```

Add to `attendees` table:

```typescript
userId: v.optional(v.id('users')) // Links to Convex Auth user account
// Add index: .index('by_user', ['userId'])
```

#### CLI Function

Create `convex/admin.ts`:

```typescript
export const promoteUser = mutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal('super_admin'),
      v.literal('admin'),
      v.literal('moderator'),
      v.literal('user'),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (!user) throw new Error('User not found')

    await ctx.db.patch(user._id, { role: args.role })

    return { success: true, userId: user._id, newRole: args.role }
  },
})
```

**CLI Usage:**

```bash
# First user signs up via app, then promote:
npx convex run admin/promoteUser --arg '{"email": "pastor@church.com", "role": "super_admin"}'

# Promote others:
npx convex run admin/promoteUser --arg '{"email": "assistant@church.com", "role": "admin"}'
```

#### Role Helpers

Create `convex/lib/auth-helpers.ts`:

```typescript
export async function requireRole(ctx, minRole: string) { ... }
export async function requireAdmin(ctx) { ... }
export async function requireSuperAdmin(ctx) { ... }
```

**Acceptance Criteria:**

- [ ] Schema updated with `role` field on users
- [ ] Schema updated with `userId` field on attendees
- [ ] `promoteUser` function created and tested via CLI
- [ ] Role checking helpers implemented
- [ ] Convex types regenerated

---

### Task 16.2: Attendee-User Auto-Linking Backend

**Time:** 2 hours  
**Status:** ⏳ Pending

#### Auto-Linking on Registration

Update `convex/auth.ts` with `createUser` callback:

```typescript
createUser: async (ctx, { user, profile }) => {
  // 1. Check for existing attendee with same email
  const existingAttendee = await ctx.db
    .query('attendees')
    .withIndex('by_email', (q) => q.eq('email', user.email))
    .first()

  if (existingAttendee) {
    // 2. Link existing attendee (Option A)
    await ctx.db.patch(existingAttendee._id, {
      userId: user._id,
      updatedAt: Date.now(),
      // Use OAuth profile pic if attendee has none
      // photoUrl: existingAttendee.photoUrl || profile.picture
    })
  } else {
    // 3. Create new attendee with OAuth data
    await ctx.db.insert('attendees', {
      firstName: profile.given_name || user.name?.split(' ')[0] || 'New',
      lastName: profile.family_name || user.name?.split(' ')[1] || 'User',
      email: user.email,
      phone: profile.phone_number, // if available
      status: 'visitor',
      userId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }
}
```

#### Admin Linking Mutations

Create `convex/attendees/admin.ts`:

```typescript
// Link attendee to user (admin only)
export const linkToUser = mutation({
  args: { attendeeId: v.id('attendees'), userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    // ... validation and linking logic
  },
})

// Unlink attendee from user (admin only, with safety check)
export const unlinkFromUser = mutation({
  args: { attendeeId: v.id('attendees') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const attendee = await ctx.db.get(args.attendeeId)
    if (!attendee?.userId) throw new Error('Not linked')

    // SAFETY CHECK: Ensure user has other auth methods
    const userAccounts = await ctx.db
      .query('accounts')
      .withIndex('by_user', (q) => q.eq('userId', attendee.userId))
      .collect()

    if (userAccounts.length <= 1) {
      throw new Error('Cannot unlink: user needs at least one sign-in method')
    }

    await ctx.db.patch(args.attendeeId, {
      userId: undefined,
      updatedAt: Date.now(),
    })
  },
})

// Admin-only status change
export const updateStatus = mutation({
  args: { attendeeId: v.id('attendees'), status: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    // ... validation logic
    await ctx.db.patch(args.attendeeId, {
      status: args.status,
      updatedAt: Date.now(),
    })
  },
})
```

#### Query Unlinked Attendees

Add to `convex/attendees/queries.ts`:

```typescript
export const listUnlinked = query({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    return await ctx.db
      .query('attendees')
      .filter((q) => q.eq(q.field('userId'), undefined))
      .take(args.count || 50)
  },
})
```

**Acceptance Criteria:**

- [ ] Auto-linking works on registration (existing attendee by email)
- [ ] New attendee created if no email match
- [ ] OAuth profile data used for new attendees
- [ ] Admin linking/unlinking mutations implemented
- [ ] Safety check prevents unlinking only auth method
- [ ] Only admins can change attendee status
- [ ] Query to list unlinked attendees

---

### Task 16.3: Admin Dashboard UI

**Time:** 2.5 hours  
**Status:** ✅ Complete

#### Settings > Admin Management Page

Created `src/routes/settings/admin.tsx` (Super Admin only):

**Implementation:**

- Created `convex/users.ts` - User queries with `getCurrentUser`, `getById`, `deleteUser`
- Created `src/hooks/useCurrentUserRole.ts` - Hook for role management
- Created `src/routes/settings.admin.tsx` - Admin dashboard with:
  - Role stats cards (Super Admin, Admin, Moderator, User counts)
  - User table with search/filter functionality
  - Role badges with icons (Crown, Shield, ShieldAlert, User)
  - Promote buttons for each role level
  - Demote button to reset to user
- Created `src/routes/settings.index.tsx` - Settings main page with Admin link
- Updated `src/lib/navigation.ts` - Added Admin child item under Settings
- Deleted `convex/myFunctions.ts` - Replaced with users.ts

**Acceptance Criteria:**

- [x] Page accessible only to Super Admin
- [x] Lists all users with current roles
- [x] Search functionality works
- [x] Can promote users to any role
- [x] Can demote/remove admin privileges
- [x] Shows stats summary

---

### Task 16.4: Attendee Detail Admin Actions

**Time:** 2 hours  
**Status:** ✅ Complete

#### Admin Section in Attendee Detail

✅ **Completed:** Updated attendee detail page with admin-only section

**Components Created:**

- ✅ `AdminSection.tsx` - Main admin section with Shield icon, role-based visibility (admin/moderator/super_admin)
- ✅ `LinkAccountDialog.tsx` - Searchable user list to link attendee to user account
- ✅ `UnlinkAccountDialog.tsx` - Confirmation dialog with safety warning about auth methods
- ✅ `ChangeStatusDialog.tsx` - Status change dialog with current/new status display

**Backend Integration:**

- ✅ `useAttendeeAdmin.ts` - Hooks for attendee-user linking (useAttendeeUserLink, useLinkToUser, useUnlinkFromUser)
- ✅ `listAll` query added to `convex/users.ts` - Search users by name/email
- ✅ `useListAllUsers` hook added to `useCurrentUserRole.ts`

**Features:**

- ✅ Admin section visible only to admins/moderators/super_admins
- ✅ Shows link status (linked/unlinked) with appropriate icons
- ✅ "Search & Link User" opens searchable user list
- ✅ "Unlink" button shows confirmation with safety warning
- ✅ "Change Status" button opens status selector
- ✅ "View User Profile" button (placeholder for future)
- ✅ All dialogs show loading states and toast notifications

**Acceptance Criteria:**

- [x] Admin section visible only to admins
- [x] Shows link status (linked/unlinked)
- [x] "Link Account" button opens user search dialog
- [x] "Unlink" button shows confirmation with safety check
- [x] "Change Status" button opens status selector
- [x] View linked user profile button

---

### Task 16.5: Attendee List Link Status

**Time:** 1 hour  
**Status:** ✅ Complete

#### Link Status in Attendee Table

Update attendee list/table:

```
Name            Email                Status      User Account
─────────────────────────────────────────────────────────────────
John Smith      john@email.com       Visitor     ✅ Linked
Jane Doe        jane@email.com       Member      ⚠️ Not Linked
Bob Wilson      bob@email.com        Visitor     ✅ Linked
```

**Features:**

- ✅ Link status icon/badge (✅/⚠️)
- ✅ Filter: "Show unlinked only" (admin convenience)
- ✅ Quick stats: "45 linked, 12 unlinked"
- ✅ Tooltip on hover: "Linked to user@email.com" or "Not linked to any account"

**Acceptance Criteria:**

- [x] Link status icon shows in table
- [x] Filter dropdown for linked/unlinked
- [x] Quick stats visible to admins
- [x] Tooltips show link details

---

### Task 16.6: Settings > Account Page

**Time:** 2.5 hours  
**Status:** ✅ Complete

#### User Account Management

Created `src/routes/settings.account.tsx`:

**Backend (`convex/account.ts`):**

- `getAccountInfo` query - Returns user profile, linked attendee, and all auth methods
- `unlinkAccount` mutation - Remove OAuth account with safety check (can't remove last method)

**Frontend (`src/routes/settings.account.tsx`):**

- **Attendee Profile Card** - Shows linked attendee with avatar, name, status badge, join date
  - "View Profile" button to navigate to attendee detail page
  - Fallback message when no attendee profile linked
- **Authentication Methods Section** - Lists all auth methods with icons and details
  - Email & Password with email display and "Change Password" button (placeholder)
  - Google/Facebook with linked date and "Unlink" button
  - Confirmation dialog before unlinking
- **Link New Account Section** - Shows available providers to link
  - "Link Google" / "Link Facebook" / "Set Password" buttons (placeholders)
  - Hides buttons for already-linked providers
- **Safety Warning Card** - Yellow alert explaining can't unlink only auth method

**Navigation Updates:**

- Added Account link to Settings children in `src/lib/navigation.ts`
- Added Account card to Settings index page grid

**Acceptance Criteria:**

- [x] Shows linked attendee profile
- [x] Lists all auth methods with icons
- [x] Can add password to OAuth account (placeholder UI)
- [x] Can link additional OAuth providers (placeholder UI)
- [x] Cannot unlink if it's the only method (safety check enforced)
- [x] Change password functionality (placeholder UI)
- [x] Navigation updated with Account link
- [x] Settings index page updated with Account card

---

### Task 16.7: OAuth Setup & E2E Testing

**Time:** 2 hours  
**Status:** ⏳ Pending

#### OAuth Configuration

**Files to Create:**

- `docs/OAUTH_SETUP.md` - Step-by-step guide
- `.env.example` - Environment variable template

**Google OAuth Setup:**

1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.com/api/auth/callback/google` (prod)
5. Copy Client ID and Secret to Convex dashboard

**Facebook OAuth Setup:**

1. Create app in Facebook Developers
2. Add Facebook Login product
3. Configure OAuth redirect URIs
4. Copy App ID and Secret to Convex dashboard

#### Convex Environment Variables

Set in Convex dashboard:

```
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_FACEBOOK_ID=your-facebook-app-id
AUTH_FACEBOOK_SECRET=your-facebook-app-secret
```

#### E2E Tests

Create `tests/e2e/specs/oauth.spec.ts`:

```typescript
describe('OAuth Authentication', () => {
  test('user can sign in with Google')
  test('user can sign in with Facebook')
  test('OAuth user can add password')
  test('user can link Google to existing email account')
  test('user can unlink OAuth account if has password')
})
```

**Note:** OAuth E2E tests may be skipped in CI if credentials not available.

**Acceptance Criteria:**

- [ ] OAuth setup documentation complete
- [ ] Google OAuth configured and tested
- [ ] Facebook OAuth configured and tested
- [ ] Environment variables documented
- [ ] E2E tests created (with skip conditions)
- [ ] Manual testing checklist completed

---

## Phase 16 Summary Table

| Task      | Time       | Description                   | Dependencies |
| --------- | ---------- | ----------------------------- | ------------ |
| 16.1      | 2 hrs      | Admin Roles Schema & CLI      | None         |
| 16.2      | 2 hrs      | Attendee-User Linking Backend | 16.1         |
| 16.3      | 2.5 hrs    | Admin Dashboard UI            | 16.1         |
| 16.4      | 2 hrs      | Attendee Detail Admin Actions | 16.2         |
| 16.5      | 1 hr       | Attendee List Link Status     | 16.2         |
| 16.6      | 2.5 hrs    | Settings > Account Page       | 16.2         |
| 16.7      | 2 hrs      | OAuth Setup & Testing         | All above    |
| **Total** | **13 hrs** |                               |              |

---

## Phase 16 Key Features

✅ **Role System:** 4 levels (super_admin, admin, moderator, user)  
✅ **CLI Promotion:** `npx convex run admin/promoteUser`  
✅ **First Admin:** Sign up → CLI promote  
✅ **Auto-Linking:** By email on registration (Option A)  
✅ **Manual Linking:** Admin UI for edge cases (Option B)  
✅ **Permissions:** Only admins link/unlink/change status  
✅ **Safety:** Prevent unlinking only auth method  
✅ **OAuth Data:** Used for new attendee profiles  
✅ **Admin Dashboard:** Settings > Admin Management  
✅ **Account Page:** Users manage auth methods

---

## Next Up After Phase 16

- Future: Attendance reporting & analytics
- Future: Dashboard statistics widgets
- Future: Event analytics per type
- Future: Multi-campus support

---

**Ready to start Phase 16 implementation!** 2. **MANUAL TEST** - Verify it works in the browser 3. **ADD TESTS** - After confirmation, add unit/component tests

**Tech Stack:** TanStack Start + React, Convex (backend), shadcn/ui (components), TypeScript

**Key Commands:**

- `pnpm dev` - Start development server
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm dlx convex dev` - Start Convex backend

---

_For detailed implementation specifications, see individual feature documentation in `/docs` directory._
