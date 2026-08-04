import { describe, it, expect } from 'vitest'
import {
  getAutoSuggestion,
  getEffectiveEstimation,
  applyEstimationAction,
} from '../estimation'
import type { Story, EstimationState } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mkStory = (
  id: string,
  state: EstimationState,
  roleDays: [string, number][] = [],
): Story => ({
  id,
  epicId: 'epic-a',
  title: id,
  asA: '', iWant: '', soThat: '',
  useCases: [], rules: [],
  roleEfforts: roleDays.map(([roleId, days]) => ({ roleId, days })),
  estimationState: state,
  mvpPct: 50,
  mvpEnabled: false,
  dependsOn: [],
  isDraft: false,
  isProtected: false,
  datasetIds: [],
  labels: [],
})

// ─── getAutoSuggestion ────────────────────────────────────────────────────────

describe('getAutoSuggestion', () => {
  it('returns avg of manual stories in the epic', () => {
    const epicStories = [
      mkStory('s1', 'manual', [['data', 6]]),
      mkStory('s2', 'manual', [['data', 10]]),
      mkStory('s3', 'manual', [['full', 5]]),
    ]
    // avg = (6+10+5)/3 = 7
    expect(getAutoSuggestion(epicStories)).toBe(7)
  })

  it('rounds to nearest integer', () => {
    const epicStories = [
      mkStory('s1', 'manual', [['data', 5]]),
      mkStory('s2', 'manual', [['data', 6]]),
    ]
    // avg = (5+6)/2 = 5.5 → 6
    expect(getAutoSuggestion(epicStories)).toBe(6)
  })

  it('excludes the target story itself when computing avg', () => {
    const epicStories = [
      mkStory('s1', 'manual', [['data', 10]]),
      mkStory('s2', 'auto'),        // this is the story being estimated
      mkStory('s3', 'manual', [['data', 4]]),
    ]
    // avg of s1(10) and s3(4) = 7; s2 excluded by its id
    expect(getAutoSuggestion(epicStories, 's2')).toBe(7)
  })

  it('returns null when no manual stories exist', () => {
    const epicStories = [mkStory('s1', 'auto'), mkStory('s2', 'unestimated')]
    expect(getAutoSuggestion(epicStories)).toBeNull()
  })

  it('ignores unestimated and auto stories when computing avg', () => {
    const epicStories = [
      mkStory('s1', 'manual', [['data', 8]]),
      mkStory('s2', 'unestimated'),    // ignored
      mkStory('s3', 'auto'),           // ignored
    ]
    expect(getAutoSuggestion(epicStories)).toBe(8) // only s1 counts
  })
})

// ─── getEffectiveEstimation — TC-047 ─────────────────────────────────────────

describe('getEffectiveEstimation — TC-047', () => {
  const epicStories = [
    mkStory('s1', 'manual', [['data', 5]]),
    mkStory('s2', 'manual', [['full', 3]]),
    mkStory('s3', 'manual', [['data', 4]]),
    // s4 is the new story, never estimated
  ]

  it('auto story gets suggestion = avg of manual siblings, marked as auto (TC-047)', () => {
    const s4 = mkStory('s4', 'auto')
    const allStories = [...epicStories, s4]
    const est = getEffectiveEstimation(s4, allStories)
    // avg of 5+3+4 = 12/3 = 4
    expect(est.state).toBe('auto')
    expect(est.isAutoSuggested).toBe(true)
    expect(est.days).toBe(4)
  })

  it('auto story with no manual siblings → days=null (no suggestion available)', () => {
    const s = mkStory('s', 'auto')
    const est = getEffectiveEstimation(s, [s])
    expect(est.days).toBeNull()
    expect(est.isAutoSuggested).toBe(false)
  })

  it('manual story returns its own roleEfforts sum, not avg', () => {
    const s = mkStory('s', 'manual', [['data', 10], ['full', 5]])
    const est = getEffectiveEstimation(s, [s])
    expect(est.state).toBe('manual')
    expect(est.days).toBe(15)
    expect(est.isAutoSuggested).toBe(false)
  })

  it('manual story ignores sibling estimations', () => {
    const s = mkStory('s', 'manual', [['data', 3]])
    const est = getEffectiveEstimation(s, [...epicStories, s])
    expect(est.days).toBe(3) // own value, not the epic avg
  })
})

// ─── getEffectiveEstimation — unestimated ─────────────────────────────────────

describe('getEffectiveEstimation — unestimated', () => {
  it('returns days=null and state=unestimated', () => {
    const s = mkStory('s', 'unestimated')
    const est = getEffectiveEstimation(s, [s])
    expect(est.state).toBe('unestimated')
    expect(est.days).toBeNull()
    expect(est.isAutoSuggested).toBe(false)
  })

  it('unestimated story does NOT fall back to auto suggestion', () => {
    // Even with manual siblings, an unestimated story stays unestimated
    const siblings = [mkStory('s1', 'manual', [['data', 10]])]
    const s = mkStory('s', 'unestimated')
    const est = getEffectiveEstimation(s, [...siblings, s])
    expect(est.state).toBe('unestimated')
    expect(est.days).toBeNull() // does NOT return 10 (the avg)
  })
})

// ─── applyEstimationAction — TC-048 ──────────────────────────────────────────

describe('applyEstimationAction — TC-048: precedence auto → manual → unestimated', () => {
  it('auto + load → manual', () => {
    expect(applyEstimationAction('auto', 'load')).toBe('manual')
  })

  it('manual + clear → unestimated (NOT back to auto)', () => {
    expect(applyEstimationAction('manual', 'clear')).toBe('unestimated')
  })

  it('auto + clear → unestimated (touched, so auto is gone)', () => {
    expect(applyEstimationAction('auto', 'clear')).toBe('unestimated')
  })

  it('unestimated + load → manual (PM re-enters a value)', () => {
    expect(applyEstimationAction('unestimated', 'load')).toBe('manual')
  })

  it('unestimated + clear → stays unestimated', () => {
    expect(applyEstimationAction('unestimated', 'clear')).toBe('unestimated')
  })

  it('TC-048 full flow: auto → manual (load) → unestimated (clear) → never back to auto', () => {
    let state: EstimationState = 'auto'
    state = applyEstimationAction(state, 'load')
    expect(state).toBe('manual')
    state = applyEstimationAction(state, 'clear')
    expect(state).toBe('unestimated')
    // Any further clear still keeps unestimated, not auto
    state = applyEstimationAction(state, 'clear')
    expect(state).toBe('unestimated')
  })
})
