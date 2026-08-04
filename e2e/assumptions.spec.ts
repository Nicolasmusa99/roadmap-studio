import { test, expect } from '@playwright/test'

// Invariant #15 ("nada asumido"): the assumptions the roadmap rests on and the
// questions for the board are a first-class, editable surface in the tool.

test('assumptions tab is reachable and its items are editable', async ({ page }) => {
  await page.goto('/')

  // Reachable from the main nav.
  await page.getByTestId('view-toggle-assumptions').click()
  const view = page.getByTestId('assumptions-view')
  await expect(view).toBeVisible()

  // Seeded categories are present.
  await expect(page.getByTestId('asm-card-Datasets')).toBeVisible()
  await expect(page.getByTestId('asm-card-Open questions')).toBeVisible()

  // Add a new question, type into it, and confirm it persists in the field.
  await page.getByTestId('asm-add-Open questions').click()
  const inputs = page.locator('[data-testid^="asm-input-"]')
  const countBefore = await inputs.count()
  const fresh = inputs.last()
  await fresh.fill('Who owns the dataset SLAs?')
  await expect(fresh).toHaveValue('Who owns the dataset SLAs?')

  // Delete it again → count returns to the previous value.
  const freshId = await fresh.getAttribute('data-testid')
  const rowId = freshId!.replace('asm-input-', '')
  await page.getByTestId(`asm-del-${rowId}`).click()
  await expect(inputs).toHaveCount(countBefore - 1)
})
