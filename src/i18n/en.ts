// Source-of-truth dictionary. es.ts is typed as `typeof en`, so TypeScript
// enforces that every key added here is also added there.
export const en = {
  // ── TopBar ───────────────────────────────────────────────────────────────
  reset: 'RESET',
  resetConfirm: 'Reset this roadmap to its initial state? All stages, stories, and settings will be cleared. Other roadmaps are not affected.',
  backHome: '← HOME',
  renameRoadmapAria: 'Rename roadmap',
  switchRoadmapAria: 'Switch roadmap',
  storageErrorQuota: 'Storage full — last save may have failed. Delete unused roadmaps.',
  storageErrorUnavailable: 'Local storage unavailable — changes are not being saved.',

  // ── Home screen ───────────────────────────────────────────────────────────
  homeTitle: 'MY ROADMAPS',
  homeEmpty: 'No roadmaps yet.',
  homeEmptyHint: 'Create one to start planning.',
  homeCreate: '+ NEW ROADMAP',
  homeNewPlaceholder: 'Roadmap name…',
  homeOpen: 'Open',
  homeRename: 'Rename',
  homeDelete: 'Delete',
  homeDeleteConfirm: 'Delete "{name}"? All its data will be permanently removed. This cannot be undone.',
  homeLastEdited: 'Edited {date}',
  homeNStories: '{n} stories',
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
  // Role CRUD (Change 2 — dynamic roles)
  addRoleBtn: 'ADD ROLE',
  newRolePlaceholder: 'Role name…',
  renameRoleAria: 'Rename role',
  deleteRoleAria: 'Delete role {name}',
  deleteRoleConfirm: 'Delete role "{name}"? This cannot be undone.',
  deleteRoleConfirmEffort: 'Delete role "{name}"? {n} stories assign effort to it ({ids}); that effort will be removed so nothing is left orphaned. This cannot be undone.',
  // Tag CRUD (Change 3 — free tags replace fixed threats)
  tags: 'TAGS',
  addTagBtn: 'ADD TAG',
  newTagPlaceholder: 'Tag name…',
  deleteTagAria: 'Delete tag {name}',
  deleteTagConfirm: 'Delete tag "{name}"? This cannot be undone.',
  deleteTagConfirmUsed: 'Delete tag "{name}"? {n} stories carry this label ({ids}); it will be removed from them. This cannot be undone.',
  sectionTags: 'TAGS',

  // ── View toggle / Timeline (US-002) ──────────────────────────────────────
  viewToggleAria: 'Switch view',
  viewTree: 'TREE',
  viewTimeline: 'TIMELINE',
  viewAssumptions: 'ASSUMPTIONS',
  tlWeeks: 'WEEKS',
  tlEmpty: 'No scheduled stories',

  // ── Notes & Assumptions tab (invariant #15 — free sections) ─────────────
  asmTitle: 'NOTES & ASSUMPTIONS',
  asmNoSections: 'No sections yet.',
  asmNoSectionsHint: 'Create a section to start taking notes.',
  asmNewSection: '+ NEW SECTION',
  asmSectionPlaceholder: 'Section name…',
  asmRenameSection: 'Rename section',
  asmDeleteSection: 'Delete section',
  asmDeleteSectionConfirm: 'Delete section "{name}" and its {n} notes? This cannot be undone.',
  asmAddNote: '+ Add note',
  asmNotePlaceholder: 'Write a note…',
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
  // Dependency-aware stage deletion (cascade): states how many stories go and who outside depends on them.
  deleteEpicConfirm: 'Delete stage "{name}" and its {n} stories? This cannot be undone.',
  deleteEpicConfirmDeps: 'Delete stage "{name}" and its {n} stories? {m} stories outside this stage depend on them ({ids}); those dependencies will be cleaned up so nothing is orphaned. This cannot be undone.',
  epicRenameSave: 'Rename',

  // ── Story CRUD (US-005, US-008) ───────────────────────────────────────────
  newStory: 'NEW STORY',
  copyStory: 'COPY',
  storyModalSave: 'Add to roadmap',
  fieldDependsOn: 'DEPENDS ON',
  deleteStory: 'DELETE',
  deleteStoryConfirm: 'Delete this story? This cannot be undone.',
  // Dependency-aware story deletion: names the stories that depend on this one.
  deleteStoryConfirmDeps: 'Delete {id}? {n} stories depend on it ({ids}); their dependency on {id} will be removed so nothing is left orphaned. This cannot be undone.',

  // ── Reorder error messages (interpolated) ────────────────────────────────
  errEpicMove:
    'Cannot move STAGE "{epicName}" here: {storyId} depends on {depId} (STAGE "{depEpicName}"). The source STAGE must come after.',
  errStoryMove:
    'Cannot move "{storyTitle}": it depends on {depId}, which would appear after it in the same STAGE.',
}
