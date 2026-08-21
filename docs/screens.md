# Screen Inventory — Roadmap Studio

> Inventario de pantallas y estados de la herramienta genérica. Los estados derivados se linkean por
> Clave Foránea a su pantalla base. Marcas: `[NUEVO]` = posterior al modelo original; `[VERIFICAR]` =
> chequear contra el código.

## Bloque A — Multi-roadmap y navegación `[NUEVO]`

| ID | Nombre | Plataforma | Clave Foránea | Detalle visual |
|---|---|---|---|---|
| SCR-A01 | Home — Mis Roadmaps | Web | — | Pantalla inicial. Lista de roadmaps guardados como cards. Cada card: nombre, indicadores de dashboard (checkpoint próximo en fecha/en riesgo, contadores de historias/roles/tags, fecha proyectada, última edición). Acciones: crear, abrir, renombrar, borrar (con confirmación). Estado vacío invita a crear el primer roadmap. (US-030, US-033) |
| SCR-A02 | Home — estado vacío | Web | SCR-A01 | Primera apertura (localStorage vacío): mensaje "no hay roadmaps aún" + CTA para crear el primero. (US-030) |
| SCR-A03 | Crear roadmap | Web | SCR-A01 | Input de nombre; al confirmar, crea un roadmap vacío (starter team) y entra a su workspace. (US-030) |
| SCR-A04 | Selector de roadmap (dropdown) | Web | SCR-001 | En la barra superior del workspace: dropdown con los roadmaps para saltar entre ellos; botón "volver a Home". (US-032) |

## Bloque B — Workspace (un roadmap)

| ID | Nombre | Plataforma | Clave Foránea | Detalle visual |
|---|---|---|---|---|
| SCR-001 | Workspace — Vista Árbol (base) | Web | — | Layout de tres zonas. Izquierda: palancas (equipo por rol con steppers, toggles de **tags**, profundidad MVP/Full, `SCOPE %`). Centro: árbol expandible Componente → Epic → Historia, con esfuerzo y duración agregados. Derecha: flags de trade-off, detalle y escenarios. Barra superior con selector de roadmap y botón Reset. (US-001) |
| SCR-002 | Workspace — Vista Timeline (Gantt) | Web | SCR-001 | Toggle de vista. El centro muestra los epics como barras en el tiempo, con marcadores de milestone y conexiones de dependencia. Paneles laterales se mantienen. (US-002) |
| SCR-003 | Epic — crear | Web | SCR-001 | Modal para crear un epic: naming [Área] — [Resultado], objetivo, criterios, milestone, componente. Nace sin historias (duración 0). (US-003) |
| SCR-004 | Epic — editar / eliminar | Web | SCR-001 | Edición del epic. Eliminar pide confirmación (con conteo de historias) y arrastra sus historias; limpia dependencias huérfanas. Cualquier epic es editable/eliminable. (US-004) |
| SCR-005 | Historia — crear (modo borrador) | Web | SCR-001 | Formulario rápido: nombre, estimación por rol, dependencia. Entra al timeline con badge "borrador". (US-005) |
| SCR-006 | Historia — completar | Web | SCR-005 | Formulario completo sobre un borrador: Como/Quiero/Para, UCs, Reglas, tags, profundidad. Al completarse desaparece el badge. (US-005) |
| SCR-007 | Historia — vista lectura | Web | SCR-001 | Detalle en lectura: Como/Quiero/Para, UCs, Reglas, Estados + planificación (componente, epic, tags, estimación, rol, dependencias, profundidad). Control "Editar". (US-006) |
| SCR-008 | Historia — modo edición | Web | SCR-007 | Todos los campos editables. Guardar recalcula el timeline; cancelar revierte. (US-007) |
| SCR-009 | Historia — eliminar / mover | Web | SCR-007 | Eliminar (con confirmación) o reasignar a otro epic. Al mover, el esfuerzo migra y las dependencias se revalidan. (US-008) |
| SCR-030 | Historia — nueva (formulario completo) | Web | SCR-001 | Modal de creación con el set completo: Como/Quiero/Para, UCs, Reglas, esfuerzo por rol (escala), rol, dependencia, MVP%, tags. Ningún campo asumido. (US-005) |
| SCR-031 | Historia — copiar existente | Web | SCR-007 | "Copiar": duplica todos los campos en una historia nueva editable. (US-005) |

## Bloque C — Estimación, roles y equipo

| ID | Nombre | Plataforma | Clave Foránea | Detalle visual |
|---|---|---|---|---|
| SCR-010 | Historia — estimación por rol | Web | SCR-008 | Esfuerzo por rol (escala de días). Muestra la duración derivada = esfuerzo del rol cuello de botella ÷ gente. (US-009) |
| SCR-011 | Historia — asignación de rol | Web | SCR-008 | Selección de los roles que ejecutan la historia. Si un rol asignado queda en 0, la historia se bloquea. (US-010) |
| SCR-012 | Panel de equipo | Web | SCR-001 | Steppers por rol para subir/bajar personas. Cada cambio recalcula el timeline. Un rol en cero bloquea. (US-011) |
| SCR-012b | Gestión de roles dinámicos | Web | SCR-012 | `[NUEVO]` Crear rol nuevo (nombre libre + capacidad), renombrar, borrar (con aviso si tiene esfuerzo asignado). Starter team de 4 roles editable. (US-034) |
| SCR-013 | Vista de carga por rol | Web | SCR-001 | "Role load ÷ people": suma del esfuerzo por rol / gente. Resalta el cuello de botella. En vivo. (US-012) |
| SCR-032 | Selector de esfuerzo (escala de días) | Web | SCR-030 | Escala acotada: 1d · 2d · 3d · 1sem · 10d · 2sem · 3sem · 4sem. Lista editable. (US-009, US-028) |
| SCR-033 | Config — escala y conversión | Web | SCR-001 | Editar los pasos de la escala y la constante "días por semana" (default 5). Recalcula toda la agenda. (US-028) |

## Bloque D — Dependencias, milestones, calendario

| ID | Nombre | Plataforma | Clave Foránea | Detalle visual |
|---|---|---|---|---|
| SCR-014 | Historia — declarar dependencia | Web | SCR-008 | Selector de dependencia hacia otra historia. Impide ciclos. Distingue interna (mismo epic) de cruzada. (US-013) |
| SCR-015 | Timeline — dependencias y reordenamiento | Web | SCR-002 | Dependencias cruzadas como conexiones. Reordenar epics sin dependencia dura; si rompe una real, la tool frena y explica. (US-014) |
| SCR-016 | Milestone — crear | Web | SCR-001 | Modal: nombre, fecha target, selección de historias de cualquier epic. Muestra qué historias lo componen. (US-015) |
| SCR-017 | Milestone — target vs forecast | Web | SCR-002 | Marcador con target fijo y forecast calculado. Se marca "en riesgo" si forecast > target, con la brecha. (US-016) |
| SCR-035 | Config — fecha de inicio y calendario | Web | SCR-001 | Fecha de inicio configurable y lista editable de feriados (hoy US). Timeline en días hábiles. `[BACKLOG: selector de país]` (US-029) |
| SCR-036 | Timeline — días hábiles y feriados | Web | SCR-002 | Eje en días hábiles: fines de semana y feriados marcados (feriado nombrado). Fechas reales de calendario. (US-029) |

## Bloque E — Scope, tags, MVP

| ID | Nombre | Plataforma | Clave Foránea | Detalle visual |
|---|---|---|---|---|
| SCR-018 | Profundidad MVP / Full | Web | SCR-001 | Toggle MVP/Full por historia. El esfuerzo se ajusta por el % de MVP de esa pieza; recalcula; muestra nota de trade-off. (US-017) |
| SCR-019 | Toggle de tags | Web | SCR-001 | Toggles de los tags definidos por el usuario. Apagar uno **saca del roadmap** las historias que lo llevan (filtra Árbol + Timeline, recalcula). Muestra `SCOPE %`. (US-018) |
| SCR-034 | Gestionar tags | Web | SCR-001 | Crear tag (nombre libre), activar/desactivar, editar, eliminar (con aviso si está en uso). Lista editable. (US-018) |

## Bloque F — Notas, escenarios, fit, reset

| ID | Nombre | Plataforma | Clave Foránea | Detalle visual |
|---|---|---|---|---|
| SCR-020 | Notas / Assumptions — secciones libres | Web | SCR-001 | Tab de notas. Crear secciones con nombre libre; agregar/editar/borrar notas dentro de cada una. Por roadmap, persistido. (US-019) |
| SCR-022 | Comparador de escenarios A/B | Web | SCR-001 | Guardar el estado como Escenario A o B y verlos lado a lado con milestones y fechas. Sin "ganador". (US-021) |
| SCR-023 | Fit por objetivo | Web | SCR-001 | Selector de objetivo (velocidad / cobertura / derisking). Muestra el fit del roadmap con la fórmula a la vista. (US-022) |
| SCR-024 | Reset del roadmap | Web | SCR-001 | "Reset" con confirmación: el roadmap vuelve a su estado inicial vacío (starter team). No afecta a otros roadmaps. (US-023) |

## Bloque G — Agregación (display)

| ID | Nombre | Plataforma | Clave Foránea | Detalle visual |
|---|---|---|---|---|
| SCR-028 | Agregación de estimaciones (display) | Web | SCR-001 | En cada nivel (epic y componente): esfuerzo total (suma) y duración, con desglose por rol. Distingue esfuerzo de duración. (US-026) |
| SCR-029 | Estimación sugerida (placeholder) | Web | SCR-008 | Historia sin estimar muestra valor sugerido (promedio del epic) marcado "estimado automáticamente". (US-027) |

---

> ### Pantallas retiradas respecto de la versión case-study
> - **SCR-020 viejo (panel de supuestos y datasets climáticos):** reemplazado por SCR-020 nuevo (notas libres). Sin datasets pre-cargados de dominio.
> - **SCR-021 (supuestos locales en la historia):** absorbido por notas libres. `[VERIFICAR]`
> - **SCR-025 (aviso de restaurar sesión):** ya no aplica — la persistencia multi-roadmap carga todo directo desde la Home.
> - **SCR-026 / SCR-027 (exportar roadmap / documento PDF):** **no construidos.** Movidos a `backlog.md`.
> - Toda referencia a datasets climáticos, amenazas heat/flood/energy y personas de dominio se eliminó; el filtrado por scope es ahora genérico vía tags.
