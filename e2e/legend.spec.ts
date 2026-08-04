import { test, expect } from '@playwright/test'

// The badge notation (d / p / sem / MVP / AUTO / scope) is explained in a legend
// behind a "?" in the header, so it isn't ambiguous in front of the board.

test('notation legend opens from the header and explains the badges', async ({ page }) => {
  await page.goto('/')

  const popover = page.getByTestId('legend-popover')
  await expect(popover).toHaveCount(0)

  await page.getByTestId('legend-toggle').click()
  await expect(popover).toBeVisible()

  // Covers the ambiguous "p" and the effort/duration units.
  await expect(popover).toContainText('people assigned')
  await expect(popover).toContainText('effort in days')
  await expect(popover).toContainText('duration in weeks')

  // Clicking the scrim closes it again.
  await page.locator('.legend-scrim').click({ position: { x: 5, y: 5 } })
  await expect(popover).toHaveCount(0)
})
