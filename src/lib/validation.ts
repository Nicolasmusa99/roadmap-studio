// Input-boundary validators for PM-editable values (US-028, invariant #15).
// These live at the edge where the PM enters data — the roadmap engine downstream
// assumes valid input. Each one is a pure function so both the UI setters and the
// scheduler (defense-in-depth vs. imported/corrupt state) share the same rule.

// daysPerWeek < 1 (or non-finite) is invalid: the days→weeks conversion would
// divide by <1 and produce Infinity/NaN. We deliberately do NOT clamp it — hiding
// the bad value would contradict "nada asumido, todo visible" (invariant #15).
// Instead the scheduler detects the invalid config here and blocks the affected
// stories with reason 'invalid-config', so the timeline empties and the mistake
// is impossible to miss. (TC-049)
export function isDaysPerWeekValid(daysPerWeek: number): boolean {
  return Number.isFinite(daysPerWeek) && daysPerWeek >= 1
}

// mvpPct is a percentage of the Full effort the MVP version costs, so it must
// live in [0, 100]. >100 would make the "MVP" cost MORE than Full (contradicts
// invariant #11); <0 would push effort negative. Clamped at the input boundary
// so a stored value is always valid, and re-applied defensively in the scheduler.
// (TC-050)
export function clampMvpPct(pct: number): number {
  if (!Number.isFinite(pct)) return 0
  return Math.min(100, Math.max(0, pct))
}
