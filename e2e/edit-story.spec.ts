import { test, expect } from '@playwright/test'

// US-006 / TC-010: Edit button is visible in read mode when a story is selected.
test('TC-010: Edit button visible in read mode (US-006)', async ({ page }) => {
  await page.goto('/')
  await page.locator('.tree-story-row', { hasText: 'H-001' }).click()
  await expect(page.getByTestId('rp-edit-btn')).toBeVisible()
})

// US-007 / TC-011: save persists the change and triggers recalc; cancel reverts.
test('TC-011: save persists edit; cancel reverts (US-007)', async ({ page }) => {
  await page.goto('/')
  await page.locator('.tree-story-row', { hasText: 'H-001' }).click()

  // ── Enter edit mode ──────────────────────────────────────────────────────
  await page.getByTestId('rp-edit-btn').click()
  await expect(page.getByTestId('rp-save-btn')).toBeVisible()
  await expect(page.getByTestId('rp-cancel-btn')).toBeVisible()
  // Edit button must disappear while in edit mode
  await expect(page.getByTestId('rp-edit-btn')).not.toBeVisible()

  // ── Change asA and save ──────────────────────────────────────────────────
  await page.getByTestId('rp-field-asA').fill('Data Engineer')
  await page.getByTestId('rp-save-btn').click()

  // Back in read mode — EDIT button reappears, new value visible
  await expect(page.getByTestId('rp-edit-btn')).toBeVisible()
  await expect(page.getByTestId('rp-narrative')).toContainText('Data Engineer')
  // Schedule section intact (scheduler still running after save)
  await expect(page.locator('.right-panel')).toContainText('START')

  // ── Enter edit mode again, change asA, then cancel ───────────────────────
  await page.getByTestId('rp-edit-btn').click()
  await page.getByTestId('rp-field-asA').fill('Product Owner')
  await page.getByTestId('rp-cancel-btn').click()

  // Reverted — saved value stays, cancelled value discarded
  await expect(page.getByTestId('rp-narrative')).toContainText('Data Engineer')
  await expect(page.getByTestId('rp-narrative')).not.toContainText('Product Owner')
})

// US-007: selecting a different story while editing exits edit mode without saving.
test('switching stories while editing exits edit mode without saving (US-007)', async ({ page }) => {
  await page.goto('/')
  await page.locator('.tree-story-row', { hasText: 'H-001' }).click()
  await page.getByTestId('rp-edit-btn').click()
  await page.getByTestId('rp-field-asA').fill('Changed value')

  // Select a different story without saving
  await page.locator('.tree-story-row', { hasText: 'H-002' }).click()

  // Should be back in read mode for H-002 — no save/cancel, edit button present
  await expect(page.getByTestId('rp-save-btn')).not.toBeVisible()
  await expect(page.getByTestId('rp-edit-btn')).toBeVisible()
  // H-001 was never saved — original value still in state (verify by re-selecting)
  await page.locator('.tree-story-row', { hasText: 'H-001' }).click()
  await expect(page.getByTestId('rp-narrative')).toContainText('PM')
  await expect(page.getByTestId('rp-narrative')).not.toContainText('Changed value')
})
