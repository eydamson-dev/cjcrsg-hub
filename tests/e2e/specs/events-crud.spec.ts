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
})
