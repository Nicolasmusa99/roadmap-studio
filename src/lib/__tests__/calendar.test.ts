import { describe, it, expect } from 'vitest'
import {
  parseDate,
  formatDate,
  getUsHolidays,
  isWeekend,
  isHoliday,
  isWorkingDay,
  addWorkingDays,
  nextWorkingDay,
  workingDaysBetween,
} from '../calendar'
import type { Holiday } from '../types'

// ─── Holiday computation ──────────────────────────────────────────────────────

describe('getUsHolidays', () => {
  it('computes Labor Day 2026 as Sep 7 (1st Monday of September)', () => {
    const h = getUsHolidays(2026)
    expect(h.find(x => x.name === 'Labor Day')?.date).toBe('2026-09-07')
  })

  it('computes Thanksgiving 2026 as Nov 26 (4th Thursday of November)', () => {
    const h = getUsHolidays(2026)
    expect(h.find(x => x.name === 'Thanksgiving')?.date).toBe('2026-11-26')
  })

  it('computes Columbus Day 2026 as Oct 12 (2nd Monday of October)', () => {
    const h = getUsHolidays(2026)
    expect(h.find(x => x.name === 'Columbus Day')?.date).toBe('2026-10-12')
  })

  it('computes MLK Day 2027 as Jan 18 (3rd Monday of January)', () => {
    const h = getUsHolidays(2027)
    expect(h.find(x => x.name === 'MLK Day')?.date).toBe('2027-01-18')
  })

  it("computes Presidents' Day 2027 as Feb 15 (3rd Monday of February)", () => {
    const h = getUsHolidays(2027)
    expect(h.find(x => x.name === "Presidents' Day")?.date).toBe('2027-02-15')
  })

  it('list is pre-populated but not imposed — caller can modify it', () => {
    const h = getUsHolidays(2026)
    h.push({ name: 'Custom', date: '2026-10-01' })
    expect(h.some(x => x.name === 'Custom')).toBe(true)
    // original call still returns 8 entries, not 9
    expect(getUsHolidays(2026)).toHaveLength(8)
  })
})

// ─── isWeekend ────────────────────────────────────────────────────────────────

describe('isWeekend', () => {
  it('Mon Aug 24 2026 is not a weekend', () => {
    expect(isWeekend(parseDate('2026-08-24'))).toBe(false)
  })
  it('Sat Aug 29 2026 is a weekend', () => {
    expect(isWeekend(parseDate('2026-08-29'))).toBe(true)
  })
  it('Sun Aug 30 2026 is a weekend', () => {
    expect(isWeekend(parseDate('2026-08-30'))).toBe(true)
  })
})

// ─── isHoliday ────────────────────────────────────────────────────────────────

describe('isHoliday', () => {
  const holidays2026 = getUsHolidays(2026)

  it('Labor Day Sep 7 2026 is a holiday', () => {
    expect(isHoliday(parseDate('2026-09-07'), holidays2026)).toBe(true)
  })

  it('Sep 8 2026 is NOT a holiday', () => {
    expect(isHoliday(parseDate('2026-09-08'), holidays2026)).toBe(false)
  })
})

// ─── isWorkingDay ─────────────────────────────────────────────────────────────

describe('isWorkingDay', () => {
  const holidays2026 = getUsHolidays(2026)

  it('Mon Aug 24 2026 is a working day', () => {
    expect(isWorkingDay(parseDate('2026-08-24'), holidays2026)).toBe(true)
  })

  it('Sat Aug 29 2026 is NOT a working day (weekend)', () => {
    expect(isWorkingDay(parseDate('2026-08-29'), holidays2026)).toBe(false)
  })

  it('Sun Aug 30 2026 is NOT a working day (weekend)', () => {
    expect(isWorkingDay(parseDate('2026-08-30'), holidays2026)).toBe(false)
  })

  it('Sep 7 2026 is NOT a working day (Labor Day — TC-029)', () => {
    expect(isWorkingDay(parseDate('2026-09-07'), holidays2026)).toBe(false)
  })
})

// ─── addWorkingDays ───────────────────────────────────────────────────────────

describe('addWorkingDays — TC-028: 5-day story starts Mon Aug 24', () => {
  const holidays = getUsHolidays(2026)

  it('5 working days (end = start + 4) → Fri Aug 28', () => {
    // story occupies [Aug24..Aug28] (5 days incl.), so end = addWorkingDays(start, 4)
    const end = addWorkingDays(parseDate('2026-08-24'), 4, holidays)
    expect(formatDate(end)).toBe('2026-08-28')
  })

  it('does not count Saturday Aug 29 or Sunday Aug 30', () => {
    // 6 working days → Mon Aug 31
    const end = addWorkingDays(parseDate('2026-08-24'), 5, holidays)
    expect(formatDate(end)).toBe('2026-08-31')
  })
})

describe('addWorkingDays — TC-031: 2 weeks (10 days) from Aug 24', () => {
  const holidays = getUsHolidays(2026)

  it('10 working days end on Sep 4, NOT Sep 7 (14 calendar days)', () => {
    // end = addWorkingDays(start, 9) — 10-day story occupies [Aug24..Sep4]
    const end = addWorkingDays(parseDate('2026-08-24'), 9, holidays)
    expect(formatDate(end)).toBe('2026-09-04')
  })
})

describe('addWorkingDays — TC-029: story crossing Labor Day Sep 7', () => {
  const holidays = getUsHolidays(2026)
  const noHolidays: Holiday[] = []

  it('without holiday, +3 working days from Sep 2 ends Sep 7', () => {
    const end = addWorkingDays(parseDate('2026-09-02'), 3, noHolidays)
    expect(formatDate(end)).toBe('2026-09-07')
  })

  it('with Labor Day active, same computation ends Sep 8 (shifted 1 day — TC-029)', () => {
    const end = addWorkingDays(parseDate('2026-09-02'), 3, holidays)
    expect(formatDate(end)).toBe('2026-09-08')
  })
})

// ─── nextWorkingDay ───────────────────────────────────────────────────────────

describe('nextWorkingDay', () => {
  const holidays = getUsHolidays(2026)

  it('Mon is already a working day — returns same day', () => {
    expect(formatDate(nextWorkingDay(parseDate('2026-08-24'), holidays))).toBe('2026-08-24')
  })

  it('Sat Aug 29 → skips to Mon Aug 31', () => {
    expect(formatDate(nextWorkingDay(parseDate('2026-08-29'), holidays))).toBe('2026-08-31')
  })

  it('Sep 7 (Labor Day) → skips to Sep 8', () => {
    expect(formatDate(nextWorkingDay(parseDate('2026-09-07'), holidays))).toBe('2026-09-08')
  })
})

// ─── workingDaysBetween ───────────────────────────────────────────────────────

describe('workingDaysBetween', () => {
  it('Mon–Fri (Aug 24–28) = 5 working days', () => {
    expect(workingDaysBetween(parseDate('2026-08-24'), parseDate('2026-08-28'), [])).toBe(5)
  })

  it('Mon–Mon next week (Aug 24–31) = 6 working days (skip weekend)', () => {
    expect(workingDaysBetween(parseDate('2026-08-24'), parseDate('2026-08-31'), [])).toBe(6)
  })

  it('week that includes Labor Day (Sep 7–11) = 4 working days, not 5', () => {
    const holidays = getUsHolidays(2026)
    // Sep 7=holiday, Sep 8–11 = 4 working days
    expect(workingDaysBetween(parseDate('2026-09-07'), parseDate('2026-09-11'), holidays)).toBe(4)
  })
})

// ─── parseDate / formatDate round-trip ───────────────────────────────────────

describe('parseDate / formatDate', () => {
  it('round-trips without timezone shift', () => {
    const iso = '2026-08-24'
    expect(formatDate(parseDate(iso))).toBe(iso)
  })
})
