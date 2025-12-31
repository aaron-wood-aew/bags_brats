import { test, expect } from '@playwright/test';

test.describe('Tournament Lifecycle Smoke Test', () => {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'password123';
    const tournamentName = `Test Tournament ${Date.now()}`;

    test('Full admin-to-player game flow', async ({ page }) => {
        // 1. Admin Login
        await page.goto('/login');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', adminPassword);
        await page.click('button[type="submit"]');

        // Should land on dashboard (redirected to player view by default or we go to admin)
        await expect(page).toHaveURL(/.*dashboard/);

        // 2. Navigate to Admin Center
        await page.click('button:has-text("Admin")');
        await expect(page).toHaveURL(/.*admin/);

        // 3. Create Tournament (if none active)
        const isTournamentActive = await page.isVisible('text=Active Tournament');
        if (!isTournamentActive) {
            await page.click('text=Create New Tournament');
            await page.fill('input[placeholder="Tournament Name"]', tournamentName);

            // Select today's date in the calendar
            const todayStr = new Date().toISOString().split('T')[0];
            await page.click(`button[key="${todayStr}"], button:has-text("${new Date().getDate()}")`);

            await page.click('button:has-text("Start Tournament")');
        }

        // 4. Generate Pairings
        await page.click('button:has-text("Pairings")');
        // We'd expect a success dialog or toast
        // await expect(page.locator('text=Pairings generated')).toBeVisible();

        // 5. Start All Games
        await page.click('button:has-text("Start All")');
        // Handle confirmation dialog if it exists
        page.on('dialog', dialog => dialog.accept());

        // 6. Verify Timer appearance on Admin Live Games
        await page.click('button:has-text("Live Games")');
        await expect(page.locator('.glass-card:has-text("Court") >> text=active')).toBeVisible();

        // 7. Verify Player Dashboard View (Switch to player view)
        await page.click('text=Player View');
        await expect(page.locator('text=Your Session')).toBeVisible();
        await expect(page.locator('text=VS')).toBeVisible();

        // 8. Submit Score (Mocking one for the test)
        await page.fill('input[placeholder="0"] >> nth=0', '21');
        await page.fill('input[placeholder="0"] >> nth=1', '15');
        await page.click('button:has-text("Submit Final Results")');

        // 9. Verify Submission Locked
        await expect(page.locator('text=Match Result Finalized')).toBeVisible();
    });

    test('Responsive Mobile View Verification', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/login');
        // Basic check for stacking/layout
        const card = page.locator('.glass-card');
        await expect(card).toBeVisible();
        const width = await card.evaluate(el => el.clientWidth);
        expect(width).toBeLessThan(400);
    });
});
