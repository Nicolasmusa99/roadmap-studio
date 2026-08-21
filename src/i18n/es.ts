import type { en } from './en'

// Must contain every key in `en` — TypeScript will error on missing keys.
export const es: typeof en = {
  // ── TopBar ───────────────────────────────────────────────────────────────
  reset: 'REINICIAR',
  resetConfirm: '¿Reiniciar este roadmap a su estado inicial? Se borran todos los stages, historias y configuración. Los otros roadmaps no se ven afectados.',
  backHome: '← INICIO',
  renameRoadmapAria: 'Renombrar roadmap',
  switchRoadmapAria: 'Cambiar roadmap',
  storageErrorQuota: 'Almacenamiento lleno — el último guardado puede haber fallado. Borrá roadmaps no usados.',
  storageErrorUnavailable: 'localStorage no disponible — los cambios no se están guardando.',

  // ── Pantalla home ─────────────────────────────────────────────────────────
  homeTitle: 'MIS ROADMAPS',
  homeEmpty: 'No hay roadmaps todavía.',
  homeEmptyHint: 'Creá uno para empezar a planificar.',
  homeCreate: '+ NUEVO ROADMAP',
  homeNewPlaceholder: 'Nombre del roadmap…',
  homeOpen: 'Abrir',
  homeRename: 'Renombrar',
  homeDelete: 'Eliminar',
  homeDeleteConfirm: '¿Eliminar "{name}"? Se borran todos sus datos de forma permanente. Esta acción no se puede deshacer.',
  homeLastEdited: 'Editado {date}',
  homeNStories: '{n} historias',
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
  // Role CRUD (Cambio 2 — roles dinámicos)
  addRoleBtn: 'AGREGAR ROL',
  newRolePlaceholder: 'Nombre del rol…',
  renameRoleAria: 'Renombrar rol',
  deleteRoleAria: 'Borrar rol {name}',
  deleteRoleConfirm: '¿Borrar el rol "{name}"? No se puede deshacer.',
  deleteRoleConfirmEffort: '¿Borrar el rol "{name}"? {n} historias le asignan effort ({ids}); ese effort se va a quitar para no dejar nada huérfano. No se puede deshacer.',
  // Tag CRUD (Cambio 3 — tags libres reemplazan threats fijas)
  tags: 'TAGS',
  addTagBtn: 'AGREGAR TAG',
  newTagPlaceholder: 'Nombre del tag…',
  deleteTagAria: 'Borrar tag {name}',
  deleteTagConfirm: '¿Borrar el tag "{name}"? No se puede deshacer.',
  deleteTagConfirmUsed: '¿Borrar el tag "{name}"? {n} historias llevan esta etiqueta ({ids}); se va a quitar de ellas. No se puede deshacer.',
  sectionTags: 'TAGS',

  // ── View toggle / Timeline (US-002) ──────────────────────────────────────
  viewToggleAria: 'Cambiar vista',
  viewTree: 'ÁRBOL',
  viewTimeline: 'TIMELINE',
  viewAssumptions: 'SUPUESTOS',
  tlWeeks: 'SEMANAS',
  tlEmpty: 'Sin historias agendadas',

  // ── Notas y supuestos (invariant #15 — secciones libres) ──────────────
  asmTitle: 'NOTAS Y SUPUESTOS',
  asmNoSections: 'Aún no hay secciones.',
  asmNoSectionsHint: 'Creá una sección para empezar a tomar notas.',
  asmNewSection: '+ NUEVA SECCIÓN',
  asmSectionPlaceholder: 'Nombre de sección…',
  asmRenameSection: 'Renombrar sección',
  asmDeleteSection: 'Eliminar sección',
  asmDeleteSectionConfirm: '¿Eliminar la sección "{name}" y sus {n} notas? Esto no se puede deshacer.',
  asmAddNote: '+ Agregar nota',
  asmNotePlaceholder: 'Escribe una nota…',
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
  // Borrado de stage dependency-aware (cascada): dice cuántas historias se van y quién afuera depende.
  deleteEpicConfirm: '¿Eliminar el stage "{name}" y sus {n} historias? Esta acción no se puede deshacer.',
  deleteEpicConfirmDeps: '¿Eliminar el stage "{name}" y sus {n} historias? {m} historias fuera de este stage dependen de ellas ({ids}); esas dependencias se van a limpiar para no dejar nada huérfano. Esta acción no se puede deshacer.',
  epicRenameSave: 'Renombrar',

  // ── Story CRUD (US-005, US-008) ───────────────────────────────────────────
  newStory: 'NUEVA HISTORIA',
  copyStory: 'COPIAR',
  storyModalSave: 'Agregar al roadmap',
  fieldDependsOn: 'DEPENDE DE',
  deleteStory: 'ELIMINAR',
  deleteStoryConfirm: '¿Eliminar esta historia? Esta acción no se puede deshacer.',
  // Borrado de historia dependency-aware: nombra las historias que dependen de esta.
  deleteStoryConfirmDeps: '¿Eliminar {id}? {n} historias dependen de ella ({ids}); su dependencia de {id} se va a quitar para no dejar nada huérfano. Esta acción no se puede deshacer.',

  // ── Reorder error messages (interpolated) ────────────────────────────────
  errEpicMove:
    'No se puede mover el STAGE "{epicName}" aquí: {storyId} depende de {depId} (del STAGE "{depEpicName}"). El STAGE de origen debe ir después.',
  errStoryMove:
    'No se puede mover "{storyTitle}": depende de {depId}, que quedaría después en el mismo STAGE.',
}
