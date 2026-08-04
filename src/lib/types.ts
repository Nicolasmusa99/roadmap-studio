// ─── Estimation ──────────────────────────────────────────────────────────────

export type EstimationState = 'auto' | 'manual' | 'unestimated'

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface Holiday {
  name: string
  date: string // YYYY-MM-DD
}

// Source of truth for all date math. holidays is editable by the PM;
// getUsHolidays() only pre-populates it, never overrides it.
export interface CalendarConfig {
  startDate: string    // YYYY-MM-DD; default '2026-08-24'
  daysPerWeek: number  // default 5; editable — recalculates the full schedule (TC-015, TC-016)
  holidays: Holiday[]  // editable list; PM can add/remove entries
}

// ─── Effort scale ────────────────────────────────────────────────────────────

// One step of the effort scale.  days is the numeric value used in calculations;
// label is how it appears in the UI selector.
export interface EffortScaleStep {
  days: number
  label: string // '1d' | '2d' | '3d' | '1sem' | '2sem' | '3sem' | '4sem'
}

// Default scale: [1, 2, 3, 5, 10, 15, 20] days (product-model §Esfuerzo).
// Exported as a plain array so the PM can extend or trim it at runtime.
export const DEFAULT_EFFORT_SCALE: EffortScaleStep[] = [
  { days: 1,  label: '1d'   },
  { days: 2,  label: '2d'   },
  { days: 3,  label: '3d'   },
  { days: 5,  label: '1sem' },
  { days: 10, label: '2sem' },
  { days: 15, label: '3sem' },
  { days: 20, label: '4sem' },
]

// ─── Team & roles ────────────────────────────────────────────────────────────

export interface TeamRole {
  id: string
  name: string
  people: number // 0 → all stories using this role are blocked
}

// Effort assigned to one role on a story (days from the scale)
export interface RoleEffort {
  roleId: string
  days: number
}

// ─── Risk layers (threats) ───────────────────────────────────────────────────

export interface RiskLayer {
  id: string
  name: string
  active: boolean
}

// ─── Core data model ─────────────────────────────────────────────────────────

export interface Story {
  id: string
  epicId: string
  title: string
  // Agile narrative
  asA: string
  iWant: string
  soThat: string
  useCases: string[]
  rules: string[]
  // Estimation — effort lives here, never in the epic (invariant #2)
  roleEfforts: RoleEffort[]
  estimationState: EstimationState
  // MVP depth — % is per-story, not global (invariant #11)
  mvpPct: number       // 0-100: % of Full effort the MVP version costs
  mvpEnabled: boolean
  // Dependency graph
  dependsOn: string[]  // story IDs; cycle-checked before accept
  // Meta
  isDraft: boolean
  isProtected: boolean // true = can't be deleted (brief stories)
  datasetIds: string[]
  labels: string[]
}

export interface Epic {
  id: string
  componentId: string
  name: string
  objective?: string
  isProtected: boolean // true = can't be deleted (four brief epics)
  milestoneId?: string
}

export interface Component {
  id: string
  name: string
}

export interface Milestone {
  id: string
  name: string
  target: string   // YYYY-MM-DD; fixed/committed date
  storyIds: string[] // forecast = max(end) of these stories
}

export interface Dataset {
  id: string
  name: string
  resolution: string
  frequency: string
}

// ─── App-level config ────────────────────────────────────────────────────────

export interface AppConfig {
  calendarConfig: CalendarConfig
  effortScale: EffortScaleStep[] // PM-editable; initialized from DEFAULT_EFFORT_SCALE
  riskLayers: RiskLayer[]
  teamRoles: TeamRole[]
}

// ─── Scheduler output ────────────────────────────────────────────────────────

export interface ScheduledStory {
  storyId: string
  startDate: string   // YYYY-MM-DD (inclusive)
  endDate: string     // YYYY-MM-DD (last working day, inclusive)
  durationDays: number
  blocked: boolean
  blockedReason?: string
}

// ─── Full app state ───────────────────────────────────────────────────────────

export interface AppState {
  components: Component[]
  epics: Epic[]
  stories: Story[]
  milestones: Milestone[]
  datasets: Dataset[]
  config: AppConfig
}
