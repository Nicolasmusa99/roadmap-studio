// Source-of-truth dictionary. es.ts is typed as `typeof en`, so TypeScript
// enforces that every key added here is also added there.
export const en = {
  // ── TopBar ───────────────────────────────────────────────────────────────
  reset: 'RESET',
  resetConfirm: 'Reset to factory baseline?',
  legendTitle: 'Notation',
  legendD: 'd — effort in days for that role (an input, chosen from the scale).',
  legendP: 'p — people assigned to that role (more people = shorter duration).',
  legendSem: 'sem — duration in weeks (derived by the tool, not typed).',
  legendRoles: 'Role chips: Data · Full-stack · AI · Product Designer.',
  legendMvp: 'MVP — the story is running at its own reduced MVP scope %.',
  legendAuto: 'AUTO — estimate auto-suggested from the epic (never edited yet).',
  legendScope: 'SCOPE % — share of total effort still inside the active threats.',
  legendTargetForecast: 'Target = committed date · Forecast = projected end.',
  legendDegraded: 'DEGRADED — the story runs without an amplifying dimension (e.g. energy burden without heat). Not blocked, just reduced.',

  // ── LeftPanel ────────────────────────────────────────────────────────────
  team: 'TEAM',
  threats: 'THREATS',
  roleLoad: 'ROLE LOAD',
  removeRole: 'Remove {name}',
  addRole: 'Add {name}',
  scopeReadout: 'SCOPE {pct}% · {inScope}/{total} stories',

  // ── View toggle / Timeline (US-002) ──────────────────────────────────────
  viewToggleAria: 'Switch view',
  viewTree: 'TREE',
  viewTimeline: 'TIMELINE',
  viewAssumptions: 'ASSUMPTIONS',
  tlWeeks: 'WEEKS',
  tlEmpty: 'No scheduled stories',

  // ── Assumptions & open questions (invariant #15) ─────────────────────────
  asmTitle: 'ASSUMPTIONS & OPEN QUESTIONS',
  asmSubtitle: 'What this roadmap rests on, and what we’d ask the board. Everything here is editable.',
  asmAddAssumption: 'Add assumption',
  asmAddQuestion: 'Add question',
  asmAssumptionPlaceholder: 'State an assumption…',
  asmQuestionPlaceholder: 'What would you ask the board?',
  asmDelete: 'Delete',

  // ── Milestones (US-015 / US-016) ─────────────────────────────────────────
  msNew: 'CHECKPOINT',
  msCheckpoint: 'CHECKPOINT',
  msCreateTitle: 'New checkpoint',
  msName: 'Name',
  msTarget: 'TARGET',
  msStories: 'Stories (any epic)',
  msCreate: 'Create',
  cancel: 'Cancel',
  msComposition: 'COMPOSITION',
  msForecast: 'FORECAST',
  msOnTrack: 'ON TRACK',
  msAtRisk: 'AT RISK',
  msBlocked: 'BLOCKED',
  msGap: '+{n} wk',

  // ── TreeView ─────────────────────────────────────────────────────────────
  nStories: '{n} stories',
  blocked: 'BLOCKED',
  degradedBadge: 'DEGRADED',
  degradedTip: 'Degraded — the {dims} dimension is off (its threat layer is unchecked). The score keeps its own component; not blocked, just less precise.',
  sectionDegraded: 'DEGRADATION',
  dragEpicTip: 'Drag to reorder STAGE',
  dragStoryTip: 'Drag to reorder',
  reorderEpicAria: 'Reorder STAGE',
  reorderStoryAria: 'Reorder story',

  // ── RightPanel — read mode ────────────────────────────────────────────────
  selectHint: 'Select a story',
  editStory: 'EDIT',

  // ── RightPanel — edit mode (US-007) ──────────────────────────────────────
  saveStory: 'SAVE',
  fieldTitle: 'TITLE',
  fieldAsA: 'AS A',
  fieldIWant: 'I WANT',
  fieldSoThat: 'SO THAT',

  // ── RightPanel — effort + roles (US-009 / US-010) ────────────────────────
  sectionRoles: 'EFFORT BY ROLE',
  noEffortPlaceholder: '—',
  addRoleLabel: '+ {name}',

  // ── RightPanel — MVP depth (US-017) ──────────────────────────────────────
  sectionMvp: 'MVP SCOPE',
  mvpPctLabel: 'MVP % of full effort',
  mvpEnabledLabel: 'Apply MVP',
  mvpTradeoff: 'MVP = {pct}% of full effort — {rest}% left out',
  sectionNarrative: 'NARRATIVE',
  narrativeAs: 'As a',
  narrativeWant: ', I want',
  narrativeSoThat: ', so that',
  sectionEffort: 'EFFORT BY ROLE',
  sectionSchedule: 'SCHEDULE',
  labelStart: 'START',
  labelEnd: 'END',
  labelDuration: 'DURATION',
  notScheduled: 'Not scheduled',
  mvpScope: 'MVP scope',
  mvpActive: 'ON',
  sectionDeps: 'DEPENDENCIES',
  sectionLabels: 'LABELS',
  blockedRole: '⊘ BLOCKED — role unavailable',
  blockedDep: '⊘ BLOCKED — dependency blocked',
  blockedUnknown: '⊘ NOT SCHEDULED',

  // ── Epic CRUD (US-003, US-004) ───────────────────────────────────────────
  addEpic: 'ADD STAGE',
  newEpicPlaceholder: 'Stage name…',
  epicDeleteConfirm: 'Delete this stage and all its stories? This cannot be undone.',
  epicRenameSave: 'Rename',

  // ── Story CRUD (US-005, US-008) ───────────────────────────────────────────
  newStory: 'NEW STORY',
  copyStory: 'COPY',
  storyModalSave: 'Add to roadmap',
  fieldDependsOn: 'DEPENDS ON',
  deleteStory: 'DELETE',
  deleteStoryConfirm: 'Delete this story? This cannot be undone.',

  // ── Reorder error messages (interpolated) ────────────────────────────────
  errEpicMove:
    'Cannot move STAGE "{epicName}" here: {storyId} depends on {depId} (STAGE "{depEpicName}"). The source STAGE must come after.',
  errStoryMove:
    'Cannot move "{storyTitle}": it depends on {depId}, which would appear after it in the same STAGE.',
}
