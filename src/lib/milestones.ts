import type { Milestone, ScheduledStory, CalendarConfig } from './types'
import { parseDate, formatDate, workingDaysBetween } from './calendar'

// Derived milestone state (US-016). Never stored — `target` is the committed date,
// everything here is computed from the current schedule so the gap moves live.
export interface MilestoneForecast {
  forecast: string | null            // YYYY-MM-DD = max(endDate) of its stories; null when blocked
  status: 'on-track' | 'at-risk' | 'blocked'
  gapWeeks: number                   // 0 unless at-risk; weeks by which forecast exceeds target
}

function nextCalendarDay(iso: string): string {
  const d = parseDate(iso)
  d.setDate(d.getDate() + 1)
  return formatDate(d)
}

// forecast = latest end among the milestone's stories (lexical max is safe on ISO
// 'YYYY-MM-DD' — same convention as epicWindow).
//
// Declared decisions:
// - If ANY composing story is blocked, the forecast is null and status is 'blocked'.
//   A max over only the schedulable subset would under-report and read as a real
//   commitment — worse than admitting "unknown".
// - gapWeeks = ceil(workingDays strictly after target, up to forecast / daysPerWeek).
//   So even 1 working day late rounds up to "+1 week" (no fractional weeks shown).
export function milestoneForecast(
  ms: Milestone,
  schedule: ScheduledStory[],
  cal: CalendarConfig,
): MilestoneForecast {
  const schedMap = new Map(schedule.map(s => [s.storyId, s]))
  const relevant = ms.storyIds
    .map(id => schedMap.get(id))
    .filter((s): s is ScheduledStory => s !== undefined)

  // Any blocked composing story voids the forecast.
  if (relevant.some(s => s.blocked)) {
    return { forecast: null, status: 'blocked', gapWeeks: 0 }
  }

  const ends = relevant.filter(s => s.endDate).map(s => s.endDate)
  if (ends.length === 0) {
    // Nothing schedulable to forecast from → treat as blocked/unknown.
    return { forecast: null, status: 'blocked', gapWeeks: 0 }
  }

  const forecast = ends.reduce((a, b) => (a > b ? a : b))

  if (forecast <= ms.target) {
    return { forecast, status: 'on-track', gapWeeks: 0 }
  }

  const gapDays = workingDaysBetween(
    parseDate(nextCalendarDay(ms.target)),
    parseDate(forecast),
    cal.holidays,
  )
  const gapWeeks = Math.ceil(gapDays / cal.daysPerWeek)
  return { forecast, status: 'at-risk', gapWeeks }
}
