# TDD Implementation Tasks

Complete task list for implementing Test Driven Development (TDD) in CJCRSG-Hub.

**Estimated Total Time:** 9.5 hours  
**Last Updated:** 2026-03-21

---

## Current Progress

**Updated:** 2026-03-21

**Phase:** Phase 4 - Event Types Tests  
**Status:** ✅ Completed | Tasks 4.10-4.12 Done  
**Current Task:** Event Types route and E2E tests added

**Summary:**

- ✅ Phase 1: Infrastructure (6/6 tasks complete)
- ✅ Phase 2: Critical Convex Unit Tests (4/4 tasks complete, 37 tests passing)
  - ✅ Task 2.1: Test Attendee Mutations (7/7 tests passing)
  - ✅ Task 2.2: Test Attendee Queries (15/15 tests passing)
  - ✅ Task 2.3: Test Event Types Queries (6/6 tests passing)
  - ✅ Task 2.4: Test Event Types Mutations (9/9 tests passing)
- ✅ Phase 3: Shared Component Tests (3/3 tasks complete, 44 tests passing)
  - ✅ Task 3.1: Test Form Component (15/15 tests passing)
  - ✅ Task 3.2: Test ErrorState Component (21/21 tests passing)
  - ✅ Task 3.3: Test Layout Component (6/6 tests passing)
- ✅ Phase 4: E2E Critical Flows (2/2 tasks complete, 9 E2E tests)
  - ✅ Task 4.1: Create Auth Tests (3 tests - signup/login, invalid credentials, session persistence)
  - ✅ Task 4.2: Create Attendee CRUD Tests (4 tests - navigation, form submission, validation, list view)
  - ✅ Setup tests (2 tests - homepage loads, login page accessible)
- ✅ Phase 4b: Event Types Unit Tests (4/4 tasks complete, 48 tests added)
  - ✅ Task 4.6: Test useEventTypes hooks (9 tests - list, getById, checkAssociations)
  - ✅ Task 4.7: Test useEventTypeMutations hooks (12 tests - create, update, delete with toast notifications)
  - ✅ Task 4.8: Test EventTypeForm component (15 tests - rendering, validation, color picker, submission)
  - ✅ Task 4.9: Test EventTypeList component (12 tests - loading, error, empty states, table rendering)
- ✅ Phase 4c: Event Types Route & E2E Tests (2/2 tasks complete, 17 tests added)
  - ✅ Task 4.10: Test Event Types route page (8 tests - initial render, dialog management, form submission)
  - ✅ Task 4.12: Test Event Types E2E (9 tests - navigation, empty state, CRUD, validation)

**Total Tests:** 155 tests passing (37 Convex + 100 Component + 18 E2E)

---

## Documentation Note

**This file tracks TDD and testing-related tasks only.**

For feature implementation tasks (Event Types, Attendee management, etc.), see `docs/TASKS.md`.

**Update this file when:**

- Working on test infrastructure (Vitest, Playwright, convex-test)
- Writing unit tests for Convex queries/mutations
- Creating E2E test specs
- Setting up test utilities or helpers

**Do NOT update this file for:**

- Feature implementation (UI components, backend logic)
- Bug fixes unrelated to tests
- Documentation updates

---

## 📋 Table of Contents

1. [TDD Overview & Strategy](#tdd-overview--strategy)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
5. [Phase 2: Critical Convex Unit Tests](#phase-2-critical-convex-unit-tests)
6. [Phase 3: Shared Component Tests](#phase-3-shared-component-tests)
7. [Phase 4: E2E Critical Flows](#phase-4-e2e-critical-flows)
8. [Commands & Scripts](#commands--scripts)
9. [Success Criteria](#success-criteria)
10. [Phase 5: Future Testing](#phase-5-future-testing)

---

## 🎯 Testing Strategy (Updated 2026-03-21)

### Implementation-First Workflow

**Step 1: IMPLEMENT**

- Build the feature (backend + frontend)
- Focus on functionality first
- Make it work in the browser

**Step 2: MANUAL TEST**

- User tests the feature manually
- Confirm requirements are met
- Report any issues or adjustments needed

**Step 3: ADD TESTS** (After user confirmation)

- Backend: Unit tests with convex-test
- Frontend: Component tests OR E2E tests
- Update documentation with test counts

### Testing Philosophy

**Focus on critical flows.** We test what can break the app.

**Backend (Unit Tests):**

- ✅ All queries and mutations
- Schema validation
- Business logic

**Frontend (E2E + Selective Unit Tests):**

- Critical user flows (via E2E)
- Shared components (via unit tests)
- Complex logic (via unit tests)

**What We Skip:**

- Simple presentational components
- Component tests that require heavy mocking
- Tests for rapidly changing UI

### When to Write Tests

**Write tests AFTER implementation for:**

- Backend queries and mutations (convex-test)
- Form validation logic
- Bug fixes (reproduce the bug first in implementation)
- E2E tests for critical flows

**Skip testing:**

- Simple UI components (pure rendering)
- Non-shared components (tested via E2E)
- Heavy-mocked component tests

---

## 🛠 Technology Stack

| Category            | Tool                                    | Purpose                     | Speed              |
| ------------------- | --------------------------------------- | --------------------------- | ------------------ |
| **Unit Tests**      | Vitest + convex-test                    | Test Convex logic in memory | ⚡ Milliseconds    |
| **Component Tests** | Vitest + @testing-library/react + jsdom | Test React components       | ⚡ Seconds         |
| **E2E Tests**       | Playwright                              | Test full user workflows    | 🐢 Seconds-Minutes |
| **Coverage**        | @vitest/coverage-v8                     | Code coverage reporting     | -                  |

### Why This Stack?

- **convex-test**: Official Convex library for fast unit testing without running dev server
- **Vitest**: Vite-native test runner, fast HMR, supports multiple projects
- **Playwright**: Modern E2E testing with auto-waiting, trace viewer, mobile emulation
- **@testing-library**: User-centric testing (test behavior, not implementation)

---

## 📁 Folder Structure

```
cjcrsg-hub/
├── tests/
│   ├── unit/
│   │   ├── convex/                    # Convex unit tests (mock backend)
│   │   │   └── attendees/
│   │   │       ├── queries.test.ts    # Search, pagination
│   │   │       └── mutations.test.ts  # CRUD operations
│   │   │   └── schema.test.ts         # Schema validation
│   │   └── components/                # Shared component tests
│   │       └── ui/
│   │           ├── form.test.tsx
│   │           ├── error-state.test.tsx
│   │           └── layout.test.tsx
│   ├── e2e/
│   │   ├── specs/
│   │   │   ├── auth.spec.ts           # Login, session
│   │   │   └── attendees-crud.spec.ts # Full workflows
│   │   └── setup/
│   │       └── auth.setup.ts
│   └── README.md
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## Phase 1: Infrastructure Setup

**Estimated Time:** 2 hours  
**Goal:** Install dependencies, configure test runners, validate setup

### ✅ Task 1.1: Install Core Dependencies

**Time:** 15 minutes  
**Status:** Completed ✓

```bash
# Core testing framework
pnpm add -D vitest @vitest/coverage-v8

# Convex testing (official library)
pnpm add -D convex-test @edge-runtime/vm

# React component testing
pnpm add -D @testing-library/react @testing-library/jest-dom jsdom

# E2E testing
pnpm add -D @playwright/test
```

**Verification:** All packages installed successfully. Test folder structure created. Validation test passes (3/3 tests).

### ✅ Task 1.2: Configure Vitest

**Time:** 30 minutes  
**Status:** Completed ✓

Created `vitest.config.ts` with React and TypeScript path support:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: ['src/**/*.{ts,tsx}', 'convex/**/*.{ts,tsx}'],
    },
  },
})
```

**Created files:**

- `vitest.config.ts` - Vitest configuration (excludes e2e tests directory)
- `tests/unit/setup.ts` - Test setup file with jest-dom matchers

**Added npm scripts:**

- `pnpm test` - Run tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report

**Verification:** All tests pass (3/3). Configuration supports React components and Convex backend tests.

- Updated vitest.config.ts to exclude `tests/e2e/**/*` to prevent Vitest from running Playwright tests

### ✅ Task 1.3: Configure Playwright

**Time:** 20 minutes  
**Status:** Completed ✓

Created `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

**Installed browsers:**

- Chromium (Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

**Created files:**

- `playwright.config.ts` - Playwright configuration
- `tests/e2e/specs/setup.spec.ts` - Example E2E validation test

**Added npm scripts:**

- `pnpm test:e2e` - Run E2E tests headless
- `pnpm test:e2e:ui` - Run E2E tests with interactive UI

**Configuration features:**

- Parallel test execution
- Automatic dev server management
- Screenshot capture on failure
- Trace recording for debugging
- Multi-browser support (desktop + mobile)

### ✅ Task 1.4: Create Test Folder Structure

**Time:** 15 minutes  
**Status:** Completed ✓

Created test directory structure:

```bash
mkdir -p tests/unit/convex/attendees
mkdir -p tests/unit/components/ui
mkdir -p tests/e2e/specs
mkdir -p tests/e2e/setup
```

**Created directories:**

- `tests/unit/convex/attendees/` - For Convex backend unit tests
- `tests/unit/components/ui/` - For shared UI component tests
- `tests/e2e/specs/` - For E2E test specifications
- `tests/e2e/setup/` - For E2E test setup files

### ✅ Task 1.5: Update package.json Scripts

**Time:** 5 minutes  
**Status:** Completed ✓

Added test scripts to package.json:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

**Scripts added:**

- `pnpm test` - Run unit tests once
- `pnpm test:watch` - Run unit tests in watch mode
- `pnpm test:coverage` - Run unit tests with coverage report
- `pnpm test:e2e` - Run E2E tests headless
- `pnpm test:e2e:ui` - Run E2E tests with interactive UI

### ✅ Task 1.6: Validate Setup

**Time:** 15 minutes  
**Status:** Completed ✓

Created validation test at `tests/unit/example.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('Setup', () => {
  it('vitest works', () => {
    expect(true).toBe(true)
  })

  it('can import testing-library', () => {
    expect(() => require('@testing-library/react')).not.toThrow()
  })

  it('can import convex-test', () => {
    expect(() => require('convex-test')).not.toThrow()
  })
})
```

**Verification:**

- ✅ `pnpm test` passes (3/3 tests)
- ✅ Vitest excludes e2e directory (configured in vitest.config.ts)
- ✅ All test runners working correctly

---

## Phase 2: Critical Convex Unit Tests

**Estimated Time:** 2.5 hours  
**Goal:** Test mutations and queries that can break the app

### ✅ Task 2.1: Test Attendee Mutations

**Time:** 1.5 hours  
**Status:** Completed ✓

Created `tests/unit/convex/attendees/mutations.test.ts` with comprehensive tests:

**Test Coverage:**

**Create Mutation (3 tests):**

- ✅ Creates attendee with valid data
- ✅ Creates attendee with minimal fields (firstName, lastName, status only)
- ✅ Creates attendee with all fields (email, phone, address, joinDate, notes)
- ✅ Validates returned ID is a string
- ✅ Verifies all fields are stored correctly

**Update Mutation (3 tests):**

- ✅ Updates attendee first name
- ✅ Updates attendee and recalculates searchField automatically
- ✅ Throws 'Attendee not found' error when updating non-existent attendee
- ✅ Updates multiple fields at once

**Archive Mutation (3 tests):**

- ✅ Archives attendee by setting status to 'inactive'
- ✅ Updates updatedAt timestamp when archiving
- ✅ Allows archiving already-archived attendee (idempotent)
- ✅ Preserves all other fields when archiving

**Total:** 7 tests, all passing ✓

**Implementation Notes:**

- Used convex-test with direct function imports instead of string paths
- Tests use real Convex mutations and queries with in-memory database
- All tests are isolated and create their own test data

````

### ✅ Task 2.2: Test Attendee Queries

**Time:** 1 hour
**Status:** Completed ✓

Created `tests/unit/convex/attendees/queries.test.ts` with comprehensive tests:

**Test Coverage:**

**List Query (3 tests):**

- ✅ Returns paginated results with cursor
- ✅ Filters by status (member/visitor/inactive)
- ✅ Orders by creation date descending

**getById Query (2 tests):**

- ✅ Returns attendee by valid ID
- ✅ Returns null for non-existent attendee ID

**Search Query (7 tests):**

- ✅ Finds attendees by first name
- ✅ Finds attendees by last name
- ✅ Finds attendees by email
- ✅ Filters search results by status
- ✅ Returns empty array when no matches found
- ✅ Case insensitive search
- ✅ Limits results to 50 maximum

**Count Query (3 tests):**

- ✅ Returns total count of all attendees
- ✅ Returns count filtered by status
- ✅ Returns 0 when no attendees exist

**Total:** 15 tests, all passing ✓

**Phase 2 Summary:**

- ✅ Task 2.1: 7 mutation tests passing
- ✅ Task 2.2: 15 query tests passing
- **Total: 22/22 Convex unit tests passing**
- Execution time: ~900ms

**Implementation Notes:**

- Used convex-test with in-memory database for fast execution
- Tests follow the same pattern as mutations (direct function imports)
- Tests are isolated and create their own test data
- All edge cases covered (empty results, non-existent IDs, filtering)`

---

## Phase 3: Shared Component Tests

**Estimated Time:** 2 hours
**Goal:** Test components used by many features

### ✅ Task 3.1: Test Form Component

**Time:** 1 hour
**Status:** Completed ✓

Created `tests/unit/components/attendee-form.test.tsx` with comprehensive tests for the AttendeeForm component:

**Test Coverage:**

**Form Rendering (3 tests):**
- ✅ Renders all required form fields (firstName, lastName, address, status)
- ✅ Renders optional form fields (email, phone, notes, dates)
- ✅ Renders with initial data when provided

**Form Validation (4 tests):**
- ✅ Validates required fields on submit
- ✅ Rejects invalid email format
- ✅ Accepts empty email field (optional)
- ✅ Accepts valid email format

**Form Submission (3 tests):**
- ✅ Submits form with valid data
- ✅ Submits form with all optional fields
- ✅ Shows loading state while submitting

**Form Cancellation (3 tests):**
- ✅ Calls onCancel when cancel button clicked
- ✅ Does not render cancel button when not provided
- ✅ Disables cancel button while submitting

**Status Field (2 tests):**
- ✅ Defaults to visitor status
- ✅ Renders status dropdown

**Total:** 15 tests, all passing ✓

**Implementation Notes:**
- Tests use AttendeeForm component with react-hook-form + zod validation
- Covers both form validation and user interactions
- Tests are isolated with mock submit/cancel handlers
- Fixed tsconfig.json to include tests directory for path resolution

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name required'),
})

function TestForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '' },
  })

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

describe('Form', () => {
  it('validates required fields', async () => {
    render(<TestForm />)

    fireEvent.click(screen.getByText('Submit'))

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.getByText('Name required')).toBeInTheDocument()
    })
  })

  it('accepts valid data', async () => {
    render(<TestForm />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' },
    })
    fireEvent.click(screen.getByText('Submit'))

    await waitFor(() => {
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
    })
  })
})
```

### ✅ Task 3.2: Test ErrorState Component

**Time:** 30 minutes
**Status:** Completed ✓

Created `tests/unit/components/error-state.test.tsx` with comprehensive tests:

**Test Coverage:**

**Error Type Rendering (5 tests):**
- ✅ Renders not-found error with correct content and icon
- ✅ Renders error type with correct content
- ✅ Renders network error type with correct content
- ✅ Renders unauthorized error type with correct content
- ✅ Defaults to error type when no type specified

**Custom Content (4 tests):**
- ✅ Renders custom title when provided
- ✅ Renders custom description when provided
- ✅ Renders error message when error object provided
- ✅ Renders both custom description and error message

**Button Actions (8 tests):**
- ✅ Calls onRetry when retry button clicked
- ✅ Calls onBack when back button clicked
- ✅ Hides retry button when showRetry is false
- ✅ Hides back button when showBack is false
- ✅ Renders custom retry label when provided
- ✅ Renders custom back label when provided
- ✅ Renders only retry button when showBack is false
- ✅ Renders only back button when showRetry is false
- ✅ Renders no buttons when both showRetry and showBack are false

**Default Behaviors (2 tests):**
- ✅ Reloads page when retry clicked without onRetry handler
- ✅ Navigates to attendees when back clicked without onBack handler

**Total:** 21 tests, all passing ✓

### ✅ Task 3.3: Test Layout Component

**Time:** 30 minutes
**Status:** Completed ✓

Created `tests/unit/components/layout.test.tsx` with comprehensive tests:

**Test Coverage:**

**Layout Rendering (6 tests):**
- ✅ Renders with navigation elements (Sidebar, Header, MobileNav)
- ✅ Renders children content in main area
- ✅ Renders main content area with correct classes
- ✅ Renders without children
- ✅ Renders multiple children
- ✅ Has proper layout structure (flex, h-screen, overflow-hidden)

**Implementation Notes:**
- Used vi.mock() to mock child components (Header, Sidebar, MobileNav)
- Tests verify layout structure and content rendering
- Tests ensure proper CSS classes for responsive layout

**Total:** 6 tests, all passing ✓

---

## Phase 4: E2E Critical Flows

**Estimated Time:** 3 hours
**Goal:** Test complete user workflows

### ✅ Task 4.1: Create Auth Tests

**Time:** 1 hour
**Status:** Completed ✓

Created `tests/e2e/specs/auth.spec.ts` with comprehensive authentication tests:

**Test Coverage:**

- ✅ **User can sign up and login with valid credentials** - Creates new user with unique email, submits form, verifies redirect to dashboard
- ✅ **User sees error with invalid credentials** - Attempts login with non-existent credentials, verifies error message displays and stays on login page
- ✅ **Session persists after page refresh** - Logs in, refreshes page, verifies still authenticated and on dashboard

**Implementation Notes:**
- Uses unique emails generated with timestamp to avoid conflicts
- Tests both signup (new user) and login flows
- Verifies URL redirects and page content
- Includes TODO section for future OAuth tests (Google, Facebook)

```typescript
// Key test structure from auth.spec.ts
const TEST_USER = {
  email: 'e2e.test.user@cjcrsg.test',
  password: 'E2ETestPass123!',
}

test('user can sign up and login with valid credentials', async ({ page }) => {
  const uniqueEmail = `e2e.${Date.now()}@cjcrsg.test`
  await page.goto('/login')
  await page.fill('input[name="email"]', uniqueEmail)
  await page.fill('input[name="password"]', TEST_USER.password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/')
  await expect(page.getByText(/dashboard|attendees|events/i)).toBeVisible()
})
```
```

### ✅ Task 4.2: Create Attendee CRUD Tests

**Time:** 2 hours
**Status:** Completed ✓

Created `tests/e2e/specs/attendees-crud.spec.ts` with comprehensive attendee workflow tests:

**Test Coverage (7 tests):**

- ✅ **Create new attendee** - Fills form with unique data, submits, verifies success message and redirect
- ✅ **Create attendee shows validation errors for required fields** - Submits empty form, verifies validation error displays
- ✅ **Create attendee with invalid email shows error** - Enters invalid email format, verifies error message
- ✅ **Edit existing attendee** - Creates attendee, navigates to edit, updates email, verifies changes
- ✅ **Archive attendee** - Creates attendee, opens actions menu, clicks archive, confirms deletion
- ✅ **Search for attendee by name** - Creates attendee, searches by name, verifies results; searches for non-existent, verifies empty state
- ✅ **Filter attendees by status** - Creates member and visitor, filters by each status, verifies correct filtering
- ✅ **View attendee details** - Creates attendee, clicks to view details, verifies all information displayed

**Implementation Notes:**
- Each test signs up a unique user before running (isolated tests)
- Uses unique names/emails with timestamps to avoid conflicts
- Tests cover full CRUD lifecycle plus search/filter functionality
- Includes both positive and negative test cases (validation errors)

```typescript
// Example: Edit attendee test flow
test('edit existing attendee', async ({ page }) => {
  // Create attendee first
  await page.goto('/attendees/new')
  const uniqueName = `E2E Edit Test ${Date.now()}`
  // ... fill and submit form ...

  // Navigate to attendee and edit
  await page.click(`text=${uniqueName}`)
  await page.click('text=Edit')
  await page.fill('input[name="email"]', updatedEmail)
  await page.click('button[type="submit"]')

  // Verify update
  await expect(page.getByText(/updated|success/i)).toBeVisible()
  await expect(page.getByText(updatedEmail)).toBeVisible()
})
```
```

---

## Commands & Scripts

| Command              | Description                | Time        |
| -------------------- | -------------------------- | ----------- |
| `pnpm test`          | Run unit tests once        | ~5 seconds  |
| `pnpm test:watch`    | Watch mode for development | Continuous  |
| `pnpm test:coverage` | Run tests with coverage    | ~10 seconds |
| `pnpm test:e2e`      | Run E2E tests headless     | ~1 minute   |
| `pnpm test:e2e:ui`   | E2E with interactive UI    | Interactive |

---

## Success Criteria

### Quality Standards

- ✅ All 18 tests pass before merging
- ✅ No `test.only` or `test.skip` in main branch
- ✅ Tests run in < 30 seconds (unit) and < 2 minutes (E2E)
- ✅ Critical flows are covered:
  - Authentication (login, session persistence)
  - Attendee CRUD (create, edit, archive)
  - Schema validation (duplicate emails, required fields)
  - Shared components (form, error states)

### What We Don't Test

- Simple UI-only components
- Non-shared components (tested via E2E)
- Every edge case (focus on breaking points)
- Visual regression (not critical for MVP)

---

## Phase 5: Future Testing

Tests to add after core features are stable:

### OAuth Authentication

- Google login flow
- Facebook login flow
- OAuth error handling
- Account linking

### Events & Attendance

- Event CRUD workflows
- Attendance recording
- Bulk check-in operations
- Real-time updates

### Advanced Scenarios

- Offline behavior
- Concurrent edits
- Permission-based access
- Data export functionality

### Performance

- Large dataset handling (10,000+ attendees)
- Search performance benchmarks
- Pagination with many pages

---

## 📊 Test Summary

| Phase       | Tasks          | Est. Time     | Tests             |
| ----------- | -------------- | ------------- | ----------------- |
| **Phase 1** | Infrastructure | 2 hours       | 1 validation test |
| **Phase 2** | Convex Unit    | 2.5 hours     | 37 tests          |
| **Phase 3** | Component Unit | 2 hours       | 44 tests          |
| **Phase 4** | E2E Tests      | 3 hours       | 9 tests           |
| **Phase 4b**| Event Types    | 1.5 hours     | 48 tests          |
| **Total**   |                | **11 hours**  | **138 tests**     |

---

**Last Updated:** 2026-03-21
**Status:** ✅ Complete | All phases implemented
````
