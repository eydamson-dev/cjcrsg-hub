# TDD Implementation Tasks

Complete task list for implementing Test Driven Development (TDD) in CJCRSG-Hub.

**Estimated Total Time:** 9.5 hours  
**Last Updated:** 2026-03-21

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

## 🎯 TDD Overview & Strategy

### Testing Philosophy

**Focus on critical flows only.** We test what can break the app, not every file.

**What We Test:**

- Authentication (if auth breaks, nobody can use the app)
- Attendee CRUD (core functionality)
- Schema validation (data integrity)
- Shared components (used by many features)

**What We Skip:**

- Every single component (high maintenance, low value)
- Non-critical utilities
- Simple UI-only components

### TDD Workflow (Red-Green-Refactor)

```
1. RED: Write a failing test first
2. GREEN: Write minimal code to make it pass
3. REFACTOR: Improve code while keeping tests green
```

### When to Write Tests

**Write tests FIRST for:**

- Critical Convex mutations (create, update, archive)
- Form validation logic
- Bug fixes (reproduce the bug first)
- Schema validation

**Skip testing:**

- Simple UI components (pure rendering)
- Non-shared components (tested via E2E)
- Refactoring (test after if needed)

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

### Task 1.1: Install Core Dependencies

**Time:** 15 minutes

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

### Task 1.2: Configure Vitest

**Time:** 30 minutes

Create `vitest.config.ts`:

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

### Task 1.3: Configure Playwright

**Time:** 20 minutes

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/specs',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Task 1.4: Create Test Folder Structure

**Time:** 15 minutes

```bash
mkdir -p tests/unit/convex/attendees
mkdir -p tests/unit/components/ui
mkdir -p tests/e2e/specs
mkdir -p tests/e2e/setup
```

### Task 1.5: Update package.json Scripts

**Time:** 5 minutes

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

### Task 1.6: Validate Setup

**Time:** 15 minutes

Create `tests/unit/example.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('Setup', () => {
  it('vitest works', () => {
    expect(true).toBe(true)
  })
})
```

Run: `pnpm test` - should pass

---

## Phase 2: Critical Convex Unit Tests

**Estimated Time:** 2.5 hours  
**Goal:** Test mutations and queries that can break the app

### Task 2.1: Test Attendee Mutations

**Time:** 1.5 hours

Create `tests/unit/convex/attendees/mutations.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../convex/schema'

const modules = import.meta.glob('../../../convex/**/*.ts')

describe('attendees mutations', () => {
  it('creates attendee with valid data', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(api.attendees.create, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      status: 'visitor',
    })

    expect(id).toBeDefined()
  })

  it('fails with duplicate email', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(api.attendees.create, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'dup@test.com',
      status: 'visitor',
    })

    await expect(
      t.mutation(api.attendees.create, {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'dup@test.com',
        status: 'visitor',
      }),
    ).rejects.toThrow()
  })

  it('updates attendee', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(api.attendees.create, {
      firstName: 'John',
      lastName: 'Doe',
      status: 'visitor',
    })

    await t.mutation(api.attendees.update, {
      id,
      firstName: 'Jane',
    })

    const attendee = await t.query(api.attendees.getById, { id })
    expect(attendee?.firstName).toBe('Jane')
  })

  it('archives attendee', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(api.attendees.create, {
      firstName: 'John',
      lastName: 'Doe',
      status: 'member',
    })

    await t.mutation(api.attendees.archive, { id })

    const attendee = await t.query(api.attendees.getById, { id })
    expect(attendee?.status).toBe('inactive')
  })

  it('fails when archiving already-archived attendee', async () => {
    const t = convexTest(schema, modules)

    const id = await t.mutation(api.attendees.create, {
      firstName: 'John',
      status: 'inactive',
    })

    await expect(t.mutation(api.attendees.archive, { id })).rejects.toThrow()
  })
})
```

### Task 2.2: Test Attendee Queries

**Time:** 1 hour

Create `tests/unit/convex/attendees/queries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import schema from '../../../convex/schema'

const modules = import.meta.glob('../../../convex/**/*.ts')

describe('attendees queries', () => {
  it('search returns matching attendees', async () => {
    const t = convexTest(schema, modules)

    await t.mutation(api.attendees.create, {
      firstName: 'Johnathan',
      lastName: 'Doe',
      status: 'visitor',
    })

    await t.mutation(api.attendees.create, {
      firstName: 'Jane',
      lastName: 'Smith',
      status: 'visitor',
    })

    const results = await t.query(api.attendees.search, { query: 'John' })

    expect(results).toHaveLength(1)
    expect(results[0].firstName).toBe('Johnathan')
  })

  it('pagination returns correct page', async () => {
    const t = convexTest(schema, modules)

    // Create 5 attendees
    for (let i = 0; i < 5; i++) {
      await t.mutation(api.attendees.create, {
        firstName: `User${i}`,
        lastName: 'Test',
        status: 'visitor',
      })
    }

    const page1 = await t.query(api.attendees.list, {
      paginationOpts: { numItems: 2, cursor: null },
    })

    expect(page1.page).toHaveLength(2)
    expect(page1.isDone).toBe(false)
  })
})
```

---

## Phase 3: Shared Component Tests

**Estimated Time:** 2 hours  
**Goal:** Test components used by many features

### Task 3.1: Test Form Component

**Time:** 1 hour

Create `tests/unit/components/ui/form.test.tsx`:

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

### Task 3.2: Test ErrorState Component

**Time:** 30 minutes

Create `tests/unit/components/ui/error-state.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorState } from '@/components/ui/error-state'

describe('ErrorState', () => {
  it('renders not-found error', () => {
    render(<ErrorState type="not-found" message="Not found" />)
    expect(screen.getByText('Not found')).toBeInTheDocument()
  })

  it('renders error with retry button', () => {
    const onRetry = vi.fn()
    render(<ErrorState type="error" message="Error" onRetry={onRetry} />)
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })
})
```

### Task 3.3: Test Layout Component

**Time:** 30 minutes

Create `tests/unit/components/layout/layout.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '@/components/layout/Layout'

describe('Layout', () => {
  it('renders with navigation', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
```

---

## Phase 4: E2E Critical Flows

**Estimated Time:** 3 hours  
**Goal:** Test complete user workflows

### Task 4.1: Create Auth Tests

**Time:** 1 hour

Create `tests/e2e/specs/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/')
  })

  test('user sees error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.getByText(/invalid|error/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('session persists after page refresh', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/')

    // Refresh
    await page.reload()

    // Should still be on dashboard
    await expect(page).toHaveURL('/')
  })

  /**
   * TODO: Add OAuth tests when credentials are configured
   *
   * Prerequisites:
   * - Google OAuth credentials set up in Convex dashboard
   * - Facebook OAuth credentials set up in Convex dashboard
   * - Test accounts created in Google/Facebook developers console
   *
   * Tests to add:
   * - Google login flow
   * - Facebook login flow
   * - OAuth cancellation (user denies permission)
   * - OAuth error handling (invalid token, expired session)
   * - Linking OAuth account to existing email account
   *
   * Estimated time: 1-2 hours
   * Priority: Medium (after core attendee features are stable)
   */
})
```

### Task 4.2: Create Attendee CRUD Tests

**Time:** 2 hours

Create `tests/e2e/specs/attendees-crud.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Attendee CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'testpassword123')
    await page.click('button[type="submit"]')
  })

  test('create new attendee', async ({ page }) => {
    await page.goto('/attendees/new')

    await page.fill('[name="firstName"]', 'E2E Test')
    await page.fill('[name="lastName"]', 'User')
    await page.fill('[name="email"]', 'e2e-test@example.com')
    await page.fill('[name="address"]', '123 Test St')
    await page.selectOption('[name="status"]', 'member')

    await page.click('button[type="submit"]')

    await expect(page.getByText('Attendee created')).toBeVisible()
    await expect(page).toHaveURL('/attendees')
  })

  test('create attendee without address (test schema mismatch)', async ({
    page,
  }) => {
    await page.goto('/attendees/new')

    await page.fill('[name="firstName"]', 'No Address')
    await page.fill('[name="lastName"]', 'Test')
    await page.selectOption('[name="status"]', 'visitor')
    // Skip address field

    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.getByText(/address is required/i)).toBeVisible()
  })

  test('edit existing attendee', async ({ page }) => {
    // Navigate to an attendee
    await page.goto('/attendees')
    await page.click('text=E2E Test User')
    await page.click('text=Edit')

    // Update email
    await page.fill('[name="email"]', 'updated@example.com')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Attendee updated')).toBeVisible()
    await expect(page.getByText('updated@example.com')).toBeVisible()
  })

  test('archive attendee', async ({ page }) => {
    await page.goto('/attendees')
    await page.click('text=E2E Test User')

    // Open actions menu and click archive
    await page.click('[data-testid="actions-menu"]')
    await page.click('text=Archive')

    // Confirm
    await page.click('button:has-text("Archive")')

    await expect(page.getByText('Attendee archived')).toBeVisible()
  })
})
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
| **Phase 2** | Convex Unit    | 2.5 hours     | 7 tests           |
| **Phase 3** | Component Unit | 2 hours       | 5 tests           |
| **Phase 4** | E2E Tests      | 3 hours       | 6 tests           |
| **Total**   |                | **9.5 hours** | **18 tests**      |

---

**Last Updated:** 2026-03-21
**Status:** Ready for implementation
