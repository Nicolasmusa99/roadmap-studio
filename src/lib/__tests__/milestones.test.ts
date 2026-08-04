import { describe, it, expect } from 'vitest'
import { milestoneForecast } from '../milestones'
import type { Milestone, ScheduledStory, CalendarConfig } from '../types'

const CAL: CalendarConfig = { startDate: '2026-08-24', daysPerWeek: 5, holidays: [] }

const sched = (storyId: string, endDate: string, blocked = false): ScheduledStory => ({
  storyId,
  startDate: '2026-08-24',
  endDate: blocked ? '' : endDate,
  durationDays: blocked ? 0 : 5,
  blocked,
  ...(blocked ? { blockedReason: 'role-unavailable' as const } : {}),
})

const ms = (storyIds: string[], target: string): Milestone => ({
  id: 'ms', name: 'M', target, storyIds,
})

// ─── forecast = max(end) ──────────────────────────────────────────────────────
describe('milestoneForecast — forecast is the max end of its stories (US-016)', () => {
  it('takes the latest end date and is on-track when it is ≤ target', () => {
    const schedule = [sched('A', '2026-09-04'), sched('B', '2026-09-11')]
    const r = milestoneForecast(ms(['A', 'B'], '2026-09-30'), schedule, CAL)
    expect(r.forecast).toBe('2026-09-11') // max end
    expect(r.status).toBe('on-track')
    expect(r.gapWeeks).toBe(0)
  })
})

// ─── at-risk with gap ──────────────────────────────────────────────────────────
describe('milestoneForecast — at-risk when forecast > target', () => {
  it('is at-risk and reports a positive gap', () => {
    const schedule = [sched('A', '2026-09-15')]
    const r = milestoneForecast(ms(['A'], '2026-09-01'), schedule, CAL)
    expect(r.status).toBe('at-risk')
    expect(r.gapWeeks).toBeGreaterThan(0)
  })

  // Rounding declared explicitly: forecast exactly 1 WORKING day after target.
  // target = Fri 2026-08-28; forecast = Mon 2026-08-31 (weekend skipped) → 1 working
  // day late → rounds UP to 1 week. Any positive gap is at least "+1 wk".
  it('1 working day past target rounds up to gapWeeks=1', () => {
    const schedule = [sched('A', '2026-08-31')]
    const r = milestoneForecast(ms(['A'], '2026-08-28'), schedule, CAL)
    expect(r.status).toBe('at-risk')
    expect(r.gapWeeks).toBe(1)
  })
})

// ─── blocked ⇒ forecast === null ───────────────────────────────────────────────
describe('milestoneForecast — a blocked composing story voids the forecast', () => {
  it('status=blocked and forecast===null (NOT a partial max over the non-blocked)', () => {
    const schedule = [sched('A', '2026-09-04'), sched('B', '', true)] // B blocked
    const r = milestoneForecast(ms(['A', 'B'], '2026-09-30'), schedule, CAL)
    expect(r.status).toBe('blocked')
    expect(r.forecast).toBeNull()
    expect(r.gapWeeks).toBe(0)
  })
})
