import type { Story, Epic, ScheduledStory } from './types'

// ─── Story-level helpers ──────────────────────────────────────────────────────

// Total effort in days for one story (sum of all its role-efforts)
export function storyTotalDays(story: Story): number {
  return story.roleEfforts.reduce((sum, r) => sum + r.days, 0)
}

// Days grouped by role across a set of stories
export function effortByRole(stories: Story[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of stories) {
    for (const re of s.roleEfforts) {
      map.set(re.roleId, (map.get(re.roleId) ?? 0) + re.days)
    }
  }
  return map
}

// ─── Epic aggregation ─────────────────────────────────────────────────────────

// Invariant #3: epic effort = SUM of its stories' days. Never average. (TC-045)
export function epicEffortDays(epicId: string, stories: Story[]): number {
  return stories
    .filter(s => s.epicId === epicId)
    .reduce((sum, s) => sum + storyTotalDays(s), 0)
}

// ─── Component aggregation ────────────────────────────────────────────────────

export function componentEffortDays(
  componentId: string,
  epics: Epic[],
  stories: Story[],
): number {
  return epics
    .filter(e => e.componentId === componentId)
    .reduce((sum, e) => sum + epicEffortDays(e.id, stories), 0)
}

// ─── Epic schedule window (duration, not effort) ─────────────────────────────

export interface EpicWindow {
  startDate: string // YYYY-MM-DD; min(scheduled starts)
  endDate: string   // YYYY-MM-DD; max(scheduled ends)
}

// Returns the calendar window of an epic derived from the scheduler output.
// Invariant #4: this is DURATION (when the epic finishes), distinct from
// total effort (sum of work). TC-046.
export function epicWindow(
  epicId: string,
  stories: Story[],
  schedule: ScheduledStory[],
): EpicWindow | null {
  const epicStoryIds = new Set(stories.filter(s => s.epicId === epicId).map(s => s.id))
  const active = schedule.filter(s => epicStoryIds.has(s.storyId) && !s.blocked)
  if (active.length === 0) return null

  // Declared dependency: these sorts are plain lexical sorts, correct ONLY because
  // dates are stored as zero-padded 'YYYY-MM-DD', where lexical order == chronological
  // order. If the date format ever changes (e.g. 'M/D/YYYY'), this breaks silently —
  // keep the ISO format or switch to explicit date comparison here.
  const starts = active.map(s => s.startDate).sort()
  const ends = active.map(s => s.endDate).sort()
  return {
    startDate: starts[0],
    endDate: ends[ends.length - 1],
  }
}

// ─── RICE calculations ────────────────────────────────────────────────────────

// Score for one story. Returns null when:
//   - story.rice is absent (not set)
//   - totalDays === 0 (no effort assigned — can't divide)
//   - any RICE field is 0 or negative (incomplete data)
// Formula: (Reach × Impact × Confidence%) / TotalPersonDays
// Effort reuse: storyTotalDays() — sum of all role-effort days (invariant #2).
// durationDays is intentionally NOT used: it folds in team size, which is a
// scheduling artifact, not a measure of work cost.
export function storyRiceScore(story: Story): number | null {
  const effort = storyTotalDays(story)
  if (!story.rice || effort === 0) return null
  const { reach, impact, confidence } = story.rice
  if (reach <= 0 || impact <= 0 || confidence <= 0) return null
  return (reach * impact * (confidence / 100)) / effort
}

export interface EpicRiceRollup {
  score: number
  sumReach: number
  wtdImpact: number   // reach-weighted average impact
  avgConf: number     // simple average confidence (%)
  sumEffort: number   // total person-days of RICE-complete stories only
  completeCount: number
  totalCount: number
}

// Epic RICE rollup. Only "RICE-complete" stories participate (all three fields
// set and effort > 0). Partial stories are ignored — no silent assumptions.
// Aggregation rules:
//   Reach      = Σ reach (additive; each story reaches distinct users/events)
//   Impact     = reach-weighted avg (high-reach stories have proportionally
//                more weight on the epic's impact signal)
//   Confidence = simple avg (estimation quality, not proportional to reach)
//   Effort     = Σ totalDays of complete stories (invariant #3: sum, not avg)
export function epicRiceRollup(epicId: string, stories: Story[]): EpicRiceRollup | null {
  const epicStories = stories.filter(s => s.epicId === epicId)
  const complete = epicStories.filter(s => {
    const effort = storyTotalDays(s)
    return s.rice && s.rice.reach > 0 && s.rice.impact > 0 && s.rice.confidence > 0 && effort > 0
  })
  if (complete.length === 0) return null

  const sumReach = complete.reduce((acc, s) => acc + s.rice!.reach, 0)
  const wtdImpact = sumReach > 0
    ? complete.reduce((acc, s) => acc + s.rice!.impact * s.rice!.reach, 0) / sumReach
    : complete.reduce((acc, s) => acc + s.rice!.impact, 0) / complete.length
  const avgConf   = complete.reduce((acc, s) => acc + s.rice!.confidence, 0) / complete.length
  const sumEffort = complete.reduce((acc, s) => acc + storyTotalDays(s), 0)

  return {
    score: (sumReach * wtdImpact * (avgConf / 100)) / sumEffort,
    sumReach,
    wtdImpact,
    avgConf,
    sumEffort,
    completeCount: complete.length,
    totalCount: epicStories.length,
  }
}
