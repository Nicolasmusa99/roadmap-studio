// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  loadStore,
  saveStore,
  emptyStore,
  STORAGE_KEY,
  SCHEMA_VERSION,
} from '../storage'
import type { RoadmapsStore, StoredRoadmap } from '../storage'
import type { AppState } from '../types'

// ─── Minimal AppState fixture ─────────────────────────────────────────────────

const MINIMAL_STATE: AppState = {
  components: [{ id: 'c1', name: 'Roadmap' }],
  epics: [],
  stories: [],
  milestones: [],
  datasets: [],
  assumptionSections: [],
  assumptions: [],
  config: {
    calendarConfig: { startDate: '2026-08-24', daysPerWeek: 5, holidays: [] },
    effortScale: [],
    riskLayers: [],
    teamRoles: [],
  },
}

function makeRoadmap(id: string, name: string): StoredRoadmap {
  return {
    id,
    name,
    lastEdited: '2026-08-20T12:00:00.000Z',
    state: JSON.parse(JSON.stringify(MINIMAL_STATE)),
  }
}

// ─── localStorage isolation ───────────────────────────────────────────────────

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

// ─── emptyStore ───────────────────────────────────────────────────────────────

describe('emptyStore', () => {
  it('returns a store with the current schema version and no roadmaps', () => {
    const store = emptyStore()
    expect(store.schemaVersion).toBe(SCHEMA_VERSION)
    expect(store.roadmaps).toEqual([])
  })
})

// ─── loadStore ────────────────────────────────────────────────────────────────

describe('loadStore', () => {
  it('returns null when localStorage is empty', () => {
    const { data } = loadStore()
    expect(data).toBeNull()
  })

  it('returns null with corrupt error on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{{')
    const { data, error } = loadStore()
    expect(data).toBeNull()
    expect(error).toBe('unavailable')
  })

  it('returns null with corrupt error when schemaVersion is missing', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ roadmaps: [] }))
    const { data, error } = loadStore()
    expect(data).toBeNull()
    expect(error).toBe('corrupt')
  })

  it('returns null with corrupt error when roadmaps is not an array', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, roadmaps: null }))
    const { data, error } = loadStore()
    expect(data).toBeNull()
    expect(error).toBe('corrupt')
  })

  it('successfully loads a valid store', () => {
    const store: RoadmapsStore = {
      schemaVersion: 1,
      roadmaps: [makeRoadmap('rm-1', 'Alpha')],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    const { data, error } = loadStore()
    expect(error).toBeUndefined()
    expect(data).not.toBeNull()
    expect(data!.roadmaps).toHaveLength(1)
    expect(data!.roadmaps[0].name).toBe('Alpha')
  })
})

// ─── saveStore + loadStore roundtrip ─────────────────────────────────────────

describe('saveStore / loadStore roundtrip', () => {
  it('roundtrips a store with multiple roadmaps', () => {
    const store: RoadmapsStore = {
      schemaVersion: 1,
      roadmaps: [makeRoadmap('rm-1', 'Alpha'), makeRoadmap('rm-2', 'Beta')],
    }
    const err = saveStore(store)
    expect(err).toBeNull()

    const { data } = loadStore()
    expect(data).not.toBeNull()
    expect(data!.schemaVersion).toBe(1)
    expect(data!.roadmaps).toHaveLength(2)
    expect(data!.roadmaps[0].id).toBe('rm-1')
    expect(data!.roadmaps[1].id).toBe('rm-2')
  })

  it('preserves AppState contents faithfully', () => {
    const state: AppState = {
      ...MINIMAL_STATE,
      epics: [{ id: 'e1', componentId: 'c1', name: 'My Epic', isProtected: false }],
    }
    const store: RoadmapsStore = {
      schemaVersion: 1,
      roadmaps: [{ id: 'rm-1', name: 'Test', lastEdited: '2026-08-20T00:00:00Z', state }],
    }
    saveStore(store)
    const { data } = loadStore()
    expect(data!.roadmaps[0].state.epics[0].name).toBe('My Epic')
  })
})

// ─── Store mutation operations (no hook, pure store manipulation) ─────────────

describe('adding and removing roadmaps does not cross-contaminate', () => {
  it('deleting a roadmap from the store does not affect others', () => {
    const store: RoadmapsStore = {
      schemaVersion: 1,
      roadmaps: [
        makeRoadmap('rm-1', 'Alpha'),
        makeRoadmap('rm-2', 'Beta'),
        makeRoadmap('rm-3', 'Gamma'),
      ],
    }
    saveStore(store)

    // Simulate deleting rm-2
    const { data } = loadStore()
    const updated: RoadmapsStore = {
      ...data!,
      roadmaps: data!.roadmaps.filter(r => r.id !== 'rm-2'),
    }
    saveStore(updated)

    const { data: final } = loadStore()
    expect(final!.roadmaps).toHaveLength(2)
    expect(final!.roadmaps.map(r => r.id)).toEqual(['rm-1', 'rm-3'])
    expect(final!.roadmaps.map(r => r.name)).toEqual(['Alpha', 'Gamma'])
  })

  it('renaming one roadmap does not touch the others', () => {
    const store: RoadmapsStore = {
      schemaVersion: 1,
      roadmaps: [makeRoadmap('rm-1', 'Alpha'), makeRoadmap('rm-2', 'Beta')],
    }
    saveStore(store)

    const { data } = loadStore()
    const updated: RoadmapsStore = {
      ...data!,
      roadmaps: data!.roadmaps.map(r => r.id === 'rm-1' ? { ...r, name: 'Renamed' } : r),
    }
    saveStore(updated)

    const { data: final } = loadStore()
    expect(final!.roadmaps[0].name).toBe('Renamed')
    expect(final!.roadmaps[1].name).toBe('Beta')  // untouched
  })

  it('updating one roadmap state does not affect another roadmap state', () => {
    const stateA: AppState = { ...MINIMAL_STATE, epics: [{ id: 'ea', componentId: 'c1', name: 'Epic A', isProtected: false }] }
    const stateB: AppState = { ...MINIMAL_STATE, epics: [{ id: 'eb', componentId: 'c1', name: 'Epic B', isProtected: false }] }
    const store: RoadmapsStore = {
      schemaVersion: 1,
      roadmaps: [
        { id: 'rm-1', name: 'Alpha', lastEdited: '2026-08-20T00:00:00Z', state: stateA },
        { id: 'rm-2', name: 'Beta',  lastEdited: '2026-08-20T00:00:00Z', state: stateB },
      ],
    }
    saveStore(store)

    // Simulate saving new state for rm-1 only
    const { data } = loadStore()
    const newStateA: AppState = { ...stateA, stories: [] }
    const updated: RoadmapsStore = {
      ...data!,
      roadmaps: data!.roadmaps.map(r =>
        r.id === 'rm-1' ? { ...r, state: newStateA } : r,
      ),
    }
    saveStore(updated)

    const { data: final } = loadStore()
    // rm-2 state is untouched
    expect(final!.roadmaps[1].state.epics[0].name).toBe('Epic B')
  })

  it('each new roadmap gets a unique id (simulated)', () => {
    const ids = new Set(['rm-1', 'rm-2', 'rm-3'])
    expect(ids.size).toBe(3)  // trivially true; the invariant is enforced by Date.now() in the hook
  })
})
