import { describe, it, expect } from 'vitest'
import { wouldCreateCycle, classifyDep, getEpicDeps } from '../dependencies'
import type { Story } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mkStory = (id: string, epicId: string, dependsOn: string[] = []): Story => ({
  id,
  epicId,
  title: id,
  asA: '', iWant: '', soThat: '',
  useCases: [], rules: [],
  roleEfforts: [],
  estimationState: 'manual',
  mvpPct: 50,
  mvpEnabled: false,
  dependsOn,
  isDraft: false,
  isProtected: false,
  datasetIds: [],
  labels: [],
})

// ─── wouldCreateCycle — TC-023 ────────────────────────────────────────────────

describe('wouldCreateCycle — TC-023', () => {
  it('self-dependency is always a cycle', () => {
    const stories = [mkStory('X', 'e')]
    expect(wouldCreateCycle(stories, 'X', 'X')).toBe(true)
  })

  it('direct cycle: X→Y exists, adding Y→X is rejected', () => {
    // X depends on Y; adding Y.dependsOn.push(X) would be a cycle
    const stories = [
      mkStory('X', 'e', ['Y']),
      mkStory('Y', 'e'),
    ]
    expect(wouldCreateCycle(stories, 'Y', 'X')).toBe(true)
  })

  it('transitive cycle: A→B, B→C, adding C→A is rejected', () => {
    const stories = [
      mkStory('A', 'e', ['B']),
      mkStory('B', 'e', ['C']),
      mkStory('C', 'e'),
    ]
    expect(wouldCreateCycle(stories, 'C', 'A')).toBe(true)
  })

  it('no cycle: A→B, adding C→A is allowed', () => {
    const stories = [
      mkStory('A', 'e', ['B']),
      mkStory('B', 'e'),
      mkStory('C', 'e'),
    ]
    expect(wouldCreateCycle(stories, 'C', 'A')).toBe(false)
  })

  it('no cycle: adding a dependency on an unknown story is allowed', () => {
    const stories = [mkStory('A', 'e')]
    expect(wouldCreateCycle(stories, 'A', 'NONEXISTENT')).toBe(false)
  })

  it('longer transitive cycle is detected', () => {
    // A→B→C→D, adding D→A should be detected as cycle
    const stories = [
      mkStory('A', 'e', ['B']),
      mkStory('B', 'e', ['C']),
      mkStory('C', 'e', ['D']),
      mkStory('D', 'e'),
    ]
    expect(wouldCreateCycle(stories, 'D', 'A')).toBe(true)
  })

  it('diamond non-cycle: A→B, A→C, B→D, C→D; adding E→D is fine', () => {
    const stories = [
      mkStory('A', 'e', ['B', 'C']),
      mkStory('B', 'e', ['D']),
      mkStory('C', 'e', ['D']),
      mkStory('D', 'e'),
      mkStory('E', 'e'),
    ]
    expect(wouldCreateCycle(stories, 'E', 'D')).toBe(false)
  })
})

// ─── classifyDep — TC-022 ─────────────────────────────────────────────────────

describe('classifyDep — TC-022', () => {
  it('same epic → internal', () => {
    const b1 = mkStory('B1', 'epic-B')
    const b2 = mkStory('B2', 'epic-B')
    expect(classifyDep(b1, b2)).toBe('internal')
  })

  it('different epics → cross-epic', () => {
    const c1 = mkStory('C1', 'epic-C')
    const a2 = mkStory('A2', 'epic-A')
    expect(classifyDep(c1, a2)).toBe('cross-epic')
  })
})

// ─── getEpicDeps — TC-022 propagation ─────────────────────────────────────────

describe('getEpicDeps — TC-022', () => {
  it('internal dep (same epic) does not appear in epic-level deps', () => {
    const stories = [
      mkStory('B1', 'epic-B', ['B2']),
      mkStory('B2', 'epic-B'),
    ]
    expect(getEpicDeps(stories)).toHaveLength(0)
  })

  it('cross-epic dep propagates as an epic-level dependency', () => {
    // C1 (epic-C) depends on A2 (epic-A) → cross-epic
    const stories = [
      mkStory('C1', 'epic-C', ['A2']),
      mkStory('A2', 'epic-A'),
    ]
    const deps = getEpicDeps(stories)
    expect(deps).toHaveLength(1)
    expect(deps[0].fromEpicId).toBe('epic-C')
    expect(deps[0].toEpicId).toBe('epic-A')
    expect(deps[0].storyId).toBe('C1')
    expect(deps[0].dependsOnStoryId).toBe('A2')
  })

  it('mixed: one internal + one cross-epic dep', () => {
    const stories = [
      mkStory('B1', 'epic-B', ['B2']),  // internal
      mkStory('B2', 'epic-B'),
      mkStory('C1', 'epic-C', ['A2']),  // cross-epic
      mkStory('A2', 'epic-A'),
    ]
    const deps = getEpicDeps(stories)
    expect(deps).toHaveLength(1) // only the cross-epic one
    expect(deps[0].fromEpicId).toBe('epic-C')
  })

  it('multiple cross-epic deps are all captured', () => {
    const stories = [
      mkStory('X', 'epic-X', ['A', 'B']),
      mkStory('A', 'epic-A'),
      mkStory('B', 'epic-B'),
    ]
    const deps = getEpicDeps(stories)
    expect(deps).toHaveLength(2)
    expect(deps.map(d => d.toEpicId).sort()).toEqual(['epic-A', 'epic-B'])
  })

  it('dep to a story not in the list is ignored', () => {
    const stories = [mkStory('X', 'epic-X', ['GHOST'])]
    expect(getEpicDeps(stories)).toHaveLength(0)
  })
})
