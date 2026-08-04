// Source-of-truth dictionary. es.ts is typed as `typeof en`, so TypeScript
// enforces that every key added here is also added there.
export const en = {
  // ── TopBar ───────────────────────────────────────────────────────────────
  reset: 'RESET',
  resetConfirm: 'Reset to factory baseline?',

  // ── LeftPanel ────────────────────────────────────────────────────────────
  team: 'TEAM',
  threats: 'THREATS',
  roleLoad: 'ROLE LOAD',
  removeRole: 'Remove {name}',
  addRole: 'Add {name}',

  // ── View toggle / Timeline (US-002) ──────────────────────────────────────
  viewToggleAria: 'Switch view',
  viewTree: 'TREE',
  viewTimeline: 'TIMELINE',
  tlWeeks: 'WEEKS',
  tlEmpty: 'No scheduled stories',

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

  // ── Reorder error messages (interpolated) ────────────────────────────────
  errEpicMove:
    'Cannot move STAGE "{epicName}" here: {storyId} depends on {depId} (STAGE "{depEpicName}"). The source STAGE must come after.',
  errStoryMove:
    'Cannot move "{storyTitle}": it depends on {depId}, which would appear after it in the same STAGE.',
}
