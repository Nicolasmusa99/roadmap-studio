import { describe, it, expect } from 'vitest'
import { createInitialState } from '../../data/baseline'
import { schedule } from '../scheduler'
import { storiesInScope } from '../threats'

// Replaces the old Lumeria-coupled `baseline-mvp.test.ts`. That file pinned the
// case-study's "+2wk MVP" forecast, the energy-pipeline sequencing and the
// heat↔energy degradation cross — all of which described Lumeria SEED DATA, not
// engine behaviour, and were removed when the baseline was emptied. The engine
// paths they exercised end-to-end are now covered on a synthetic roadmap in
// `engine-e2e.test.ts`. Here we only pin that the factory baseline is EMPTY and
// generic, so `reset` (invariant #13) returns a blank board.

describe('empty / generic baseline', () => {
  it('ships no case-study content', () => {
    const st = createInitialState()
    expect(st.stories).toEqual([])
    expect(st.epics).toEqual([])
    expect(st.milestones).toEqual([])
    expect(st.datasets).toEqual([])
    expect(st.assumptions).toEqual([])
    expect(st.config.riskLayers).toEqual([])
  })

  it('keeps a single neutral root component so epics can be created', () => {
    const st = createInitialState()
    expect(st.components).toHaveLength(1)
    // No component id from the Lumeria case study survives.
    expect(st.components.map(c => c.id)).not.toContain('comp-data')
  })

  it('keeps a usable engine config: effort scale, calendar and a starter team', () => {
    const st = createInitialState()
    expect(st.config.effortScale.length).toBeGreaterThan(0)
    expect(st.config.calendarConfig.daysPerWeek).toBe(5)
    expect(st.config.calendarConfig.holidays.length).toBeGreaterThan(0)
    expect(st.config.teamRoles.length).toBeGreaterThan(0)
  })

  it('schedules to an empty timeline with no work in it', () => {
    const st = createInitialState()
    const sched = schedule({
      stories: storiesInScope(st.stories, st.config.riskLayers),
      teamRoles: st.config.teamRoles,
      calendarConfig: st.config.calendarConfig,
    })
    expect(sched).toEqual([])
  })

  it('createInitialState returns an independent deep copy (mutations never touch BASELINE)', () => {
    const a = createInitialState()
    const b = createInitialState()
    a.components[0].name = 'Mutated'
    expect(b.components[0].name).not.toBe('Mutated')
  })
})
