import { describe, it, expect } from 'vitest'
import { isStoryInScope, storiesInScope, scopeSummary, storyDegradation } from '../threats'
import type { Story, RiskLayer } from '../types'

const mkStory = (id: string, labels: string[], days = 5, amplifiedBy?: string[]): Story => ({
  id, epicId: 'e', title: id,
  asA: '', iWant: '', soThat: '',
  useCases: [], rules: [],
  roleEfforts: [{ roleId: 'data', days }],
  estimationState: 'manual', mvpPct: 50, mvpEnabled: false,
  dependsOn: [], isDraft: false, isProtected: false,
  datasetIds: [], labels, amplifiedBy,
})

const layers = (active: Record<string, boolean>): RiskLayer[] =>
  Object.entries(active).map(([name, on]) => ({ id: `l-${name}`, name, active: on }))

describe('isStoryInScope', () => {
  it('keeps every story when all threats are active', () => {
    const ls = layers({ heat: true, flood: true, energy: true })
    expect(isStoryInScope(mkStory('h', ['heat']), ls)).toBe(true)
    expect(isStoryInScope(mkStory('f', ['flood']), ls)).toBe(true)
  })

  it('filters a story that carries an inactive threat label', () => {
    const ls = layers({ heat: true, flood: false, energy: true })
    expect(isStoryInScope(mkStory('f', ['map', 'flood']), ls)).toBe(false)
    expect(isStoryInScope(mkStory('h', ['map', 'heat']), ls)).toBe(true)
  })

  it('never filters a multi-risk story (no single-threat label)', () => {
    const ls = layers({ heat: true, flood: false, energy: false })
    expect(isStoryInScope(mkStory('agg', ['scoring', 'aggregation']), ls)).toBe(true)
  })

  it('matches threat labels case-insensitively', () => {
    const ls = layers({ Flood: false })
    expect(isStoryInScope(mkStory('f', ['FLOOD']), ls)).toBe(false)
  })
})

describe('storiesInScope', () => {
  it('drops only the stories tied to inactive threats, preserving order', () => {
    const ls = layers({ heat: true, flood: false, energy: true })
    const stories = [
      mkStory('h', ['heat']),
      mkStory('f', ['flood']),
      mkStory('e', ['energy']),
    ]
    expect(storiesInScope(stories, ls).map(s => s.id)).toEqual(['h', 'e'])
  })
})

describe('scopeSummary', () => {
  it('is 100% with every threat active', () => {
    const ls = layers({ heat: true, flood: true })
    const stories = [mkStory('h', ['heat'], 10), mkStory('f', ['flood'], 10)]
    const s = scopeSummary(stories, ls)
    expect(s.pct).toBe(100)
    expect(s.storiesInScope).toBe(2)
    expect(s.effortInScope).toBe(20)
  })

  it('reports the effort-weighted % of scope remaining when a threat is off', () => {
    const ls = layers({ heat: true, flood: false })
    const stories = [mkStory('h', ['heat'], 30), mkStory('f', ['flood'], 10)]
    // 30 of 40 days survive → 75%
    const s = scopeSummary(stories, ls)
    expect(s.pct).toBe(75)
    expect(s.storiesInScope).toBe(1)
    expect(s.effortInScope).toBe(30)
    expect(s.effortTotal).toBe(40)
  })
})

describe('storyDegradation (heat↔energy cross)', () => {
  it('is not degraded when the amplifying threat is active', () => {
    const ls = layers({ heat: true, energy: true })
    const burden = mkStory('burden', ['scoring', 'energy'], 5, ['heat'])
    const d = storyDegradation(burden, ls)
    expect(d.degraded).toBe(false)
    expect(d.lostDimensions).toEqual([])
  })

  it('degrades (loses the heat dimension) but stays IN SCOPE when heat is off', () => {
    const ls = layers({ heat: false, energy: true })
    const burden = mkStory('burden', ['scoring', 'energy'], 5, ['heat'])
    // Still schedulable — no 'heat' label, so it is never filtered...
    expect(isStoryInScope(burden, ls)).toBe(true)
    // ...but it reports the lost dimension so the UI can show it degraded, not blocked.
    const d = storyDegradation(burden, ls)
    expect(d.degraded).toBe(true)
    expect(d.lostDimensions).toEqual(['heat'])
  })

  it('IS filtered when its own threat (energy) is off — degradation only applies to amplifiers', () => {
    const ls = layers({ heat: true, energy: false })
    const burden = mkStory('burden', ['scoring', 'energy'], 5, ['heat'])
    expect(isStoryInScope(burden, ls)).toBe(false)
  })

  it('has no degradation for a story with no amplifiedBy', () => {
    const ls = layers({ heat: false })
    expect(storyDegradation(mkStory('plain', ['scoring']), ls).degraded).toBe(false)
  })
})
