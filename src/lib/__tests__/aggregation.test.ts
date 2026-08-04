import { describe, it, expect } from 'vitest'
import {
  storyTotalDays,
  effortByRole,
  epicEffortDays,
  componentEffortDays,
  epicWindow,
} from '../aggregation'
import type { Story, Epic, ScheduledStory } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mkStory = (id: string, epicId: string, roleDays: [string, number][]): Story => ({
  id,
  epicId,
  title: id,
  asA: '', iWant: '', soThat: '',
  useCases: [], rules: [],
  roleEfforts: roleDays.map(([roleId, days]) => ({ roleId, days })),
  estimationState: 'manual',
  mvpPct: 50,
  mvpEnabled: false,
  dependsOn: [],
  isDraft: false,
  isProtected: false,
  datasetIds: [],
  labels: [],
})

const mkEpic = (id: string, componentId: string): Epic => ({
  id, componentId, name: id, isProtected: false,
})

const mkScheduled = (
  storyId: string,
  start: string,
  end: string,
  blocked = false,
): ScheduledStory => ({ storyId, startDate: start, endDate: end, durationDays: 0, blocked })

// ─── storyTotalDays ───────────────────────────────────────────────────────────

describe('storyTotalDays', () => {
  it('sums all role efforts', () => {
    expect(storyTotalDays(mkStory('s', 'e', [['data', 8], ['full', 2]]))).toBe(10)
  })
  it('returns 0 for no role efforts', () => {
    expect(storyTotalDays(mkStory('s', 'e', []))).toBe(0)
  })
})

// ─── epicEffortDays — TC-045 ──────────────────────────────────────────────────

describe('epicEffortDays — TC-045: SUM not average', () => {
  it('8d story + 2d story = 10d (not 5d average)', () => {
    const stories = [
      mkStory('s1', 'epic-a', [['data', 8]]),
      mkStory('s2', 'epic-a', [['data', 2]]),
    ]
    expect(epicEffortDays('epic-a', stories)).toBe(10) // sum, NOT 5 (average)
  })

  it('only includes stories of the specified epic', () => {
    const stories = [
      mkStory('s1', 'epic-a', [['data', 8]]),
      mkStory('s2', 'epic-b', [['data', 100]]), // different epic
    ]
    expect(epicEffortDays('epic-a', stories)).toBe(8)
  })

  it('multi-role story: sums all roles in total effort', () => {
    const stories = [mkStory('s1', 'e', [['data', 10], ['full', 5]])]
    expect(epicEffortDays('e', stories)).toBe(15)
  })

  it('empty epic returns 0', () => {
    expect(epicEffortDays('empty', [])).toBe(0)
  })

  it('three stories sum correctly (not any kind of average)', () => {
    const stories = [
      mkStory('s1', 'e', [['data', 5]]),
      mkStory('s2', 'e', [['data', 3]]),
      mkStory('s3', 'e', [['full', 2]]),
    ]
    expect(epicEffortDays('e', stories)).toBe(10) // 5+3+2=10, not (5+3+2)/3=3.3
  })
})

// ─── componentEffortDays ─────────────────────────────────────────────────────

describe('componentEffortDays', () => {
  it('sums effort across all epics in the component', () => {
    const epics = [mkEpic('e1', 'c1'), mkEpic('e2', 'c1'), mkEpic('e3', 'c2')]
    const stories = [
      mkStory('s1', 'e1', [['data', 5]]),
      mkStory('s2', 'e2', [['full', 3]]),
      mkStory('s3', 'e3', [['data', 100]]), // different component — must not count
    ]
    expect(componentEffortDays('c1', epics, stories)).toBe(8)
  })
})

// ─── effortByRole ─────────────────────────────────────────────────────────────

describe('effortByRole', () => {
  it('aggregates days by role across stories', () => {
    const stories = [
      mkStory('s1', 'e', [['data', 5], ['ai', 3]]),
      mkStory('s2', 'e', [['data', 5], ['full', 2]]),
    ]
    const map = effortByRole(stories)
    expect(map.get('data')).toBe(10)
    expect(map.get('ai')).toBe(3)
    expect(map.get('full')).toBe(2)
  })
})

// ─── epicWindow — TC-046: effort ≠ duration ───────────────────────────────────

describe('epicWindow — TC-046', () => {
  const stories = [mkStory('s1', 'e', [['data', 5]]), mkStory('s2', 'e', [['full', 3]])]

  it('returns min start and max end from scheduled stories', () => {
    const schedule = [
      mkScheduled('s1', '2026-08-24', '2026-08-28'),
      mkScheduled('s2', '2026-08-31', '2026-09-02'),
    ]
    const w = epicWindow('e', stories, schedule)
    expect(w?.startDate).toBe('2026-08-24')
    expect(w?.endDate).toBe('2026-09-02')
  })

  it('ignores blocked stories', () => {
    const schedule = [
      mkScheduled('s1', '2026-08-24', '2026-08-28'),
      mkScheduled('s2', '2026-08-24', '2026-09-09', true), // blocked
    ]
    const w = epicWindow('e', stories, schedule)
    expect(w?.endDate).toBe('2026-08-28') // blocked s2 excluded
  })

  it('returns null when all stories are blocked', () => {
    const schedule = [mkScheduled('s1', '', '', true)]
    expect(epicWindow('e', [mkStory('s1', 'e', [])], schedule)).toBeNull()
  })

  it('parallel execution: effort (8d) ≠ duration window (5d) — TC-046', () => {
    // s1 (data, 5d) and s2 (fullstack, 3d) run in parallel from the same start
    const schedule = [
      mkScheduled('s1', '2026-08-24', '2026-08-28'), // 5 days
      mkScheduled('s2', '2026-08-24', '2026-08-26'), // 3 days, overlapping
    ]
    const effort = epicEffortDays('e', stories)   // 5+3 = 8 days of work
    const w = epicWindow('e', stories, schedule)  // window = Aug24–Aug28 = 5 days duration
    expect(effort).toBe(8)
    expect(w?.endDate).toBe('2026-08-28')
    // 8 days of effort, but only 5 calendar working days — they differ
    expect(effort).not.toBe(5)
  })
})
