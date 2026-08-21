import type { AppState } from './types'
import { schedule } from './scheduler'
import { storiesInScope } from './threats'
import { milestoneForecast } from './milestones'

export interface NextCheckpoint {
  name: string
  status: 'on-track' | 'at-risk' | 'blocked'
  gapWeeks: number
}

export interface RoadmapIndicators {
  storyCount: number          // total stories in the roadmap (not filtered by scope)
  roleCount: number           // team roles configured
  tagCount: number            // tags (risk layers)
  projectedEnd: string | null // YYYY-MM-DD max endDate of non-blocked scheduled stories
  nextCheckpoint: NextCheckpoint | null  // nearest milestone by target date; null if none
}

// Compute roadmap-level health indicators from a stored AppState.
// Runs the same scheduler pipeline as the workspace: storiesInScope → schedule → milestoneForecast.
// Typical cost is <50ms for ~20 stories; called once per roadmap on the Home screen,
// memoized by the caller on [roadmaps] so it doesn't re-run on unrelated renders.
export function computeRoadmapIndicators(state: AppState): RoadmapIndicators {
  const inScope = storiesInScope(state.stories, state.config.riskLayers)
  const scheduled = schedule({
    stories: inScope,
    teamRoles: state.config.teamRoles,
    calendarConfig: state.config.calendarConfig,
  })

  // Projected end: max endDate across non-blocked scheduled stories that have effort.
  // Stories with no roleEfforts get endDate = startDate from the scheduler — not meaningful.
  const estimatedIds = new Set(inScope.filter(s => s.roleEfforts.length > 0).map(s => s.id))
  let projectedEnd: string | null = null
  for (const s of scheduled) {
    if (!s.blocked && s.endDate && estimatedIds.has(s.storyId) &&
        (projectedEnd === null || s.endDate > projectedEnd)) {
      projectedEnd = s.endDate
    }
  }

  // Next checkpoint: milestone with the earliest target date.
  let nextCheckpoint: NextCheckpoint | null = null
  if (state.milestones.length > 0) {
    const nearest = [...state.milestones].sort((a, b) => a.target.localeCompare(b.target))[0]
    const fc = milestoneForecast(nearest, scheduled, state.config.calendarConfig)
    nextCheckpoint = { name: nearest.name, status: fc.status, gapWeeks: fc.gapWeeks }
  }

  return {
    storyCount: state.stories.length,
    roleCount: state.config.teamRoles.length,
    tagCount: state.config.riskLayers.length,
    projectedEnd,
    nextCheckpoint,
  }
}
