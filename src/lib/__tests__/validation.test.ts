import { describe, it, expect } from 'vitest'
import { isDaysPerWeekValid, clampMvpPct } from '../validation'

// ─── TC-049: daysPerWeek validity ─────────────────────────────────────────────
describe('isDaysPerWeekValid — TC-049', () => {
  it('rejects 0 (would divide by zero)', () => {
    expect(isDaysPerWeekValid(0)).toBe(false)
  })
  it('rejects values < 1', () => {
    expect(isDaysPerWeekValid(0.5)).toBe(false)
    expect(isDaysPerWeekValid(-3)).toBe(false)
  })
  it('rejects non-finite input', () => {
    expect(isDaysPerWeekValid(NaN)).toBe(false)
    expect(isDaysPerWeekValid(Infinity)).toBe(false)
  })
  it('accepts 1 and the default 5', () => {
    expect(isDaysPerWeekValid(1)).toBe(true)
    expect(isDaysPerWeekValid(5)).toBe(true)
  })
})

// ─── TC-050: mvpPct clamp to [0, 100] ─────────────────────────────────────────
describe('clampMvpPct — TC-050', () => {
  it('clamps values > 100 down to 100 (MVP never costs more than Full)', () => {
    expect(clampMvpPct(150)).toBe(100)
  })
  it('clamps values < 0 up to 0', () => {
    expect(clampMvpPct(-10)).toBe(0)
  })
  it('leaves the boundaries 0 and 100 untouched', () => {
    expect(clampMvpPct(0)).toBe(0)
    expect(clampMvpPct(100)).toBe(100)
  })
  it('leaves in-range values untouched', () => {
    expect(clampMvpPct(45)).toBe(45)
    expect(clampMvpPct(55)).toBe(55)
  })
  it('treats non-finite input as 0', () => {
    expect(clampMvpPct(NaN)).toBe(0)
  })
})
