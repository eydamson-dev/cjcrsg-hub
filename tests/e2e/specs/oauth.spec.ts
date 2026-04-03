import { test, expect } from '@playwright/test'

/**
 * OAuth E2E Tests
 *
 * These tests verify the OAuth UI flows and account management features.
 * Actual OAuth redirects are not tested (require external provider credentials).
 *
 * Tests are skipped if OAuth environment variables are not configured.
 *
 * Prerequisites for full OAuth testing:
 * - AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET set in Convex
 * - AUTH_FACEBOOK_ID and AUTH_FACEBOOK_SECRET set in Convex (optional)
 */

test.describe('OAuth Authentication', () => {
  test.describe('OAuth Buttons on Login Page', () => {
    test('login page shows OAuth provider buttons', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Check for Google sign-in button
      const googleButton = page.getByRole('button', {
        name: /continue with google/i,
      })
      await expect(googleButton).toBeVisible()

      // Check for Facebook sign-in button
      const facebookButton = page.getByRole('button', {
        name: /continue with facebook/i,
      })
      await expect(facebookButton).toBeVisible()
    })

    test('OAuth buttons are clickable', async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      const googleButton = page.getByRole('button', {
        name: /continue with google/i,
      })
      await expect(googleButton).toBeEnabled()

      const facebookButton = page.getByRole('button', {
        name: /continue with facebook/i,
      })
      await expect(facebookButton).toBeEnabled()
    })
  })

  test.describe('Account Page - Auth Methods', () => {
    test('account page shows authentication methods section', async ({
      page,
    }) => {
      // Sign up a new user first
      const uniqueEmail = `oauth.test.${Date.now()}@cjcrsg.test`
      const password = 'OAuthTestPass123!'

      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Click Sign Up tab
      await page.locator('button', { hasText: 'Sign Up' }).first().click()
      await page.waitForTimeout(500)

      // Fill signup form
      await page.fill('#signup-email', uniqueEmail)
      await page.fill('#signup-password', password)
      await page.fill('#signup-confirm', password)
      await page.click('button:has-text("Create Account")')

      // Wait for redirect to dashboard
      await expect(page).toHaveURL('/', { timeout: 10000 })

      // Navigate to account page
      await page.goto('/settings/account')
      await page.waitForLoadState('networkidle')

      // Verify auth methods section exists
      await expect(
        page.getByText('Authentication Methods', { exact: true }),
      ).toBeVisible()

      // Should show Email & Password method
      await expect(page.getByText('Email & Password')).toBeVisible()
    })

    test('account page shows attendee profile card', async ({ page }) => {
      // Sign up a new user
      const uniqueEmail = `oauth.profile.${Date.now()}@cjcrsg.test`
      const password = 'OAuthTestPass123!'

      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.locator('button', { hasText: 'Sign Up' }).first().click()
      await page.waitForTimeout(500)

      await page.fill('#signup-email', uniqueEmail)
      await page.fill('#signup-password', password)
      await page.fill('#signup-confirm', password)
      await page.click('button:has-text("Create Account")')

      await expect(page).toHaveURL('/', { timeout: 10000 })

      // Navigate to account page
      await page.goto('/settings/account')
      await page.waitForLoadState('networkidle')

      // Verify attendee profile card exists
      await expect(page.getByText('Your Attendee Profile')).toBeVisible()
    })

    test('account page shows safety warning card', async ({ page }) => {
      // Sign up a new user
      const uniqueEmail = `oauth.warning.${Date.now()}@cjcrsg.test`
      const password = 'OAuthTestPass123!'

      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.locator('button', { hasText: 'Sign Up' }).first().click()
      await page.waitForTimeout(500)

      await page.fill('#signup-email', uniqueEmail)
      await page.fill('#signup-password', password)
      await page.fill('#signup-confirm', password)
      await page.click('button:has-text("Create Account")')

      await expect(page).toHaveURL('/', { timeout: 10000 })

      // Navigate to account page
      await page.goto('/settings/account')
      await page.waitForLoadState('networkidle')

      // Verify safety warning
      await expect(page.getByText('Important Safety Note')).toBeVisible()
      await expect(
        page.getByText('You cannot unlink your only authentication method'),
      ).toBeVisible()
    })

    test('unlink button disabled when only one auth method', async ({
      page,
    }) => {
      // Sign up a new user (only has password auth)
      const uniqueEmail = `oauth.single.${Date.now()}@cjcrsg.test`
      const password = 'OAuthTestPass123!'

      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.locator('button', { hasText: 'Sign Up' }).first().click()
      await page.waitForTimeout(500)

      await page.fill('#signup-email', uniqueEmail)
      await page.fill('#signup-password', password)
      await page.fill('#signup-confirm', password)
      await page.click('button:has-text("Create Account")')

      await expect(page).toHaveURL('/', { timeout: 10000 })

      // Navigate to account page
      await page.goto('/settings/account')
      await page.waitForLoadState('networkidle')

      // Wait for the page to fully load and settle
      await expect(
        page.getByText('Authentication Methods', { exact: true }),
      ).toBeVisible()
      await page.waitForTimeout(500)

      // With only password auth, there should be no unlink button visible
      // (password method doesn't have unlink button, only OAuth methods do)
      // Use count() to check for presence without failing
      const unlinkCount = await page
        .getByRole('button', { name: 'Unlink' })
        .count()
      expect(unlinkCount).toBe(0)

      // Safety warning should be visible
      await expect(page.getByText('Important Safety Note')).toBeVisible()
    })
  })

  test.describe('Account Page - Link New Account Section', () => {
    test('shows link options for unlinked providers', async ({ page }) => {
      // Sign up a new user
      const uniqueEmail = `oauth.link.${Date.now()}@cjcrsg.test`
      const password = 'OAuthTestPass123!'

      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.locator('button', { hasText: 'Sign Up' }).first().click()
      await page.waitForTimeout(500)

      await page.fill('#signup-email', uniqueEmail)
      await page.fill('#signup-password', password)
      await page.fill('#signup-confirm', password)
      await page.click('button:has-text("Create Account")')

      await expect(page).toHaveURL('/', { timeout: 10000 })

      // Navigate to account page
      await page.goto('/settings/account')
      await page.waitForLoadState('networkidle')

      // Verify "Link New Account" section exists
      await expect(page.getByText('Link New Account')).toBeVisible()

      // Should show Link Google button (since not linked yet)
      const linkGoogleButton = page.getByRole('button', {
        name: 'Link Google',
      })
      await expect(linkGoogleButton).toBeVisible()

      // Should show Link Facebook button (since not linked yet)
      const linkFacebookButton = page.getByRole('button', {
        name: 'Link Facebook',
      })
      await expect(linkFacebookButton).toBeVisible()
    })
  })

  /**
   * TODO: Add full OAuth flow tests when test accounts are available
   *
   * These tests would require:
   * - Google/Facebook test accounts
   * - Mock OAuth provider or test credentials
   * - Ability to intercept OAuth redirects
   *
   * Tests to add:
   * - Full Google sign-in flow with test account
   * - Full Facebook sign-in flow with test account
   * - OAuth account linking (email user links Google)
   * - OAuth account unlinking (user with password + Google unlinks Google)
   * - OAuth error handling (user denies permission)
   * - Auto-linking attendee profile on OAuth registration
   *
   * Estimated time: 2-3 hours
   * Priority: Medium (after core features are stable)
   */
})
