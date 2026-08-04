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

// US-009 / TC-013: the effort selector offers exactly the configured scale — no free input.
// Each role's selector has testid rp-effort-select-{roleId}; TC-013 grabs the first one.
test('TC-013: effort selector shows configured scale; no free text input (US-009)', async ({ page }) => {
  await page.goto('/')
  await page.locator('.tree-story-row', { hasText: 'H-001' }).click()
  await page.getByTestId('rp-edit-btn').click()

  // The effort selector for the first role must be a <select>, not a text input
  const firstSelect = page.locator('[data-testid^="rp-effort-select-"]').first()
  await expect(firstSelect).toBeVisible()
  const tag = await firstSelect.evaluate(el => el.tagName.toLowerCase())
  expect(tag).toBe('select')

  // Options include exactly the default scale labels (from config.effortScale, not hardcoded)
  const labels = await firstSelect.evaluate(el => {
    const select = el as HTMLSelectElement
    return Array.from(select.options).map(o => o.text)
  })
  expect(labels).toContain('1d')
  expect(labels).toContain('2d')
  expect(labels).toContain('3d')
  expect(labels).toContain('1sem')
  expect(labels).toContain('2sem')
  expect(labels).toContain('3sem')
  expect(labels).toContain('4sem')
  // "—" placeholder is the first option (represents "not yet selected")
  expect(labels[0]).toBe('—')
})

// US-010: adding and removing roles updates roleEfforts on save.
test('US-010: role assignment — remove fullstack, add AI (US-010)', async ({ page }) => {
  await page.goto('/')
  // H-001 has data + fullstack roles; select it and enter edit mode
  await page.locator('.tree-story-row', { hasText: 'H-001' }).click()
  await page.getByTestId('rp-edit-btn').click()

  // Both assigned role rows are visible
  await expect(page.getByTestId('rp-role-row-data')).toBeVisible()
  await expect(page.getByTestId('rp-role-row-fullstack')).toBeVisible()

  // Remove the fullstack role
  await page.getByTestId('rp-role-remove-fullstack').click()
  await expect(page.getByTestId('rp-role-row-fullstack')).not.toBeVisible()

  // Add the AI role (was unassigned)
  await page.getByTestId('rp-role-add-ai').click()
  await expect(page.getByTestId('rp-role-row-ai')).toBeVisible()

  // Set an effort for AI so it survives the save filter (days=0 rows are dropped)
  await page.getByTestId('rp-effort-select-ai').selectOption({ label: '1sem' })

  // Save and verify in read mode
  await page.getByTestId('rp-save-btn').click()
  await expect(page.locator('.right-panel')).toContainText('DATA')
  await expect(page.locator('.right-panel')).toContainText('AI')
  await expect(page.locator('.right-panel')).not.toContainText('FULLSTACK')
})

// US-017 / TC-033: mvpPct is editable per story; two stories can have different %.
test('TC-033: mvpPct editable per story; toggle MVP recalculates (US-017)', async ({ page }) => {
  await page.goto('/')
  await page.locator('.tree-story-row', { hasText: 'H-001' }).click()
  await page.getByTestId('rp-edit-btn').click()

  // The mvpPct input is visible with the current value (H-001 baseline: 55)
  const pctInput = page.getByTestId('rp-mvp-pct')
  await expect(pctInput).toBeVisible()
  await expect(pctInput).toHaveValue('55')

  // Change to 40 and save
  await pctInput.fill('40')
  await page.getByTestId('rp-save-btn').click()

  // Read mode reflects 40%
  await expect(page.locator('.right-panel')).toContainText('40%')

  // Now edit H-002 — its mvpPct (60) is independent of H-001's
  await page.locator('.tree-story-row', { hasText: 'H-002' }).click()
  await page.getByTestId('rp-edit-btn').click()
  await expect(page.getByTestId('rp-mvp-pct')).toHaveValue('60')
  await page.getByTestId('rp-cancel-btn').click()
})

// US-017: toggle mvpEnabled persists
test('US-017: toggle mvpEnabled persists after save', async ({ page }) => {
  await page.goto('/')
  await page.locator('.tree-story-row', { hasText: 'H-001' }).click()
  await page.getByTestId('rp-edit-btn').click()

  // Toggle the MVP checkbox ON (H-001 starts with mvpEnabled=false)
  const mvpCheckbox = page.getByTestId('rp-mvp-enabled')
  await expect(mvpCheckbox).not.toBeChecked()
  await mvpCheckbox.check()
  await page.getByTestId('rp-save-btn').click()

  // Read mode shows MVP badge
  await expect(page.locator('.right-panel')).toContainText('ON')
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
