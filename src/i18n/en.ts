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

  // ── TreeView ─────────────────────────────────────────────────────────────
  nStories: '{n} stories',
  blocked: 'BLOCKED',
  dragEpicTip: 'Drag to reorder STAGE',
  dragStoryTip: 'Drag to reorder',
  reorderEpicAria: 'Reorder STAGE',
  reorderStoryAria: 'Reorder story',

  // ── RightPanel ───────────────────────────────────────────────────────────
  selectHint: 'Select a story',
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
