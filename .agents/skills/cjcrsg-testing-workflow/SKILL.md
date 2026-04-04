---
name: cjcrsg-testing-workflow
description: Testing workflow and requirements for CJCRSG-Hub. Use when determining what tests to write, where to place them, and how to run the test suite.
---

# CJCRSG Testing Workflow

Guidelines for test coverage, test locations, and test commands.

## When to Use This Skill

- Deciding what tests to write
- Determining test file locations
- Running test suites
- Understanding test requirements

---

## When Tests Are Required

**✅ REQUIRED (After implementation):**

| Feature                               | Test Type        | File Pattern                                    |
| ------------------------------------- | ---------------- | ----------------------------------------------- |
| New Convex mutation                   | Unit test        | `tests/unit/convex/{feature}/mutations.test.ts` |
| New Convex query                      | Unit test        | `tests/unit/convex/{feature}/queries.test.ts`   |
| Shared component (2+ features use it) | Component test   | `tests/unit/components/{name}.test.tsx`         |
| Bug fix                               | Regression test  | Add to existing test file                       |
| Form validation logic                 | Unit + Component | Both test types                                 |

**❌ Optional (Can skip):**

- Simple UI-only components
- One-off components
- Styling/visual changes
- Documentation updates

---

## Test Statistics

**Current:** 591 tests passing

| Category        | Count | Status         |
| --------------- | ----- | -------------- |
| Convex Unit     | 94    | ✅ All passing |
| Component Tests | 497   | ✅ All passing |

---

## Running Tests

```bash
# Run all tests
pnpm test              # Must pass before commit

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

---

## Implementation-First Testing

### Phase 1: IMPLEMENT

Build the feature first:

- Write the code
- Make it functional
- Don't write tests yet
- Focus on requirements

### Phase 2: MANUAL TEST

Verify it works:

- Run `pnpm dev`
- Test the feature manually
- Confirm requirements are met
- Report issues or adjustments

### Phase 3: ADD TESTS

After user confirmation ("works", "LGTM", etc.):

- Backend: Add convex-test unit tests
- Frontend: Add component tests
- Update test counts in documentation
- Run all tests to verify

---

## Test Folder Structure

```
tests/
├── unit/
│   ├── convex/                    # Convex backend tests
│   │   └── attendees/
│   │       ├── queries.test.ts
│   │       └── mutations.test.ts
│   └── components/                # Component tests
│       └── ui/
│           ├── form.test.tsx
│           ├── error-state.test.tsx
│           └── layout.test.tsx
└── setup/
    └── test.setup.ts
```

---

## Test Types

### Convex Unit Tests

Use `convex-test` for testing backend logic:

```typescript
// tests/unit/convex/attendees/mutations.test.ts
import { convexTest } from 'convex-test'
import { describe, it, expect } from 'vitest'
import schema from '../../../convex/schema'

const modules = import.meta.glob('../../../convex/**/*.ts')

describe('attendees mutations', () => {
  it('creates attendee with valid data', async () => {
    const t = convexTest(schema, modules)
    const id = await t.mutation(api.attendees.create, {
      firstName: 'John',
      lastName: 'Doe',
      status: 'member',
    })
    expect(id).toBeDefined()
  })
})
```

### Component Tests

Use `@testing-library/react` for React components:

```typescript
// tests/unit/components/form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

describe('Form', () => {
  it('validates required fields', async () => {
    render(<TestForm />)
    fireEvent.click(screen.getByText('Submit'))
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })
})
```

---

\_Last Updated: 2026-03-21
