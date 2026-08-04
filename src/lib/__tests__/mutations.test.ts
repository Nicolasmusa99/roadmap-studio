import { describe, it, expect } from 'vitest'
import { removeStoryFromState, removeEpicFromState } from '../mutations'
import type { AppState } from '../types'

// ─── Minimal fixture ──────────────────────────────────────────────────────────

const BASE: AppState = {
  components: [{ id: 'c1', name: 'C1' }],
  epics: [
    { id: 'e1', componentId: 'c1', name: 'E1', isProtected: false },
    { id: 'e2', componentId: 'c1', name: 'E2', isProtected: false },
  ],
  stories: [
    {
      id: 'S1', epicId: 'e1', title: 'S1', asA: '', iWant: '', soThat: '',
      useCases: [], rules: [], roleEfforts: [], estimationState: 'manual',
      mvpPct: 55, mvpEnabled: false, dependsOn: [],
      isDraft: false, isProtected: false, datasetIds: [], labels: [],
    },
    {
      id: 'S2', epicId: 'e1', title: 'S2', asA: '', iWant: '', soThat: '',
      useCases: [], rules: [], roleEfforts: [], estimationState: 'manual',
      mvpPct: 55, mvpEnabled: false, dependsOn: ['S1'],
      isDraft: false, isProtected: false, datasetIds: [], labels: [],
    },
    {
      id: 'S3', epicId: 'e2', title: 'S3', asA: '', iWant: '', soThat: '',
      useCases: [], rules: [], roleEfforts: [], estimationState: 'manual',
      mvpPct: 55, mvpEnabled: false, dependsOn: ['S1'],
      isDraft: false, isProtected: false, datasetIds: [], labels: [],
    },
  ],
  milestones: [{ id: 'ms1', name: 'M1', target: '2026-10-01', storyIds: ['S1', 'S2'] }],
  datasets: [],
  config: {
    calendarConfig: { startDate: '2026-08-24', daysPerWeek: 5, holidays: [] },
    effortScale: [],
    riskLayers: [],
    teamRoles: [],
  },
}

// ─── removeStoryFromState ─────────────────────────────────────────────────────

describe('removeStoryFromState', () => {
  it('removes the target story', () => {
    const result = removeStoryFromState(BASE, 'S1')
    expect(result.stories.map(s => s.id)).not.toContain('S1')
    expect(result.stories).toHaveLength(2)
  })

  it('removes the story ID from dependsOn of all other stories', () => {
    const result = removeStoryFromState(BASE, 'S1')
    expect(result.stories.find(s => s.id === 'S2')!.dependsOn).toEqual([])
    expect(result.stories.find(s => s.id === 'S3')!.dependsOn).toEqual([])
  })

  it('removes the story ID from milestone storyIds', () => {
    const result = removeStoryFromState(BASE, 'S1')
    expect(result.milestones[0].storyIds).not.toContain('S1')
    expect(result.milestones[0].storyIds).toContain('S2')
  })

  it('does not mutate the original state', () => {
    removeStoryFromState(BASE, 'S1')
    expect(BASE.stories).toHaveLength(3)
  })
})

// ─── removeEpicFromState ──────────────────────────────────────────────────────

describe('removeEpicFromState', () => {
  it('removes the epic', () => {
    const result = removeEpicFromState(BASE, 'e1')
    expect(result.epics.map(e => e.id)).not.toContain('e1')
    expect(result.epics).toHaveLength(1)
  })

  it('removes all stories belonging to the epic', () => {
    const result = removeEpicFromState(BASE, 'e1')
    expect(result.stories.map(s => s.id)).not.toContain('S1')
    expect(result.stories.map(s => s.id)).not.toContain('S2')
  })

  it('removes deleted story IDs from dependsOn of surviving stories', () => {
    const result = removeEpicFromState(BASE, 'e1')
    expect(result.stories.find(s => s.id === 'S3')!.dependsOn).toEqual([])
  })

  it('removes deleted story IDs from milestone storyIds', () => {
    const result = removeEpicFromState(BASE, 'e1')
    expect(result.milestones[0].storyIds).toEqual([])
  })

  it('does not remove stories from other epics', () => {
    const result = removeEpicFromState(BASE, 'e1')
    expect(result.stories.find(s => s.id === 'S3')).toBeDefined()
  })
})
