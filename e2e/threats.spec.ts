import { test, expect } from '@playwright/test'

// Hybrid threat model (invariant #12): unchecking a threat FILTERS its stories out
// of the Tree and Timeline (the work is gone → epics/milestones recompute), and a
// visible scope readout reports how much effort still remains.

test('unchecking a threat removes its stories from the tree and updates scope', async ({ page }) => {
  await page.goto('/')

  // Baseline: all threats active → flood stories present, scope 100%.
  await expect(page.locator('.tree-story-row', { hasText: 'H-002' })).toBeVisible() // FloodGrid ingest
  await expect(page.locator('.tree-story-row', { hasText: 'H-006' })).toBeVisible() // Flood overlay
  const readout = page.getByTestId('scope-readout')
  await expect(readout).toContainText('100%')

  // Uncheck "flood".
  await page.locator('.layer-row', { hasText: 'flood' }).locator('input[type=checkbox]').uncheck()

  // Flood-labeled stories disappear from the tree...
  await expect(page.locator('.tree-story-row', { hasText: 'H-002' })).toHaveCount(0)
  await expect(page.locator('.tree-story-row', { hasText: 'H-006' })).toHaveCount(0)
  // ...while a heat story stays.
  await expect(page.locator('.tree-story-row', { hasText: 'H-005' })).toBeVisible()

  // Scope readout drops below 100%.
  await expect(readout).not.toContainText('100%')

  // Timeline reflects the same filtering — no flood story bar remains.
  await page.getByTestId('view-toggle-timeline').click()
  await expect(page.locator('[data-story-id="H-002"]')).toHaveCount(0)
  await expect(page.locator('[data-story-id="H-005"]')).toBeVisible()

  // Re-check restores the stories (dynamic, no reload).
  await page.getByTestId('view-toggle-tree').click()
  await page.locator('.layer-row', { hasText: 'flood' }).locator('input[type=checkbox]').check()
  await expect(page.locator('.tree-story-row', { hasText: 'H-002' })).toBeVisible()
  await expect(readout).toContainText('100%')
})

test('MVP checkpoint shows +2 wk at baseline and improves when a threat frees shared roles', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('view-toggle-timeline').click()

  // Baseline (all threats active): the MVP forecast lands +2 wk past target — the
  // prototype's headline gap. This must hold in the default state.
  const gap = page.getByTestId('ms-gap-ms-mvp')
  await expect(gap).toContainText('+2 wk')

  // Dropping "energy" removes H-003 (GridWatch ingest), which occupies the Data
  // Engineer and Full-stack roles. Resource leveling then lets the MVP stories
  // start sooner, so the gap shrinks to +1 wk — a genuine "what-if", live.
  await page.getByTestId('view-toggle-tree').click()
  await page.locator('.layer-row', { hasText: 'energy' }).locator('input[type=checkbox]').uncheck()
  await page.getByTestId('view-toggle-timeline').click()
  await expect(page.getByTestId('ms-gap-ms-mvp')).toContainText('+1 wk')
})
