import { test, expect } from '@playwright/test'

// TC-007: create story via modal → appears in tree with correct title + epic effort updates
test('TC-007 — create story via + NEW STORY button', async ({ page }) => {
  await page.goto('/')

  // Click the "+ NEW STORY" button on the first epic (epic-data)
  const addBtn = page.getByTestId('add-story-epic-data')
  await addBtn.click()

  // Modal should appear
  const modal = page.getByTestId('story-modal')
  await expect(modal).toBeVisible()

  // Fill in the title
  await modal.getByTestId('story-modal-title').fill('My Test Story')

  // Save
  await modal.getByTestId('story-modal-save').click()

  // Modal should close
  await expect(modal).not.toBeVisible()

  // The new story should appear somewhere in the tree (title visible)
  await expect(page.getByText('My Test Story')).toBeVisible()
})

// TC-007 (supplement): save button disabled when title is empty
test('TC-007 — save disabled when title is empty', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('add-story-epic-viz').click()

  const modal = page.getByTestId('story-modal')
  await expect(modal).toBeVisible()

  // Title is empty by default — save should be disabled
  await expect(modal.getByTestId('story-modal-save')).toBeDisabled()

  // Type something → becomes enabled
  await modal.getByTestId('story-modal-title').fill('Draft')
  await expect(modal.getByTestId('story-modal-save')).toBeEnabled()

  // Clear → disabled again
  await modal.getByTestId('story-modal-title').fill('')
  await expect(modal.getByTestId('story-modal-save')).toBeDisabled()
})

// TC-007: close modal with backdrop click
test('TC-007 — close modal via backdrop click', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('add-story-epic-data').click()
  await expect(page.getByTestId('story-modal')).toBeVisible()

  // Click the backdrop (outside the modal dialog itself)
  await page.locator('.modal-backdrop').click({ position: { x: 5, y: 5 } })
  await expect(page.getByTestId('story-modal')).not.toBeVisible()
})

// TC-009: delete story → disappears from tree, right panel deselects
test('TC-009 — delete story via DELETE button (confirm)', async ({ page }) => {
  await page.goto('/')

  // Create a story we can safely delete
  await page.getByTestId('add-story-epic-data').click()
  const modal = page.getByTestId('story-modal')
  await modal.getByTestId('story-modal-title').fill('Story To Delete')
  await modal.getByTestId('story-modal-save').click()
  await expect(modal).not.toBeVisible()

  // Select the newly created story
  await page.getByText('Story To Delete').click()

  // DELETE button should be visible (non-protected story)
  const deleteBtn = page.getByTestId('rp-delete-btn')
  await expect(deleteBtn).toBeVisible()

  // Accept the confirmation dialog
  page.on('dialog', dialog => dialog.accept())
  await deleteBtn.click()

  // Story should no longer appear in the tree
  await expect(page.getByText('Story To Delete')).not.toBeVisible()
})

// TC-008: copy story — all fields pre-filled, save creates a new story
test('TC-008 — copy story via COPY button in RightPanel', async ({ page }) => {
  await page.goto('/')

  // Select a story that has content (first story row)
  const firstStoryRow = page.locator('.tree-story-row').first()
  await firstStoryRow.click()

  // RightPanel should show and COPY button should appear
  const copyBtn = page.getByTestId('rp-copy-btn')
  await expect(copyBtn).toBeVisible()
  await copyBtn.click()

  // Modal should open in copy mode (title pre-filled)
  const modal = page.getByTestId('story-modal')
  await expect(modal).toBeVisible()

  // Title input should be pre-filled (not empty)
  const titleInput = modal.getByTestId('story-modal-title')
  const titleValue = await titleInput.inputValue()
  expect(titleValue.length).toBeGreaterThan(0)

  // Change the title to differentiate the copy
  await titleInput.fill(titleValue + ' — COPY')

  // Save
  await modal.getByTestId('story-modal-save').click()
  await expect(modal).not.toBeVisible()

  // The copied story title should appear in the tree
  await expect(page.getByText(titleValue + ' — COPY')).toBeVisible()
})
