import { test, expect } from '@playwright/test'

test.describe('Events CRUD', () => {
  // Sign up and login before each test
  test.beforeEach(async ({ page }) => {
    // Generate unique email for this test run
    const uniqueEmail = `e2e.events.${Date.now()}.${Math.random().toString(36).substring(7)}@cjcrsg.test`
    const password = 'E2ETestPass123!'

    // Navigate to login and sign up
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Click on Sign Up tab
    const signUpTab = page.locator('button', { hasText: 'Sign Up' }).first()
    await signUpTab.click()
    await page.waitForTimeout(500)

    // Fill in signup form
    await page.fill('#signup-email', uniqueEmail)
    await page.fill('#signup-password', password)
    await page.fill('#signup-confirm', password)
    await page.click('button:has-text("Create Account")')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('user can create a new event', async ({ page }) => {
    const uniqueEventName = `E2E Test Event ${Date.now()}`

    // Navigate to create event page
    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    // Verify we're on the create event page by checking breadcrumb
    await expect(page.getByText(/create new event/i)).toBeVisible()

    // Fill in required fields
    // Event Name
    await page.fill('#name', uniqueEventName)

    // Select Event Type (first available option)
    await page.click('#eventType')
    await page.waitForTimeout(500)
    // Select the first option in the dropdown
    await page.locator('[role="option"]').first().click()

    // Date is pre-filled with today's date by default, no need to interact with date picker

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for navigation to events dashboard
    await expect(page).toHaveURL('/events', { timeout: 10000 })

    // Verify success toast (event was created successfully)
    await expect(page.getByText(/event created successfully/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test('user can edit an existing event', async ({ page }) => {
    const uniqueEventName = `E2E Edit Test ${Date.now()}`
    const updatedEventName = `${uniqueEventName} - Updated`

    // Step 1: Create an event first
    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/create new event/i)).toBeVisible()

    // Fill in required fields
    await page.fill('#name', uniqueEventName)

    // Select Event Type (first available option)
    await page.click('#eventType')
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').first().click()

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for navigation to events dashboard
    await expect(page).toHaveURL('/events', { timeout: 10000 })

    // Verify event was created
    await expect(page.getByText(/event created successfully/i)).toBeVisible({
      timeout: 5000,
    })

    // Step 2: Navigate to events archive to find the event
    await page.goto('/events/archive')
    await page.waitForLoadState('networkidle')

    // Wait for the events list to load
    await expect(page.getByText(/event archive/i)).toBeVisible()

    // Step 3: Find and click on the event row (click on the event name link)
    await expect(page.getByText(uniqueEventName)).toBeVisible({ timeout: 5000 })
    // Click on the event name which should be a link
    await page
      .locator('tr', { hasText: uniqueEventName })
      .locator('td')
      .first()
      .click()

    // Wait for navigation to event detail page
    await page.waitForLoadState('networkidle')

    // Step 4: Click edit button in Event Details card (Basic Info)
    // Find the Event Details heading, then get its parent card's edit button
    await expect(page.getByText(/Event Details/i)).toBeVisible()
    const eventDetailsSection = page
      .locator('div')
      .filter({ hasText: /^Event Details$/ })
      .first()
    await expect(
      eventDetailsSection
        .locator('..')
        .getByRole('button', { name: /^Edit$/i }),
    ).toBeVisible()
    await eventDetailsSection
      .locator('..')
      .getByRole('button', { name: /^Edit$/i })
      .click()

    // Wait for modal to open
    await page.waitForTimeout(500)

    // Step 5: Modify the event name in the modal
    await expect(page.getByText(/edit basic info/i)).toBeVisible({
      timeout: 5000,
    })
    await page.fill('#name', updatedEventName)

    // Step 6: Save the changes
    await page.getByRole('button', { name: /save changes/i }).click()

    // Step 7: Verify the changes
    await expect(page.getByText(/event updated/i)).toBeVisible({
      timeout: 5000,
    })

    // Verify the updated name is displayed
    await expect(page.getByText(updatedEventName)).toBeVisible()
  })

  test('user can view event details', async ({ page }) => {
    const uniqueEventName = `E2E View Test ${Date.now()}`

    // Step 1: Create an event first
    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/create new event/i)).toBeVisible()

    // Fill in required fields
    await page.fill('#name', uniqueEventName)

    // Select Event Type (first available option)
    await page.click('#eventType')
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').first().click()

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for navigation to events dashboard
    await expect(page).toHaveURL('/events', { timeout: 10000 })

    // Verify event was created
    await expect(page.getByText(/event created successfully/i)).toBeVisible({
      timeout: 5000,
    })

    // Step 2: Navigate to events archive to find the event
    await page.goto('/events/archive')
    await page.waitForLoadState('networkidle')

    // Wait for the events list to load
    await expect(page.getByText(/event archive/i)).toBeVisible()

    // Step 3: Find and click on the event to view details
    await expect(page.getByText(uniqueEventName)).toBeVisible({ timeout: 5000 })
    // Click on the event name which should be a link
    await page
      .locator('tr', { hasText: uniqueEventName })
      .locator('td')
      .first()
      .click()

    // Wait for navigation to event detail page
    await page.waitForLoadState('networkidle')

    // Step 4: Verify event details are displayed
    // Verify event name is displayed
    await expect(page.getByText(uniqueEventName)).toBeVisible()

    // Verify Event Details section exists
    await expect(page.getByText(/Event Details/i)).toBeVisible()

    // Verify Status badge is displayed (should be 'Upcoming' for new event - capitalized)
    await expect(page.getByText(/Upcoming/i)).toBeVisible()

    // Verify Date is displayed
    await expect(page.getByText(/Date/i)).toBeVisible()

    // Verify Edit button is available (get the first one - Event Details edit)
    await expect(
      page.getByRole('button', { name: /^Edit$/i }).first(),
    ).toBeVisible()

    // Verify Back to Events button is available
    await expect(
      page.getByRole('button', { name: /back to events/i }),
    ).toBeVisible()
  })

  test('user can archive an event', async ({ page }) => {
    const uniqueEventName = `E2E Archive Test ${Date.now()}`

    // Step 1: Create an event first
    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/create new event/i)).toBeVisible()

    // Fill in required fields
    await page.fill('#name', uniqueEventName)

    // Select Event Type (first available option)
    await page.click('#eventType')
    await page.waitForTimeout(500)
    await page.locator('[role="option"]').first().click()

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for navigation to events dashboard
    await expect(page).toHaveURL('/events', { timeout: 10000 })

    // Verify event was created
    await expect(page.getByText(/event created successfully/i)).toBeVisible({
      timeout: 5000,
    })

    // Step 2: Navigate to events archive to find the event
    await page.goto('/events/archive')
    await page.waitForLoadState('networkidle')

    // Wait for the events list to load
    await expect(page.getByText(/event archive/i)).toBeVisible()

    // Step 3: Find and click on the event to view details
    await expect(page.getByText(uniqueEventName)).toBeVisible({ timeout: 5000 })
    await page
      .locator('tr', { hasText: uniqueEventName })
      .locator('td')
      .first()
      .click()

    // Wait for navigation to event detail page
    await page.waitForLoadState('networkidle')

    // Step 4: Verify we're on the event detail page
    await expect(page.getByText(uniqueEventName)).toBeVisible()

    // Step 5: Click the Archive button
    await expect(
      page.getByRole('button', { name: /archive event/i }),
    ).toBeVisible()
    await page.getByRole('button', { name: /archive event/i }).click()

    // Step 6: Verify the toast notification
    await expect(page.getByText(/event archived/i)).toBeVisible({
      timeout: 5000,
    })

    // Step 7: Navigate back to archive and verify event is not in the list
    await page.goto('/events/archive')
    await page.waitForLoadState('networkidle')

    // Wait for the events list to load
    await expect(page.getByText(/event archive/i)).toBeVisible()

    // The archived event should no longer appear in the archive list
    await expect(page.getByText(uniqueEventName)).not.toBeVisible()
  })
})
