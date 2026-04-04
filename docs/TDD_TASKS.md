# TDD Implementation Tasks

Complete task list for implementing Test Driven Development (TDD) in CJCRSG-Hub.

**Last Updated:** 2026-04-02  
**Current Phase:** All Testing Phases Complete  
**Status:** ✅ 591 tests passing

---

## Current Status

**Test Count:** 591 tests passing

- Convex Unit: 94 tests
- Component Tests: 497 tests

**All test phases complete.** Infrastructure, backend queries/mutations, and component tests all implemented.

---

## Future Testing (Next Up)

### OAuth Authentication Testing

**Priority:** Medium

**Test Coverage:**

- Google login flow
- Facebook login flow
- OAuth error handling
- Account linking scenarios

**Files:**

- `tests/unit/auth/oauth.test.ts`
- `tests/unit/components/auth/OAuthButtons.test.tsx`

---

### Performance Testing

**Priority:** Low

**Test Coverage:**

- Large dataset handling (10,000+ attendees)
- Search performance benchmarks
- Pagination with many pages
- Memory leak detection

**Tools:**

- Vitest bench for benchmarks
- React DevTools Profiler

---

## Completed Testing Phases

### Phase 1: Infrastructure ✅

Setup Vitest, convex-test, and test folder structure. Validation tests passing.

**Files:**

- `vitest.config.ts`
- `tests/unit/setup.ts`
- `tests/unit/example.test.ts`

---

### Phase 2: Attendee Backend Tests ✅

Convex unit tests for attendee queries and mutations.

**Test Files:**

- `tests/unit/convex/attendees/mutations.test.ts` (7 tests - create, update, archive)
- `tests/unit/convex/attendees/queries.test.ts` (15 tests - list, getById, search, count)

---

### Phase 3: Shared Component Tests ✅

Tests for shared UI components used across features.

**Test Files:**

- `tests/unit/components/form.test.tsx` (15 tests - validation, submission, cancellation)
- `tests/unit/components/error-state.test.tsx` (21 tests - error types, actions, defaults)
- `tests/unit/components/layout.test.tsx` (6 tests - rendering, structure)

---

### Phase 4b: Event Types Tests ✅

Tests for event type management (hooks and components).

**Test Files:**

- `tests/unit/events/hooks/useEventTypes.test.ts` (9 tests)
- `tests/unit/events/hooks/useEventTypeMutations.test.ts` (12 tests)
- `tests/unit/events/components/EventTypeForm.test.tsx` (15 tests)
- `tests/unit/events/components/EventTypeList.test.tsx` (12 tests)
- `tests/unit/routes/event-types.test.tsx` (8 tests)

---

### Phase 6: Events Backend Tests ✅

Convex unit tests for event queries and mutations.

**Test Files:**

- `tests/unit/convex/events/mutations.test.ts` (31 tests - create, update, start, complete, cancel, archive)
- `tests/unit/convex/events/queries.test.ts` (26 tests - list, getById, getCurrentEvent, listArchive, getStats)

---

### Phase 7: Attendance Backend Tests ✅

Convex unit tests for attendance tracking.

**Test Files:**

- `tests/unit/convex/attendance/mutations.test.ts` (19 tests - checkIn, unCheckIn, bulkCheckIn)
- `tests/unit/convex/attendance/queries.test.ts` (21 tests - getByEvent, getStats, getByAttendee, getInviters)

---

### Phase 8: Events Frontend Hooks ✅

Tests for React hooks managing events and attendance.

**Test Files:**

- `tests/unit/events/hooks/useEvents.test.ts` (22 tests - list, getById, getCurrent, archive, stats)
- `tests/unit/events/hooks/useEventMutations.test.ts` (24 tests - create, update, start, complete, cancel, archive)
- `tests/unit/events/hooks/useAttendance.test.ts` (19 tests - byEvent, stats, byAttendee, inviters, checkIn, unCheckIn, bulkCheckIn)

---

### Phase 9: Events Components ✅

Tests for event-related React components.

**Test Files:**

- `tests/unit/events/components/BasicInfoEditModal.test.tsx`
- `tests/unit/events/components/EventDetails.test.tsx`
- `tests/unit/events/components/AttendanceManager.test.tsx`
- `tests/unit/events/components/EventArchive.test.tsx`
- `tests/unit/events/components/EventFilters.test.tsx`
- `tests/unit/events/components/CurrentEventDashboard.test.tsx`
- `tests/unit/events/components/QuickStats.test.tsx`

**Total:** 78 tests (20 + 33 + 25)

---

### Phase 13: Spiritual Retreat Tests ✅

Backend tests for retreat-specific functionality.

**Test Files:**

- `tests/unit/convex/retreat/mutations.test.ts` (37 tests)
  - Teacher validation (10 tests)
  - Teacher removal (4 tests)
  - Lesson management (15 tests)
  - Staff CRUD (8 tests)

---

### Phase 14: Event Forms Tests ✅

Component tests for Spiritual Retreat form.

**Test Files:**

- `tests/unit/events/forms/SpiritualRetreatForm.test.tsx` (16 tests)
- Deleted with Phase 15 refactor: `GenericEventForm.test.tsx`

---

## Testing Strategy

### Implementation-First Workflow

1. **IMPLEMENT** - Build the feature (backend + frontend)
2. **MANUAL TEST** - User tests manually, confirms requirements
3. **ADD TESTS** - Backend unit tests + component tests after confirmation

### What We Test

**Backend (Unit Tests):**

- All queries and mutations
- Schema validation
- Business logic

**Frontend (Selective):**

- Shared components
- Complex logic
- Critical user flows

**What We Skip:**

- Simple presentational components
- Heavy-mocked tests
- Rapidly changing UI

---

## Technology Stack

| Category        | Tool                            | Purpose                     |
| --------------- | ------------------------------- | --------------------------- |
| Unit Tests      | Vitest + convex-test            | Test Convex logic in memory |
| Component Tests | Vitest + @testing-library/react | Test React components       |
| Coverage        | @vitest/coverage-v8             | Code coverage reporting     |

---

## Test Summary

| Phase     | Focus              | Tests   |
| --------- | ------------------ | ------- |
| 1         | Infrastructure     | 3       |
| 2         | Attendee Backend   | 22      |
| 3         | Shared Components  | 44      |
| 4b        | Event Types        | 48      |
| 6         | Events Backend     | 57      |
| 7         | Attendance Backend | 40      |
| 8         | Events Hooks       | 65      |
| 9         | Events Components  | 78      |
| 13        | Retreat Backend    | 37      |
| 14        | Event Forms        | 16      |
| **Total** |                    | **591** |

---

## Commands

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

---

## Documentation Note

**This file tracks TDD and testing-related tasks only.**

For feature implementation tasks, see `docs/TASKS.md`.

**Update this file when:**

- Working on test infrastructure
- Writing unit tests for Convex queries/mutations
- Setting up test utilities

**Do NOT update this file for:**

- Feature implementation
- Bug fixes unrelated to tests
- Documentation updates

---

_For detailed test implementation examples, see individual test files in `/tests/unit/`._
