import { test, expect } from '@playwright/test';

test.describe('Dashboard Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays correct title and branding', async ({ page }) => {
    await expect(page).toHaveTitle(/GASH Dashboard/i);
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toHaveText(/GASH Dashboard Dashboard/i);
  });

  test('renders quick navigation cards', async ({ page }) => {
    await expect(page.getByText(/Orders Management/i)).toBeVisible();
    await expect(page.getByText(/Product Catalog & Inventory/i)).toBeVisible();
  });
});
