# CJCRSG-Hub Feature List

Complete feature catalog for the church management system.

**Last Updated:** 2026-03-31  
**Current Phase:** Phase 13 - Spiritual Retreat Enhancement - In Progress  
**Status:** 🚧 Phase 13.3 Complete

**Next Up:**

- 🚧 Phase 13.4: Tabbed UI Components (waiting for your approval)
- ⏳ Phase 13.5: Integration
- ⏳ Future: Attendance reporting & analytics
- ⏳ Future: Dashboard statistics widgets

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
