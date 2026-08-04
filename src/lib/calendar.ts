import type { Holiday } from './types'

// ─── Date helpers ─────────────────────────────────────────────────────────────

// Always use local-time constructors to avoid UTC-offset date-shift bugs.
export function parseDate(isoDate: string): Date {
  const parts = isoDate.split('-').map(Number)
  return new Date(parts[0], parts[1] - 1, parts[2])
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── US federal holiday computation ──────────────────────────────────────────

// Returns the nth occurrence of `weekday` (0=Sun … 6=Sat) in the given month.
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): string {
  const firstDay = new Date(year, month - 1, 1)
  const offset = ((weekday - firstDay.getDay()) + 7) % 7
  const day = offset + 1 + (n - 1) * 7
  return formatDate(new Date(year, month - 1, day))
}

// Generates US federal holidays for `year` by rule (no hardcoded dates).
// CalendarConfig.holidays is the source of truth — this function only pre-populates it.
// The PM can add, remove, or rename entries after initialization.
export function getUsHolidays(year: number): Holiday[] {
  return [
    { name: "New Year's Day",  date: `${year}-01-01` },
    { name: 'MLK Day',         date: nthWeekdayOfMonth(year, 1,  1, 3) }, // 3rd Mon Jan
    { name: "Presidents' Day", date: nthWeekdayOfMonth(year, 2,  1, 3) }, // 3rd Mon Feb
    { name: 'Labor Day',       date: nthWeekdayOfMonth(year, 9,  1, 1) }, // 1st Mon Sep
    { name: 'Columbus Day',    date: nthWeekdayOfMonth(year, 10, 1, 2) }, // 2nd Mon Oct
    { name: 'Veterans Day',    date: `${year}-11-11` },
    { name: 'Thanksgiving',    date: nthWeekdayOfMonth(year, 11, 4, 4) }, // 4th Thu Nov
    { name: 'Christmas',       date: `${year}-12-25` },
  ]
}

// ─── Working-day predicates ───────────────────────────────────────────────────

export function isWeekend(date: Date): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

export function isHoliday(date: Date, holidays: Holiday[]): boolean {
  const s = formatDate(date)
  return holidays.some(h => h.date === s)
}

export function isWorkingDay(date: Date, holidays: Holiday[]): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays)
}

// Returns the holiday entry for `date`, or undefined if it's not a holiday.
export function getHolidayOnDate(date: Date, holidays: Holiday[]): Holiday | undefined {
  const s = formatDate(date)
  return holidays.find(h => h.date === s)
}

// ─── Working-day arithmetic ───────────────────────────────────────────────────

// Advance exactly n working days forward from `date` (date itself is not counted).
// addWorkingDays(Aug24, 0) = Aug24; addWorkingDays(Aug24, 4) = Aug28 (TC-028).
export function addWorkingDays(date: Date, n: number, holidays: Holiday[]): Date {
  const result = new Date(date)
  let remaining = n
  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    if (isWorkingDay(result, holidays)) remaining--
  }
  return result
}

// Returns the earliest working day on or after `date`.
export function nextWorkingDay(date: Date, holidays: Holiday[]): Date {
  const result = new Date(date)
  while (!isWorkingDay(result, holidays)) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

// Count of working days in [start, end] inclusive.
export function workingDaysBetween(start: Date, end: Date, holidays: Holiday[]): number {
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    if (isWorkingDay(cur, holidays)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}
