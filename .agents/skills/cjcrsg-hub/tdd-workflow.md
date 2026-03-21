# TDD Workflow Enforcement (Moderate)

## Strictness Level: Moderate 🟡

I will **strongly remind** you about tests but proceed with implementation if you explicitly request it. However, I'll always emphasize the TDD workflow and document what's missing.

---

## The TDD Golden Rule

**Test First, Code Second**

```
RED:    Write failing test → Run it (confirm it fails)
GREEN:  Write minimal code → Run tests (confirm it passes)
REFACTOR: Clean up → Run tests (still passing)
```

---

## When Tests Are Required

### ✅ REQUIRED (Write tests FIRST)

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

# Step 2: Write tests FIRST
# Create tests/unit/convex/eventTypes/mutations.test.ts
# Create tests/unit/convex/eventTypes/queries.test.ts
pnpm test  # Run tests → Expect FAILURES (RED)

git add tests/
git commit -m "test: add tests for event type CRUD operations"

# Step 3: Write implementation
# Create convex/eventTypes/mutations.ts
# Create convex/eventTypes/queries.ts
pnpm test  # Run tests → Expect PASS (GREEN)

git add convex/
git commit -m "feat: implement event type backend operations"

# Step 4: Frontend (if needed)
# Create tests for shared components first
# Then implement components

git push -u origin feature/event-types
```

### 2. Bug Fix

```bash
# Step 1: Create branch
git checkout -b fix/attendee-search

# Step 2: Write regression test FIRST
# Add test to tests/unit/convex/attendees/queries.test.ts
# Test should reproduce the bug (fail)

git add tests/
git commit -m "test: add regression test for attendee search bug"

# Step 3: Fix the bug
# Fix the query code
pnpm test  # Test should now pass

git add convex/
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

## Test File Patterns

### Convex Unit Tests

```typescript
// tests/unit/convex/eventTypes/mutations.test.ts
import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../convex/schema'

const test = convexTest(schema)

describe('eventTypes mutations', () => {
  describe('create', () => {
    it('creates event type with valid data', async () => {
      // Test here
    })
  })
})
```

### Component Tests

```typescript
// tests/unit/components/event-type-form.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventTypeForm } from '@/features/events/components/EventTypeForm'

describe('EventTypeForm', () => {
  it('renders all required fields', () => {
    render(<EventTypeForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })
})
```

---

## Pre-Commit Checklist

Before every commit, ensure:

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

## My Role as TDD Enforcer

### What I'll Do:

1. **Remind you** about tests when you ask for new features
2. **Write tests first** for critical mutations and queries
3. **Question missing tests**: "Should we add a test for this mutation?"
4. **Document exceptions**: If you skip tests, I'll note it in commit messages
5. **Update skill files**: Keep this TDD workflow current

### What I Won't Do:

1. **Block you completely**: If you insist on implementation first, I'll proceed
2. **Test everything**: Focus on critical paths (mutations, shared components)
3. **Over-test**: Skip trivial UI-only components

### Commit Message Format

When tests are missing by exception:

```bash
# With exception note
git commit -m "feat: add event type form [TEST-EXCEPTION: prototype]"

# Or
git commit -m "feat: add event type form

Note: Tests skipped - this is spike/prototype code"
```

---

## Quick Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode (development)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E with UI
pnpm test:e2e:ui

# Check if tests pass (for hooks)
pnpm test 2>&1 | grep -q "Test Files.*passed" && echo "✅ Tests pass" || echo "❌ Tests failed"
```

---

## Phase 4 TDD Plan (Event Types)

### Task Breakdown with TDD

| Task                       | Implementation | Test First? | Test File                      |
| -------------------------- | -------------- | ----------- | ------------------------------ |
| 4.1 Install react-colorful | Config         | ❌ No       | -                              |
| 4.2 Backend validators     | TypeScript     | ⚠️ Optional | -                              |
| 4.3 Backend queries        | Convex         | ✅ **YES**  | `eventTypes/queries.test.ts`   |
| 4.4 Backend mutations      | Convex         | ✅ **YES**  | `eventTypes/mutations.test.ts` |
| 4.5 Generate types         | Auto           | ❌ No       | -                              |
| 4.6 Frontend hooks         | React          | ⚠️ Optional | -                              |
| 4.7 Frontend mutations     | React          | ⚠️ Optional | -                              |
| 4.8 EventTypeForm          | Component      | ✅ **YES**  | `event-type-form.test.tsx`     |
| 4.9 EventTypeList          | Component      | ✅ **YES**  | `event-type-list.test.tsx`     |
| 4.10 Route page            | React          | ❌ No       | E2E test instead               |
| 4.11 Navigation            | Config         | ❌ No       | -                              |
| 4.12 E2E Testing           | Playwright     | ✅ **YES**  | `event-types.spec.ts`          |

**Total tests to write: 5 test files**

---

## Success Metrics

After Phase 4:

- [ ] All mutations tested
- [ ] All queries tested
- [ ] Shared components tested
- [ ] E2E flow tested
- [ ] Test count: 75 + ~20 = ~95 tests
- [ ] Coverage: Maintain or improve

---

_Last Updated: 2026-03-21_
