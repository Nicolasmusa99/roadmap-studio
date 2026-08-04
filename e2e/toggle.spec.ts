import { test, expect } from '@playwright/test'

// US-002 — Tree/Timeline toggle. Scope: the two flows in the plan table.
// Engine math is covered by unit tests; this validates view wiring + selection.

test('toggle swaps the center view and preserves the selected story (UC-02)', async ({ page }) => {
  await page.goto('/')

  // Select a story in the Tree view
  const treeRow = page.locator('.tree-story-row', { hasText: 'H-001' })
  await treeRow.click()
  await expect(treeRow).toHaveClass(/tree-story-row--selected/)

  // Switch to Timeline — selection must carry over
  await page.getByTestId('view-toggle-timeline').click()
  await expect(page.getByTestId('timeline-view')).toBeVisible()
  await expect(page.locator('[data-story-id="H-001"]')).toHaveAttribute('data-selected', 'true')

  // Switch back to Tree — still selected
  await page.getByTestId('view-toggle-tree').click()
  await expect(page.locator('.tree-story-row', { hasText: 'H-001' })).toHaveClass(
    /tree-story-row--selected/,
  )
})

test('timeline renders epic and story bars positioned on the axis', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('view-toggle-timeline').click()

  await expect(page.locator('.tl-epic-bar').first()).toBeVisible()
  await expect(page.locator('.tl-story-bar').first()).toBeVisible()
})
