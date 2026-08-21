import { describe, it, expect } from 'vitest'
import { schedule } from '../scheduler'
import { storiesInScope, storyDegradation, scopeSummary } from '../threats'
import { milestoneForecast } from '../milestones'
import { removeStoryFromState, dependentsOf } from '../mutations'
import type { AppState, Story, TeamRole, CalendarConfig } from '../types'

// End-to-end engine coverage on a SYNTHETIC roadmap (no case-study data). This
// replaces the pipeline assertions the old `baseline-mvp.test.ts` made against
// Lumeria's seed content: it drives the exact production path
// (threats → scheduler → forecast → degradation → deletion) so the integration
// stays pinned even though the baseline is now empty.

const cal: CalendarConfig = { startDate: '2026-08-24', daysPerWeek: 5, holidays: [] }
const roles: TeamRole[] = [
  { id: 'eng',    name: 'Engineer',        people: 1 },
  { id: 'design', name: 'Product Designer', people: 1 },
]

function mk(over: Partial<Story> & Pick<Story, 'id' | 'epicId'>): Story {
  return {
    title: over.id, asA: '', iWant: '', soThat: '',
    useCases: [], rules: [],
    roleEfforts: [], estimationState: 'manual',
    mvpPct: 50, mvpEnabled: false,
    dependsOn: [], isDraft: false, isProtected: false,
    datasetIds: [], labels: [],
    ...over,
  }
}

// A minimal roadmap that mirrors the generic shapes the engine must handle:
// a serial dependency chain, a parallel branch on a second role, a label-gated
// story and an amplified (degradable) story.
function makeRoadmap(): AppState {
  const stories: Story[] = [
    mk({ id: 'S1', epicId: 'epic-a', roleEfforts: [{ roleId: 'eng', days: 5 }], labels: ['alpha'] }),
    mk({ id: 'S2', epicId: 'epic-a', roleEfforts: [{ roleId: 'eng', days: 5 }], dependsOn: ['S1'] }),
    mk({ id: 'S3', epicId: 'epic-b', roleEfforts: [{ roleId: 'design', days: 5 }], labels: ['beta'], amplifiedBy: ['alpha'] }),
  ]
  return {
    components: [{ id: 'comp', name: 'Roadmap' }],
    epics: [
      { id: 'epic-a', componentId: 'comp', name: 'A', isProtected: false },
      { id: 'epic-b', componentId: 'comp', name: 'B', isProtected: false },
    ],
    stories,
    milestones: [],
    datasets: [],
    assumptionSections: [],
    assumptions: [],
    config: { calendarConfig: cal, effortScale: [], riskLayers: [
      { id: 'l-alpha', name: 'alpha', active: true },
      { id: 'l-beta',  name: 'beta',  active: true },
    ], teamRoles: roles },
  }
}

function scheduleState(st: AppState) {
  return schedule({
    stories: storiesInScope(st.stories, st.config.riskLayers),
    teamRoles: st.config.teamRoles,
    calendarConfig: st.config.calendarConfig,
  })
}

describe('scheduler: dependencies + resource leveling', () => {
  it('runs a dependency chain serially and a second-role branch in parallel', () => {
    const st = makeRoadmap()
    const sched = scheduleState(st)
    const end = (id: string) => sched.find(s => s.storyId === id)!

    // No blocks anywhere.
    for (const s of sched) expect(s.blocked).toBe(false)

    // S2 depends on S1 → starts strictly after S1 ends.
    expect(end('S2').startDate > end('S1').endDate).toBe(true)

    // S1 (eng) and S3 (design) use different roles → both start on the first working day.
    expect(end('S1').startDate).toBe('2026-08-24')
    expect(end('S3').startDate).toBe('2026-08-24')
  })

  it('a role at 0 people blocks its stories', () => {
    const st = makeRoadmap()
    st.config.teamRoles = st.config.teamRoles.map(r => r.id === 'eng' ? { ...r, people: 0 } : r)
    const sched = scheduleState(st)
    // S1 blocked (role-unavailable) and S2 blocked downstream of it.
    expect(sched.find(s => s.storyId === 'S1')!.blocked).toBe(true)
    expect(sched.find(s => s.storyId === 'S2')!.blocked).toBe(true)
    // S3 uses design → still schedules.
    expect(sched.find(s => s.storyId === 'S3')!.blocked).toBe(false)
  })
})

describe('threat scoping mechanism (generic, no case-study threats)', () => {
  it('turning a threat off filters the stories carrying its label', () => {
    const st = makeRoadmap()
    st.config.riskLayers = st.config.riskLayers.map(l => l.name === 'beta' ? { ...l, active: false } : l)
    const inScope = storiesInScope(st.stories, st.config.riskLayers).map(s => s.id)
    expect(inScope).toContain('S1')
    expect(inScope).toContain('S2')
    expect(inScope).not.toContain('S3') // S3 carries the 'beta' label
  })

  it('an amplified story survives (degraded) when its amplifier goes off', () => {
    const st = makeRoadmap()
    st.config.riskLayers = st.config.riskLayers.map(l => l.name === 'alpha' ? { ...l, active: false } : l)
    // S3 has no 'alpha' label, only amplifiedBy — it is NOT filtered out.
    expect(storiesInScope(st.stories, st.config.riskLayers).some(s => s.id === 'S3')).toBe(true)
    const d = storyDegradation(st.stories.find(s => s.id === 'S3')!, st.config.riskLayers)
    expect(d.degraded).toBe(true)
    expect(d.lostDimensions).toContain('alpha')
    // S1 (carries the 'alpha' label) IS filtered out.
    expect(storiesInScope(st.stories, st.config.riskLayers).some(s => s.id === 'S1')).toBe(false)
  })

  it('scope summary reports effort-weighted % of the surviving work', () => {
    const st = makeRoadmap()
    expect(scopeSummary(st.stories, st.config.riskLayers).pct).toBe(100)
    st.config.riskLayers = st.config.riskLayers.map(l => l.name === 'beta' ? { ...l, active: false } : l)
    const sum = scopeSummary(st.stories, st.config.riskLayers)
    expect(sum.pct).toBeLessThan(100)
    expect(sum.storiesInScope).toBe(2)
  })
})

describe('milestone forecast: target vs forecast gap', () => {
  it('flags at-risk with a positive gap when the forecast exceeds the target', () => {
    const st = makeRoadmap()
    const sched = scheduleState(st)
    const f = milestoneForecast(
      { id: 'm', name: 'Cut', target: '2026-09-01', storyIds: ['S2'] },
      sched, cal,
    )
    expect(f.status).toBe('at-risk')
    expect(f.forecast).toBe('2026-09-04')
    expect(f.gapWeeks).toBeGreaterThan(0)
  })

  it('is on-track when the target is beyond the forecast', () => {
    const st = makeRoadmap()
    const sched = scheduleState(st)
    const f = milestoneForecast(
      { id: 'm', name: 'Cut', target: '2026-12-31', storyIds: ['S2'] },
      sched, cal,
    )
    expect(f.status).toBe('on-track')
    expect(f.gapWeeks).toBe(0)
  })
})

describe('scheduler: people count scales duration (TC-people)', () => {
  it('doubling role headcount halves duration (no deps, single role)', () => {
    const story = mk({ id: 'S', epicId: 'epic-a', roleEfforts: [{ roleId: 'eng', days: 10 }] })
    const base = schedule({
      stories: [story],
      teamRoles: [{ id: 'eng', name: 'Engineer', people: 1 }],
      calendarConfig: cal,
    })
    const scaled = schedule({
      stories: [story],
      teamRoles: [{ id: 'eng', name: 'Engineer', people: 2 }],
      calendarConfig: cal,
    })
    expect(base[0].durationDays).toBe(10)  // 10d / (5dpw * 1p) = 2 weeks = 10d
    expect(scaled[0].durationDays).toBe(5) // 10d / (5dpw * 2p) = 1 week = 5d
  })

  it('4 people on a 10-day story yields 1 week (ceil rounds up fractional weeks)', () => {
    const story = mk({ id: 'S', epicId: 'epic-a', roleEfforts: [{ roleId: 'eng', days: 10 }] })
    const sched = schedule({
      stories: [story],
      teamRoles: [{ id: 'eng', name: 'Engineer', people: 4 }],
      calendarConfig: cal,
    })
    // 10 / (5 * 4) = 0.5 weeks → ceil(0.5) = 1 week = 5d
    expect(sched[0].durationDays).toBe(5)
  })
})

describe('deleting a story cleans up its dependents (no orphans)', () => {
  it('removing S1 strips it from S2.dependsOn and everything still schedules', () => {
    const st0 = makeRoadmap()
    expect(dependentsOf(st0, 'S1').map(s => s.id)).toContain('S2')

    const st1 = removeStoryFromState(st0, 'S1')
    expect(st1.stories.some(s => s.id === 'S1')).toBe(false)
    for (const s of st1.stories) expect(s.dependsOn).not.toContain('S1')

    const sched = scheduleState(st1)
    expect(sched.every(s => s.blockedReason !== 'not-scheduled')).toBe(true)
    expect(sched.find(s => s.storyId === 'S2')!.blocked).toBe(false)
  })
})
