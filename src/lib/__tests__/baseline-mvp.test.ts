import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../data/baseline'
import { schedule } from '../scheduler'
import { storiesInScope, storyDegradation } from '../threats'
import { milestoneForecast } from '../milestones'
import type { AppState } from '../types'

// End-to-end through the exact production pipeline (threats → scheduler → forecast),
// pinning the invariant the whole tool is built around: the MVP checkpoint sits at
// +2 weeks. The energy pipeline (H-017/H-018/H-019) is sequenced after the MVP
// checkpoint precisely so it does NOT move this number. See the resource-leveling
// note: every role except design is serial, so any energy work scheduled before
// H-010 would push the MVP to +3wk.

function scheduleState(st: AppState) {
  return schedule({
    stories: storiesInScope(st.stories, st.config.riskLayers),
    teamRoles: st.config.teamRoles,
    calendarConfig: st.config.calendarConfig,
  })
}

describe('baseline MVP forecast — the +2wk invariant', () => {
  it('MVP checkpoint forecasts to 2026-11-10, at-risk by +2 weeks', () => {
    const st = createInitialState()
    const sched = scheduleState(st)
    const mvp = st.milestones.find(m => m.id === 'ms-mvp')!
    const f = milestoneForecast(mvp, sched, st.config.calendarConfig)
    expect(f.status).toBe('at-risk')
    expect(f.gapWeeks).toBe(2)
    expect(f.forecast).toBe('2026-11-10')
  })

  it('the energy pipeline is scheduled AFTER the MVP checkpoint (H-010)', () => {
    const st = createInitialState()
    const sched = scheduleState(st)
    const end = (id: string) => sched.find(s => s.storyId === id)!
    const h010End = end('H-010').endDate
    for (const id of ['H-017', 'H-018', 'H-019']) {
      const s = end(id)
      expect(s.blocked).toBe(false)
      // starts strictly after the MVP checkpoint finishes
      expect(s.startDate > h010End).toBe(true)
    }
  })

  it('energy stories all exist and none are blocked in the baseline', () => {
    const st = createInitialState()
    const sched = scheduleState(st)
    for (const id of ['H-017', 'H-018', 'H-019']) {
      expect(st.stories.some(s => s.id === id)).toBe(true)
      expect(sched.find(s => s.storyId === id)!.blocked).toBe(false)
    }
  })
})

describe('heat↔energy degradation cross on the baseline', () => {
  it('turning heat off keeps the energy burden score in scope but degraded', () => {
    const st = createInitialState()
    st.config.riskLayers = st.config.riskLayers.map(l =>
      l.name === 'heat' ? { ...l, active: false } : l,
    )
    const burden = st.stories.find(s => s.id === 'H-018')!
    // Not filtered — no heat label, so it survives with reduced precision.
    expect(storiesInScope(st.stories, st.config.riskLayers).some(s => s.id === 'H-018')).toBe(true)
    const d = storyDegradation(burden, st.config.riskLayers)
    expect(d.degraded).toBe(true)
    expect(d.lostDimensions).toContain('heat')
  })

  it('turning energy off DOES remove the energy burden score entirely', () => {
    const st = createInitialState()
    st.config.riskLayers = st.config.riskLayers.map(l =>
      l.name === 'energy' ? { ...l, active: false } : l,
    )
    expect(storiesInScope(st.stories, st.config.riskLayers).some(s => s.id === 'H-018')).toBe(false)
  })
})
