import { test, expect } from '@playwright/test'

test.describe('Event Types CRUD', () => {
  // Sign up and login before each test
  test.beforeEach(async ({ page }) => {
    // Generate unique email for this test run
    const uniqueEmail = `e2e.eventtypes.${Date.now()}.${Math.random().toString(36).substring(7)}@cjcrsg.test`
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

  test('can navigate to event types page', async ({ page }) => {
    await page.goto('/event-types')

    // Should show the event types page
    await expect(
      page.getByRole('heading', { name: /event types/i }),
    ).toBeVisible()

    // Should show the description
    await expect(page.getByText(/manage event types/i)).toBeVisible()
  })

  test('can see event types page content', async ({ page }) => {
    await page.goto('/event-types')

    // Should show the page header
    await expect(
      page.getByRole('heading', { name: /event types/i }),
    ).toBeVisible()

    // Should show "Add Event Type" button
    await expect(
      page.getByRole('button', { name: /add event type/i }),
    ).toBeVisible()
  })

  test('can open create dialog when clicking add button', async ({ page }) => {
    await page.goto('/event-types')
    await page.waitForLoadState('networkidle')

    // Click "Add Event Type" button
    await page.getByRole('button', { name: /add event type/i }).click()

    // Should show dialog with form
    await expect(page.getByText(/create event type/i)).toBeVisible()

    // Should show form fields
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#color')).toBeVisible()
  })

  test('can create event type with unique name', async ({ page }) => {
    const uniqueName = `Sunday Service ${Date.now()}`

    await page.goto('/event-types')
    await page.waitForLoadState('networkidle')

    // Open create dialog
    await page.getByRole('button', { name: /add event type/i }).click()

    // Fill in the form with unique name
    await page.fill('#name', uniqueName)

    // Submit the form
    await page.getByRole('button', { name: /save/i }).click()

    // Wait for dialog to close
    await page.waitForTimeout(2000)

    // Should show success toast
    await expect(page.getByText(/event type created/i)).toBeVisible({
      timeout: 5000,
    })

    // Should show the event type in the table (use first() to avoid strict mode)
    await expect(page.getByText(uniqueName).first()).toBeVisible()
  })

  test('can create event type with description', async ({ page }) => {
    const uniqueName = `Youth Retreat ${Date.now()}`
    const description = 'Weekly youth group gatherings'

    await page.goto('/event-types')
    await page.waitForLoadState('networkidle')

    // Open create dialog
    await page.getByRole('button', { name: /add event type/i }).click()

    // Fill in the form with unique name and description
    await page.fill('#name', uniqueName)
    await page.fill('textarea', description)

    // Submit the form
    await page.getByRole('button', { name: /save/i }).click()

    // Wait for dialog to close
    await page.waitForTimeout(2000)

    // Should show success toast
    await expect(page.getByText(/event type created/i)).toBeVisible({
      timeout: 5000,
    })

    // Should show the event type name in table (use first() to avoid strict mode)
    await expect(page.getByText(uniqueName).first()).toBeVisible()

    // Should show the description
    await expect(page.getByText(description).first()).toBeVisible()
  })

  test('can randomize color', async ({ page }) => {
    await page.goto('/event-types')
    await page.waitForLoadState('networkidle')

    // Open create dialog
    await page.getByRole('button', { name: /add event type/i }).click()

    // Click randomize button
    await page.getByRole('button', { name: /randomize/i }).click()

    // Wait for color to change
    await page.waitForTimeout(500)

    // Get color value
    const color = await page.locator('#color').inputValue()

    // Color should be valid hex format
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  test('can close dialog with cancel button', async ({ page }) => {
    await page.goto('/event-types')
    await page.waitForLoadState('networkidle')

    // Open create dialog
    await page.getByRole('button', { name: /add event type/i }).click()

    // Should show dialog
    await expect(page.getByText(/create event type/i)).toBeVisible()

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Dialog should be closed
    await expect(page.getByText(/create event type/i)).not.toBeVisible()
  })

  test('form validates required name field', async ({ page }) => {
    await page.goto('/event-types')
    await page.waitForLoadState('networkidle')

    // Open create dialog
    await page.getByRole('button', { name: /add event type/i }).click()

    // Clear name field if filled
    await page.locator('#name').clear()

    // Try to submit without name
    await page.getByRole('button', { name: /save/i }).click()

    // Should show validation error
    await expect(page.getByText(/name must be at least/i)).toBeVisible()
  })
})
