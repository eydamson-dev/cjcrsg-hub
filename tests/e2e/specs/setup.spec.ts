import { test, expect } from '@playwright/test'

test.describe('E2E Setup', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    // Just verify the page loads without errors
    await expect(page).toHaveTitle(/CJCRSG Hub/)
  })

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/.*login/)
  })
})
