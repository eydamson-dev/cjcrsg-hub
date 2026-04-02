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

    // Select Event Type from dropdown - click the Select trigger button
    await page.locator('button[data-slot="select-trigger"]').click()
    await page.waitForTimeout(500)
    await page.getByRole('option').first().click()
    await page.waitForTimeout(500)

    // Wait for GenericEventDetails to appear
    await expect(page.getByText(/unsaved event draft/i)).toBeVisible({
      timeout: 5000,
    })

    // Click Edit button specifically in the Event Details card to open modal
    // (not the header Edit button which opens Status & Type modal)
    const eventDetailsCard = page
      .locator('div')
      .filter({ hasText: /^Event Details$/ })
      .first()
    await eventDetailsCard
      .locator('..')
      .getByRole('button', { name: /^Edit$/i })
      .click()
    await page.waitForTimeout(300)

    // Wait for modal to open
    await expect(page.getByText(/edit basic info/i)).toBeVisible({
      timeout: 5000,
    })
    await page.waitForTimeout(500) // Extra wait for form to be ready

    // Fill in event name
    await page.fill('#name', uniqueEventName)
    await page.waitForTimeout(300) // Wait for React state update

    // Save changes in modal
    await page.getByRole('button', { name: /save changes/i }).click()
    await page.waitForTimeout(300)

    // Wait for modal to close
    await expect(page.getByText(/edit basic info/i)).not.toBeVisible({
      timeout: 5000,
    })

    // Click Save Event button
    await page.getByRole('button', { name: /save event/i }).click()

    // Wait for navigation and success toast (URL will vary based on event type)
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/event created successfully/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test('user can edit an existing event', async ({ page }) => {
    const uniqueEventName = `E2E Edit Test ${Date.now()}`
    const updatedEventName = `${uniqueEventName} - Updated`

    // Step 1: Create an event first
    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/create new event/i)).toBeVisible()

    // Select Event Type from dropdown - click the Select trigger button
    await page.locator('button[data-slot="select-trigger"]').click()
    await page.waitForTimeout(500)
    await page.getByRole('option').first().click()
    await page.waitForTimeout(500)

    // Wait for GenericEventDetails to appear
    await expect(page.getByText(/unsaved event draft/i)).toBeVisible({
      timeout: 5000,
    })

    // Click Edit button specifically in the Event Details card to open modal
    const eventDetailsCard = page
      .locator('div')
      .filter({ hasText: /^Event Details$/ })
      .first()
    await eventDetailsCard
      .locator('..')
      .getByRole('button', { name: /^Edit$/i })
      .click()
    await page.waitForTimeout(300)

    // Wait for modal to open
    await expect(page.getByText(/edit basic info/i)).toBeVisible({
      timeout: 5000,
    })
    await page.waitForTimeout(500) // Extra wait for form to be ready

    // Fill in event name
    await page.fill('#name', uniqueEventName)
    await page.waitForTimeout(300) // Wait for React state update

    // Save changes in modal
    await page.getByRole('button', { name: /save changes/i }).click()
    await page.waitForTimeout(300)

    // Wait for modal to close
    await expect(page.getByText(/edit basic info/i)).not.toBeVisible({
      timeout: 5000,
    })

    // Click Save Event button
    await page.getByRole('button', { name: /save event/i }).click()

    // Wait for navigation and success toast
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/event created successfully/i)).toBeVisible({
      timeout: 10000,
    })

    // Wait a moment for page to settle
    await page.waitForTimeout(1000)

    // Step 2: Verify event details are displayed and click edit
    await expect(page.getByText(/Event Details/i)).toBeVisible()
    const editEventDetailsCard = page
      .locator('div')
      .filter({ hasText: /^Event Details$/ })
      .first()
    await editEventDetailsCard
      .locator('..')
      .getByRole('button', { name: /^Edit$/i })
      .click()

    // Wait for modal to open
    await page.waitForTimeout(500)

    // Step 3: Modify the event name in the modal
    await expect(page.getByText(/edit basic info/i)).toBeVisible({
      timeout: 5000,
    })
    await page.fill('#name', updatedEventName)

    // Step 4: Save the changes
    await page.getByRole('button', { name: /save changes/i }).click()

    // Step 5: Wait for modal to close and verify the updated name is displayed
    await expect(page.getByText(/edit basic info/i)).not.toBeVisible({
      timeout: 5000,
    })

    // Verify the updated name is displayed in the heading
    await expect(
      page.getByRole('heading', { name: updatedEventName }),
    ).toBeVisible()
  })

  test('user can view event details', async ({ page }) => {
    const uniqueEventName = `E2E View Test ${Date.now()}`

    // Step 1: Create an event first
    await page.goto('/events/new')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/create new event/i)).toBeVisible()

    // Select Event Type from dropdown - click the Select trigger button
    await page.locator('button[data-slot="select-trigger"]').click()
    await page.waitForTimeout(500)
    await page.getByRole('option').first().click()
    await page.waitForTimeout(500)

    // Wait for GenericEventDetails to appear
    await expect(page.getByText(/unsaved event draft/i)).toBeVisible({
      timeout: 5000,
    })

    // Click Edit button specifically in the Event Details card to open modal
    const eventDetailsCard = page
      .locator('div')
      .filter({ hasText: /^Event Details$/ })
      .first()
    await eventDetailsCard
      .locator('..')
      .getByRole('button', { name: /^Edit$/i })
      .click()
    await page.waitForTimeout(300)

    // Wait for modal to open
    await expect(page.getByText(/edit basic info/i)).toBeVisible({
      timeout: 5000,
    })
    await page.waitForTimeout(500) // Extra wait for form to be ready

    // Fill in event name
    await page.fill('#name', uniqueEventName)
    await page.waitForTimeout(300) // Wait for React state update

    // Save changes in modal
    await page.getByRole('button', { name: /save changes/i }).click()
    await page.waitForTimeout(300)

    // Wait for modal to close
    await expect(page.getByText(/edit basic info/i)).not.toBeVisible({
      timeout: 5000,
    })

    // Click Save Event button
    await page.getByRole('button', { name: /save event/i }).click()

    // Wait for navigation and success toast
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/event created successfully/i)).toBeVisible({
      timeout: 10000,
    })

    // Wait a moment for page to settle
    await page.waitForTimeout(1000)

    // Step 2: Verify event details are displayed
    // Verify event name is displayed (either in heading or in the page)
    await expect(page.getByText(uniqueEventName)).toBeVisible()

    // Verify Event Details section exists
    await expect(page.getByText(/Event Details/i)).toBeVisible()

    // Verify Status badge is displayed (should be 'Upcoming' for new event)
    await expect(page.getByText(/Upcoming/i)).toBeVisible()

    // Verify Date is displayed
    await expect(page.getByText(/Date/i)).toBeVisible()

    // Verify Edit button is available (in Event Details card specifically)
    const verifyEventDetailsCard = page
      .locator('div')
      .filter({ hasText: /^Event Details$/ })
      .first()
    await expect(
      verifyEventDetailsCard
        .locator('..')
        .getByRole('button', { name: /^Edit$/i }),
    ).toBeVisible()

    // Verify either Back to Events or Save Event button is available
    // (depending on whether we're on detail page or still on create page)
    const backButton = page.getByRole('button', { name: /back to events/i })
    const saveButton = page.getByRole('button', { name: /save event/i })
    await expect(backButton.or(saveButton)).toBeVisible()
  })
})
