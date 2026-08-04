import { test, expect } from '@playwright/test'

// US-015 — create a transversal milestone and see its composition.
test('create a milestone spanning two epics; marker + composition appear', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('new-milestone').click()
  await expect(page.getByTestId('milestone-modal')).toBeVisible()

  await page.getByTestId('ms-name').fill('Alpha')

  // Pick stories from two different epics: H-001 (Data Foundation) + H-004 (Geospatial Visualizer)
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
  await expect(comp).toContainText('Geospatial Visualizer')
})

// US-016 — the baseline MVP milestone has an intentionally aggressive target, so
// its forecast slips past it and it must render at-risk (--warn) with the gap.
test('baseline MVP milestone is at-risk with a visible gap', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('view-toggle-timeline').click()

  const marker = page.getByTestId('ms-marker-ms-mvp')
  await expect(marker).toHaveAttribute('data-status', 'at-risk')
  await expect(marker).toHaveClass(/tl-marker--risk/)
  await expect(page.getByTestId('ms-gap-ms-mvp')).toContainText('+')

  await marker.click()
  await expect(page.getByTestId('ms-status')).toHaveAttribute('data-status', 'at-risk')
})
