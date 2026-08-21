# Test Cases — Roadmap Studio

> Casos de prueba de la herramienta genérica. Unit (lógica pura), E2E (interacción), Integration
> (flujos cruzados). Cada TC referencia su historia (US-XXX). Marcas: `[NUEVO]` = posterior al modelo
> original; `[VERIFICAR]` = confirmar el comportamiento/nombres exactos contra el código.

---

## Grupo 0 — Multi-roadmap y persistencia `[NUEVO]`

## TC-053 — Crear un roadmap desde la Home (US-030) `[NUEVO]`
**Descripción:** Verifica que crear un roadmap desde la Home entra a su workspace vacío.
**Precondiciones:** Home "Mis Roadmaps".
**Pasos:** 1. Crear un roadmap con nombre. 2. Confirmar.
**Resultado esperado:** Se crea un roadmap vacío con el starter team de roles y se entra a su workspace.
**Tipo:** E2E

## TC-054 — Los roadmaps persisten al recargar (US-031) `[NUEVO]`
**Descripción:** Verifica que localStorage conserva los roadmaps.
**Precondiciones:** Dos roadmaps con contenido distinto.
**Pasos:** 1. Recargar la app (hard-reload).
**Resultado esperado:** Ambos roadmaps aparecen en la Home con su contenido intacto.
**Tipo:** Integration

## TC-055 — Borrar un roadmap no afecta a los otros (US-030) `[NUEVO]`
**Descripción:** Verifica el aislamiento entre roadmaps.
**Precondiciones:** Roadmaps A y B con contenido.
**Pasos:** 1. Borrar A desde la Home (confirmar).
**Resultado esperado:** A desaparece; B sigue en la lista con todo su contenido.
**Tipo:** Unit

## TC-056 — Fallo de localStorage no rompe la app (US-031) `[NUEVO]`
**Descripción:** Verifica el manejo de storage lleno/no disponible.
**Precondiciones:** localStorage mockeado para fallar.
**Pasos:** 1. Disparar un cambio que guardaría estado.
**Resultado esperado:** La app avisa (o traga el error) sin romperse; sigue funcionando.
**Tipo:** Unit

## TC-057 — Indicadores del dashboard por roadmap (US-033) `[NUEVO]` `[VERIFICAR]`
**Descripción:** Verifica que la Home calcula los indicadores de cada roadmap.
**Precondiciones:** Un roadmap con checkpoint en riesgo y N historias.
**Pasos:** 1. Ver la card en la Home.
**Resultado esperado:** Muestra estado del checkpoint (en riesgo), contadores correctos y fecha proyectada, coincidiendo con el estado interno del roadmap.
**Tipo:** Unit

## TC-058 — Saltar entre roadmaps con el selector (US-032) `[NUEVO]`
**Descripción:** Verifica el dropdown de navegación.
**Precondiciones:** Dentro de un roadmap; existe otro.
**Pasos:** 1. Elegir otro roadmap en el selector.
**Resultado esperado:** El workspace muestra el otro roadmap con su propio estado, sin volver a la Home.
**Tipo:** E2E

---

## Grupo 1 — Modelo y jerarquía

## TC-001 — Render de la jerarquía Componente › Epic › Historia (US-001)
**Precondiciones:** Un roadmap abierto en vista Árbol.
**Pasos:** 1. Expandir un epic.
**Resultado esperado:** Se listan los componentes; cada epic muestra sus historias con estado, estimación y rol.
**Tipo:** E2E

## TC-002 — El esfuerzo del epic es la suma de sus historias (US-001)
**Precondiciones:** Un epic con 3 historias estimadas.
**Resultado esperado:** El esfuerzo del epic = suma; no existe input directo de esfuerzo a nivel epic.
**Tipo:** Unit

## TC-003 — El toggle Árbol/Timeline preserva la selección (US-002)
**Precondiciones:** Una historia seleccionada en Árbol.
**Pasos:** 1. Cambiar a Timeline. 2. Volver a Árbol.
**Resultado esperado:** La misma historia sigue seleccionada; ambas vistas reflejan los mismos datos.
**Tipo:** E2E

## Grupo 2 — Epics

## TC-004 — Crear un epic con naming correcto (US-003)
**Resultado esperado:** El epic aparece en árbol y timeline con duración 0 hasta que se le agreguen historias.
**Tipo:** E2E

## TC-005 — Cualquier epic es editable y eliminable (US-004) `[MODIFICADO]`
**Descripción:** En la versión genérica NO hay epics protegidos (antes los 4 del brief no se borraban).
**Pasos:** 1. Abrir el menú de un epic.
**Resultado esperado:** Se ofrecen editar y eliminar en todos los epics.
**Tipo:** E2E

## TC-006 — Eliminar un epic limpia dependencias (US-004)
**Precondiciones:** Un epic del que dependen historias de otro epic.
**Pasos:** 1. Eliminar el epic tras confirmación.
**Resultado esperado:** El epic y sus historias se eliminan; las dependencias que apuntaban a ellas se limpian, sin dejar huérfanas.
**Tipo:** Unit

## Grupo 3 — Historias

## TC-007 — Crear una historia por formulario completo (US-005)
**Resultado esperado:** La historia entra al epic; su estimación impacta la duración del epic y el timeline al instante.
**Tipo:** E2E

## TC-008 — Copiar una historia duplica todos los campos (US-005)
**Resultado esperado:** Se crea una historia nueva con todos los campos copiados, lista para editar.
**Tipo:** E2E

## TC-009 — Historia incompleta muestra badge 'borrador' (US-005)
**Resultado esperado:** Se muestra con badge 'borrador' hasta completar todos los campos.
**Tipo:** E2E

## TC-010 — Ver una historia en modo lectura (US-006)
**Resultado esperado:** Muestra Como/Quiero/Para, UCs, reglas, y componente, epic, tags, estimación, rol, dependencias, profundidad; hay control 'Editar'.
**Tipo:** E2E

## TC-011 — Editar recalcula; cancelar revierte (US-007)
**Resultado esperado:** Al guardar, el timeline se recalcula. Al cancelar, la historia vuelve a su estado previo.
**Tipo:** E2E

## TC-012 — Mover una historia migra su esfuerzo entre epics (US-008)
**Resultado esperado:** El esfuerzo agregado de A baja y el de B sube; las dependencias se revalidan.
**Tipo:** Unit

## Grupo 4 — Estimación, roles y equipo

## TC-013 — El selector de esfuerzo ofrece la escala exacta (US-009)
**Resultado esperado:** Opciones exactas: 1d · 2d · 3d · 1sem · 10d · 2sem · 3sem · 4sem; no se tipea libre.
**Tipo:** E2E

## TC-014 — La duración deriva del rol cuello de botella (US-009)
**Precondiciones:** Historia con Data=10d, Full-stack=5d; team data=1, fullstack=2.
**Resultado esperado:** Duración = máx(10/1 , 5/2) = 10 días hábiles (2 semanas).
**Tipo:** Unit

## TC-015 — La conversión días→semanas usa la constante (US-009)
**Resultado esperado:** 10 días ÷ 5 = 2 semanas de trabajo.
**Tipo:** Unit

## TC-016 — Cambiar 'días por semana' recalcula toda la agenda (US-028)
**Pasos:** 1. Cambiar la constante a 4.
**Resultado esperado:** Todas las duraciones y fechas se recalculan usando 4 días = 1 semana.
**Tipo:** Unit

## TC-017 — La escala de esfuerzo es una lista editable (US-028)
**Resultado esperado:** El selector refleja la escala editada; ningún paso está clavado.
**Tipo:** E2E

## TC-018 — Quitar un rol asignado bloquea la historia (US-010)
**Precondiciones:** Historia asignada al rol AI; team ai=1.
**Pasos:** 1. Bajar AI a 0.
**Resultado esperado:** La historia se bloquea y el efecto sube al milestone.
**Tipo:** Unit

## TC-019 — Sumar personas comprime el timeline (US-011)
**Descripción:** Verifica que agregar gente a un rol acorta las duraciones.
**Precondiciones:** Historia con 10d de un rol, sin dependencias, rol en 1 persona.
**Pasos:** 1. Leer fecha de fin. 2. Subir el rol a 2 personas. 3. Leer fecha de fin.
**Resultado esperado:** Con 2 personas la duración baja (~5 días); la barra se acorta. **(Test de regresión del bug de recálculo por capacidad.)**
**Tipo:** Unit

## TC-020 — Crear/renombrar/borrar un rol dinámico (US-034) `[NUEVO]`
**Precondiciones:** Panel de roles (SCR-012b).
**Pasos:** 1. Crear un rol "QA". 2. Asignarle esfuerzo en una historia. 3. Renombrarlo. 4. Borrarlo.
**Resultado esperado:** El rol se crea con nombre libre y capacidad; al borrarlo con esfuerzo asignado, la tool avisa (conteo) y limpia el esfuerzo huérfano; el nombre (no el id) se ve en la UI.
**Tipo:** E2E

## TC-021 — Un rol con days=0 se descarta al guardar (US-034) `[NUEVO]`
**Precondiciones:** Historia en edición; se agrega un rol sin elegir valor de escala.
**Resultado esperado:** El rol (days===0) se filtra al guardar; no aparece en lectura.
**Tipo:** Unit

## Grupo 5 — Dependencias

## TC-022 — Declarar dependencia interna vs cruzada (US-013)
**Resultado esperado:** Misma-epic = orden interno; otro-epic = se propaga como dependencia entre epics.
**Tipo:** Unit

## TC-023 — Impedir dependencias circulares (US-013)
**Resultado esperado:** La tool no permite crear un ciclo A→B→A.
**Tipo:** Unit

## TC-024 — Reordenar rompiendo una dependencia se frena (US-014)
**Resultado esperado:** Si el movimiento rompe una dependencia real, la tool lo frena y explica por qué.
**Tipo:** E2E

## Grupo 6 — Milestones y calendario

## TC-025 — Crear un milestone transversal (US-015)
**Resultado esperado:** El milestone agrupa historias de varios epics y muestra de qué epic viene cada una.
**Tipo:** E2E

## TC-026 — Target vs forecast y estado en riesgo (US-016)
**Resultado esperado:** Target fijo, forecast calculado; se marca "en riesgo" con la brecha cuando forecast > target.
**Tipo:** Unit

## TC-027 — Calendario en días hábiles saltea fines de semana y feriados (US-029)
**Resultado esperado:** "2 semanas de trabajo" caen en la fecha hábil real (10 días hábiles), salteando finde y feriados nombrados.
**Tipo:** Unit

## Grupo 7 — Scope, MVP y tags

## TC-028 — Toggle MVP ajusta el esfuerzo por su % (US-017)
**Resultado esperado:** Con MVP activo, el esfuerzo se reduce por el `mvpPct` de esa historia; recalcula; muestra nota de trade-off.
**Tipo:** Unit

## TC-029 — Crear y asignar un tag (US-018) `[MODIFICADO — antes "capa de riesgo"]`
**Precondiciones:** Panel de tags (SCR-034).
**Pasos:** 1. Crear el tag "growth". 2. Asignarlo a una historia.
**Resultado esperado:** El tag se crea con nombre libre y queda disponible para activar/desactivar; la historia lo lleva.
**Tipo:** E2E

## TC-030 — Desactivar un tag filtra sus historias y recalcula scope (US-018)
**Descripción:** Verifica el modelo híbrido de filtrado.
**Pasos:** 1. Desactivar un tag asignado a historias.
**Resultado esperado:** Las historias con ese tag salen del Árbol y del Timeline; epics/milestones y `SCOPE %` se recalculan. Reactivarlo las restaura.
**Tipo:** Unit

## TC-031 — Degradación vía amplifiedBy (US-018)
**Descripción:** Verifica que un tag en `amplifiedBy` no gatea la historia.
**Precondiciones:** Historia con label `energy` y `amplifiedBy: ['heat']` (o equivalente genérico).
**Pasos:** 1. Desactivar el tag amplificador.
**Resultado esperado:** La historia NO se filtra: sigue agendada, pierde solo esa dimensión y muestra score degradado (badge `⚠ −<TAG>`), nunca BLOCKED.
**Tipo:** Unit

## TC-032 — Editar y eliminar un tag (US-018)
**Resultado esperado:** Renombrar actualiza; eliminar recalcula el scope (con aviso si está en uso).
**Tipo:** E2E

## Grupo 8 — Notas / Assumptions

## TC-033 — Secciones y notas libres persisten (US-019) `[MODIFICADO]`
**Precondiciones:** Tab de Notas.
**Pasos:** 1. Crear una sección "Riesgos". 2. Agregar notas. 3. Hard-reload.
**Resultado esperado:** La sección y sus notas persisten; pertenecen solo a ese roadmap (no aparecen en otro).
**Tipo:** Integration

## Grupo 9 — Escenarios, fit, reset

## TC-039 — Guardar y comparar escenarios A/B (US-021)
**Resultado esperado:** Ambos escenarios lado a lado con milestones y fechas; sin "ganador".
**Tipo:** E2E

## TC-040 — El fit cambia con el objetivo elegido (US-022)
**Resultado esperado:** El fit cambia según velocidad/cobertura/derisking; la fórmula de cada uno está a la vista; nunca afirma correctitud absoluta.
**Tipo:** E2E

## TC-041 — El reset vuelve al estado inicial sin tocar otros roadmaps (US-023) `[MODIFICADO]`
**Pasos:** 1. Modificar un roadmap. 2. Ejecutar 'Reset'.
**Resultado esperado:** El roadmap vuelve a su estado inicial vacío (starter team); los otros roadmaps guardados NO se ven afectados.
**Tipo:** Integration

## Grupo 10 — Agregación y estimación

## TC-045 — La agregación es suma, no promedio (US-026)
**Precondiciones:** Epic con historias de 8 y 2 días.
**Resultado esperado:** Esfuerzo del epic = 10 (suma), no 5 (promedio).
**Tipo:** Unit

## TC-046 — Se distingue esfuerzo total de duración (US-026)
**Resultado esperado:** El esfuerzo total (suma) puede diferir de la duración (según dependencias y gente).
**Tipo:** Unit

## TC-047 — Historia sin estimar recibe sugerencia marcada (US-027)
**Resultado esperado:** La tool sugiere el promedio del epic, marcado 'estimado automáticamente'.
**Tipo:** Unit

## TC-048 — Precedencia auto → estimado → sin estimar (US-027)
**Resultado esperado:** Tras cargar pasa a 'estimado'; al vaciarlo a mano queda 'sin estimar', no vuelve al placeholder.
**Tipo:** Unit

---

## Grupo 11 — Auditoría de bordes (protegen invariantes del motor)

## TC-049 — daysPerWeek < 1 bloquea de forma visible (US-028)
**Resultado esperado:** Con `daysPerWeek = 0` la historia queda `blocked` con `blockedReason = 'invalid-config'` y sin fechas; nunca `NaN`/`Infinity`; NO se clampea en silencio.
**Tipo:** Unit

## TC-050 — mvpPct fuera de 0–100 se clampea (US-017)
**Resultado esperado:** 150 → se clampea a 100 (nunca supera el Full); -10 → 0 (nunca negativo); 0 → duración 0 sin bloquear, `endDate = startDate`.
**Tipo:** Unit

## TC-051 — La historia bloqueada expone la causa raíz (US-011)
**Precondiciones:** Cadena A ← B ← C, A requiere un rol con 0 personas.
**Resultado esperado:** Las tres `blocked`. A tiene `blockedReason = 'role-unavailable'`; B y C apuntan a A como raíz (`blockedBy = 'A'`, `blockedReason = 'dependency-blocked'`).
**Tipo:** Unit

## TC-052 — Un ciclo en los datos se bloquea, no se agenda mal (US-013)
**Precondiciones:** Tres historias en ciclo A→B→C→A pasadas directo al scheduler.
**Resultado esperado:** Las tres `blocked` con `blockedReason = 'cycle'` y sin fechas.
**Tipo:** Unit

---

> ### Casos retirados respecto de la versión case-study
> - **TC-034/035/036 (capas de riesgo climáticas):** reemplazados por TC-029..032 (tags genéricos).
> - **TC-037 (dataset global climático):** retirado — no hay datasets de dominio pre-cargados.
> - **TC-038 (supuestos locales en la historia):** absorbido por TC-033 (notas libres). `[VERIFICAR]`
> - **TC-042/043 (persistencia de sesión única):** reemplazados por TC-054/056 (persistencia multi-roadmap).
> - **TC-044 (export a PDF):** **retirado** — feature no construida (ver `backlog.md`).
