import type { AppState, Story, Epic, Component, Milestone, Dataset, AppConfig, Assumption } from '../lib/types'
import { DEFAULT_EFFORT_SCALE } from '../lib/types'
import { getUsHolidays } from '../lib/calendar'

// ─── Components ───────────────────────────────────────────────────────────────

const COMPONENTS: Component[] = [
  { id: 'comp-data',      name: 'Data Foundation'      },
  { id: 'comp-viz',       name: 'Geospatial Visualizer' },
  { id: 'comp-risk',      name: 'Risk Insights'         },
  { id: 'comp-ai',        name: 'AI Mitigation Plans'   },
]

// ─── Epics — four from the brief, all protected (invariant: not deletable) ────

const EPICS: Epic[] = [
  { id: 'epic-data', componentId: 'comp-data', name: 'Data Foundation',      isProtected: true },
  { id: 'epic-viz',  componentId: 'comp-viz',  name: 'Geospatial Visualizer', isProtected: true },
  { id: 'epic-risk', componentId: 'comp-risk', name: 'Risk Insights',         isProtected: true },
  { id: 'epic-ai',   componentId: 'comp-ai',   name: 'AI Mitigation Plans',   isProtected: true },
]

// ─── Stories — 11 stories; effort, deps and MVP% all per-story ───────────────

const STORIES: Story[] = [

  // ── epic-data ──────────────────────────────────────────────────────────────

  {
    id: 'H-001', epicId: 'epic-data',
    title: 'Ingest Aurora-Heat dataset',
    asA: 'Data Engineer', iWant: 'to ingest the hourly heat-risk grid from Aurora-Heat',
    soThat: 'the platform always has a live 1 km heat layer to score neighborhoods against',
    useCases: [
      'UC-01: Pipeline fetches hourly updates from the Aurora-Heat API.',
      'UC-02: Data is normalized to the canonical schema and time-stamped.',
    ],
    rules: [
      'Assumption: Aurora-Heat API keys are available in the deployment environment.',
      'Retry policy: 3 attempts on 5xx, then silent-fail with alert.',
    ],
    roleEfforts: [{ roleId: 'data', days: 10 }, { roleId: 'fullstack', days: 3 }],
    estimationState: 'manual', mvpPct: 55, mvpEnabled: false,
    dependsOn: [], isDraft: false, isProtected: true,
    datasetIds: ['dataset-aurora-heat'], labels: ['ingestion', 'heat'],
  },

  {
    id: 'H-002', epicId: 'epic-data',
    title: 'Ingest FloodGrid dataset',
    asA: 'Data Engineer', iWant: 'to ingest the daily flood-risk tiles from FloodGrid',
    soThat: 'the platform has fresh 250 m inundation-probability tiles for every neighborhood',
    useCases: [
      'UC-01: Daily batch import via FloodGrid FTP endpoint.',
      'UC-02: Tiles are clipped to the configured coverage polygon.',
    ],
    rules: [
      'Assumption: FloodGrid provides full-coverage tiles (no partial downloads).',
    ],
    roleEfforts: [{ roleId: 'data', days: 5 }, { roleId: 'fullstack', days: 2 }],
    estimationState: 'manual', mvpPct: 60, mvpEnabled: false,
    dependsOn: ['H-001'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-floodgrid'], labels: ['ingestion', 'flood'],
  },

  {
    id: 'H-003', epicId: 'epic-data',
    title: 'Ingest GridWatch energy dataset',
    asA: 'Data Engineer', iWant: 'to stream the 15-min energy-grid readings from GridWatch',
    soThat: 'the platform can relate consumption and grid load to the other risk layers',
    useCases: [
      'UC-01: Stream from GridWatch MQTT broker into the time-series store.',
      'UC-02: Gaps longer than 30 min are flagged and visible in the admin panel.',
    ],
    rules: [
      'Assumption: GridWatch municipality IDs map 1:1 to our area codes.',
    ],
    roleEfforts: [{ roleId: 'data', days: 5 }, { roleId: 'fullstack', days: 2 }],
    estimationState: 'manual', mvpPct: 60, mvpEnabled: false,
    dependsOn: ['H-001'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-gridwatch'], labels: ['ingestion', 'energy'],
  },

  // ── epic-viz ───────────────────────────────────────────────────────────────

  {
    id: 'H-004', epicId: 'epic-viz',
    title: 'Base risk map layer',
    asA: 'Urban Planner', iWant: 'a zoomable map of Lumeria with neighborhood boundaries',
    soThat: 'I can locate and compare risk across specific zones of the city',
    useCases: [
      'UC-01: Render a web map centered on the configured metro area.',
      'UC-02: Neighborhood polygons are clickable; clicking opens the risk summary panel.',
    ],
    rules: ['Uses an open tile server; no proprietary map key required for MVP.'],
    roleEfforts: [{ roleId: 'fullstack', days: 10 }],
    estimationState: 'manual', mvpPct: 55, mvpEnabled: false,
    dependsOn: ['H-001'], isDraft: false, isProtected: true,
    datasetIds: [], labels: ['map', 'ui'],
  },

  {
    id: 'H-005', epicId: 'epic-viz',
    title: 'Heat risk overlay',
    asA: 'Urban Planner', iWant: 'a toggleable heat-risk choropleth on the map',
    soThat: 'I can see at a glance which neighborhoods face the most dangerous heat exposure',
    useCases: [
      'UC-01: Color-coded cells from the Aurora-Heat layer at neighborhood granularity.',
      'UC-02: Tooltip shows heat-index value and risk tier on hover.',
    ],
    rules: ['Color scale follows WHO heat-stress thresholds.'],
    roleEfforts: [{ roleId: 'fullstack', days: 5 }],
    estimationState: 'manual', mvpPct: 50, mvpEnabled: false,
    dependsOn: ['H-004', 'H-013'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-aurora-heat'], labels: ['map', 'heat'],
  },

  {
    id: 'H-006', epicId: 'epic-viz',
    title: 'Flood risk overlay',
    asA: 'Urban Planner', iWant: 'a toggleable flood-risk overlay on the map',
    soThat: 'I can see which neighborhoods face the highest inundation probability before approving new development',
    useCases: [
      'UC-01: 250m FloodGrid tiles rendered as a semi-transparent layer.',
      'UC-02: Layer toggled independently of the heat overlay.',
    ],
    rules: ['Opacity defaults to 70%; user-adjustable.'],
    roleEfforts: [{ roleId: 'fullstack', days: 5 }],
    estimationState: 'manual', mvpPct: 50, mvpEnabled: false,
    dependsOn: ['H-004', 'H-002', 'H-013'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-floodgrid'], labels: ['map', 'flood'],
  },

  {
    id: 'H-012', epicId: 'epic-viz',
    title: 'Wireframes: Geospatial Visualizer',
    asA: 'Product Designer', iWant: 'low-fi wireframes for the map, panels and overlay controls',
    soThat: 'engineering builds the visualizer against an agreed layout, not guesses',
    useCases: [
      'UC-01: Wireframe the map canvas, neighborhood detail panel and layer toggles.',
      'UC-02: Review with the board; capture sign-off before build starts.',
    ],
    rules: [
      'Assumption: one design review round is enough for MVP; deeper iteration is post-MVP.',
    ],
    roleEfforts: [{ roleId: 'design', days: 5 }],
    estimationState: 'manual', mvpPct: 60, mvpEnabled: false,
    dependsOn: [], isDraft: false, isProtected: true,
    datasetIds: [], labels: ['design', 'ui'],
  },

  {
    id: 'H-013', epicId: 'epic-viz',
    title: 'Design system: risk overlays',
    asA: 'Product Designer', iWant: 'a consistent visual language for the risk overlays (color, legend, tooltip)',
    soThat: 'heat, flood and multi-risk layers read as one coherent system, not three styles',
    useCases: [
      'UC-01: Define the shared color ramp, legend and tooltip components.',
      'UC-02: Hand off tokens the overlay stories consume directly.',
    ],
    rules: [
      'Color ramps must stay colour-blind safe (declared accessibility constraint).',
    ],
    roleEfforts: [{ roleId: 'design', days: 3 }, { roleId: 'fullstack', days: 2 }],
    estimationState: 'manual', mvpPct: 60, mvpEnabled: false,
    dependsOn: ['H-012'], isDraft: false, isProtected: true,
    datasetIds: [], labels: ['design', 'ui'],
  },

  {
    id: 'H-017', epicId: 'epic-viz',
    title: 'Energy stress overlay',
    asA: 'Urban Planner', iWant: 'a toggleable overlay that shades the map by grid load and consumption intensity per neighborhood',
    soThat: 'I can see where the energy system is most strained, not just where the weather is worst',
    useCases: [
      'UC-01: Color the map from the GridWatch load-ratio per neighborhood — a cost/consumption view, not a physical-hazard view like heat or flood.',
      'UC-02: Toggled independently of the heat and flood overlays; reuses the H-013 shared visual language.',
    ],
    rules: [
      'Energy is modeled as a COST / CONSUMPTION problem (grid load, demand), not a physical-hazard layer.',
      'Sequencing decision (declared, not a data need): energy is post-MVP scope, so this work is sequenced after the MVP checkpoint (H-010). Keeps the committed MVP forecast intact — the dependency is visible here, not hidden.',
    ],
    roleEfforts: [{ roleId: 'fullstack', days: 5 }],
    estimationState: 'manual', mvpPct: 50, mvpEnabled: false,
    dependsOn: ['H-010', 'H-004', 'H-003', 'H-013'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-gridwatch'], labels: ['map', 'energy'],
  },

  // ── epic-risk ──────────────────────────────────────────────────────────────

  {
    id: 'H-007', epicId: 'epic-risk',
    title: 'Heat risk scoring per neighborhood',
    asA: 'Council Risk Analyst', iWant: 'a computed heat-risk score for each neighborhood',
    soThat: 'I can rank neighborhoods by heat severity and defend where we intervene first',
    useCases: [
      'UC-01: Score = weighted average of Aurora-Heat cells within the polygon.',
      'UC-02: Score refreshed daily; previous day retained for trend display.',
    ],
    rules: [
      'Assumption: equal cell weighting (no population-density adjustment) for MVP.',
    ],
    roleEfforts: [{ roleId: 'data', days: 5 }, { roleId: 'ai', days: 5 }],
    estimationState: 'manual', mvpPct: 45, mvpEnabled: false,
    dependsOn: ['H-001'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-aurora-heat'], labels: ['scoring', 'heat'],
  },

  {
    id: 'H-008', epicId: 'epic-risk',
    title: 'Flood risk scoring per neighborhood',
    asA: 'Council Risk Analyst', iWant: 'a computed flood-risk score for each neighborhood',
    soThat: 'I can rank neighborhoods by flood exposure and justify how it weighs into resilience decisions',
    useCases: [
      'UC-01: Score = max inundation probability across the neighborhood polygon.',
      'UC-02: Scores versioned daily.',
    ],
    rules: ['100-year flood baseline; assumes no new drainage infrastructure.'],
    roleEfforts: [{ roleId: 'data', days: 5 }, { roleId: 'ai', days: 5 }],
    estimationState: 'manual', mvpPct: 45, mvpEnabled: false,
    dependsOn: ['H-002'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-floodgrid'], labels: ['scoring', 'flood'],
  },

  {
    id: 'H-009', epicId: 'epic-risk',
    title: 'Multi-risk aggregation index',
    asA: 'member of the decision board', iWant: 'a single composite risk index per neighborhood that reflects how the threats compound, not just their sum',
    soThat: 'we can prioritize neighborhoods from one honest figure instead of juggling three separate scores',
    useCases: [
      'UC-01: Composite fuses the heat, flood and energy sub-scores with a compound-crisis term that boosts neighborhoods scoring high on more than one threat at once (e.g. high heat AND high energy burden).',
      'UC-02: Weights and the compound term are configurable in the admin panel.',
      'UC-03: When a threat layer is off, the index keeps running on the remaining dimensions and flags itself as degraded (it lost an input), rather than silently collapsing to a partial number.',
    ],
    rules: [
      'Assumption: equal initial weights (⅓ each) — declared supuesto, visible in UI.',
      'Energy sub-score = GridWatch load-ratio vs. rolling 30-day peak.',
      'Interaction is NON-linear: heat and energy burden reinforce each other (a heatwave spikes A/C demand, so a hot low-capacity neighborhood is a compounded crisis — worse than the two scores added). Capturing that is the whole reason an index beats three separate scores.',
    ],
    roleEfforts: [{ roleId: 'data', days: 3 }, { roleId: 'ai', days: 10 }],
    estimationState: 'manual', mvpPct: 40, mvpEnabled: false,
    dependsOn: ['H-007', 'H-008'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-aurora-heat', 'dataset-floodgrid', 'dataset-gridwatch'],
    labels: ['scoring', 'aggregation'],
    // Never filtered (no single-threat label), but each threat feeds a dimension:
    // toggling one off degrades the index (loses that input) instead of blocking it.
    amplifiedBy: ['heat', 'flood', 'energy'],
  },

  {
    id: 'H-018', epicId: 'epic-risk',
    title: 'Energy burden score per neighborhood',
    asA: 'Council Risk Analyst', iWant: 'a per-neighborhood energy-burden score that combines how much energy a neighborhood consumes with how able its residents are to pay for it',
    soThat: 'I can rank neighborhoods by energy vulnerability, so a low-income high-consumption area surfaces above a wealthy one that simply uses a lot',
    useCases: [
      'UC-01: Own component = consumption (GridWatch load) × inverse ability-to-pay — a low-income, high-consumption neighborhood scores highest.',
      'UC-02: Heat-amplification component = heatwaves spike A/C demand, driving up both grid stress and cost for those same households.',
      'UC-03: With the heat layer OFF, the score stays live on its own component and drops ONLY the heat-amplification dimension — rendered as a degraded / reduced-precision score, never blocked or removed.',
    ],
    rules: [
      'Energy is a COST / CONSUMPTION problem, not a physical hazard: burden = consumption × (1 / ability-to-pay).',
      'Degradation, NOT blocking: this story carries no heat label, so toggling heat off never filters it — it keeps its own component and loses only the heat-amplification dimension (see amplifiedBy: heat).',
      'Sequencing decision (declared): energy is post-MVP scope; this starts after the MVP checkpoint (H-010) so the committed MVP forecast does not move.',
    ],
    roleEfforts: [{ roleId: 'data', days: 5 }, { roleId: 'ai', days: 5 }],
    estimationState: 'manual', mvpPct: 45, mvpEnabled: false,
    dependsOn: ['H-010', 'H-003'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-gridwatch'], labels: ['scoring', 'energy'],
    amplifiedBy: ['heat'],
  },

  // ── epic-ai ────────────────────────────────────────────────────────────────
  // Same granularity as Risk Insights (heat / flood / general). H-010 builds the
  // general resilience plan from the multi-risk index; H-015 and H-016 then refine
  // it into threat-specific mitigation plans. They depend on H-010, so the MVP
  // forecast (which runs through H-010) is unchanged — the breakdown adds detail
  // without moving the committed gap.

  {
    id: 'H-010', epicId: 'epic-ai',
    title: 'Resilience plan generator',
    asA: 'Urban Planner', iWant: 'AI-generated resilience action plans for high-risk neighborhoods',
    soThat: 'I get prioritized, data-backed interventions I can take straight to the council',
    useCases: [
      'UC-01: For each neighborhood above risk threshold, generate a top-3 action list.',
      'UC-02: Each action includes estimated impact, cost tier and lead time.',
    ],
    rules: [
      'Reasoning uses LLM over the composite risk index; prompts are version-controlled.',
      'Assumption: LLM API access is available in the deployment environment.',
    ],
    roleEfforts: [{ roleId: 'ai', days: 15 }, { roleId: 'fullstack', days: 5 }],
    estimationState: 'manual', mvpPct: 45, mvpEnabled: false,
    dependsOn: ['H-009'], isDraft: false, isProtected: true,
    datasetIds: [], labels: ['ai', 'planning'],
  },

  {
    id: 'H-015', epicId: 'epic-ai',
    title: 'Heat mitigation plan generator',
    asA: 'Emergency Coordinator', iWant: 'AI-generated heat-specific mitigation actions per high-heat neighborhood',
    soThat: 'I can stand up targeted cooling responses (shade, reflective roofs, cooling centers) where heat hits hardest',
    useCases: [
      'UC-01: Specialize the general resilience plan into heat-driven actions per neighborhood.',
      'UC-02: Actions map to the heat score band so severity drives the recommendation.',
    ],
    rules: [
      'Refines the general plan using the heat-risk score as the primary signal.',
    ],
    roleEfforts: [{ roleId: 'ai', days: 5 }],
    estimationState: 'manual', mvpPct: 45, mvpEnabled: false,
    dependsOn: ['H-010', 'H-007'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-aurora-heat'], labels: ['ai', 'planning', 'heat'],
  },

  {
    id: 'H-016', epicId: 'epic-ai',
    title: 'Flood mitigation plan generator',
    asA: 'Urban Planner', iWant: 'AI-generated flood-specific mitigation actions per high-flood neighborhood',
    soThat: 'I can target structural interventions (drainage, barriers, zoning limits) to the most exposed areas',
    useCases: [
      'UC-01: Specialize the general resilience plan into flood-driven actions per neighborhood.',
      'UC-02: Actions reference the 100-year flood baseline so scope is explicit.',
    ],
    rules: [
      'Refines the general plan using the flood-risk score as the primary signal.',
    ],
    roleEfforts: [{ roleId: 'ai', days: 5 }],
    estimationState: 'manual', mvpPct: 45, mvpEnabled: false,
    dependsOn: ['H-010', 'H-008'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-floodgrid'], labels: ['ai', 'planning', 'flood'],
  },

  {
    id: 'H-019', epicId: 'epic-ai',
    title: 'Energy cost mitigation plan generator',
    asA: 'Urban Planner', iWant: 'AI-generated energy-cost mitigation actions per high-burden neighborhood',
    soThat: 'I can direct subsidies, efficiency upgrades and demand-management programs to the households that need them most',
    useCases: [
      'UC-01: Specialize the general resilience plan into energy-cost actions (subsidies, insulation/efficiency, demand response), driven by the energy-burden score.',
      'UC-02: Each action notes whether the burden is consumption-driven or ability-to-pay-driven, so the recommendation fits the cause.',
    ],
    rules: [
      'Refines the general plan (H-010) using the energy-burden score (H-018) as the primary signal — same pattern as H-015 / H-016.',
    ],
    roleEfforts: [{ roleId: 'ai', days: 5 }],
    estimationState: 'manual', mvpPct: 45, mvpEnabled: false,
    dependsOn: ['H-010', 'H-018'], isDraft: false, isProtected: true,
    datasetIds: ['dataset-gridwatch'], labels: ['ai', 'planning', 'energy'],
  },

  {
    id: 'H-011', epicId: 'epic-ai',
    title: 'Plan export and sharing',
    asA: 'Urban Planner', iWant: 'to export resilience plans as PDF and share a read-only link',
    soThat: 'stakeholders outside the platform can review the recommendations offline',
    useCases: [
      'UC-01: One-click PDF export of the current plan view.',
      'UC-02: Shareable link valid for 30 days.',
    ],
    rules: ['Export is a snapshot; live data is not embedded in the PDF.'],
    roleEfforts: [{ roleId: 'fullstack', days: 10 }],
    estimationState: 'manual', mvpPct: 60, mvpEnabled: false,
    dependsOn: ['H-014', 'H-015', 'H-016'], isDraft: false, isProtected: true,
    datasetIds: [], labels: ['export', 'sharing'],
  },

  {
    id: 'H-014', epicId: 'epic-ai',
    title: 'Report export prototype',
    asA: 'Product Designer', iWant: 'a clickable prototype of the resilience-plan export and share flow',
    soThat: 'we validate the report layout with stakeholders before engineering builds it',
    useCases: [
      'UC-01: Prototype the PDF layout and the read-only share screen.',
      'UC-02: Test the flow with two council stakeholders; fold in feedback.',
    ],
    rules: [
      'Assumption: export covers a single plan view for MVP (no multi-plan bundles).',
    ],
    roleEfforts: [{ roleId: 'design', days: 3 }],
    estimationState: 'manual', mvpPct: 60, mvpEnabled: false,
    dependsOn: ['H-010'], isDraft: false, isProtected: true,
    datasetIds: [], labels: ['design', 'export'],
  },
]

// ─── Datasets (with character — name, resolution, frequency) ─────────────────

const DATASETS: Dataset[] = [
  { id: 'dataset-aurora-heat', name: 'Aurora-Heat', resolution: '1km grid',     frequency: 'hourly' },
  { id: 'dataset-floodgrid',   name: 'FloodGrid',   resolution: '250m grid',    frequency: 'daily'  },
  { id: 'dataset-gridwatch',   name: 'GridWatch',   resolution: 'municipality', frequency: '15min'  },
]

// ─── Milestones — transversal, with intentionally aggressive MVP target ───────
// The MVP target (W10) is tight enough that the scheduler will show it in risk,
// demonstrating the target vs. forecast gap the tool is built to surface.

const MILESTONES: Milestone[] = [
  {
    id: 'ms-mvp',
    name: 'MVP',
    target: '2026-10-30',  // Week ~10; aggressive — forecast will exceed it
    storyIds: ['H-001', 'H-004', 'H-007', 'H-010'],
  },
  {
    id: 'ms-beta',
    name: 'Beta',
    target: '2027-01-29',
    storyIds: ['H-001', 'H-002', 'H-003', 'H-004', 'H-005', 'H-006', 'H-007', 'H-008', 'H-009'],
  },
  {
    id: 'ms-full',
    name: 'Full Release',
    target: '2027-03-19',
    storyIds: STORIES.map(s => s.id),
  },
]

// ─── Assumptions & open questions (invariant #15: "nada asumido") ─────────────
// Everything the roadmap silently rests on, made explicit and editable in-tool.
// The PM can add/edit/remove any of these live in the ASSUMPTIONS tab.

const ASSUMPTIONS: Assumption[] = [
  // Datasets
  { id: 'a-ds-1', category: 'Datasets', kind: 'assumption',
    text: 'Aurora-Heat, FloodGrid and GridWatch are third-party APIs already negotiated and licensed by the council.' },
  { id: 'a-ds-2', category: 'Datasets', kind: 'assumption',
    text: 'Dataset access credentials are available in the deployment environment from day one (no procurement lead time budgeted).' },
  { id: 'a-ds-3', category: 'Datasets', kind: 'assumption',
    text: 'GridWatch municipality IDs map 1:1 to our neighborhood area codes; no reconciliation layer is scoped.' },
  // Mitigation actions
  { id: 'a-mit-1', category: 'Mitigation', kind: 'assumption',
    text: 'Resilience plans are advisory (LLM-generated recommendations), not automated interventions — no actuation/IoT scope.' },
  { id: 'a-mit-2', category: 'Mitigation', kind: 'assumption',
    text: 'An LLM API with sufficient quota is available; prompt engineering is in scope, model fine-tuning is not.' },
  // Milestones & dates
  { id: 'a-ms-1', category: 'Milestones & dates', kind: 'assumption',
    text: 'The MVP target (2026-10-30) is a committed board date; the +2 wk forecast gap is the decision we are surfacing, not hiding.' },
  { id: 'a-ms-2', category: 'Milestones & dates', kind: 'assumption',
    text: 'The team is stable for the whole plan: 1 Data, 2 Full-stack, 1 AI, 1 Product Designer, working US federal-holiday calendar.' },
  // Open questions for the board
  { id: 'a-q-1', category: 'Open questions', kind: 'question',
    text: 'Does the council already have live access to all three datasets, or do any still need to be negotiated?' },
  { id: 'a-q-2', category: 'Open questions', kind: 'question',
    text: 'Is the MVP scope the four checkpoint stories, or must heat + flood both ship before we call it an MVP?' },
  { id: 'a-q-3', category: 'Open questions', kind: 'question',
    text: 'Who signs off on the resilience-plan recommendations before they reach city planners — is a human-in-the-loop review required?' },
  { id: 'a-q-4', category: 'Open questions', kind: 'question',
    text: 'If the MVP date is immovable, which threat would the board drop first to pull the forecast in — flood, energy, or heat?' },
]

// ─── App config ───────────────────────────────────────────────────────────────

const CONFIG: AppConfig = {
  calendarConfig: {
    startDate: '2026-08-24',
    daysPerWeek: 5,
    // Pre-populated by rule; PM can add/remove entries (invariant: editable)
    holidays: [...getUsHolidays(2026), ...getUsHolidays(2027)],
  },
  effortScale: [...DEFAULT_EFFORT_SCALE], // PM-editable copy
  riskLayers: [
    { id: 'layer-calor',      name: 'heat',   active: true },
    { id: 'layer-inundacion', name: 'flood',  active: true },
    { id: 'layer-energia',    name: 'energy', active: true },
  ],
  teamRoles: [
    { id: 'data',      name: 'Data Engineer',       people: 1 },
    { id: 'fullstack', name: 'Full-stack Developer', people: 2 },
    { id: 'ai',        name: 'AI Engineer',          people: 1 },
    { id: 'design',    name: 'Product Designer',     people: 1 },
  ],
}

// ─── Exported baseline ────────────────────────────────────────────────────────

// Immutable factory snapshot (invariant #13: reset always returns here).
export const BASELINE: AppState = {
  components:  COMPONENTS,
  epics:       EPICS,
  stories:     STORIES,
  milestones:  MILESTONES,
  datasets:    DATASETS,
  assumptions: ASSUMPTIONS,
  config:      CONFIG,
}

// Deep copy for initializing React state — mutations never touch BASELINE.
export function createInitialState(): AppState {
  return JSON.parse(JSON.stringify(BASELINE)) as AppState
}
