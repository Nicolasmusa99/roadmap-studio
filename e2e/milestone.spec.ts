import { test, expect } from '@playwright/test'

// US-015 — create a transversal milestone and see its composition.
test('create a milestone spanning two epics; marker + composition appear', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('new-milestone').click()
  await expect(page.getByTestId('milestone-modal')).toBeVisible()

  await page.getByTestId('ms-name').fill('Alpha')

  // Pick stories from two different epics: H-001 (Data Foundation) + H-004 (Risk Map Viewer)
  const picker = page.getByTestId('ms-stories')
  await picker.locator('.modal-story-opt', { hasText: 'H-001' }).click()
  await picker.locator('.modal-story-opt', { hasText: 'H-004' }).click()

  await page.getByTestId('ms-save').click()

  // Marker on the timeline (view auto-switches to timeline on create)
  await expect(page.locator('.tl-marker-flag', { hasText: 'Alpha' })).toBeVisible()

  // Composition panel shows the stories and which epic each comes from
  const comp = page.getByTestId('ms-composition')
  await expect(comp).toContainText('H-001')
  await expect(comp).toContainText('H-004')
  await expect(comp).toContainText('Data Foundation')
  await expect(comp).toContainText('Risk Map Viewer')
})
