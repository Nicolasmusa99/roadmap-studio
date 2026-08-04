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

  const starts = active.map(s => s.startDate).sort()
  const ends = active.map(s => s.endDate).sort()
  return {
    startDate: starts[0],
    endDate: ends[ends.length - 1],
  }
}
