import { test, expect } from '@playwright/test'

// TC-025 flow: drag valid epic in timeline → stage numbers reflow
test('TC-025 — drag epic in timeline changes stage order', async ({ page }) => {
  await page.goto('/')

  // Switch to timeline view
  await page.getByTestId('view-toggle').getByText('TIMELINE').click()
  await expect(page.getByTestId('timeline-view')).toBeVisible()

  // Grab the first epic gutter handle and the second epic block
  const handles = page.locator('.tl-gutter--epic .drag-handle')
  const epicBlocks = page.locator('.tl-epic-block')

  await expect(epicBlocks).toHaveCount(4) // 4 baseline epics

  // Record original STAGE labels
  const firstGutter  = epicBlocks.nth(0).locator('.tl-gutter--epic')
  const secondGutter = epicBlocks.nth(1).locator('.tl-gutter--epic')
  const origFirst  = await firstGutter.textContent()
  const origSecond = await secondGutter.textContent()

  // Drag first epic handle down onto the second epic block (drop "after")
  const handle     = handles.nth(0)
  const targetBlock = epicBlocks.nth(1)

  const handleBox = await handle.boundingBox()
  const targetBox = await targetBlock.boundingBox()
  if (!handleBox || !targetBox) throw new Error('bounding box missing')

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  // Move to lower half of target block ("after" position)
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height * 0.75, { steps: 10 })
  await page.mouse.up()

  // After drop, the first block's label should have changed
  const newFirstText = await epicBlocks.nth(0).locator('.tl-gutter--epic').textContent()
  expect(newFirstText).not.toBe(origFirst)
  expect(newFirstText?.trim()).toContain(origSecond?.trim().slice(0, 10))
})

// TC-024 flow: drag handle visible in timeline view
test('TC-024 — drag handles present on all epic rows in timeline', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('view-toggle').getByText('TIMELINE').click()
  await expect(page.getByTestId('timeline-view')).toBeVisible()

  const handles = page.locator('.tl-gutter--epic .drag-handle')
  const count = await handles.count()
  expect(count).toBeGreaterThanOrEqual(4) // at least the 4 baseline epics
})
