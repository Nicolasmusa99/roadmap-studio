import type { AppState, Component, AppConfig } from '../lib/types'
import { DEFAULT_EFFORT_SCALE } from '../lib/types'
import { getUsHolidays } from '../lib/calendar'

// ─── Empty / generic baseline ───────────────────────────────────────────────
//
// This tool started as a case-study roadmap (fictional "Lumeria"). All of that
// seed content — the four epics, the 19 stories, the datasets, the checkpoints,
// the heat/flood/energy threats and the assumptions — has been removed so the
// app opens as a blank, general-purpose roadmapping tool. The ENGINE is intact:
// scheduler, dependencies, threat-scoping mechanism (lib/threats.ts), calendar,
// aggregation, milestones and estimation are untouched — only the seed DATA is
// gone. Reset (invariant #13) now returns to THIS empty state.

// ─── Components ──────────────────────────────────────────────────────────────
// One neutral root component. The tool's hierarchy is Component → Epic → Story
// (invariant #1) and the Tree only exposes "add epic" INSIDE a component, so an
// empty board still needs exactly one container to hang epics off. Rename freely.

const COMPONENTS: Component[] = [
  { id: 'comp-general', name: 'Roadmap' },
]

// ─── App config ───────────────────────────────────────────────────────────────
// Engine defaults, not case-study content: business calendar, effort scale and a
// starter team. riskLayers is empty — the label-filter MECHANISM lives in
// lib/threats.ts and stays generic; only Lumeria's concrete threats are gone.

const CONFIG: AppConfig = {
  calendarConfig: {
    startDate: '2026-08-24', // default Monday (invariant #9); editable
    daysPerWeek: 5,          // invariant #7; editable
    // Pre-populated by rule; PM can add/remove entries (invariant: editable)
    holidays: [...getUsHolidays(2026), ...getUsHolidays(2027)],
  },
  effortScale: [...DEFAULT_EFFORT_SCALE], // PM-editable copy
  riskLayers: [], // no seed threats; add/remove is a threat-management concern
  teamRoles: [
    // Starter team so the scheduler has capacity to plan against out of the box.
    // Fully editable — roles can be renamed, added and removed (see Change 2).
    { id: 'data',      name: 'Data Engineer',        people: 1 },
    { id: 'fullstack', name: 'Full-stack Developer', people: 2 },
    { id: 'ai',        name: 'AI Engineer',          people: 1 },
    { id: 'design',    name: 'Product Designer',     people: 1 },
  ],
}

// ─── Exported baseline ────────────────────────────────────────────────────────

// Immutable factory snapshot (invariant #13: reset always returns here).
export const BASELINE: AppState = {
  components:         COMPONENTS,
  epics:              [],
  stories:            [],
  milestones:         [],
  datasets:           [],
  assumptionSections: [],
  assumptions:        [],
  config:             CONFIG,
}

// Deep copy for initializing React state — mutations never touch BASELINE.
export function createInitialState(): AppState {
  return JSON.parse(JSON.stringify(BASELINE)) as AppState
}
