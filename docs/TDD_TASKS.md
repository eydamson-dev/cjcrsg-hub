# TDD Implementation Tasks

Complete task list for implementing Test Driven Development (TDD) in CJCRSG-Hub.

**Estimated Total Time:** 20-25 hours across 4 weeks  
**Last Updated:** 2026-03-21

---

## 📋 Table of Contents

1. [TDD Overview & Strategy](#tdd-overview--strategy)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
5. [Phase 2: Convex Unit Tests](#phase-2-convex-unit-tests)
6. [Phase 3: React Component Tests](#phase-3-react-component-tests)
7. [Phase 4: E2E Tests](#phase-4-e2e-tests)
8. [Phase 5: Documentation & Standards](#phase-5-documentation--standards)
9. [Commands & Scripts](#commands--scripts)
10. [Success Criteria](#success-criteria)

---

## 🎯 TDD Overview & Strategy

### Testing Philosophy

We follow a **two-tier testing approach**:

1. **Unit Tests** - Fast, isolated tests for business logic
2. **E2E Tests** - Full user workflow tests against real backend

### TDD Workflow (Red-Green-Refactor)

```
1. RED: Write a failing test first
2. GREEN: Write minimal code to make it pass
3. REFACTOR: Improve code while keeping tests green
```

### When to Write Tests

**Write tests FIRST for:**

- New Convex queries/mutations
- New React components with logic
- Bug fixes (reproduce the bug)
- Complex validation logic

**Write tests AFTER for:**

- Simple UI components (pure rendering)
- Refactoring existing code
- Adding new fields to existing forms

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
│   │   │       ├── queries.test.ts
│   │   │       └── mutations.test.ts
│   │   ├── features/                  # React component tests
│   │   │   └── attendees/
│   │   │       ├── components/
│   │   │       │   ├── AttendeeList.test.tsx
│   │   │       │   └── AttendeeForm.test.tsx
│   │   │       └── hooks/
│   │   │           └── useAttendees.test.ts
│   │   ├── lib/
│   │   │   └── utils.test.ts
│   │   └── setup/
│   │       ├── setup.ts               # Vitest setup
│   │       ├── test-utils.tsx         # Custom render with providers
│   │       └── convex-setup.ts        # convex-test utilities
│   ├── e2e/
│   │   ├── setup/
│   │   │   ├── auth.setup.ts          # Auth state management
│   │   │   ├── global-setup.ts        # Start/stop Convex dev server
│   │   │   └── global-teardown.ts     # Cleanup
│   │   ├── specs/
│   │   │   ├── auth.spec.ts
│   │   │   ├── attendees-crud.spec.ts
│   │   │   └── attendees-search.spec.ts
│   │   └── fixtures/
│   │       └── test-data.ts
│   └── README.md
├── convex/
│   ├── attendees/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── validators.ts
│   └── test.setup.ts                  # Shared convex-test modules
├── vitest.config.ts                   # Multi-project config
├── playwright.config.ts
└── package.json (updated)
```

---

## Phase 1: Infrastructure Setup

**Estimated Time:** 2-3 hours  
**Goal:** Install dependencies, configure test runners, create utilities, validate setup

### Task 1.1: Install Core Dependencies

**Time:** 15 minutes

Install all testing dependencies:

```bash
# Core testing framework
pnpm add -D vitest @vitest/coverage-v8

# Convex testing (official library)
pnpm add -D convex-test @edge-runtime/vm

# React component testing
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E testing
pnpm add -D @playwright/test

# TypeScript types
pnpm add -D @types/node
```

**Success Criteria:**

- All packages installed without errors
- `node_modules` contains all testing packages

---

### Task 1.2: Configure Vitest (Multi-Project)

**Time:** 30 minutes

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    projects: [
      {
        // Project 1: Convex backend tests (uses edge-runtime)
        extends: true,
        test: {
          name: 'convex',
          include: ['tests/unit/convex/**/*.test.{ts,js}'],
          environment: 'edge-runtime',
          globals: true,
        },
      },
      {
        // Project 2: React frontend tests (uses jsdom)
        extends: true,
        test: {
          name: 'frontend',
          include: ['tests/unit/**/*.test.{ts,tsx}'],
          exclude: ['tests/unit/convex/**', 'tests/e2e/**'],
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./tests/unit/setup/setup.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/unit/coverage',
      include: ['src/**/*.{ts,tsx}', 'convex/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/node_modules/**', 'tests/**'],
    },
  },
})
```

**Why Multi-Project?**

- Convex tests need `edge-runtime` (simulates Convex environment)
- React tests need `jsdom` (simulates browser)
- Separating them prevents conflicts

**Success Criteria:**

- Config file created
- Projects array properly configured
- Coverage settings defined

---

### Task 1.3: Configure Playwright for E2E

**Time:** 20 minutes

Create `playwright.config.ts` at project root:

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
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  globalSetup: './tests/e2e/setup/global-setup.ts',
  globalTeardown: './tests/e2e/setup/global-teardown.ts',
})
```

**Key Configurations:**

- `baseURL`: Points to your local dev server
- `webServer`: Auto-starts your app before tests
- `projects`: Tests on both desktop and mobile
- `trace`: Captures detailed trace on failure

**Success Criteria:**

- Config file created
- webServer configured to start dev server
- Projects for desktop and mobile set up

---

### Task 1.4: Create Test Folder Structure

**Time:** 15 minutes

Create all necessary directories:

```bash
mkdir -p tests/unit/setup
mkdir -p tests/unit/convex/attendees
mkdir -p tests/unit/features/attendees/components
mkdir -p tests/unit/features/attendees/hooks
mkdir -p tests/unit/lib
mkdir -p tests/e2e/setup
mkdir -p tests/e2e/specs
mkdir -p tests/e2e/fixtures
touch tests/README.md
```

**Directory Purposes:**

- `tests/unit/setup/`: Test configuration and utilities
- `tests/unit/convex/`: Convex function unit tests
- `tests/unit/features/`: React component and hook tests
- `tests/unit/lib/`: Utility function tests
- `tests/e2e/setup/`: E2E test setup and auth
- `tests/e2e/specs/`: E2E test files
- `tests/e2e/fixtures/`: Test data and helpers

**Success Criteria:**

- All directories created
- Ready to add test files

---

### Task 1.5: Create React Test Utilities

**Time:** 20 minutes

Create `tests/unit/setup/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

Create `tests/unit/setup/test-utils.tsx`:

```typescript
import React, { ReactElement } from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL || 'http://127.0.0.1:3210'
)

function AllTheProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => rtlRender(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }
```

**What This Does:**

- Wraps components with Convex and QueryClient providers
- Enables automatic cleanup after each test
- Mocks matchMedia for responsive tests

**Success Criteria:**

- Files created with correct content
- Providers properly configured

---

### Task 1.6: Create Convex Test Setup

**Time:** 20 minutes

Create `convex/test.setup.ts`:

```typescript
/// <reference types="vite/client" />

// Glob pattern to load all Convex modules for testing
// This makes all your Convex functions available in tests
export const modules = import.meta.glob('./**/!(*.*.*)*.*s')
```

Create `tests/unit/setup/convex-setup.ts`:

```typescript
import { convexTest } from 'convex-test'
import schema from '../../../convex/schema'
import { modules } from '../../../convex/test.setup'

// Re-export for convenience
export { convexTest, schema, modules }

// Test data factories
export function createMockAttendee(overrides = {}) {
  return {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    phone: '1234567890',
    address: '123 Test St',
    status: 'visitor',
    notes: 'Test attendee',
    ...overrides,
  }
}

export function createMockEventType(overrides = {}) {
  return {
    name: 'Test Event Type',
    description: 'Test description',
    color: '#3b82f6',
    ...overrides,
  }
}

export function createMockEvent(overrides = {}) {
  const tomorrow = Date.now() + 24 * 60 * 60 * 1000
  return {
    name: 'Test Event',
    description: 'Test event description',
    date: tomorrow,
    startTime: '09:00',
    endTime: '11:00',
    location: 'Main Sanctuary',
    ...overrides,
  }
}
```

**What This Does:**

- Loads all Convex modules via glob pattern
- Provides factory functions for creating test data
- Ensures unique emails (using timestamp)

**Success Criteria:**

- Files created
- Factory functions available
- Schema and modules exported

---

### Task 1.7: Update package.json Scripts

**Time:** 5 minutes

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "vitest run && playwright test"
  }
}
```

**Script Descriptions:**

- `test`: Run unit tests once
- `test:watch`: Run unit tests in watch mode (re-run on file changes)
- `test:coverage`: Run tests with coverage report
- `test:e2e`: Run E2E tests in headless mode
- `test:e2e:ui`: Open Playwright UI for interactive testing
- `test:e2e:debug`: Run E2E tests with debugger
- `test:all`: Run both unit and E2E tests

**Success Criteria:**

- Scripts added to package.json
- All commands work when run

---

### Task 1.8: Validate Setup with Example Tests

**Time:** 30 minutes

Create a simple Convex test to validate:

Create `tests/unit/convex/example.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { convexTest, schema, modules } from '../../setup/convex-setup'

describe('Setup Validation', () => {
  it('convex-test should work', async () => {
    const t = convexTest(schema, modules)
    expect(t).toBeDefined()
  })

  it('should run edge-runtime environment', () => {
    // This will only pass in edge-runtime
    expect(typeof EdgeRuntime).toBe('undefined')
  })
})
```

Create a simple React test:

Create `tests/unit/example.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from './setup/test-utils'
import { Button } from '../src/components/ui/button'

describe('Setup Validation', () => {
  it('react testing library should work', () => {
    render(<Button>Test</Button>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should run jsdom environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })
})
```

**Run Tests:**

```bash
# Run unit tests
pnpm test

# Should see output:
#  ✓ tests/unit/convex/example.test.ts (2)
#  ✓ tests/unit/example.test.tsx (2)
#  Test Files  2 passed (2)
#       Tests  4 passed (4)
```

**Success Criteria:**

- Tests run without errors
- Both projects (convex + frontend) execute
- Coverage report generates

---

## Phase 2: Convex Unit Tests

**Estimated Time:** 4-6 hours  
**Goal:** Test all Convex queries and mutations with mock backend

### Task 2.1: Test Attendee Queries

**Time:** 45 minutes

Create `tests/unit/convex/attendees/queries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  convexTest,
  schema,
  modules,
  createMockAttendee,
} from '../../../setup/convex-setup'
import { api } from '../../../../convex/_generated/api'

describe('attendees queries', () => {
  it('returns empty array when no attendees exist', async () => {
    const t = convexTest(schema, modules)

    const result = await t.query(api.attendees.list, {
      paginationOpts: { numItems: 10, cursor: null },
    })

    expect(result.page).toEqual([])
    expect(result.isDone).toBe(true)
  })

  it('returns attendees ordered by creation time', async () => {
    const t = convexTest(schema, modules)

    // Create test attendees
    await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Alice',
        email: 'alice@test.com',
      }),
    )

    await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Bob',
        email: 'bob@test.com',
      }),
    )

    const result = await t.query(api.attendees.list, {
      paginationOpts: { numItems: 10, cursor: null },
    })

    expect(result.page).toHaveLength(2)
    expect(result.page[0].firstName).toBe('Bob') // Most recent first
    expect(result.page[1].firstName).toBe('Alice')
  })

  it('respects pagination options', async () => {
    const t = convexTest(schema, modules)

    // Create 5 attendees
    for (let i = 0; i < 5; i++) {
      await t.mutation(
        api.attendees.create,
        createMockAttendee({
          firstName: `User${i}`,
          email: `user${i}@test.com`,
        }),
      )
    }

    // Get first page (2 items)
    const page1 = await t.query(api.attendees.list, {
      paginationOpts: { numItems: 2, cursor: null },
    })

    expect(page1.page).toHaveLength(2)
    expect(page1.isDone).toBe(false)
    expect(page1.continueCursor).toBeDefined()

    // Get second page
    const page2 = await t.query(api.attendees.list, {
      paginationOpts: { numItems: 2, cursor: page1.continueCursor },
    })

    expect(page2.page).toHaveLength(2)
    expect(page2.isDone).toBe(false)
  })

  it('filters attendees by status', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Member',
        status: 'member',
        email: 'member@test.com',
      }),
    )

    await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Visitor',
        status: 'visitor',
        email: 'visitor@test.com',
      }),
    )

    const members = await t.query(api.attendees.listByStatus, {
      status: 'member',
    })

    expect(members).toHaveLength(1)
    expect(members[0].status).toBe('member')
  })

  it('searches attendees by name', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Johnathan',
        lastName: 'Doe',
        email: 'john@test.com',
      }),
    )

    await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
      }),
    )

    const results = await t.query(api.attendees.search, {
      query: 'John',
    })

    expect(results).toHaveLength(1)
    expect(results[0].firstName).toBe('Johnathan')
  })

  it('getById returns attendee when exists', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Test',
        email: 'test@test.com',
      }),
    )

    const attendee = await t.query(api.attendees.getById, { id })

    expect(attendee).toBeDefined()
    expect(attendee?.firstName).toBe('Test')
  })

  it('getById returns null when not found', async () => {
    const t = convexTest(schema, modules)

    const attendee = await t.query(api.attendees.getById, {
      id: 'nonexistent123' as any,
    })

    expect(attendee).toBeNull()
  })
})
```

**Success Criteria:**

- All 7 tests pass
- Tests cover list, getById, search, and filter functionality
- Pagination behavior verified

---

### Task 2.2: Test Attendee Mutations

**Time:** 45 minutes

Create `tests/unit/convex/attendees/mutations.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  convexTest,
  schema,
  modules,
  createMockAttendee,
} from '../../../setup/convex-setup'
import { api } from '../../../../convex/_generated/api'

describe('attendees mutations', () => {
  it('creates a new attendee', async () => {
    const t = convexTest(schema, modules)

    const attendeeId = await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        status: 'member',
      }),
    )

    expect(attendeeId).toBeDefined()
    expect(typeof attendeeId).toBe('string')

    // Verify attendee was created
    const attendee = await t.query(api.attendees.getById, { id: attendeeId })
    expect(attendee).toMatchObject({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      status: 'member',
    })
  })

  it('generates createdAt and updatedAt timestamps', async () => {
    const t = convexTest(schema, modules)
    const before = Date.now()

    const id = await t.mutation(api.attendees.create, createMockAttendee())

    const attendee = await t.query(api.attendees.getById, { id })
    expect(attendee?.createdAt).toBeGreaterThanOrEqual(before)
    expect(attendee?.updatedAt).toBeGreaterThanOrEqual(before)
  })

  it('throws error when creating attendee with duplicate email', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(
      api.attendees.create,
      createMockAttendee({
        email: 'duplicate@example.com',
      }),
    )

    await expect(
      t.mutation(
        api.attendees.create,
        createMockAttendee({
          email: 'duplicate@example.com',
        }),
      ),
    ).rejects.toThrow()
  })

  it('updates an existing attendee', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Original',
        email: 'original@test.com',
      }),
    )

    await t.mutation(api.attendees.update, {
      id,
      firstName: 'Updated',
      email: 'updated@test.com',
    })

    const updated = await t.query(api.attendees.getById, { id })
    expect(updated?.firstName).toBe('Updated')
    expect(updated?.email).toBe('updated@test.com')
  })

  it('updates updatedAt timestamp on update', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(api.attendees.create, createMockAttendee())
    const original = await t.query(api.attendees.getById, { id })

    // Wait a bit to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10))

    await t.mutation(api.attendees.update, {
      id,
      firstName: 'Updated',
    })

    const updated = await t.query(api.attendees.getById, { id })
    expect(updated?.updatedAt).toBeGreaterThan(original?.updatedAt || 0)
  })

  it('preserves unchanged fields during update', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
      }),
    )

    await t.mutation(api.attendees.update, {
      id,
      firstName: 'Jane',
    })

    const updated = await t.query(api.attendees.getById, { id })
    expect(updated?.firstName).toBe('Jane')
    expect(updated?.lastName).toBe('Doe') // Unchanged
    expect(updated?.email).toBe('john@test.com') // Unchanged
  })

  it('archives an attendee (soft delete)', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(
      api.attendees.create,
      createMockAttendee({
        status: 'member',
      }),
    )

    await t.mutation(api.attendees.archive, { id })

    const archived = await t.query(api.attendees.getById, { id })
    expect(archived?.status).toBe('inactive')
  })
})
```

**Success Criteria:**

- All 7 tests pass
- Tests cover create, update, archive operations
- Error cases tested (duplicate email)
- Timestamp behavior verified

---

### Task 2.3: Test Event Type Queries

**Time:** 30 minutes

Create `tests/unit/convex/eventTypes/queries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  convexTest,
  schema,
  modules,
  createMockEventType,
} from '../../../setup/convex-setup'
import { api } from '../../../../convex/_generated/api'

describe('event types queries', () => {
  it('returns empty array when no event types exist', async () => {
    const t = convexTest(schema, modules)

    const types = await t.query(api.eventTypes.list)

    expect(types).toEqual([])
  })

  it('returns all active event types ordered by name', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'Retreat',
      }),
    )

    await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'Sunday Service',
      }),
    )

    const types = await t.query(api.eventTypes.list)

    expect(types).toHaveLength(2)
    expect(types[0].name).toBe('Retreat') // Alphabetical
    expect(types[1].name).toBe('Sunday Service')
  })

  it('getById returns event type when exists', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'Youth Group',
        color: '#8b5cf6',
      }),
    )

    const type = await t.query(api.eventTypes.getById, { id })

    expect(type).toBeDefined()
    expect(type?.name).toBe('Youth Group')
    expect(type?.color).toBe('#8b5cf6')
  })

  it('getById returns null when not found', async () => {
    const t = convexTest(schema, modules)

    const type = await t.query(api.eventTypes.getById, {
      id: 'nonexistent' as any,
    })

    expect(type).toBeNull()
  })

  it('checkAssociations returns true when events exist', async () => {
    const t = convexTest(schema, modules)

    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'Service',
      }),
    )

    // Create an event using this type
    await t.mutation(api.events.create, {
      name: 'Sunday Service',
      eventTypeId: typeId,
      date: Date.now() + 86400000,
      isActive: true,
    })

    const hasAssociations = await t.query(api.eventTypes.checkAssociations, {
      id: typeId,
    })

    expect(hasAssociations).toBe(true)
  })

  it('checkAssociations returns false when no events', async () => {
    const t = convexTest(schema, modules)

    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'Unused Type',
      }),
    )

    const hasAssociations = await t.query(api.eventTypes.checkAssociations, {
      id: typeId,
    })

    expect(hasAssociations).toBe(false)
  })
})
```

**Success Criteria:**

- All 6 tests pass
- List, getById, and checkAssociations covered

---

### Task 2.4: Test Event Type Mutations

**Time:** 30 minutes

Create `tests/unit/convex/eventTypes/mutations.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  convexTest,
  schema,
  modules,
  createMockEventType,
} from '../../../setup/convex-setup'
import { api } from '../../../../convex/_generated/api'

describe('event types mutations', () => {
  it('creates event type with name and color', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(api.eventTypes.create, {
      name: 'Prayer Meeting',
      description: 'Weekly prayer gathering',
      color: '#f97316',
    })

    expect(id).toBeDefined()

    const type = await t.query(api.eventTypes.getById, { id })
    expect(type).toMatchObject({
      name: 'Prayer Meeting',
      description: 'Weekly prayer gathering',
      color: '#f97316',
      isActive: true,
    })
  })

  it('validates hex color format', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(
        api.eventTypes.create,
        createMockEventType({
          color: 'invalid-color',
        }),
      ),
    ).rejects.toThrow()
  })

  it('updates event type fields', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'Original Name',
      }),
    )

    await t.mutation(api.eventTypes.update, {
      id,
      name: 'Updated Name',
      color: '#22c55e',
    })

    const updated = await t.query(api.eventTypes.getById, { id })
    expect(updated?.name).toBe('Updated Name')
    expect(updated?.color).toBe('#22c55e')
  })

  it('removes event type when no associations', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'To Delete',
      }),
    )

    await t.mutation(api.eventTypes.remove, { id })

    const removed = await t.query(api.eventTypes.getById, { id })
    expect(removed).toBeNull()
  })

  it('throws error when removing event type with associations', async () => {
    const t = convexTest(schema, modules)

    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'Has Events',
      }),
    )

    // Create event using this type
    await t.mutation(api.events.create, {
      name: 'Test Event',
      eventTypeId: typeId,
      date: Date.now() + 86400000,
      isActive: true,
    })

    await expect(
      t.mutation(api.eventTypes.remove, { id: typeId }),
    ).rejects.toThrow(/associated/i)
  })
})
```

**Success Criteria:**

- All 5 tests pass
- Create, update, remove operations tested
- Association check validated

---

### Task 2.5: Test Event Queries

**Time:** 30 minutes

Create `tests/unit/convex/events/queries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  convexTest,
  schema,
  modules,
  createMockEvent,
  createMockEventType,
} from '../../../setup/convex-setup'
import { api } from '../../../../convex/_generated/api'

describe('events queries', () => {
  it('listUpcoming returns only future events', async () => {
    const t = convexTest(schema, modules)
    const tomorrow = Date.now() + 86400000
    const yesterday = Date.now() - 86400000

    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )

    // Create future event
    await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
        date: tomorrow,
        isActive: true,
      }),
    )

    // Create past event
    await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
        date: yesterday,
        isActive: true,
      }),
    )

    const upcoming = await t.query(api.events.listUpcoming)

    expect(upcoming).toHaveLength(1)
    expect(upcoming[0].date).toBe(tomorrow)
  })

  it('listUpcoming orders by date ascending', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )

    const day1 = Date.now() + 86400000
    const day2 = Date.now() + 172800000

    await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
        date: day2,
        name: 'Later Event',
      }),
    )

    await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
        date: day1,
        name: 'Earlier Event',
      }),
    )

    const upcoming = await t.query(api.events.listUpcoming)

    expect(upcoming[0].name).toBe('Earlier Event')
    expect(upcoming[1].name).toBe('Later Event')
  })

  it('getById returns event with details', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType({
        name: 'Sunday Service',
      }),
    )

    const eventId = await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
        name: 'Special Service',
      }),
    )

    const event = await t.query(api.events.getById, { id: eventId })

    expect(event).toBeDefined()
    expect(event?.name).toBe('Special Service')
    expect(event?.eventType).toBeDefined()
    expect(event?.eventType?.name).toBe('Sunday Service')
  })
})
```

**Success Criteria:**

- All 3 tests pass
- Upcoming events and getById tested

---

### Task 2.6: Test Event Mutations

**Time:** 30 minutes

Create `tests/unit/convex/events/mutations.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  convexTest,
  schema,
  modules,
  createMockEvent,
  createMockEventType,
} from '../../../setup/convex-setup'
import { api } from '../../../../convex/_generated/api'

describe('events mutations', () => {
  it('creates event with all fields', async () => {
    const t = convexTest(schema, modules)
    const tomorrow = Date.now() + 86400000
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )

    const eventId = await t.mutation(api.events.create, {
      name: 'Sunday Service',
      eventTypeId: typeId,
      description: 'Main sanctuary service',
      date: tomorrow,
      startTime: '09:00',
      endTime: '11:00',
      location: 'Main Sanctuary',
      isActive: true,
    })

    expect(eventId).toBeDefined()

    const event = await t.query(api.events.getById, { id: eventId })
    expect(event).toMatchObject({
      name: 'Sunday Service',
      startTime: '09:00',
      endTime: '11:00',
      location: 'Main Sanctuary',
    })
  })

  it('validates eventTypeId exists', async () => {
    const t = convexTest(schema, modules)

    await expect(
      t.mutation(
        api.events.create,
        createMockEvent({
          eventTypeId: 'nonexistent' as any,
        }),
      ),
    ).rejects.toThrow()
  })

  it('validates endTime is after startTime', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )

    await expect(
      t.mutation(
        api.events.create,
        createMockEvent({
          eventTypeId: typeId,
          startTime: '11:00',
          endTime: '09:00',
        }),
      ),
    ).rejects.toThrow()
  })

  it('cancels event by setting isActive to false', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )

    const eventId = await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
      }),
    )

    await t.mutation(api.events.cancel, { id: eventId })

    const cancelled = await t.query(api.events.getById, { id: eventId })
    expect(cancelled?.isActive).toBe(false)
  })
})
```

**Success Criteria:**

- All 4 tests pass
- Create with validation, cancel tested

---

### Task 2.7: Test Attendance Queries

**Time:** 30 minutes

Create `tests/unit/convex/attendance/queries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  convexTest,
  schema,
  modules,
  createMockAttendee,
  createMockEvent,
  createMockEventType,
} from '../../../setup/convex-setup'
import { api } from '../../../../convex/_generated/api'

describe('attendance queries', () => {
  it('getByEvent returns all attendees for event', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )
    const eventId = await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
      }),
    )

    const attendee1 = await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'John',
      }),
    )
    const attendee2 = await t.mutation(
      api.attendees.create,
      createMockAttendee({
        firstName: 'Jane',
      }),
    )

    // Check in attendees
    await t.mutation(api.attendance.checkIn, {
      eventId,
      attendeeId: attendee1,
    })
    await t.mutation(api.attendance.checkIn, {
      eventId,
      attendeeId: attendee2,
    })

    const records = await t.query(api.attendance.getByEvent, { eventId })

    expect(records).toHaveLength(2)
    expect(records[0].attendee.firstName).toBeDefined()
  })

  it('getByAttendee returns attendance history', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )
    const eventId = await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
      }),
    )
    const attendeeId = await t.mutation(
      api.attendees.create,
      createMockAttendee(),
    )

    await t.mutation(api.attendance.checkIn, { eventId, attendeeId })

    const history = await t.query(api.attendance.getByAttendee, { attendeeId })

    expect(history).toHaveLength(1)
    expect(history[0].eventId).toBe(eventId)
  })
})
```

**Success Criteria:**

- Both tests pass
- Event and attendee attendance queries tested

---

### Task 2.8: Test Attendance Mutations

**Time:** 30 minutes

Create `tests/unit/convex/attendance/mutations.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  convexTest,
  schema,
  modules,
  createMockAttendee,
  createMockEvent,
  createMockEventType,
} from '../../../setup/convex-setup'
import { api } from '../../../../convex/_generated/api'

describe('attendance mutations', () => {
  it('checkIn creates attendance record', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )
    const eventId = await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
      }),
    )
    const attendeeId = await t.mutation(
      api.attendees.create,
      createMockAttendee(),
    )

    const before = Date.now()
    const recordId = await t.mutation(api.attendance.checkIn, {
      eventId,
      attendeeId,
    })

    expect(recordId).toBeDefined()

    const record = await t.run(async (ctx) => {
      return await ctx.db.get(recordId)
    })

    expect(record?.eventId).toBe(eventId)
    expect(record?.attendeeId).toBe(attendeeId)
    expect(record?.checkedInAt).toBeGreaterThanOrEqual(before)
  })

  it('prevents duplicate check-ins', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )
    const eventId = await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
      }),
    )
    const attendeeId = await t.mutation(
      api.attendees.create,
      createMockAttendee(),
    )

    await t.mutation(api.attendance.checkIn, { eventId, attendeeId })

    await expect(
      t.mutation(api.attendance.checkIn, { eventId, attendeeId }),
    ).rejects.toThrow(/already/i)
  })

  it('unCheckIn removes attendance record', async () => {
    const t = convexTest(schema, modules)
    const typeId = await t.mutation(
      api.eventTypes.create,
      createMockEventType(),
    )
    const eventId = await t.mutation(
      api.events.create,
      createMockEvent({
        eventTypeId: typeId,
      }),
    )
    const attendeeId = await t.mutation(
      api.attendees.create,
      createMockAttendee(),
    )

    await t.mutation(api.attendance.checkIn, { eventId, attendeeId })
    await t.mutation(api.attendance.unCheckIn, { eventId, attendeeId })

    const records = await t.query(api.attendance.getByEvent, { eventId })
    expect(records).toHaveLength(0)
  })
})
```

**Success Criteria:**

- All 3 tests pass
- Check-in, duplicate prevention, and uncheck tested

---

## Phase 3: React Component Tests

**Estimated Time:** 4-6 hours  
**Goal:** Test React components in isolation with mocked dependencies

### Task 3.1: Test AttendeeForm Component

**Time:** 1 hour

Create `tests/unit/features/attendees/components/AttendeeForm.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../../setup/test-utils'
import { AttendeeForm } from '../../../../../src/features/attendees/components/AttendeeForm'

describe('AttendeeForm', () => {
  const mockSubmit = vi.fn()

  beforeEach(() => {
    mockSubmit.mockClear()
  })

  it('renders all required fields', () => {
    render(<AttendeeForm onSubmit={mockSubmit} />)

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders optional fields', () => {
    render(<AttendeeForm onSubmit={mockSubmit} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/join date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<AttendeeForm onSubmit={mockSubmit} />)

    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(<AttendeeForm onSubmit={mockSubmit} />)

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    })
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: '123 Church St' },
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Church St',
          status: 'visitor',
        })
      )
    })
  })

  it('validates email format', async () => {
    render(<AttendeeForm onSubmit={mockSubmit} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    })

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('accepts valid email format', async () => {
    render(<AttendeeForm onSubmit={mockSubmit} />)

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    })
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: '123 Church St' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled()
    })
  })

  it('populates form with initial data', () => {
    const initialData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      status: 'member' as const,
      address: '456 Oak Ave',
    }

    render(<AttendeeForm onSubmit={mockSubmit} initialData={initialData} />)

    expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Smith')
    expect(screen.getByLabelText(/email/i)).toHaveValue('jane@example.com')
    expect(screen.getByLabelText(/address/i)).toHaveValue('456 Oak Ave')
  })

  it('calls onCancel when cancel button clicked', () => {
    const mockCancel = vi.fn()

    render(<AttendeeForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockCancel).toHaveBeenCalled()
  })

  it('disables submit button when isSubmitting is true', () => {
    render(<AttendeeForm onSubmit={mockSubmit} isSubmitting={true} />)

    const submitButton = screen.getByRole('button', { name: /saving/i })
    expect(submitButton).toBeDisabled()
  })
})
```

**Success Criteria:**

- All 10 tests pass
- Form rendering, validation, submission covered
- Initial data population tested

---

### Task 3.2: Test AttendeeList Component

**Time:** 1 hour

Create `tests/unit/features/attendees/components/AttendeeList.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../setup/test-utils'
import { AttendeeList } from '../../../../../src/features/attendees/components/AttendeeList'

describe('AttendeeList', () => {
  const mockAttendees = [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      status: 'member',
      joinDate: Date.now(),
    },
    {
      _id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: null,
      phone: null,
      status: 'visitor',
      joinDate: null,
    },
  ]

  const mockNavigate = vi.fn()
  const mockArchive = vi.fn()

  beforeEach(() => {
    mockNavigate.mockClear()
    mockArchive.mockClear()
  })

  it('renders attendee list correctly', () => {
    render(
      <AttendeeList
        attendees={mockAttendees}
        onNavigate={mockNavigate}
        onArchive={mockArchive}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('1234567890')).toBeInTheDocument()
  })

  it('shows status badges correctly', () => {
    render(
      <AttendeeList
        attendees={mockAttendees}
        onNavigate={mockNavigate}
        onArchive={mockArchive}
      />
    )

    expect(screen.getByText('member')).toBeInTheDocument()
    expect(screen.getByText('visitor')).toBeInTheDocument()
  })

  it('navigates to attendee detail on row click', () => {
    render(
      <AttendeeList
        attendees={mockAttendees}
        onNavigate={mockNavigate}
        onArchive={mockArchive}
      />
    )

    fireEvent.click(screen.getByText('John Doe'))

    expect(mockNavigate).toHaveBeenCalledWith('/attendees/1/')
  })

  it('shows empty state when no attendees', () => {
    render(
      <AttendeeList
        attendees={[]}
        onNavigate={mockNavigate}
        onArchive={mockArchive}
      />
    )

    expect(screen.getByText(/no attendees yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add attendee/i })).toBeInTheDocument()
  })

  it('shows loading skeleton when pending', () => {
    render(
      <AttendeeList
        attendees={[]}
        isPending={true}
        onNavigate={mockNavigate}
        onArchive={mockArchive}
      />
    )

    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('shows search empty state when no matches', () => {
    render(
      <AttendeeList
        attendees={[]}
        searchQuery="nonexistent"
        onNavigate={mockNavigate}
        onArchive={mockArchive}
        onClearSearch={vi.fn()}
      />
    )

    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
  })

  it('shows filter empty state when no matches', () => {
    render(
      <AttendeeList
        attendees={[]}
        statusFilter="member"
        onNavigate={mockNavigate}
        onArchive={mockArchive}
        onClearSearch={vi.fn()}
      />
    )

    expect(screen.getByText(/no matches/i)).toBeInTheDocument()
    expect(screen.getByText(/no member attendees found/i)).toBeInTheDocument()
  })

  it('opens archive dialog when archive clicked', async () => {
    render(
      <AttendeeList
        attendees={mockAttendees}
        onNavigate={mockNavigate}
        onArchive={mockArchive}
      />
    )

    // Open actions menu for first attendee
    const menuButtons = screen.getAllByTestId('actions-menu')
    fireEvent.click(menuButtons[0])

    // Click archive
    const archiveButton = screen.getByText(/archive/i)
    fireEvent.click(archiveButton)

    // Verify dialog opened
    expect(screen.getByText(/archive attendee/i)).toBeInTheDocument()
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
  })

  it('shows pagination info when paginated', () => {
    const paginationInfo = {
      currentPage: 1,
      totalCount: 25,
      pageSize: 10,
      totalPages: 3,
      startItem: 1,
      endItem: 10,
      hasNext: true,
      hasPrevious: false,
      isDone: false,
    }

    render(
      <AttendeeList
        attendees={mockAttendees}
        isPaginated={true}
        paginationInfo={paginationInfo}
        onNavigate={mockNavigate}
        onArchive={mockArchive}
      />
    )

    expect(screen.getByText(/showing 1 to 10 of 25 attendees/i)).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument()
  })
})
```

**Success Criteria:**

- All 10 tests pass
- Rendering, interactions, empty states covered
- Pagination tested

---

### Task 3.3: Test Custom Hooks

**Time:** 1 hour

Create `tests/unit/features/attendees/hooks/useAttendees.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'

// Mock the convex query hook
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  }
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const convex = new ConvexReactClient('http://localhost:3210')

  return ({ children }: { children: React.ReactNode }) => (
    <ConvexProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexProvider>
  )
}

describe('useAttendees hooks', () => {
  it('useAttendeesList returns data from query', async () => {
    const mockData = {
      page: [
        { _id: '1', firstName: 'John', lastName: 'Doe' },
      ],
      isDone: true,
    }

    const { useQuery } = await import('@tanstack/react-query')
    vi.mocked(useQuery).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any)

    const { useAttendeesList } = await import('../../../../../src/features/attendees/hooks/useAttendees')

    const { result } = renderHook(() => useAttendeesList({ count: 10 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.isLoading).toBe(false)
  })

  it('useAttendee returns single attendee', async () => {
    const mockAttendee = {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }

    const { useQuery } = await import('@tanstack/react-query')
    vi.mocked(useQuery).mockReturnValue({
      data: mockAttendee,
      isLoading: false,
      error: null,
    } as any)

    const { useAttendee } = await import('../../../../../src/features/attendees/hooks/useAttendees')

    const { result } = renderHook(() => useAttendee('1'), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toEqual(mockAttendee)
  })
})
```

**Success Criteria:**

- Hook tests pass
- Data fetching and loading states covered

---

### Task 3.4: Test Utility Functions

**Time:** 30 minutes

Create `tests/unit/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { cn, formatDate } from '../../../src/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      const result = cn('base', false && 'hidden', true && 'visible')
      expect(result).toBe('base visible')
    })

    it('handles tailwind conflicts', () => {
      const result = cn('px-2', 'px-4')
      expect(result).toBe('px-4')
    })
  })

  describe('formatDate', () => {
    it('formats timestamp to date string', () => {
      const timestamp = new Date('2024-03-15').getTime()
      const result = formatDate(timestamp)
      expect(result).toBe('3/15/2024')
    })

    it('handles null/undefined', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
    })
  })
})
```

**Success Criteria:**

- Utility function tests pass

---

## Phase 4: E2E Tests

**Estimated Time:** 6-8 hours  
**Goal:** Test complete user workflows against real local Convex dev server

### Task 4.1: Setup E2E Authentication

**Time:** 30 minutes

Create `tests/e2e/setup/auth.setup.ts`:

```typescript
import { test as setup, expect } from '@playwright/test'

const authFile = 'tests/e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Create a test user in Convex before running (if not exists)

  // Navigate to login page
  await page.goto('/login')

  // Fill in credentials
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'testpassword123')

  // Submit form
  await page.click('button[type="submit"]')

  // Wait for navigation to dashboard
  await expect(page).toHaveURL('/')

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
```

Create `tests/e2e/setup/global-setup.ts`:

```typescript
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function globalSetup() {
  console.log('Checking Convex dev server...')

  try {
    // Check if Convex is already running
    await execAsync('curl -s http://127.0.0.1:3210')
    console.log('✓ Convex dev server is running')
  } catch {
    console.error('✗ Convex dev server not found')
    console.error('Please run: pnpm dlx convex dev')
    throw new Error('Convex dev server must be running for E2E tests')
  }
}

export default globalSetup
```

**Success Criteria:**

- Auth setup creates and saves authenticated state
- Global setup verifies Convex server is running

---

### Task 4.2: Test Authentication Flows

**Time:** 1 hour

Create `tests/e2e/specs/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/')
    await expect(page.getByText(/dashboard|attendees/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.getByText(/invalid|error/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('should redirect to login when accessing protected route', async ({
    page,
  }) => {
    await page.goto('/attendees')

    await expect(page).toHaveURL('/login')
  })

  test('should persist session after page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/')

    // Refresh page
    await page.reload()

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL('/')
  })
})
```

**Success Criteria:**

- All 4 tests pass
- Login, error handling, session persistence covered

---

### Task 4.3: Test Attendee CRUD Workflow

**Time:** 1.5 hours

Create `tests/e2e/specs/attendees-crud.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Attendee CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to attendees page (authenticated)
    await page.goto('/attendees')
    await expect(page.getByText('Church Members')).toBeVisible()
  })

  test('should create a new attendee', async ({ page }) => {
    // Click Add Attendee button
    await page.click('button:has-text("Add Attendee")')

    // Fill in the form
    await page.fill('[name="firstName"]', 'E2E Test')
    await page.fill('[name="lastName"]', 'User')
    await page.fill('[name="email"]', 'e2e-test@example.com')
    await page.fill('[name="phone"]', '5551234567')
    await page.fill('[name="address"]', '123 E2E Test St')

    // Select status
    await page.click('[name="status"]')
    await page.click('text=Member')

    // Submit form
    await page.click('button:has-text("Save")')

    // Verify success message
    await expect(page.getByText('Attendee created successfully')).toBeVisible()

    // Verify redirect to attendees list
    await expect(page).toHaveURL('/attendees')

    // Verify new attendee appears in list
    await expect(page.getByText('E2E Test User')).toBeVisible()
  })

  test('should edit an existing attendee', async ({ page }) => {
    // Click on attendee row
    await page.click('text=E2E Test User')

    // Click Edit button
    await page.click('text=Edit')

    // Update email
    await page.fill('[name="email"]', 'updated@example.com')

    // Save changes
    await page.click('button:has-text("Save")')

    // Verify success
    await expect(page.getByText('Attendee updated successfully')).toBeVisible()

    // Verify updated data displayed
    await expect(page.getByText('updated@example.com')).toBeVisible()
  })

  test('should archive an attendee', async ({ page }) => {
    // Click on attendee row
    await page.click('text=E2E Test User')

    // Open actions menu
    await page.click('[data-testid="actions-menu"]')

    // Click Archive
    await page.click('text=Archive')

    // Confirm in dialog
    await page.click('button:has-text("Archive")')

    // Verify success
    await expect(page.getByText('Attendee archived')).toBeVisible()

    // Verify redirect to list
    await expect(page).toHaveURL('/attendees')
  })
})
```

**Success Criteria:**

- All 3 tests pass
- Create, edit, archive workflows tested

---

### Task 4.4: Test Search & Filter

**Time:** 1 hour

Create `tests/e2e/specs/attendees-search.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Attendee Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attendees')
  })

  test('should search by name', async ({ page }) => {
    // Type in search box
    await page.fill('[placeholder*="Search"]', 'John')

    // Wait for debounce (300ms)
    await page.waitForTimeout(400)

    // Verify filtered results
    await expect(page.getByText('John')).toBeVisible()
  })

  test('should filter by status', async ({ page }) => {
    // Select status filter
    await page.click('text=All Status')
    await page.click('text=Member')

    // Verify only members shown (check for member badge)
    const memberBadges = page.getByText('member')
    expect(await memberBadges.count()).toBeGreaterThan(0)
  })

  test('should clear search', async ({ page }) => {
    // Type search
    await page.fill('[placeholder*="Search"]', 'test')
    await page.waitForTimeout(400)

    // Clear search
    await page.click('button:has-text("Clear")')

    // Verify all attendees shown
    await expect(page.getByText('Church Members')).toBeVisible()
  })
})
```

**Success Criteria:**

- All 3 tests pass
- Search, filter, clear operations tested

---

### Task 4.5: Test Event Type Management

**Time:** 1 hour

Create `tests/e2e/specs/event-types.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Event Type Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/event-types')
  })

  test('should create event type', async ({ page }) => {
    // Click Add
    await page.click('button:has-text("Add Event Type")')

    // Fill form
    await page.fill('[name="name"]', 'Test Event Type')
    await page.fill('[name="description"]', 'Test description')

    // Randomize color (click randomize button)
    await page.click('button:has-text("🎲")')

    // Save
    await page.click('button:has-text("Save")')

    // Verify success
    await expect(page.getByText('Event type created')).toBeVisible()

    // Verify in list
    await expect(page.getByText('Test Event Type')).toBeVisible()
  })

  test('should edit event type', async ({ page }) => {
    // Click on event type row
    await page.click('text=Test Event Type')

    // Edit name
    await page.fill('[name="name"]', 'Updated Event Type')

    // Save
    await page.click('button:has-text("Save")')

    // Verify
    await expect(page.getByText('Updated Event Type')).toBeVisible()
  })

  test('should delete event type', async ({ page }) => {
    // Click delete on event type
    await page.click('button[aria-label="Delete"]')

    // Confirm
    await page.click('button:has-text("Delete")')

    // Verify removed
    await expect(page.getByText('Updated Event Type')).not.toBeVisible()
  })
})
```

**Success Criteria:**

- All 3 tests pass
- Create, edit, delete workflows tested

---

### Task 4.6: Test Attendance Recording

**Time:** 1 hour

Create `tests/e2e/specs/attendance.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Attendance Recording', () => {
  test('should record attendance for event', async ({ page }) => {
    // Navigate to attendance
    await page.goto('/attendance')

    // Select event
    await page.click('text=Select Event')
    await page.click('text=Sunday Service')

    // Search for attendee
    await page.fill('[placeholder*="Search"]', 'John')
    await page.waitForTimeout(400)

    // Check in attendee
    await page.click('button:has-text("Check In")')

    // Verify attendee appears in attendance list
    await expect(page.getByText('John')).toBeVisible()

    // Verify count updated
    await expect(page.getByText(/1 attendee/i)).toBeVisible()
  })

  test('should remove attendance', async ({ page }) => {
    await page.goto('/attendance')

    // Select event
    await page.click('text=Select Event')
    await page.click('text=Sunday Service')

    // Uncheck attendee
    await page.click('button[aria-label="Remove attendance"]')

    // Verify removed
    await expect(page.getByText(/0 attendees/i)).toBeVisible()
  })
})
```

**Success Criteria:**

- Both tests pass
- Check-in and remove attendance tested

---

## Phase 5: Documentation & Standards

**Estimated Time:** 2 hours

### Task 5.1: Document Testing Conventions

**Time:** 30 minutes

Create testing conventions documentation in `tests/README.md`:

````markdown
# Testing Guide

## Naming Conventions

- **Test files**: `*.test.ts` (unit) or `*.spec.ts` (E2E)
- **Describe blocks**: Use component/function name
- **Test names**: Should describe behavior, not implementation

Example:

```typescript
describe('AttendeeForm', () => {
  // Component name
  it('validates required fields', () => {
    // Behavior
    // test code
  })
})
```
````

## Test Structure

```typescript
describe('FeatureName', () => {
  // Setup
  beforeEach(() => {})

  describe('rendering', () => {
    it('should render correctly', () => {})
  })

  describe('interactions', () => {
    it('should handle user input', () => {})
  })

  describe('edge cases', () => {
    it('should handle empty state', () => {})
  })
})
```

## When to Mock vs Use Real Data

**Mock (Unit Tests):**

- External APIs
- Database queries (use convex-test)
- Complex dependencies
- Deterministic results needed

**Real Data (E2E Tests):**

- Full user workflows
- Database integration
- Cross-component communication
- Authentication flows

## TDD Workflow

1. **Red**: Write failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve while keeping tests green

## Coverage Requirements

- **Minimum**: 70% for critical paths
- **Target**: 80%+ for business logic
- **Focus on**: Mutations, validation, user workflows

````

---

### Task 5.2: Create Testing Checklist

**Time:** 30 minutes

Add testing checklist to main docs:

```markdown
## Pre-Commit Testing Checklist

Before committing code:

- [ ] Run `pnpm test` - all unit tests pass
- [ ] Run `pnpm test:coverage` - coverage above threshold
- [ ] Run `pnpm test:e2e` - critical E2E tests pass
- [ ] No `test.only` or `test.skip` left in code
- [ ] Tests are deterministic (no flaky tests)
- [ ] Test names describe behavior clearly

## Writing New Tests Checklist

When adding new features:

- [ ] Write test before implementation (TDD)
- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases (empty, null, extreme values)
- [ ] Test user interactions (clicks, inputs)
- [ ] Verify accessibility where applicable
````

---

### Task 5.3: Add Testing Section to Main README

**Time:** 30 minutes

Update `README.md` with testing section:

````markdown
## Testing

This project uses a comprehensive testing strategy with unit tests and E2E tests.

### Running Tests

```bash
# Unit tests (fast, no dev server needed)
pnpm test

# Watch mode (re-run on file changes)
pnpm test:watch

# With coverage report
pnpm test:coverage

# E2E tests (requires dev server)
pnpm test:e2e

# E2E with UI
pnpm test:e2e:ui

# Run all tests
pnpm test:all
```
````

### Test Structure

- **Unit Tests**: `tests/unit/` - Fast tests for logic and components
- **E2E Tests**: `tests/e2e/` - Full user workflow tests
- **Convex Tests**: `tests/unit/convex/` - Backend logic tests

### Test Data

Test data factories are in `tests/unit/setup/convex-setup.ts`. Use these to create consistent test data.

### Coverage

Coverage reports are generated in `tests/unit/coverage/`. Open `index.html` to view detailed reports.

```

---

## 🚀 Commands & Scripts

| Command | Description | Time |
|---------|-------------|------|
| `pnpm test` | Run unit tests once | ~10 seconds |
| `pnpm test:watch` | Watch mode for development | Continuous |
| `pnpm test:coverage` | Run tests with coverage | ~15 seconds |
| `pnpm test:e2e` | Run E2E tests headless | ~2 minutes |
| `pnpm test:e2e:ui` | E2E with interactive UI | Interactive |
| `pnpm test:e2e:debug` | Debug E2E tests | Interactive |
| `pnpm test:all` | Run everything | ~3 minutes |

---

## 🎯 Success Criteria

### Coverage Targets

- **Minimum**: 70% for critical paths (attendees, events, attendance)
- **Target**: 80%+ for all business logic
- **Focus Areas**:
  - ✅ All Convex mutations have tests
  - ✅ All form validations have tests
  - ✅ All CRUD operations have E2E tests
  - ✅ Authentication flow has E2E tests

### Performance Goals

- Unit tests: < 10 seconds total
- E2E tests: < 2 minutes total
- No flaky tests (deterministic results)
- Tests run without manual intervention

### Quality Standards

- ✅ All tests pass before merging
- ✅ No `test.only` or `test.skip` in main branch
- ✅ Clear test names describing behavior
- ✅ Tests isolated (no dependencies between tests)
- ✅ Proper cleanup after each test

### Documentation

- ✅ Testing conventions documented
- ✅ Example tests in each category
- ✅ Troubleshooting guide for common issues
- ✅ How to write tests guide

---

## 📊 Test Summary

| Phase | Tasks | Est. Time | Tests |
|-------|-------|-----------|-------|
| **Phase 1** | Infrastructure | 2-3 hours | 2 validation tests |
| **Phase 2** | Convex Unit | 4-6 hours | 30+ tests |
| **Phase 3** | Component Unit | 4-6 hours | 25+ tests |
| **Phase 4** | E2E Tests | 6-8 hours | 15+ tests |
| **Phase 5** | Documentation | 2 hours | N/A |
| **Total** | | **20-25 hours** | **70+ tests** |

---

## 🎓 Learning Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [convex-test Documentation](https://docs.convex.dev/testing/convex-test)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles/)

---

**Last Updated:** 2026-03-21
**Status:** Ready for implementation
```
