import type { Story, RiskLayer } from './types'
import { storyTotalDays } from './aggregation'

// ─── Threat scoping ────────────────────────────────────────────────────────────
//
// Product decision (hybrid model — see CLAUDE.md invariant #12, revised):
// A threat checkbox in the sidebar does two things when unchecked:
//   1. FILTERS the stories that carry that threat's label out of the schedule,
//      the Tree and the Timeline. The work is *gone*, so epics/milestones recompute.
//   2. The remaining scope is reported as a visible % (see scopeSummary) so the
//      scope assumption stays declared, never hidden.
//
// A story is out of scope when it carries a label naming a currently-inactive
// threat (case-insensitive). Multi-risk / aggregation stories carry no single
// threat label, so they are never filtered — dropping "flood" removes the flood
// scoring story, but the composite multi-risk index stays (it just loses an input).

export function isStoryInScope(story: Story, riskLayers: RiskLayer[]): boolean {
  const inactive = new Set(
    riskLayers.filter(l => !l.active).map(l => l.name.toLowerCase()),
  )
  if (inactive.size === 0) return true
  return !story.labels.some(l => inactive.has(l.toLowerCase()))
}

// Stories currently in scope, preserving order.
export function storiesInScope(stories: Story[], riskLayers: RiskLayer[]): Story[] {
  return stories.filter(s => isStoryInScope(s, riskLayers))
}

// ─── Graceful degradation (heat↔energy cross) ────────────────────────────────
//
// A story can declare threats that AMPLIFY it (story.amplifiedBy) — an enrichment,
// not a gate. When such a threat is inactive the story is NOT filtered out (that is
// what a label would do); it stays scheduled and only loses that dimension. The UI
// renders this as a "degraded" score, never as BLOCKED. This is what lets the energy
// burden score survive with reduced precision when heat is unchecked, instead of
// vanishing the way a heat-labelled story would.

export interface Degradation {
  degraded: boolean
  lostDimensions: string[] // amplifying threat names that are currently inactive
}

export function storyDegradation(story: Story, riskLayers: RiskLayer[]): Degradation {
  const inactive = new Set(
    riskLayers.filter(l => !l.active).map(l => l.name.toLowerCase()),
  )
  const lostDimensions = (story.amplifiedBy ?? []).filter(a => inactive.has(a.toLowerCase()))
  return { degraded: lostDimensions.length > 0, lostDimensions }
}

// ─── Scope readout ──────────────────────────────────────────────────────────────

export interface ScopeSummary {
  storiesInScope: number
  storiesTotal: number
  effortInScope: number   // days of effort still in scope
  effortTotal: number     // days of effort across all stories
  activeThreats: number
  totalThreats: number
  pct: number             // effortInScope / effortTotal, 0-100 (100 when nothing to scope)
}

// Effort-weighted scope summary. pct is by EFFORT, not story count — dropping a
// small story shouldn't read as the same scope cut as dropping a large one.
export function scopeSummary(stories: Story[], riskLayers: RiskLayer[]): ScopeSummary {
  const inScope = storiesInScope(stories, riskLayers)
  const effortTotal = stories.reduce((sum, s) => sum + storyTotalDays(s), 0)
  const effortInScope = inScope.reduce((sum, s) => sum + storyTotalDays(s), 0)
  return {
    storiesInScope: inScope.length,
    storiesTotal: stories.length,
    effortInScope,
    effortTotal,
    activeThreats: riskLayers.filter(l => l.active).length,
    totalThreats: riskLayers.length,
    pct: effortTotal === 0 ? 100 : Math.round((effortInScope / effortTotal) * 100),
  }
}
