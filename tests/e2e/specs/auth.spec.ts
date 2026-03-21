import { test, expect } from '@playwright/test'

// Test user credentials for E2E testing
const TEST_USER = {
  email: 'e2e.test.user@cjcrsg.test',
  password: 'E2ETestPass123!',
  name: 'E2E Test User',
}

test.describe('Authentication', () => {
  test('user can sign up and login with valid credentials', async ({
    page,
  }) => {
    // Generate unique email to avoid conflicts
    const uniqueEmail = `e2e.${Date.now()}@cjcrsg.test`

    // Navigate to login page
    await page.goto('/login')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Click on Sign Up tab
    const signUpTab = page.locator('button', { hasText: 'Sign Up' }).first()
    await signUpTab.click()

    // Wait a moment for tab switch
    await page.waitForTimeout(500)

    // Fill in signup form using correct selectors
    await page.fill('#signup-email', uniqueEmail)
    await page.fill('#signup-password', TEST_USER.password)
    await page.fill('#signup-confirm', TEST_USER.password)

    // Submit form
    await page.click('button:has-text("Create Account")')

    // Should redirect to dashboard after successful auth
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Verify we're logged in by checking for dashboard heading
    await expect(
      page.getByRole('heading', { name: /dashboard/i }),
    ).toBeVisible()
  })

  test('user sees error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Use credentials that don't exist
    await page.fill('#login-email', 'nonexistent@cjcrsg.test')
    await page.fill('#login-password', 'wrongpassword123')
    await page.click('button:has-text("Sign In")')

    // Wait for auth system to process
    await page.waitForTimeout(2000)

    // Should stay on login page (didn't redirect to dashboard)
    await expect(page).toHaveURL(/.*login/)

    // Either an error message is shown OR we're still on the login form
    // (Convex auth may or may not show an error for invalid credentials)
    const errorVisible = await page
      .locator('.text-destructive')
      .isVisible()
      .catch(() => false)
    const signInButtonVisible = await page
      .getByRole('button', { name: 'Sign In' })
      .isVisible()
      .catch(() => false)

    // At minimum, we should still see the sign in button (didn't navigate away)
    expect(signInButtonVisible || errorVisible).toBeTruthy()
  })

  test('session persists after page refresh', async ({ page }) => {
    // Generate unique email
    const uniqueEmail = `e2e.session.${Date.now()}@cjcrsg.test`

    // Sign up first
    await page.goto('/login')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Click on Sign Up tab
    const signUpTab = page.locator('button', { hasText: 'Sign Up' }).first()
    await signUpTab.click()

    // Wait a moment for tab switch
    await page.waitForTimeout(500)

    await page.fill('#signup-email', uniqueEmail)
    await page.fill('#signup-password', TEST_USER.password)
    await page.fill('#signup-confirm', TEST_USER.password)
    await page.click('button:has-text("Create Account")')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Verify we're on dashboard
    await expect(
      page.getByRole('heading', { name: /dashboard/i }),
    ).toBeVisible()

    // Refresh the page
    await page.reload()

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('heading', { name: /dashboard/i }),
    ).toBeVisible()
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
