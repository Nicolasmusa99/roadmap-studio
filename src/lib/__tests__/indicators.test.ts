import { describe, it, expect } from 'vitest'
import { computeRoadmapIndicators } from '../indicators'
import type { AppState, Story, Milestone } from '../types'

// ─── Calendar note ─────────────────────────────────────────────────────────────
// startDate 2026-09-01 is a Tuesday.
// 5 working days from Sep 01 (Tue): Sep 01, 02, 03, 04, Sep 07 → endDate = Sep 07.
// S2 after S1: starts Sep 08 (Tue), ends Sep 14 (Mon) — Sep 12–13 are weekend.

const CAL = { startDate: '2026-09-01', daysPerWeek: 5, holidays: [] }

const BASE: AppState = {
  components: [{ id: 'c1', name: 'Test' }],
  epics: [{ id: 'e1', componentId: 'c1', name: 'E1', isProtected: false }],
  stories: [],
  milestones: [],
  datasets: [],
  assumptionSections: [],
  assumptions: [],
  config: {
    calendarConfig: CAL,
    effortScale: [],
    riskLayers: [
      { id: 't1', name: 'Alpha', active: true },
      { id: 't2', name: 'Beta',  active: true },
    ],
    teamRoles: [
      { id: 'dev',    name: 'Dev',    people: 1 },
      { id: 'design', name: 'Design', people: 1 },
    ],
  },
}

function makeStory(id: string, days: number, deps: string[] = []): Story {
  return {
    id, epicId: 'e1', title: id, asA: '', iWant: '', soThat: '',
    useCases: [], rules: [],
    roleEfforts: [{ roleId: 'dev', days }],
    estimationState: 'manual', mvpPct: 55, mvpEnabled: false,
    dependsOn: deps,
    isDraft: false, isProtected: false, datasetIds: [], labels: [],
  }
}

function withStories(stories: Story[], milestones: Milestone[] = []): AppState {
  return { ...BASE, stories, milestones }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

describe('computeRoadmapIndicators — empty state', () => {
  it('returns zero story count and null projectedEnd when no stories', () => {
    const ind = computeRoadmapIndicators(BASE)
    expect(ind.storyCount).toBe(0)
    expect(ind.tagCount).toBe(2)
    expect(ind.roleCount).toBe(2)
    expect(ind.projectedEnd).toBeNull()
  })

  it('returns null nextCheckpoint when no milestones', () => {
    expect(computeRoadmapIndicators(BASE).nextCheckpoint).toBeNull()
  })
})

// ─── Projected end ────────────────────────────────────────────────────────────

describe('computeRoadmapIndicators — projectedEnd', () => {
  const s1 = makeStory('S1', 5)           // ends 2026-09-07
  const s2 = makeStory('S2', 5, ['S1'])   // ends 2026-09-14

  it('is null when stories have no roleEfforts (unestimated)', () => {
    const emptyStory: Story = { ...s1, roleEfforts: [] }
    const ind = computeRoadmapIndicators(withStories([emptyStory]))
    expect(ind.projectedEnd).toBeNull()
  })

  it('equals the max endDate across scheduled stories', () => {
    const ind = computeRoadmapIndicators(withStories([s1, s2]))
    // S2 finishes later (Sep 14) because it depends on S1 (Sep 07)
    expect(ind.projectedEnd).toBe('2026-09-14')
  })

  it('ignores blocked stories (role with 0 people) when computing max end', () => {
    // S_design uses the design role which has 0 capacity → blocked
    const sDesign: Story = {
      ...makeStory('SD', 5),
      roleEfforts: [{ roleId: 'design', days: 5 }],
    }
    const state: AppState = {
      ...withStories([s1, sDesign]),
      config: {
        ...BASE.config,
        teamRoles: [
          { id: 'dev',    name: 'Dev',    people: 1 },
          { id: 'design', name: 'Design', people: 0 }, // blocked
        ],
      },
    }
    const ind = computeRoadmapIndicators(state)
    // Only S1 (dev, unblocked) contributes → projectedEnd = Sep 07
    expect(ind.projectedEnd).toBe('2026-09-07')
  })

  it('returns null when all stories are blocked (role with 0 people)', () => {
    const state: AppState = {
      ...withStories([s1]),
      config: {
        ...BASE.config,
        teamRoles: [{ id: 'dev', name: 'Dev', people: 0 }],
      },
    }
    expect(computeRoadmapIndicators(state).projectedEnd).toBeNull()
  })
})

// ─── Counts ───────────────────────────────────────────────────────────────────

describe('computeRoadmapIndicators — counts', () => {
  it('storyCount reflects total stories including blocked ones', () => {
    const s1 = makeStory('S1', 5)
    const s2 = makeStory('S2', 3)
    const state: AppState = {
      ...withStories([s1, s2]),
      config: {
        ...BASE.config,
        teamRoles: [{ id: 'dev', name: 'Dev', people: 0 }],
      },
    }
    // Both stories are blocked due to 0 people, but storyCount still = 2
    expect(computeRoadmapIndicators(state).storyCount).toBe(2)
  })

  it('tagCount equals the number of riskLayers regardless of active state', () => {
    const state: AppState = {
      ...BASE,
      config: {
        ...BASE.config,
        riskLayers: [
          { id: 't1', name: 'A', active: true },
          { id: 't2', name: 'B', active: false },
          { id: 't3', name: 'C', active: true },
        ],
      },
    }
    expect(computeRoadmapIndicators(state).tagCount).toBe(3)
  })

  it('roleCount equals the number of teamRoles', () => {
    expect(computeRoadmapIndicators(BASE).roleCount).toBe(2)
  })
})

// ─── Next checkpoint ──────────────────────────────────────────────────────────

describe('computeRoadmapIndicators — nextCheckpoint', () => {
  const s1 = makeStory('S1', 5)  // ends 2026-09-07

  it('on-track: forecast ≤ target', () => {
    const ms: Milestone = { id: 'ms1', name: 'Alpha', target: '2026-09-15', storyIds: ['S1'] }
    const ind = computeRoadmapIndicators(withStories([s1], [ms]))
    // S1 ends Sep 07 ≤ target Sep 15 → ON-TRACK
    expect(ind.nextCheckpoint?.status).toBe('on-track')
    expect(ind.nextCheckpoint?.name).toBe('Alpha')
    expect(ind.nextCheckpoint?.gapWeeks).toBe(0)
  })

  it('at-risk: forecast > target — reports gapWeeks > 0', () => {
    // S1 ends Sep 07; target Sep 03 → late
    const ms: Milestone = { id: 'ms1', name: 'Alpha', target: '2026-09-03', storyIds: ['S1'] }
    const ind = computeRoadmapIndicators(withStories([s1], [ms]))
    expect(ind.nextCheckpoint?.status).toBe('at-risk')
    expect(ind.nextCheckpoint?.gapWeeks).toBeGreaterThan(0)
  })

  it('blocked: composing story has role with 0 people → status=blocked', () => {
    const state: AppState = {
      ...withStories([s1], [{ id: 'ms1', name: 'Alpha', target: '2026-12-01', storyIds: ['S1'] }]),
      config: {
        ...BASE.config,
        teamRoles: [{ id: 'dev', name: 'Dev', people: 0 }],
      },
    }
    expect(computeRoadmapIndicators(state).nextCheckpoint?.status).toBe('blocked')
  })

  it('picks the nearest (earliest target) milestone when multiple exist', () => {
    const ms1: Milestone = { id: 'ms1', name: 'Far',    target: '2026-12-01', storyIds: ['S1'] }
    const ms2: Milestone = { id: 'ms2', name: 'Near',   target: '2026-09-15', storyIds: ['S1'] }
    const ms3: Milestone = { id: 'ms3', name: 'Middle', target: '2026-10-01', storyIds: ['S1'] }
    const ind = computeRoadmapIndicators(withStories([s1], [ms1, ms2, ms3]))
    expect(ind.nextCheckpoint?.name).toBe('Near')
  })

  it('returns null nextCheckpoint when milestones array is empty', () => {
    expect(computeRoadmapIndicators(withStories([s1], [])).nextCheckpoint).toBeNull()
  })
})

// ─── Tag-scoped stories excluded from scheduling ──────────────────────────────

describe('computeRoadmapIndicators — scope filtering', () => {
  it('an inactive tag removes its stories from scheduling (projectedEnd shrinks)', () => {
    const s1 = makeStory('S1', 5)  // no labels, always in scope
    const s2: Story = { ...makeStory('S2', 5, ['S1']), labels: ['Alpha'] }
    const stateFiltered: AppState = {
      ...withStories([s1, s2]),
      config: {
        ...BASE.config,
        riskLayers: [{ id: 't1', name: 'Alpha', active: false }],
      },
    }
    // With Alpha off, S2 is out of scope → only S1 schedules
    const ind = computeRoadmapIndicators(stateFiltered)
    expect(ind.projectedEnd).toBe('2026-09-07')   // S1 only
    expect(ind.storyCount).toBe(2)                 // still counts S2 (in state.stories)
  })
})
