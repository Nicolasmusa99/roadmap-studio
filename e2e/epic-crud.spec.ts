import { test, expect } from '@playwright/test'

// TC-004: create epic → appears in tree, born with no stories
test('TC-004 — add epic via inline form', async ({ page }) => {
  await page.goto('/')

  // Click the "ADD STAGE" button in the first component (comp-data)
  const addBtn = page.getByTestId('add-epic-comp-data')
  await addBtn.click()

  // Inline input should appear
  const input = page.getByTestId('add-epic-input-comp-data')
  await expect(input).toBeVisible()

  // Type the new epic name and press Enter
  await input.fill('My New Stage')
  await input.press('Enter')

  // Input should disappear and new epic name should appear in the tree
  await expect(input).not.toBeVisible()
  await expect(page.getByText('My New Stage'.toUpperCase())).toBeVisible()
})

// TC-004 (supplement): pressing Escape cancels without creating
test('TC-004 — Escape cancels epic creation', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('add-epic-comp-viz').click()
  const input = page.getByTestId('add-epic-input-comp-viz')
  await input.fill('Aborted Stage')
  await input.press('Escape')
  await expect(input).not.toBeVisible()
  await expect(page.getByText('Aborted Stage'.toUpperCase())).not.toBeVisible()
})

// TC-005: protected epics have no delete button; user-created ones do
test('TC-005 — protected epics cannot be deleted', async ({ page }) => {
  await page.goto('/')

  // Baseline protected epic (epic-data) should have NO delete button
  await expect(page.getByTestId('epic-delete-btn-epic-data')).not.toBeVisible()

  // Create a new epic so we can verify it DOES have a delete button
  await page.getByTestId('add-epic-comp-data').click()
  await page.getByTestId('add-epic-input-comp-data').fill('Deletable Stage')
  await page.getByTestId('add-epic-input-comp-data').press('Enter')

  // Find the new epic's id — it starts with 'epic-user-'
  // Hover over the eyebrow to reveal the actions (CSS opacity: 0 → 1 on hover)
  const eyebrow = page.locator('.tree-epic-eyebrow', { hasText: 'Deletable Stage'.toUpperCase() })
  await eyebrow.hover()

  // The delete button for the new (non-protected) epic should now be visible
  // We look for ANY delete btn that's visible, since we don't know the dynamic id
  const visibleDeleteBtns = page.locator('[data-testid^="epic-delete-btn-epic-user-"]')
  await expect(visibleDeleteBtns).toBeVisible()
})

// TC-004: rename epic via rename button
test('TC-004 — rename epic via ✎ button', async ({ page }) => {
  await page.goto('/')

  // Create a new epic first so we can rename it
  await page.getByTestId('add-epic-comp-ai').click()
  await page.getByTestId('add-epic-input-comp-ai').fill('Old Name')
  await page.getByTestId('add-epic-input-comp-ai').press('Enter')

  // Find the rename button for the new epic
  const eyebrow = page.locator('.tree-epic-eyebrow', { hasText: 'Old Name'.toUpperCase() })
  await eyebrow.hover()

  // Click the rename button (✎) — we pick by test-id prefix
  const renameBtns = page.locator('[data-testid^="epic-rename-btn-epic-user-"]')
  await renameBtns.first().click()

  // Inline rename input should appear
  const renameInput = page.locator('[data-testid^="epic-rename-input-epic-user-"]').first()
  await expect(renameInput).toBeVisible()

  // Clear and type new name
  await renameInput.fill('New Name')
  await renameInput.press('Enter')

  // New name should appear in the tree
  await expect(page.getByText('New Name'.toUpperCase())).toBeVisible()
})
