# TDD Workflow Guide

## Implementation-First Workflow (Updated 2026-03-21)

Our development workflow has evolved to an **Implementation-First** approach:

1. **IMPLEMENT** - Build the feature first
   - Write the code
   - Make it functional
   - Don't write tests yet

2. **MANUAL TEST** - Verify it works
   - Run the app (`pnpm dev`)
   - Test the feature manually
   - Confirm requirements are met

3. **ADD TESTS** - After confirmation
   - Backend: Add convex-test unit tests
   - Frontend: Add component tests
   - Update test counts in documentation

**Why this change?**

- UI requirements often evolve during implementation
- Heavy mocking makes tests brittle for React components
- Manual testing catches UX issues unit tests miss
- Backend can still be unit tested effectively after implementation

---

## When Tests Are Required

### ✅ REQUIRED (Write tests after implementation)

| Feature                               | Test Type        | File Pattern                                    |
| ------------------------------------- | ---------------- | ----------------------------------------------- |
| New Convex mutation                   | Unit test        | `tests/unit/convex/{feature}/mutations.test.ts` |
| New Convex query                      | Unit test        | `tests/unit/convex/{feature}/queries.test.ts`   |
| Shared component (2+ features use it) | Component test   | `tests/unit/components/{name}.test.tsx`         |
| Bug fix                               | Regression test  | Add to existing test file                       |
| Form validation logic                 | Unit + Component | Both test types                                 |

### ❌ Optional (Can skip)

- Simple UI-only components (pure presentation)
- One-off components (used in single place)
- Styling/visual changes
- Documentation updates
- Refactoring (test after if needed)

### 🚨 Exceptions

1. **Prototype/Spike Code**: Testing exploratory features
2. **Emergency Hotfixes**: Production issues needing immediate fix
3. **Documentation**: README, comments, etc.

---

## Workflow by Task Type

### 1. New Feature Implementation

```bash
# Step 1: Create branch
git checkout -b feature/event-types

# Step 2: Implement the feature
# Create convex/eventTypes/mutations.ts
# Create convex/eventTypes/queries.ts
# Create frontend components
pnpm dev  # Test manually

# Step 3: Add tests after manual verification
# Create tests/unit/convex/eventTypes/mutations.test.ts
# Create tests/unit/convex/eventTypes/queries.test.ts
pnpm test  # Run tests → Expect PASS

git add .
git commit -m "feat: implement event type backend with tests"

git push -u origin feature/event-types
```

### 2. Bug Fix

```bash
# Step 1: Create branch
git checkout -b fix/attendee-search

# Step 2: Fix the bug
# Fix the query code
pnpm dev  # Verify fix manually

# Step 3: Add regression test
# Add test to tests/unit/convex/attendees/queries.test.ts
# Test should verify the fix

pnpm test  # Test should pass

git add .
git commit -m "fix: resolve attendee search with special characters"
```

### 3. Refactoring

```bash
# Step 1: Ensure existing tests exist
# If no tests, write them first

# Step 2: Refactor
# Make changes
pnpm test  # Must still pass

git add .
git commit -m "refactor: simplify attendee queries"
```

---

## Current Test Statistics

**Total Tests:** 591 tests passing

| Category        | Count | Status         |
| --------------- | ----- | -------------- |
| Convex Unit     | 94    | ✅ All passing |
| Component Tests | 497   | ✅ All passing |

### Breakdown by Feature

**Attendees:**

- Mutations: 7 tests
- Queries: 15 tests

**Event Types:**

- useEventTypes hooks: 9 tests
- useEventTypeMutations hooks: 12 tests
- EventTypeForm component: 15 tests
- EventTypeList component: 12 tests

**Shared Components:**

- Form: 15 tests
- ErrorState: 21 tests
- Layout: 6 tests

---

## Test File Patterns

### Convex Unit Tests

```typescript
// tests/unit/convex/eventTypes/mutations.test.ts
import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../convex/schema'

const modules = import.meta.glob('../../../convex/**/*.ts')

describe('eventTypes mutations', () => {
  describe('create', () => {
    it('creates event type with valid data', async () => {
      const t = convexTest(schema, modules)

      const id = await t.mutation(api.eventTypes.create, {
        name: 'Sunday Service',
        color: '#3b82f6',
      })

      expect(id).toBeDefined()

      // Verify the event type was created
      const eventType = await t.query(api.eventTypes.getById, { id })
      expect(eventType).toMatchObject({
        name: 'Sunday Service',
        color: '#3b82f6',
      })
    })

    it('throws error for duplicate name', async () => {
      const t = convexTest(schema, modules)

      // Create first event type
      await t.mutation(api.eventTypes.create, {
        name: 'Sunday Service',
        color: '#3b82f6',
      })

      // Try to create duplicate
      await expect(
        t.mutation(api.eventTypes.create, {
          name: 'Sunday Service',
          color: '#22c55e',
        }),
      ).rejects.toThrow('already exists')
    })
  })
})
```

### Component Tests

```typescript
// tests/unit/components/event-type-form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EventTypeForm } from '@/features/events/components/EventTypeForm'

describe('EventTypeForm', () => {
  const mockSubmit = vi.fn()
  const mockCancel = vi.fn()

  it('renders all required fields', () => {
    render(<EventTypeForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('validates required name field', async () => {
    render(<EventTypeForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(<EventTypeForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Sunday Service' },
    })

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Sunday Service',
        description: '',
        color: '#3b82f6',
      })
    })
  })
})
```

---

## Pre-Commit Checklist

Before every commit, ensure:

- [ ] **Implementation is complete** and manually tested
- [ ] **New mutations have tests** (if applicable)
- [ ] **New queries have tests** (if applicable)
- [ ] **New shared components have tests** (if applicable)
- [ ] **Bug fixes include regression test** (if applicable)
- [ ] Run `pnpm test` - **all tests pass**
- [ ] Run `pnpm lint` - **no errors**
- [ ] Update **CHANGELOG.md** (if user-facing change)
- [ ] Update **TASKS.md** "Current Session" (if feature work)
- [ ] Update **TDD_TASKS.md** "Current Progress" (if test work)

---

## My Role as Testing Guide

### What I'll Do:

1. **Implement features first** - Build working code
2. **Remind about tests** - After manual verification
3. **Write comprehensive tests** - For mutations, queries, shared components
4. **Question missing tests**: "Should we add a test for this?"
5. **Document exceptions**: Note when tests are skipped
6. **Update skill files**: Keep this workflow current

### What I Won't Do:

1. **Block implementation** - Build first, test after
2. **Test everything** - Focus on critical paths (mutations, shared components)
3. **Over-test** - Skip trivial UI-only components

---

## Quick Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode (development)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Check if tests pass (for hooks)
pnpm test 2>&1 | grep -q "Test Files.*passed" && echo "✅ Tests pass" || echo "❌ Tests failed"
```

---

## Phase 4 TDD Plan (Event Types) - ✅ COMPLETED

### Task Breakdown

| Task                       | Implementation | Tests Added | Test File                       | Status         |
| -------------------------- | -------------- | ----------- | ------------------------------- | -------------- |
| 4.1 Install react-colorful | Config         | ❌ No       | -                               | ✅ Done        |
| 4.2 Backend validators     | TypeScript     | ❌ No       | -                               | ✅ Done        |
| 4.3 Backend queries        | Convex         | ✅ Yes      | `eventTypes/queries.test.ts`    | ✅ Done        |
| 4.4 Backend mutations      | Convex         | ✅ Yes      | `eventTypes/mutations.test.ts`  | ✅ Done        |
| 4.5 Generate types         | Auto           | ❌ No       | -                               | ✅ Done        |
| 4.6 Frontend hooks         | React          | ✅ Yes      | `useEventTypes.test.ts`         | ✅ Done        |
| 4.7 Frontend mutations     | React          | ✅ Yes      | `useEventTypeMutations.test.ts` | ✅ Done        |
| 4.8 EventTypeForm          | Component      | ✅ Yes      | `event-type-form.test.tsx`      | ✅ Done        |
| 4.9 EventTypeList          | Component      | ✅ Yes      | `event-type-list.test.tsx`      | ✅ Done        |
| 4.10 Route page            | React          | ❌ No       | Manually tested                 | 🚧 In Progress |
| 4.11 Navigation            | Config         | ❌ No       | -                               | ⏳ Pending     |

**Total tests written: 48 new tests**
**Total project tests: 591 tests passing**

---

## Testing Philosophy

**Focus on critical flows.** We test what can break the app.

**Backend (Unit Tests):**

- ✅ All queries and mutations
- Schema validation
- Business logic

**Frontend (Selective Unit Tests):**

- Shared components (via unit tests)
- Complex logic (via unit tests)

**What We Skip:**

- Simple presentational components
- Component tests that require heavy mocking
- Tests for rapidly changing UI

---

## Success Metrics

Current Status:

- ✅ **591 total tests passing**
- ✅ **All mutations tested**
- ✅ **All queries tested**
- ✅ **Shared components tested**
- ✅ **Coverage maintained/improved**

---

_Last Updated: 2026-03-21_
