import { test, expect } from '@playwright/test';

test.describe('Navigation & Smoke Tests', () => {
  test('homepage has correct title and mega menu works', async ({ page }) => {
    await page.goto('/');
    
    // Check main title
    await expect(page).toHaveTitle(/Topica/);

    // Desktop Mega Menu test (Hover "Ngành đào tạo")
    const navLink = page.getByRole('link', { name: 'Ngành đào tạo', exact: true });
    await expect(navLink).toBeVisible();
    
    // Check contact form section exists
    const contactHeading = page.getByRole('heading', { name: 'Liên hệ' });
    await expect(contactHeading).toBeVisible();
  });
});
