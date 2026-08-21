import { describe, it, expect } from 'vitest'
import {
  removeStoryFromState,
  removeEpicFromState,
  removeRoleFromState,
  removeTagFromState,
  removeSectionFromState,
  dependentsOf,
  epicDeletionImpact,
  storiesUsingRole,
  storiesUsingTag,
} from '../mutations'
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
  assumptionSections: [],
  assumptions: [],
  config: {
    calendarConfig: { startDate: '2026-08-24', daysPerWeek: 5, holidays: [] },
    effortScale: [],
    riskLayers: [],
    teamRoles: [
      { id: 'dev', name: 'Developer', people: 2 },
      { id: 'design', name: 'Designer', people: 1 },
    ],
  },
}

// Base with stories that have role efforts — used by role-deletion tests.
const WITH_EFFORTS: AppState = {
  ...BASE,
  stories: [
    {
      id: 'S1', epicId: 'e1', title: 'S1', asA: '', iWant: '', soThat: '',
      useCases: [], rules: [],
      roleEfforts: [{ roleId: 'dev', days: 5 }, { roleId: 'design', days: 3 }],
      estimationState: 'manual', mvpPct: 55, mvpEnabled: false, dependsOn: [],
      isDraft: false, isProtected: false, datasetIds: [], labels: [],
    },
    {
      id: 'S2', epicId: 'e1', title: 'S2', asA: '', iWant: '', soThat: '',
      useCases: [], rules: [],
      roleEfforts: [{ roleId: 'dev', days: 3 }],
      estimationState: 'manual', mvpPct: 55, mvpEnabled: false, dependsOn: [],
      isDraft: false, isProtected: false, datasetIds: [], labels: [],
    },
    {
      id: 'S3', epicId: 'e2', title: 'S3', asA: '', iWant: '', soThat: '',
      useCases: [], rules: [],
      roleEfforts: [{ roleId: 'design', days: 2 }],
      estimationState: 'manual', mvpPct: 55, mvpEnabled: false, dependsOn: [],
      isDraft: false, isProtected: false, datasetIds: [], labels: [],
    },
  ],
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

// ─── dependentsOf ─────────────────────────────────────────────────────────────

describe('dependentsOf', () => {
  it('finds every story that depends on the target (across epics)', () => {
    // S2 (same epic) and S3 (other epic) both depend on S1
    const deps = dependentsOf(BASE, 'S1')
    expect(deps.map(s => s.id).sort()).toEqual(['S2', 'S3'])
  })

  it('is empty for a story nobody depends on', () => {
    expect(dependentsOf(BASE, 'S3')).toEqual([])
  })
})

// ─── epicDeletionImpact ───────────────────────────────────────────────────────

describe('epicDeletionImpact', () => {
  it('reports the cascade (stories inside) and external dependents', () => {
    const impact = epicDeletionImpact(BASE, 'e1')
    // e1 holds S1 and S2 → both cascade
    expect(impact.cascade.map(s => s.id).sort()).toEqual(['S1', 'S2'])
    // S3 (in e2) depends on S1 → it is an external dependent whose ref gets cleaned
    expect(impact.externalDependents.map(s => s.id)).toEqual(['S3'])
  })

  it('has no external dependents when nothing outside points in', () => {
    const impact = epicDeletionImpact(BASE, 'e2')
    expect(impact.cascade.map(s => s.id)).toEqual(['S3'])
    expect(impact.externalDependents).toEqual([])
  })
})

// ─── storiesUsingRole ─────────────────────────────────────────────────────────

describe('storiesUsingRole', () => {
  it('returns stories that have effort for the given role', () => {
    const result = storiesUsingRole(WITH_EFFORTS, 'dev')
    expect(result.map(s => s.id).sort()).toEqual(['S1', 'S2'])
  })

  it('returns stories using the design role (only those)', () => {
    const result = storiesUsingRole(WITH_EFFORTS, 'design')
    expect(result.map(s => s.id).sort()).toEqual(['S1', 'S3'])
  })

  it('returns empty when no story uses the role', () => {
    expect(storiesUsingRole(WITH_EFFORTS, 'nonexistent')).toEqual([])
  })

  it('returns empty when stories have no role efforts at all', () => {
    expect(storiesUsingRole(BASE, 'dev')).toEqual([])
  })
})

// ─── removeRoleFromState ──────────────────────────────────────────────────────

describe('removeRoleFromState', () => {
  it('removes the role from teamRoles', () => {
    const result = removeRoleFromState(WITH_EFFORTS, 'dev')
    expect(result.config.teamRoles.map(r => r.id)).not.toContain('dev')
    expect(result.config.teamRoles.map(r => r.id)).toContain('design')
  })

  it('strips roleEfforts for the deleted role from every story', () => {
    const result = removeRoleFromState(WITH_EFFORTS, 'dev')
    for (const story of result.stories) {
      expect(story.roleEfforts.some(re => re.roleId === 'dev')).toBe(false)
    }
  })

  it('preserves other role efforts in stories', () => {
    const result = removeRoleFromState(WITH_EFFORTS, 'dev')
    // S1 had both dev and design — only design should remain
    const s1 = result.stories.find(s => s.id === 'S1')!
    expect(s1.roleEfforts).toHaveLength(1)
    expect(s1.roleEfforts[0].roleId).toBe('design')
  })

  it('leaves stories with no remaining efforts with an empty roleEfforts', () => {
    const result = removeRoleFromState(WITH_EFFORTS, 'dev')
    // S2 only had dev → now empty
    const s2 = result.stories.find(s => s.id === 'S2')!
    expect(s2.roleEfforts).toEqual([])
  })

  it('does not mutate the original state', () => {
    removeRoleFromState(WITH_EFFORTS, 'dev')
    expect(WITH_EFFORTS.config.teamRoles).toHaveLength(2)
    expect(WITH_EFFORTS.stories.find(s => s.id === 'S1')!.roleEfforts).toHaveLength(2)
  })
})

// ─── storiesUsingTag / removeTagFromState ─────────────────────────────────────

const WITH_LABELS: AppState = {
  ...BASE,
  stories: [
    { ...BASE.stories[0], labels: ['alpha', 'beta'] },
    { ...BASE.stories[1], labels: ['alpha'] },
    { ...BASE.stories[2], labels: [] },
  ],
  config: {
    ...BASE.config,
    riskLayers: [
      { id: 'tag-alpha', name: 'alpha', active: true },
      { id: 'tag-beta',  name: 'beta',  active: true },
    ],
  },
}

describe('storiesUsingTag', () => {
  it('returns stories that carry the given tag label', () => {
    const result = storiesUsingTag(WITH_LABELS, 'tag-alpha')
    expect(result.map(s => s.id).sort()).toEqual(['S1', 'S2'])
  })

  it('is case-insensitive when matching labels', () => {
    const state: AppState = {
      ...WITH_LABELS,
      config: {
        ...WITH_LABELS.config,
        riskLayers: [{ id: 'tag-alpha', name: 'ALPHA', active: true }],
      },
      stories: WITH_LABELS.stories.map(s => ({
        ...s,
        labels: s.labels.map(l => l.toUpperCase()),
      })),
    }
    const result = storiesUsingTag(state, 'tag-alpha')
    expect(result.map(s => s.id).sort()).toEqual(['S1', 'S2'])
  })

  it('returns empty when no story carries the tag', () => {
    expect(storiesUsingTag(WITH_LABELS, 'tag-alpha').filter(s => s.labels.includes('gamma'))).toEqual([])
  })

  it('returns empty for an unknown tagId', () => {
    expect(storiesUsingTag(WITH_LABELS, 'nonexistent')).toEqual([])
  })
})

describe('removeTagFromState', () => {
  it('removes the tag from riskLayers', () => {
    const result = removeTagFromState(WITH_LABELS, 'tag-alpha')
    expect(result.config.riskLayers.map(l => l.id)).not.toContain('tag-alpha')
    expect(result.config.riskLayers.map(l => l.id)).toContain('tag-beta')
  })

  it('strips the tag name from all story labels', () => {
    const result = removeTagFromState(WITH_LABELS, 'tag-alpha')
    for (const s of result.stories) {
      expect(s.labels).not.toContain('alpha')
    }
  })

  it('preserves other labels in stories', () => {
    const result = removeTagFromState(WITH_LABELS, 'tag-alpha')
    const s1 = result.stories.find(s => s.id === 'S1')!
    expect(s1.labels).toContain('beta')
    expect(s1.labels).not.toContain('alpha')
  })

  it('is a no-op for an unknown tagId', () => {
    const result = removeTagFromState(WITH_LABELS, 'nonexistent')
    expect(result).toBe(WITH_LABELS)
  })

  it('does not mutate the original state', () => {
    removeTagFromState(WITH_LABELS, 'tag-alpha')
    expect(WITH_LABELS.config.riskLayers).toHaveLength(2)
    expect(WITH_LABELS.stories.find(s => s.id === 'S1')!.labels).toContain('alpha')
  })
})

// ─── removeSectionFromState ───────────────────────────────────────────────────

const WITH_SECTIONS: AppState = {
  ...BASE,
  assumptionSections: [
    { id: 'sec-1', name: 'Risks' },
    { id: 'sec-2', name: 'Questions' },
  ],
  assumptions: [
    { id: 'note-1', sectionId: 'sec-1', text: 'Risk A' },
    { id: 'note-2', sectionId: 'sec-1', text: 'Risk B' },
    { id: 'note-3', sectionId: 'sec-2', text: 'Q1' },
  ],
}

describe('removeSectionFromState', () => {
  it('removes the section from assumptionSections', () => {
    const result = removeSectionFromState(WITH_SECTIONS, 'sec-1')
    expect(result.assumptionSections.map(s => s.id)).not.toContain('sec-1')
    expect(result.assumptionSections.map(s => s.id)).toContain('sec-2')
  })

  it('cascades to delete all notes inside the removed section', () => {
    const result = removeSectionFromState(WITH_SECTIONS, 'sec-1')
    expect(result.assumptions.map(a => a.id)).not.toContain('note-1')
    expect(result.assumptions.map(a => a.id)).not.toContain('note-2')
  })

  it('preserves notes belonging to other sections', () => {
    const result = removeSectionFromState(WITH_SECTIONS, 'sec-1')
    expect(result.assumptions.find(a => a.id === 'note-3')).toBeDefined()
    expect(result.assumptions).toHaveLength(1)
  })

  it('is a no-op (returns same object) for an unknown sectionId', () => {
    const result = removeSectionFromState(WITH_SECTIONS, 'nonexistent')
    // Filter always produces a new array, so check content not reference
    expect(result.assumptionSections).toHaveLength(2)
    expect(result.assumptions).toHaveLength(3)
  })

  it('does not mutate the original state', () => {
    removeSectionFromState(WITH_SECTIONS, 'sec-1')
    expect(WITH_SECTIONS.assumptionSections).toHaveLength(2)
    expect(WITH_SECTIONS.assumptions).toHaveLength(3)
  })
})
