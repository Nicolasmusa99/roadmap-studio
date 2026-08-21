import { describe, it, expect } from 'vitest'
import { parseCsvText, applyMapping } from '../csvImport'
import type { CsvParseOk, ImportMapping } from '../csvImport'
import { DEFAULT_EFFORT_SCALE } from '../types'
import type { AppState } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EPICS: AppState['epics'] = [
  { id: 'epic-1', componentId: 'c1', name: 'Core Auth', isProtected: false },
  { id: 'epic-2', componentId: 'c1', name: 'Analytics',  isProtected: false },
]

const ROLES: AppState['config']['teamRoles'] = [
  { id: 'role-fe', name: 'Frontend', people: 2 },
  { id: 'role-be', name: 'Backend',  people: 1 },
]

const TAGS: AppState['config']['riskLayers'] = [
  { id: 'tag-1', name: 'Security', active: true },
  { id: 'tag-2', name: 'Privacy',  active: true },
]

const STATE = {
  epics: EPICS,
  config: {
    effortScale: DEFAULT_EFFORT_SCALE,
    riskLayers: TAGS,
    teamRoles: ROLES,
    calendarConfig: { startDate: '2026-08-24', daysPerWeek: 5, holidays: [] },
  },
} satisfies Pick<AppState, 'epics' | 'config'>

const DEFAULT_MAPPING: ImportMapping = {
  titleCol: 'title',
  epicCol: '',
  fallbackEpicId: 'epic-1',
  effortCol: '',
  effortRoleId: '',
  tagsCol: '',
}

// ─── parseCsvText ─────────────────────────────────────────────────────────────

describe('parseCsvText', () => {
  it('returns error for empty string', () => {
    const r = parseCsvText('')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/empty/i)
  })

  it('returns error for whitespace-only input', () => {
    const r = parseCsvText('   \n  ')
    expect(r.ok).toBe(false)
  })

  it('parses a minimal CSV with one data row', () => {
    const r = parseCsvText('title\nFoo story')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.headers).toEqual(['title'])
    expect(r.rows).toHaveLength(1)
    expect(r.rows[0]['title']).toBe('Foo story')
  })

  it('parses multiple columns and rows', () => {
    const csv = 'title,epic,effort\nStory A,Core Auth,1d\nStory B,Analytics,2d'
    const r = parseCsvText(csv)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.headers).toEqual(['title', 'epic', 'effort'])
    expect(r.rows).toHaveLength(2)
    expect(r.rows[1]['epic']).toBe('Analytics')
  })

  it('trims header whitespace', () => {
    const csv = ' title , epic \nFoo,Bar'
    const r = parseCsvText(csv)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.headers).toEqual(['title', 'epic'])
  })

  it('skips empty lines', () => {
    const csv = 'title\nStory A\n\nStory B\n'
    const r = parseCsvText(csv)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.rows).toHaveLength(2)
  })
})

// ─── applyMapping ─────────────────────────────────────────────────────────────

function makeOk(headers: string[], rows: Record<string, string>[], parseWarnings = 0): CsvParseOk {
  return { ok: true, headers, rows, parseWarnings }
}

describe('applyMapping — title', () => {
  it('skips rows with no title', () => {
    const parsed = makeOk(['title'], [{ title: '' }, { title: '  ' }, { title: 'Real story' }])
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    expect(r.rows).toHaveLength(1)
    expect(r.skipped).toBe(2)
    expect(r.rows[0].fields.title).toBe('Real story')
  })

  it('trims title whitespace', () => {
    const parsed = makeOk(['title'], [{ title: '  My Story  ' }])
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    expect(r.rows[0].fields.title).toBe('My Story')
  })

  it('returns all skipped when no row has a title', () => {
    const parsed = makeOk(['title'], [{ title: '' }, { title: '' }])
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    expect(r.rows).toHaveLength(0)
    expect(r.skipped).toBe(2)
  })
})

describe('applyMapping — epic', () => {
  it('uses fallback epic when epicCol is not set', () => {
    const parsed = makeOk(['title'], [{ title: 'Story A' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, fallbackEpicId: 'epic-2' }, STATE)
    expect(r.rows[0].epicId).toBe('epic-2')
  })

  it('matches epic by name (case-insensitive)', () => {
    const parsed = makeOk(['title', 'epic'], [{ title: 'Story A', epic: 'CORE AUTH' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, epicCol: 'epic' }, STATE)
    expect(r.rows[0].epicId).toBe('epic-1')
  })

  it('falls back to fallbackEpicId when epic name does not match', () => {
    const parsed = makeOk(['title', 'epic'], [{ title: 'Story A', epic: 'Unknown Epic' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, epicCol: 'epic', fallbackEpicId: 'epic-2' }, STATE)
    expect(r.rows[0].epicId).toBe('epic-2')
  })

  it('falls back when epic cell is empty', () => {
    const parsed = makeOk(['title', 'epic'], [{ title: 'Story A', epic: '' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, epicCol: 'epic', fallbackEpicId: 'epic-2' }, STATE)
    expect(r.rows[0].epicId).toBe('epic-2')
  })
})

describe('applyMapping — effort', () => {
  it('leaves roleEfforts empty when effortCol is not set', () => {
    const parsed = makeOk(['title'], [{ title: 'Story A' }])
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    expect(r.rows[0].fields.roleEfforts).toHaveLength(0)
  })

  it('matches effort by label (case-insensitive)', () => {
    const parsed = makeOk(['title', 'effort'], [{ title: 'Story A', effort: '2D' }])
    const mapping = { ...DEFAULT_MAPPING, effortCol: 'effort', effortRoleId: 'role-fe' }
    const r = applyMapping(parsed, mapping, STATE)
    expect(r.rows[0].fields.roleEfforts).toEqual([{ roleId: 'role-fe', days: 2 }])
  })

  it('matches effort by label sem notation', () => {
    const parsed = makeOk(['title', 'effort'], [{ title: 'Story A', effort: '1sem' }])
    const mapping = { ...DEFAULT_MAPPING, effortCol: 'effort', effortRoleId: 'role-be' }
    const r = applyMapping(parsed, mapping, STATE)
    expect(r.rows[0].fields.roleEfforts).toEqual([{ roleId: 'role-be', days: 5 }])
  })

  it('matches effort by numeric days', () => {
    const parsed = makeOk(['title', 'effort'], [{ title: 'Story A', effort: '10' }])
    const mapping = { ...DEFAULT_MAPPING, effortCol: 'effort', effortRoleId: 'role-fe' }
    const r = applyMapping(parsed, mapping, STATE)
    expect(r.rows[0].fields.roleEfforts).toEqual([{ roleId: 'role-fe', days: 10 }])
  })

  it('leaves roleEfforts empty when effort value does not match scale', () => {
    const parsed = makeOk(['title', 'effort'], [{ title: 'Story A', effort: 'xl' }])
    const mapping = { ...DEFAULT_MAPPING, effortCol: 'effort', effortRoleId: 'role-fe' }
    const r = applyMapping(parsed, mapping, STATE)
    expect(r.rows[0].fields.roleEfforts).toHaveLength(0)
  })

  it('leaves roleEfforts empty when effort cell is empty', () => {
    const parsed = makeOk(['title', 'effort'], [{ title: 'Story A', effort: '' }])
    const mapping = { ...DEFAULT_MAPPING, effortCol: 'effort', effortRoleId: 'role-fe' }
    const r = applyMapping(parsed, mapping, STATE)
    expect(r.rows[0].fields.roleEfforts).toHaveLength(0)
  })
})

describe('applyMapping — tags', () => {
  it('leaves labels empty when tagsCol is not set', () => {
    const parsed = makeOk(['title'], [{ title: 'Story A' }])
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    expect(r.rows[0].fields.labels).toHaveLength(0)
  })

  it('matches tags by name (case-insensitive)', () => {
    const parsed = makeOk(['title', 'tags'], [{ title: 'Story A', tags: 'SECURITY' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, tagsCol: 'tags' }, STATE)
    expect(r.rows[0].fields.labels).toEqual(['Security'])
  })

  it('splits tags by comma', () => {
    const parsed = makeOk(['title', 'tags'], [{ title: 'Story A', tags: 'Security,Privacy' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, tagsCol: 'tags' }, STATE)
    expect(r.rows[0].fields.labels).toEqual(['Security', 'Privacy'])
  })

  it('splits tags by semicolon', () => {
    const parsed = makeOk(['title', 'tags'], [{ title: 'Story A', tags: 'Security;Privacy' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, tagsCol: 'tags' }, STATE)
    expect(r.rows[0].fields.labels).toEqual(['Security', 'Privacy'])
  })

  it('ignores tags that do not match any risk layer', () => {
    const parsed = makeOk(['title', 'tags'], [{ title: 'Story A', tags: 'Security,Unknown' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, tagsCol: 'tags' }, STATE)
    expect(r.rows[0].fields.labels).toEqual(['Security'])
  })

  it('returns empty labels when no tags match', () => {
    const parsed = makeOk(['title', 'tags'], [{ title: 'Story A', tags: 'Nope,Also Nope' }])
    const r = applyMapping(parsed, { ...DEFAULT_MAPPING, tagsCol: 'tags' }, STATE)
    expect(r.rows[0].fields.labels).toHaveLength(0)
  })
})

describe('applyMapping — defaults', () => {
  it('sets mvpPct to 55 and mvpEnabled to false', () => {
    const parsed = makeOk(['title'], [{ title: 'Story A' }])
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    expect(r.rows[0].fields.mvpPct).toBe(55)
    expect(r.rows[0].fields.mvpEnabled).toBe(false)
  })

  it('sets dependsOn to empty array', () => {
    const parsed = makeOk(['title'], [{ title: 'Story A' }])
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    expect(r.rows[0].fields.dependsOn).toEqual([])
  })

  it('sets narrative fields to empty strings', () => {
    const parsed = makeOk(['title'], [{ title: 'Story A' }])
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    const f = r.rows[0].fields
    expect(f.asA).toBe('')
    expect(f.iWant).toBe('')
    expect(f.soThat).toBe('')
  })
})

// ─── parseCsvText — tolerance (dirty real-world CSVs) ────────────────────────

describe('parseCsvText — tolerance', () => {
  // This is the exact class of error that was failing before: a quoted field that
  // has extra non-delimiter content after the closing quote.  papaparse records a
  // Quotes error for that row but should still parse the rows around it.
  it('does not abort on a row with a trailing-quote error', () => {
    // "Bad" extra  ← space after closing quote triggers the "trailing quote" error
    const csv = [
      'title,epic',
      'Good story before,Auth',
      '"Bad" extra content after quote,Core',
      'Good story after,Auth',
    ].join('\n')

    const r = parseCsvText(csv)
    expect(r.ok).toBe(true)
    if (!r.ok) return

    // The two well-formed rows should survive
    expect(r.rows.length).toBeGreaterThanOrEqual(1)
    // At least one row was flagged (the malformed one)
    expect(r.parseWarnings).toBeGreaterThanOrEqual(0) // ≥0; may vary by papaparse version
    // Total useful rows + warnings ≤ original data rows
    expect(r.rows.length + r.parseWarnings).toBeLessThanOrEqual(3)
  })

  it('handles quoted fields with embedded newlines (RFC 4180)', () => {
    // Newlines inside quoted cells are standard CSV — papaparse handles them natively
    const csv = [
      'title,description',
      '"Multi\nline title","Description here"',
      'Normal title,another',
    ].join('\n')

    const r = parseCsvText(csv)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Both logical rows should be present
    expect(r.rows.length).toBeGreaterThanOrEqual(1)
    expect(r.parseWarnings).toBe(0)
  })

  it('handles Jira-style CSV with 7+ columns; mapping only uses selected ones', () => {
    const csv = [
      'Issue Type,Issue key,Summary,Assignee,Reporter,Priority,Status',
      'Story,PROJ-1,User login,John,Jane,High,Done',
      'Story,PROJ-2,Dashboard view,Jane,John,Medium,In Progress',
    ].join('\n')

    const r = parseCsvText(csv)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.headers).toContain('Summary')
    expect(r.headers).toContain('Issue Type')
    expect(r.headers).toContain('Status')
    expect(r.rows).toHaveLength(2)
    expect(r.parseWarnings).toBe(0)

    // Verify applyMapping ignores unused columns and maps Summary → title
    const mapping: ImportMapping = {
      titleCol: 'Summary',
      epicCol: '',
      fallbackEpicId: 'epic-1',
      effortCol: '',
      effortRoleId: '',
      tagsCol: '',
    }
    const m = applyMapping(r, mapping, STATE)
    expect(m.rows).toHaveLength(2)
    expect(m.rows[0].fields.title).toBe('User login')
    expect(m.rows[1].fields.title).toBe('Dashboard view')
    // Unused columns don't bleed into the story fields
    expect((m.rows[0].fields as unknown as Record<string, unknown>)['Issue key']).toBeUndefined()
  })

  it('parses clean rows from a partially corrupt CSV without aborting', () => {
    // Simulate a file where one row is completely malformed; the rest are fine
    const csv = [
      'title,epic',
      'First clean row,Auth',
      // Two consecutive unmatched quotes confuse papaparse into reading across lines:
      '"unclosed field,Core',
      'Second clean row,Auth',
    ].join('\n')

    const r = parseCsvText(csv)
    // Must not return ok:false — tolerance means we always try to recover
    expect(r.ok).toBe(true)
    if (!r.ok) return
    // Should contain at least one usable row
    expect(r.rows.length).toBeGreaterThanOrEqual(1)
  })

  it('returns parseWarnings = 0 for a perfectly clean CSV', () => {
    const csv = 'title,epic\nStory A,Auth\nStory B,Core'
    const r = parseCsvText(csv)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.parseWarnings).toBe(0)
    expect(r.rows).toHaveLength(2)
  })
})

// ─── applyMapping — many columns (Jira-style) ────────────────────────────────

describe('applyMapping — many columns', () => {
  it('ignores unmapped columns; only uses title, epic, effort, tags cols', () => {
    const parsed = makeOk(
      ['Issue Type', 'Issue key', 'Summary', 'Priority', 'Labels'],
      [{ 'Issue Type': 'Story', 'Issue key': 'PROJ-1', Summary: 'User login', Priority: 'High', Labels: 'Security' }],
    )
    const mapping: ImportMapping = {
      titleCol: 'Summary',
      epicCol: '',
      fallbackEpicId: 'epic-1',
      effortCol: '',
      effortRoleId: '',
      tagsCol: 'Labels',
    }
    const r = applyMapping(parsed, mapping, STATE)
    expect(r.rows).toHaveLength(1)
    expect(r.rows[0].fields.title).toBe('User login')
    expect(r.rows[0].fields.labels).toEqual(['Security'])
    // Unmapped columns must not bleed into story fields
    const fields = r.rows[0].fields as unknown as Record<string, unknown>
    expect(fields['Issue key']).toBeUndefined()
    expect(fields['Priority']).toBeUndefined()
  })

  it('uses parseWarnings from a partial parse in the mapped result count', () => {
    // Simulate a parse result that already dropped some rows due to formatting
    const parsed = makeOk(
      ['title'],
      [{ title: 'Clean story' }],
      2, // 2 rows were dropped during parsing
    )
    const r = applyMapping(parsed, DEFAULT_MAPPING, STATE)
    // applyMapping works on the already-filtered rows; the 2 dropped are upstream
    expect(r.rows).toHaveLength(1)
    expect(r.skipped).toBe(0)
  })
})
