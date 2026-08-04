import type { Story, EstimationState } from './types'
import { storyTotalDays } from './aggregation'

// ─── Auto-suggestion ──────────────────────────────────────────────────────────

// Average total days of `manual` stories in the epic (excluding `excludeId`).
// Returns null when there are no manual stories to average from.
// This value is a PLACEHOLDER — it never drives the roadmap. (product-model §Estimación)
export function getAutoSuggestion(epicStories: Story[], excludeId?: string): number | null {
  const manual = epicStories.filter(
    s => s.estimationState === 'manual' && s.id !== excludeId,
  )
  if (manual.length === 0) return null
  const total = manual.reduce((sum, s) => sum + storyTotalDays(s), 0)
  return Math.round(total / manual.length)
}

// ─── Effective estimation ─────────────────────────────────────────────────────

export interface EffectiveEstimation {
  days: number | null    // null when no value can be derived
  state: EstimationState
  isAutoSuggested: boolean // true only for 'auto' with a computable suggestion
}

// Returns what the story's effort should be treated as, honoring the
// precedence rule: auto → manual → unestimated.
//
// 'auto'       (never touched) → suggests avg of manual siblings; marked as placeholder (TC-047)
// 'manual'     (PM loaded a value) → uses the story's own roleEfforts
// 'unestimated' (PM cleared it) → null; does NOT revert to auto (TC-048)
export function getEffectiveEstimation(
  story: Story,
  epicStories: Story[],
): EffectiveEstimation {
  switch (story.estimationState) {
    case 'manual': {
      const days = storyTotalDays(story)
      return { days, state: 'manual', isAutoSuggested: false }
    }
    case 'unestimated': {
      return { days: null, state: 'unestimated', isAutoSuggested: false }
    }
    case 'auto': {
      const days = getAutoSuggestion(epicStories, story.id)
      return { days, state: 'auto', isAutoSuggested: days !== null }
    }
  }
}

// ─── State transitions ────────────────────────────────────────────────────────

// Encodes the one-way precedence rule: once a story is touched (loaded or cleared),
// it never reverts to 'auto'. (TC-048)
//
//   'load'  → 'manual'      (PM entered a value)
//   'clear' → 'unestimated' (PM deleted the value; does NOT go back to 'auto')
export function applyEstimationAction(
  _current: EstimationState,
  action: 'load' | 'clear',
): EstimationState {
  return action === 'load' ? 'manual' : 'unestimated'
}
