import type { en } from './en'

// Must contain every key in `en` — TypeScript will error on missing keys.
export const es: typeof en = {
  // ── TopBar ───────────────────────────────────────────────────────────────
  reset: 'REINICIAR',
  resetConfirm: '¿Reiniciar al baseline de fábrica?',
  legendTitle: 'Notación',
  legendD: 'd — esfuerzo en días de ese rol (un input, elegido de la escala).',
  legendP: 'p — personas asignadas a ese rol (más gente = menos duración).',
  legendSem: 'sem — duración en semanas (la deriva la tool, no se tipea).',
  legendRoles: 'Chips de rol: Data · Full-stack · AI · Product Designer.',
  legendMvp: 'MVP — la historia corre con su % de scope MVP reducido propio.',
  legendAuto: 'AUTO — estimación auto-sugerida del epic (nunca tocada aún).',
  legendScope: 'SCOPE % — parte del esfuerzo total aún dentro de las amenazas activas.',
  legendTargetForecast: 'Target = fecha comprometida · Forecast = fin proyectado.',
  legendDegraded: 'DEGRADED — la historia corre sin una dimensión que la amplifica (ej. energy burden sin heat). No está bloqueada, solo reducida.',

  // ── LeftPanel ────────────────────────────────────────────────────────────
  team: 'EQUIPO',
  threats: 'AMENAZAS',
  roleLoad: 'CARGA POR ROL',
  removeRole: 'Quitar {name}',
  addRole: 'Agregar {name}',
  scopeReadout: 'SCOPE {pct}% · {inScope}/{total} historias',

  // ── View toggle / Timeline (US-002) ──────────────────────────────────────
  viewToggleAria: 'Cambiar vista',
  viewTree: 'ÁRBOL',
  viewTimeline: 'TIMELINE',
  viewAssumptions: 'SUPUESTOS',
  tlWeeks: 'SEMANAS',
  tlEmpty: 'Sin historias agendadas',

  // ── Assumptions & open questions (invariant #15) ─────────────────────────
  asmTitle: 'SUPUESTOS Y PREGUNTAS ABIERTAS',
  asmSubtitle: 'En qué se apoya este roadmap y qué le preguntaríamos al board. Todo acá es editable.',
  asmAddAssumption: 'Agregar supuesto',
  asmAddQuestion: 'Agregar pregunta',
  asmAssumptionPlaceholder: 'Declará un supuesto…',
  asmQuestionPlaceholder: '¿Qué le preguntarías al board?',
  asmDelete: 'Eliminar',

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
  degradedBadge: 'DEGRADADO',
  degradedTip: 'Degradado — la dimensión {dims} está apagada (su capa de amenaza está sin marcar). El score conserva su componente propio; no está bloqueado, solo con menos precisión.',
  sectionDegraded: 'DEGRADACIÓN',
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

  // ── Epic CRUD (US-003, US-004) ───────────────────────────────────────────
  addEpic: 'AGREGAR STAGE',
  newEpicPlaceholder: 'Nombre del stage…',
  epicDeleteConfirm: '¿Eliminar este stage y todas sus historias? Esta acción no se puede deshacer.',
  epicRenameSave: 'Renombrar',

  // ── Story CRUD (US-005, US-008) ───────────────────────────────────────────
  newStory: 'NUEVA HISTORIA',
  copyStory: 'COPIAR',
  storyModalSave: 'Agregar al roadmap',
  fieldDependsOn: 'DEPENDE DE',
  deleteStory: 'ELIMINAR',
  deleteStoryConfirm: '¿Eliminar esta historia? Esta acción no se puede deshacer.',

  // ── Reorder error messages (interpolated) ────────────────────────────────
  errEpicMove:
    'No se puede mover el STAGE "{epicName}" aquí: {storyId} depende de {depId} (del STAGE "{depEpicName}"). El STAGE de origen debe ir después.',
  errStoryMove:
    'No se puede mover "{storyTitle}": depende de {depId}, que quedaría después en el mismo STAGE.',
}
