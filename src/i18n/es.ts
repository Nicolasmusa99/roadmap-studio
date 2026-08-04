import type { en } from './en'

// Must contain every key in `en` — TypeScript will error on missing keys.
export const es: typeof en = {
  // ── TopBar ───────────────────────────────────────────────────────────────
  reset: 'REINICIAR',
  resetConfirm: '¿Reiniciar al baseline de fábrica?',

  // ── LeftPanel ────────────────────────────────────────────────────────────
  team: 'EQUIPO',
  threats: 'AMENAZAS',
  roleLoad: 'CARGA POR ROL',
  removeRole: 'Quitar {name}',
  addRole: 'Agregar {name}',

  // ── View toggle / Timeline (US-002) ──────────────────────────────────────
  viewToggleAria: 'Cambiar vista',
  viewTree: 'ÁRBOL',
  viewTimeline: 'TIMELINE',
  tlWeeks: 'SEMANAS',
  tlEmpty: 'Sin historias agendadas',

  // ── Milestones (US-015 / US-016) ─────────────────────────────────────────
  msNew: 'CHECKPOINT',
  msCheckpoint: 'CHECKPOINT',
  msCreateTitle: 'Nuevo checkpoint',
  msName: 'Nombre',
  msTarget: 'TARGET',
  msStories: 'Historias (cualquier epic)',
  msCreate: 'Crear',
  cancel: 'Cancelar',
  msComposition: 'COMPOSICIÓN',
  msForecast: 'FORECAST',
  msOnTrack: 'EN FECHA',
  msAtRisk: 'EN RIESGO',
  msBlocked: 'BLOQUEADO',
  msGap: '+{n} sem',

  // ── TreeView ─────────────────────────────────────────────────────────────
  nStories: '{n} historias',
  blocked: 'BLOQUEADO',
  dragEpicTip: 'Arrastrar para cambiar prioridad del STAGE',
  dragStoryTip: 'Arrastrar para cambiar prioridad',
  reorderEpicAria: 'Reordenar STAGE',
  reorderStoryAria: 'Reordenar historia',

  // ── RightPanel — modo lectura ─────────────────────────────────────────────
  selectHint: 'Seleccioná una historia',
  editStory: 'EDITAR',

  // ── RightPanel — modo edición (US-007) ────────────────────────────────────
  saveStory: 'GUARDAR',
  fieldTitle: 'TÍTULO',
  fieldAsA: 'COMO',
  fieldIWant: 'QUIERO',
  fieldSoThat: 'PARA QUE',

  // ── RightPanel — esfuerzo y roles (US-009 / US-010) ───────────────────────
  sectionRoles: 'ESFUERZO POR ROL',
  noEffortPlaceholder: '—',
  addRoleLabel: '+ {name}',

  // ── RightPanel — profundidad MVP (US-017) ─────────────────────────────────
  sectionMvp: 'ALCANCE MVP',
  mvpPctLabel: 'MVP % del esfuerzo full',
  mvpEnabledLabel: 'Aplicar MVP',
  mvpTradeoff: 'MVP = {pct}% del esfuerzo full — {rest}% queda afuera',
  sectionNarrative: 'NARRATIVA',
  narrativeAs: 'Como',
  narrativeWant: ', quiero',
  narrativeSoThat: ', para que',
  sectionEffort: 'ESFUERZO POR ROL',
  sectionSchedule: 'CALENDARIO',
  labelStart: 'INICIO',
  labelEnd: 'FIN',
  labelDuration: 'DURACIÓN',
  notScheduled: 'No programada',
  mvpScope: 'Alcance MVP',
  mvpActive: 'ACTIVO',
  sectionDeps: 'DEPENDENCIAS',
  sectionLabels: 'ETIQUETAS',
  blockedRole: '⊘ BLOQUEADO — rol sin personas',
  blockedDep: '⊘ BLOQUEADO — dependencia bloqueada',
  blockedUnknown: '⊘ SIN PROGRAMAR',

  // ── Reorder error messages (interpolated) ────────────────────────────────
  errEpicMove:
    'No se puede mover el STAGE "{epicName}" aquí: {storyId} depende de {depId} (del STAGE "{depEpicName}"). El STAGE de origen debe ir después.',
  errStoryMove:
    'No se puede mover "{storyTitle}": depende de {depId}, que quedaría después en el mismo STAGE.',
}
