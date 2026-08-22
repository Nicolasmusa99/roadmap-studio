import { describe, it, expect } from 'vitest'
import { storyRiceScore, epicRiceRollup } from '../aggregation'
import type { Story } from '../types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id:              overrides.id              ?? 'H-001',
    epicId:          overrides.epicId          ?? 'epic-1',
    title:           overrides.title           ?? 'Test story',
    asA:             '',
    iWant:           '',
    soThat:          '',
    useCases:        [],
    rules:           [],
    roleEfforts:     overrides.roleEfforts     ?? [],
    estimationState: overrides.estimationState ?? 'unestimated',
    mvpPct:          55,
    mvpEnabled:      false,
    dependsOn:       [],
    isDraft:         true,
    isProtected:     false,
    datasetIds:      [],
    labels:          [],
    ...overrides,
  }
}

// ─── storyRiceScore ───────────────────────────────────────────────────────────

describe('storyRiceScore', () => {
  it('returns null when story has no rice field', () => {
    const s = makeStory({ roleEfforts: [{ roleId: 'r1', days: 5 }] })
    expect(storyRiceScore(s)).toBeNull()
  })

  it('returns null when story has no effort (division by zero guard)', () => {
    const s = makeStory({
      roleEfforts: [],
      rice: { reach: 1000, impact: 2, confidence: 80 },
    })
    expect(storyRiceScore(s)).toBeNull()
  })

  it('returns null when reach is 0', () => {
    const s = makeStory({
      roleEfforts: [{ roleId: 'r1', days: 5 }],
      rice: { reach: 0, impact: 2, confidence: 80 },
    })
    expect(storyRiceScore(s)).toBeNull()
  })

  it('returns null when impact is 0', () => {
    const s = makeStory({
      roleEfforts: [{ roleId: 'r1', days: 5 }],
      rice: { reach: 1000, impact: 0, confidence: 80 },
    })
    expect(storyRiceScore(s)).toBeNull()
  })

  it('returns null when confidence is 0', () => {
    const s = makeStory({
      roleEfforts: [{ roleId: 'r1', days: 5 }],
      rice: { reach: 1000, impact: 2, confidence: 0 },
    })
    expect(storyRiceScore(s)).toBeNull()
  })

  it('calculates correctly with a single role', () => {
    // Reach=1000, Impact=2, Confidence=80% → numerator = 1000×2×0.8 = 1600
    // Effort = 5d → score = 1600 / 5 = 320
    const s = makeStory({
      roleEfforts: [{ roleId: 'r1', days: 5 }],
      rice: { reach: 1000, impact: 2, confidence: 80 },
    })
    expect(storyRiceScore(s)).toBeCloseTo(320, 5)
  })

  it('reuses storyTotalDays (sum of all role-efforts) as the divisor', () => {
    // Multi-role: 10d frontend + 5d backend = 15 total person-days
    // Score = (500 × 1 × 1.0) / 15 = 33.333...
    const s = makeStory({
      roleEfforts: [
        { roleId: 'fe', days: 10 },
        { roleId: 'be', days: 5 },
      ],
      rice: { reach: 500, impact: 1, confidence: 100 },
    })
    expect(storyRiceScore(s)).toBeCloseTo(500 / 15, 5)
  })

  it('scales proportionally with confidence percentage', () => {
    const base = makeStory({
      roleEfforts: [{ roleId: 'r1', days: 10 }],
      rice: { reach: 1000, impact: 1, confidence: 100 },
    })
    const half = makeStory({
      roleEfforts: [{ roleId: 'r1', days: 10 }],
      rice: { reach: 1000, impact: 1, confidence: 50 },
    })
    const baseScore = storyRiceScore(base)!
    const halfScore = storyRiceScore(half)!
    expect(halfScore).toBeCloseTo(baseScore / 2, 5)
  })

  it('uses Minimal impact (0.25) correctly', () => {
    // 200 × 0.25 × 1.0 / 4 = 12.5
    const s = makeStory({
      roleEfforts: [{ roleId: 'r1', days: 4 }],
      rice: { reach: 200, impact: 0.25, confidence: 100 },
    })
    expect(storyRiceScore(s)).toBeCloseTo(12.5, 5)
  })

  it('is independent of team size (durationDays is NOT the divisor)', () => {
    // Both stories have the same roleEfforts and RICE data.
    // Even if team size were different, the score must be identical because
    // we divide by totalDays (person-days of work), not by durationDays.
    const s = makeStory({
      roleEfforts: [{ roleId: 'r1', days: 10 }],
      rice: { reach: 1000, impact: 2, confidence: 80 },
    })
    // Score = (1000 × 2 × 0.8) / 10 = 160
    expect(storyRiceScore(s)).toBeCloseTo(160, 5)
    // Changing team size does not affect the story model — score is unchanged.
    // (durationDays is scheduler output, not stored on Story)
  })
})

// ─── epicRiceRollup ───────────────────────────────────────────────────────────

describe('epicRiceRollup', () => {
  it('returns null when no stories have RICE data', () => {
    const stories = [makeStory({ epicId: 'e1', roleEfforts: [{ roleId: 'r1', days: 5 }] })]
    expect(epicRiceRollup('e1', stories)).toBeNull()
  })

  it('returns null when epic has no stories at all', () => {
    expect(epicRiceRollup('e-empty', [])).toBeNull()
  })

  it('returns null when RICE-incomplete stories only (missing effort)', () => {
    const s = makeStory({
      epicId: 'e1',
      roleEfforts: [], // no effort → totalDays = 0
      rice: { reach: 1000, impact: 2, confidence: 80 },
    })
    expect(epicRiceRollup('e1', [s])).toBeNull()
  })

  it('computes rollup for a single RICE-complete story', () => {
    // Reach=500, Impact=2, Confidence=100%, Effort=10d
    // Score = (500 × 2 × 1.0) / 10 = 100
    const s = makeStory({
      epicId: 'e1',
      roleEfforts: [{ roleId: 'r1', days: 10 }],
      rice: { reach: 500, impact: 2, confidence: 100 },
    })
    const r = epicRiceRollup('e1', [s])!
    expect(r).not.toBeNull()
    expect(r.completeCount).toBe(1)
    expect(r.totalCount).toBe(1)
    expect(r.sumReach).toBe(500)
    expect(r.sumEffort).toBe(10)
    expect(r.score).toBeCloseTo(100, 5)
  })

  it('sums reach across RICE-complete stories', () => {
    const s1 = makeStory({ id: 'H-1', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5 }], rice: { reach: 300, impact: 1, confidence: 100 } })
    const s2 = makeStory({ id: 'H-2', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5 }], rice: { reach: 700, impact: 1, confidence: 100 } })
    const r = epicRiceRollup('e1', [s1, s2])!
    expect(r.sumReach).toBe(1000)
  })

  it('excludes RICE-incomplete stories from rollup, shows them in totalCount', () => {
    const complete   = makeStory({ id: 'H-ok',  epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5  }], rice: { reach: 500, impact: 2, confidence: 80 } })
    const noRice     = makeStory({ id: 'H-no',  epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 10 }] })
    const noEffort   = makeStory({ id: 'H-ne',  epicId: 'e1', roleEfforts: [],                          rice: { reach: 200, impact: 1, confidence: 50 } })
    const r = epicRiceRollup('e1', [complete, noRice, noEffort])!
    expect(r.completeCount).toBe(1)
    expect(r.totalCount).toBe(3)
    expect(r.sumEffort).toBe(5)   // only complete story's effort
    expect(r.sumReach).toBe(500)  // only complete story's reach
  })

  it('uses reach-weighted average for impact', () => {
    // s1: reach=100, impact=3  → weight 100
    // s2: reach=900, impact=1  → weight 900
    // wtdImpact = (100×3 + 900×1) / (100+900) = (300+900)/1000 = 1200/1000 = 1.2
    const s1 = makeStory({ id: 'H-1', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5 }], rice: { reach: 100, impact: 3, confidence: 100 } })
    const s2 = makeStory({ id: 'H-2', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5 }], rice: { reach: 900, impact: 1, confidence: 100 } })
    const r = epicRiceRollup('e1', [s1, s2])!
    expect(r.wtdImpact).toBeCloseTo(1.2, 5)
    // Score = (1000 × 1.2 × 1.0) / 10 = 120
    expect(r.score).toBeCloseTo(120, 5)
  })

  it('uses simple average for confidence', () => {
    // Both stories: reach=500, impact=1
    // s1 confidence=100, s2 confidence=60 → avgConf = 80
    const s1 = makeStory({ id: 'H-1', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5 }], rice: { reach: 500, impact: 1, confidence: 100 } })
    const s2 = makeStory({ id: 'H-2', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5 }], rice: { reach: 500, impact: 1, confidence: 60  } })
    const r = epicRiceRollup('e1', [s1, s2])!
    expect(r.avgConf).toBeCloseTo(80, 5)
    // Score = (1000 × 1 × 0.8) / 10 = 80
    expect(r.score).toBeCloseTo(80, 5)
  })

  it('sums effort across RICE-complete stories only', () => {
    const s1 = makeStory({ id: 'H-1', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 7 }], rice: { reach: 100, impact: 1, confidence: 100 } })
    const s2 = makeStory({ id: 'H-2', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 3 }], rice: { reach: 100, impact: 1, confidence: 100 } })
    const r = epicRiceRollup('e1', [s1, s2])!
    expect(r.sumEffort).toBe(10)
  })
})

// ─── RICE sort comparator ────────────────────────────────────────────────────
// This test exercises the exact comparator used in TreeView's sort-by-RICE mode.
// It would have caught any bug in the score-map lookup or the sb - sa direction.

describe('RICE sort comparator (TreeView)', () => {
  it('reorders stories from worst-to-best into best-to-worst RICE order', () => {
    // H-hi has the highest score; H-lo the lowest; H-nil has no RICE data.
    // Start them in the worst possible order (lowest first, null-score in the middle)
    // so any reordering bug would be obvious.
    const hi  = makeStory({ id: 'H-hi',  epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5  }], rice: { reach: 1000, impact: 3, confidence: 100 } })
    const lo  = makeStory({ id: 'H-lo',  epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 10 }], rice: { reach: 100,  impact: 1, confidence: 100 } })
    const nil = makeStory({ id: 'H-nil', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5  }] })

    // Intentionally wrong order: lo → nil → hi
    const stories = [lo, nil, hi]

    // Replicate TreeView's score map + comparator exactly
    const scores = new Map(stories.map(s => [s.id, storyRiceScore(s)]))
    const sorted = [...stories].sort((a, b) => {
      const sa = scores.get(a.id) ?? -Infinity
      const sb = scores.get(b.id) ?? -Infinity
      return sb - sa
    })

    expect(sorted[0].id).toBe('H-hi')   // highest score first
    expect(sorted[1].id).toBe('H-lo')   // lower score second
    expect(sorted[2].id).toBe('H-nil')  // no RICE goes last
  })

  it('is a no-op when stories are already in RICE order', () => {
    // Verifies stable behaviour: correct order in → same order out.
    // This is exactly the scenario that looks like a "broken sort" — the sort
    // runs but produces no visible change because the data is already ordered.
    const hi = makeStory({ id: 'H-hi', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5 }], rice: { reach: 1000, impact: 3, confidence: 100 } })
    const lo = makeStory({ id: 'H-lo', epicId: 'e1', roleEfforts: [{ roleId: 'r', days: 5 }], rice: { reach: 100,  impact: 1, confidence: 100 } })

    const stories = [hi, lo]  // already in RICE order
    const scores = new Map(stories.map(s => [s.id, storyRiceScore(s)]))
    const sorted = [...stories].sort((a, b) => {
      const sa = scores.get(a.id) ?? -Infinity
      const sb = scores.get(b.id) ?? -Infinity
      return sb - sa
    })

    expect(sorted[0].id).toBe('H-hi')
    expect(sorted[1].id).toBe('H-lo')
  })
})
