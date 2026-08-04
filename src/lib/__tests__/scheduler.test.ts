import { describe, it, expect } from 'vitest'
import { schedule } from '../scheduler'
import type { Story, SchedulerInput } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Build a story with the minimum fields needed for the scheduler
const mkStory = (
  id: string,
  roleDays: [string, number][],
  dependsOn: string[] = [],
  mvpEnabled = false,
  mvpPct = 50,
): Story => ({
  id,
  epicId: 'e',
  title: id,
  asA: '', iWant: '', soThat: '',
  useCases: [], rules: [],
  roleEfforts: roleDays.map(([roleId, days]) => ({ roleId, days })),
  estimationState: 'manual',
  mvpPct,
  mvpEnabled,
  dependsOn,
  isDraft: false,
  isProtected: false,
  datasetIds: [],
  labels: [],
})

// Build a SchedulerInput with no holidays (predictable date arithmetic)
const mkInput = (
  stories: Story[],
  rolePeople: [string, number][],
  daysPerWeek = 5,
): SchedulerInput => ({
  stories,
  teamRoles: rolePeople.map(([id, people]) => ({ id, name: id, people })),
  riskLayers: [],
  calendarConfig: {
    startDate: '2026-08-24', // Monday
    daysPerWeek,
    holidays: [],            // no holidays → fully predictable dates
  },
})

const get = (result: ReturnType<typeof schedule>, id: string) =>
  result.find(s => s.storyId === id)!

// ─── TC-014: bottleneck role determines duration ──────────────────────────────

describe('schedule — TC-014: bottleneck role', () => {
  it('Data=10d(1p) + Full=5d(2p), daysPerWeek=5 → durationDays=10 (Data is bottleneck)', () => {
    const story = mkStory('s', [['data', 10], ['full', 5]])
    const result = schedule(mkInput([story], [['data', 1], ['full', 2]]))
    const s = get(result, 's')
    expect(s.blocked).toBe(false)
    expect(s.durationDays).toBe(10) // ceil(max(10/(5*1), 5/(5*2)))*5 = ceil(2)*5
  })

  it('bottleneck is Data not Full: Full alone would give 5d', () => {
    // Full=5d (2p): ceil(5/(5*2))=1 week → 5 days; Data=10d: 2 weeks → 10 days
    const story = mkStory('s', [['data', 10], ['full', 5]])
    const result = schedule(mkInput([story], [['data', 1], ['full', 2]]))
    expect(get(result, 's').durationDays).toBe(10) // NOT 5
  })

  it('start = 2026-08-24, end = 2026-09-04 (10 working days)', () => {
    const story = mkStory('s', [['data', 10], ['full', 5]])
    const result = schedule(mkInput([story], [['data', 1], ['full', 2]]))
    const s = get(result, 's')
    expect(s.startDate).toBe('2026-08-24')
    expect(s.endDate).toBe('2026-09-04') // addWorkingDays(Aug24, 9) = Sep4
  })
})

// ─── TC-015: daysPerWeek=5 drives the conversion ─────────────────────────────

describe('schedule — TC-015: daysPerWeek=5 in duration calc', () => {
  it('Data=10d(1p), daysPerWeek=5 → durationDays=10', () => {
    const story = mkStory('s', [['data', 10]])
    const result = schedule(mkInput([story], [['data', 1]], 5))
    expect(get(result, 's').durationDays).toBe(10)
  })

  it('start Aug24, durationDays=10 → end Sep4', () => {
    const story = mkStory('s', [['data', 10]])
    const result = schedule(mkInput([story], [['data', 1]], 5))
    expect(get(result, 's').endDate).toBe('2026-09-04')
  })
})

// ─── TC-016: changing daysPerWeek recalculates ───────────────────────────────

describe('schedule — TC-016: daysPerWeek=4 recalculates duration', () => {
  it('Data=10d(1p), daysPerWeek=4 → durationDays=12 (ceil(10/4)*4 = 3*4)', () => {
    const story = mkStory('s', [['data', 10]])
    const result = schedule(mkInput([story], [['data', 1]], 4))
    expect(get(result, 's').durationDays).toBe(12)
  })

  it('same effort, daysPerWeek=4 → ends later than daysPerWeek=5', () => {
    const story = mkStory('s', [['data', 10]])
    const r5 = schedule(mkInput([story], [['data', 1]], 5))
    const r4 = schedule(mkInput([story], [['data', 1]], 4))
    expect(r4[0].endDate > r5[0].endDate).toBe(true) // ends later with 4d/week
  })

  it('daysPerWeek=4: end = Aug24 + 11 working days = Sep8', () => {
    // durationDays=12 → addWorkingDays(Aug24, 11) = Sep8
    // Aug25..Aug28=4, Aug31..Sep4=9, Sep7=10, Sep8=11 → Sep8
    const story = mkStory('s', [['data', 10]])
    const result = schedule(mkInput([story], [['data', 1]], 4))
    expect(get(result, 's').endDate).toBe('2026-09-08')
  })
})

// ─── Resource leveling: same role → sequential ───────────────────────────────

describe('schedule — resource leveling: same role runs sequentially', () => {
  it('story B (same Data role) starts only after story A releases it', () => {
    // A: Data=5d → occupies Aug24–Aug28; Data free from Aug31
    // B: Data=3d → must start Aug31 (not Aug24)
    const storyA = mkStory('A', [['data', 5]])
    const storyB = mkStory('B', [['data', 3]])
    const result = schedule(mkInput([storyA, storyB], [['data', 1]]))
    const a = get(result, 'A')
    const b = get(result, 'B')
    expect(a.startDate).toBe('2026-08-24')
    expect(a.endDate).toBe('2026-08-28')   // 5d = 1 week = Aug24–Aug28
    expect(b.startDate).toBe('2026-08-31') // waits for Data role to be free
  })

  it('B cannot start before A ends when they share a role', () => {
    const storyA = mkStory('A', [['data', 5]])
    const storyB = mkStory('B', [['data', 3]])
    const result = schedule(mkInput([storyA, storyB], [['data', 1]]))
    expect(get(result, 'B').startDate > get(result, 'A').endDate).toBe(true)
  })
})

// ─── Resource leveling: different roles → parallel ───────────────────────────

describe('schedule — resource leveling: different roles run in parallel', () => {
  it('story C (Full role) starts on same day as story A (Data role)', () => {
    const storyA = mkStory('A', [['data', 5]])
    const storyC = mkStory('C', [['full', 3]])
    const result = schedule(mkInput([storyA, storyC], [['data', 1], ['full', 1]]))
    const a = get(result, 'A')
    const c = get(result, 'C')
    expect(a.startDate).toBe('2026-08-24')
    expect(c.startDate).toBe('2026-08-24') // parallel — same start!
  })

  it('roles do not block each other: A occupies Data, C uses Full independently', () => {
    const storyA = mkStory('A', [['data', 10]]) // 2 weeks
    const storyC = mkStory('C', [['full', 5]])   // 1 week
    const result = schedule(mkInput([storyA, storyC], [['data', 1], ['full', 1]]))
    // C ends after 1 week (Aug28), A ends after 2 weeks (Sep4)
    expect(get(result, 'C').endDate).toBe('2026-08-28')
    expect(get(result, 'A').endDate).toBe('2026-09-04')
  })
})

// ─── TC-020: role with 0 people → blocked ────────────────────────────────────

describe('schedule — TC-020: role at 0 people → story blocked', () => {
  it('story requiring Data when data=0 is blocked', () => {
    const story = mkStory('s', [['data', 5]])
    const result = schedule(mkInput([story], [['data', 0]]))
    expect(get(result, 's').blocked).toBe(true)
    expect(get(result, 's').blockedReason).toBe('role-unavailable')
  })

  it('story requiring Full when full=0 is blocked even if data is available', () => {
    const story = mkStory('s', [['data', 5], ['full', 3]])
    const result = schedule(mkInput([story], [['data', 1], ['full', 0]]))
    expect(get(result, 's').blocked).toBe(true)
  })

  it('story with no role requirement is not blocked by unrelated zero-people role', () => {
    const story = mkStory('s', [['full', 5]])
    const result = schedule(mkInput([story], [['data', 0], ['full', 1]]))
    expect(get(result, 's').blocked).toBe(false)
  })

  it('downstream story depending on blocked story is also blocked (TC-020 propagation)', () => {
    const blocked = mkStory('A', [['data', 5]])
    const downstream = mkStory('B', [['full', 3]], ['A']) // B depends on A
    const result = schedule(mkInput([blocked, downstream], [['data', 0], ['full', 1]]))
    expect(get(result, 'A').blocked).toBe(true)
    expect(get(result, 'B').blocked).toBe(true)
    expect(get(result, 'B').blockedReason).toBe('dependency-blocked')
  })

  it('all stories requiring blocked role are blocked (TC-020)', () => {
    const s1 = mkStory('s1', [['data', 5]])
    const s2 = mkStory('s2', [['data', 3]])
    const s3 = mkStory('s3', [['full', 5]]) // different role — not blocked
    const result = schedule(mkInput([s1, s2, s3], [['data', 0], ['full', 1]]))
    expect(get(result, 's1').blocked).toBe(true)
    expect(get(result, 's2').blocked).toBe(true)
    expect(get(result, 's3').blocked).toBe(false) // unaffected
  })
})

// ─── Dependency ordering ──────────────────────────────────────────────────────

describe('schedule — dependency ordering', () => {
  it('story B depending on A starts after A ends', () => {
    const storyA = mkStory('A', [['full', 5]])
    const storyB = mkStory('B', [['data', 5]], ['A']) // B needs A done first
    const result = schedule(mkInput([storyA, storyB], [['full', 1], ['data', 1]]))
    const a = get(result, 'A')
    const b = get(result, 'B')
    expect(a.endDate).toBe('2026-08-28')
    expect(b.startDate).toBe('2026-08-31') // first working day after Aug28
  })

  it('dependency takes precedence over role availability', () => {
    // A (data, 5d) and B (data, 3d) depend on C (full, 2d).
    // B must wait for BOTH C (dep) AND Data role freed by A.
    const c = mkStory('C', [['full', 2]])            // 1 week (Aug24–Aug28)
    const a = mkStory('A', [['data', 5]], ['C'])      // waits for C, starts Aug31
    const b = mkStory('B', [['data', 3]], ['C'])      // waits for C + Data from A
    const result = schedule(mkInput([c, a, b], [['full', 1], ['data', 1]]))
    const rc = get(result, 'C')
    const ra = get(result, 'A')
    const rb = get(result, 'B')
    expect(rc.startDate).toBe('2026-08-24')
    expect(ra.startDate).toBe('2026-08-31') // after C (dep) + data free
    expect(rb.startDate).toBe('2026-09-07') // after C (dep) + data freed by A
  })

  it('independent stories (no shared roles or deps) both start on globalStart', () => {
    const s1 = mkStory('s1', [['data', 5]])
    const s2 = mkStory('s2', [['full', 3]])
    const result = schedule(mkInput([s1, s2], [['data', 1], ['full', 1]]))
    expect(get(result, 's1').startDate).toBe('2026-08-24')
    expect(get(result, 's2').startDate).toBe('2026-08-24')
  })
})

// ─── Start date handling ──────────────────────────────────────────────────────

describe('schedule — start date', () => {
  it('uses calendarConfig.startDate as the first working day', () => {
    const story = mkStory('s', [['data', 5]])
    const result = schedule(mkInput([story], [['data', 1]]))
    expect(get(result, 's').startDate).toBe('2026-08-24')
  })

  it('advances to next working day if startDate falls on a weekend', () => {
    const story = mkStory('s', [['data', 5]])
    const result = schedule({
      stories: [story],
      teamRoles: [{ id: 'data', name: 'data', people: 1 }],
      riskLayers: [],
      calendarConfig: { startDate: '2026-08-22', daysPerWeek: 5, holidays: [] }, // Saturday
    })
    expect(get(result, 's').startDate).toBe('2026-08-24') // advances to Monday
  })
})

// ─── Zero-effort stories ──────────────────────────────────────────────────────

describe('schedule — story with no role efforts', () => {
  it('schedules at globalStart with durationDays=0 and does not block any roles', () => {
    const empty = mkStory('empty', []) // no roleEfforts
    const other = mkStory('other', [['data', 5]])
    const result = schedule(mkInput([empty, other], [['data', 1]]))
    const e = get(result, 'empty')
    const o = get(result, 'other')
    expect(e.blocked).toBe(false)
    expect(e.durationDays).toBe(0)
    expect(e.startDate).toBe('2026-08-24')
    expect(o.startDate).toBe('2026-08-24') // not blocked by empty story
  })
})

// ─── Risk layers and MVP mult ─────────────────────────────────────────────────

describe('schedule — scope multiplier (risk layers)', () => {
  it('with 1 of 2 layers active: mult=0.5 → durationDays halved (rounded to week)', () => {
    const story = mkStory('s', [['data', 10]])
    const result = schedule({
      stories: [story],
      teamRoles: [{ id: 'data', name: 'data', people: 1 }],
      riskLayers: [
        { id: 'r1', name: 'calor', active: true },
        { id: 'r2', name: 'flood', active: false },
      ],
      calendarConfig: { startDate: '2026-08-24', daysPerWeek: 5, holidays: [] },
    })
    // mult=0.5; maxRatio = 10*0.5/(5*1) = 1; durationWeeks=1; durationDays=5
    expect(get(result, 's').durationDays).toBe(5)
  })
})

describe('schedule — MVP multiplier', () => {
  it('mvpEnabled with mvpPct=50 reduces effort to half', () => {
    const story = mkStory('s', [['data', 10]], [], true, 50) // mvpEnabled, 50%
    const result = schedule(mkInput([story], [['data', 1]]))
    // mult=0.5; 10*0.5/(5*1) = 1 week = 5 days
    expect(get(result, 's').durationDays).toBe(5)
  })

  it('mvpPct=45 (AI story) rounds up to whole week', () => {
    // TC-032: esfuerzo Full=10d, MVP 45% → 10*0.45=4.5d → ceil(4.5/5)*5 = 5d
    const story = mkStory('s', [['ai', 10]], [], true, 45)
    const result = schedule(mkInput([story], [['ai', 1]]))
    expect(get(result, 's').durationDays).toBe(5)
  })
})
