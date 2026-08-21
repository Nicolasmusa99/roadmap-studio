# Roadmap Studio — Historias de Usuario

> Backlog de la herramienta genérica de roadmapping multi-proyecto. Persona por defecto: **PM / Product Owner**.
> UCs de comportamiento. Las historias marcadas `[NUEVO]` son features posteriores al modelo original.
> Las marcadas `[VERIFICAR]` describen comportamiento que conviene chequear contra el código.

---

## Bloque 0 — Multi-roadmap y persistencia `[NUEVO]`

### US-030 — Manejar varios roadmaps en paralelo `[NUEVO]`

**COMO** PM
**QUIERO** crear y mantener varios roadmaps independientes
**PARA** planificar distintos proyectos sin mezclarlos

**Casos de uso**

- `UC-01` Al abrir la app, veo la Home "Mis Roadmaps" con la lista de mis roadmaps guardados.
- `UC-02` Creo un roadmap nuevo con un nombre; arranca vacío (con el starter team de roles) y entro a su workspace.
- `UC-03` Abro, renombro o borro un roadmap desde la Home. Borrar pide confirmación (borra datos guardados).
- `UC-04` Cada roadmap es independiente: historias, epics, roles, tags, checkpoints y notas no se comparten entre roadmaps.

**Reglas**

- No hay límite de cantidad de roadmaps.
- Borrar un roadmap no afecta a los demás.

### US-031 — Persistencia local de los roadmaps `[NUEVO]`

**COMO** PM
**QUIERO** que mis roadmaps se conserven al cerrar y reabrir la app
**PARA** no rearmarlos cada vez

**Casos de uso**

- `UC-01` Cada cambio se guarda solo en localStorage (con debounce).
- `UC-02` Al recargar o reabrir el browser, los roadmaps aparecen como los dejé.
- `UC-03` Si localStorage no está disponible o está lleno, la app avisa sin romperse.

**Reglas**

- localStorage es por browser y por dispositivo: no sincroniza entre máquinas ni sobrevive a borrar la caché.
- El formato guardado lleva `schemaVersion` para migraciones futuras.

### US-032 — Navegar entre roadmaps `[NUEVO]`

**COMO** PM
**QUIERO** saltar entre roadmaps sin volver siempre a la Home
**PARA** moverme rápido cuando trabajo en varios a la vez

**Casos de uso**

- `UC-01` Dentro de un roadmap, un selector (dropdown) en la barra superior lista los otros roadmaps y me deja cambiar.
- `UC-02` Un botón vuelve a la Home.

### US-033 — Dashboard de la Home `[NUEVO]` `[VERIFICAR detalles]`

**COMO** PM
**QUIERO** ver indicadores de cada roadmap de un vistazo en la Home
**PARA** saber cuál necesita atención sin abrirlo

**Casos de uso**

- `UC-01` Cada roadmap en la lista muestra: estado del checkpoint más próximo (en fecha / en riesgo), contadores (historias, roles, tags), fecha proyectada de fin, última edición.
- `UC-02` Los indicadores se calculan del estado guardado de cada roadmap.

**Reglas**

- Sobrio y de un vistazo; reusa la lógica de checkpoints/forecast del motor.

---

## Bloque 1 — Modelo y jerarquía

### US-001 — Ver la jerarquía Componente › Epic › Historia

**COMO** PM
**QUIERO** ver el trabajo organizado en Componente → Epic → Historia
**PARA** entender de un vistazo dónde vive cada pieza y cómo se agrega hacia arriba

**Casos de uso**

- `UC-01` Al abrir un roadmap, se muestran los componentes, cada uno con sus epics.
- `UC-02` Al expandir un epic, se listan sus historias con estado, estimación y rol.
- `UC-03` El esfuerzo y la duración del epic se muestran como suma de sus historias, no como un valor tipeado.
- `UC-04` Si un epic no tiene historias, se muestra vacío con la invitación a crear la primera.

**Reglas**

- La historia es el átomo; epic y componente son sumas.
- La estructura nunca vive en el título.

### US-002 — Alternar entre vista de árbol y vista de timeline

**COMO** PM
**QUIERO** cambiar entre una vista de árbol (planificación) y una de timeline (Gantt)
**PARA** planificar en el árbol y comunicar en el timeline sin perder contexto

**Casos de uso**

- `UC-01` Un control alterna entre 'Árbol' y 'Timeline'; ambas reflejan los mismos datos.
- `UC-02` Seleccionar un epic o historia en una vista lo mantiene seleccionado al cambiar a la otra.
- `UC-03` El timeline muestra epics como barras; el árbol, como lista expandible.

**Estados**

- `vista = árbol`
- `vista = timeline`

---

## Bloque 2 — Gestión de epics

### US-003 — Crear un epic dentro de un componente

**COMO** PM
**QUIERO** crear un epic nuevo dentro de un componente
**PARA** scopear una capability

**Casos de uso**

- `UC-01` El PM elige un componente y crea un epic con naming [Área] — [Resultado].
- `UC-02` El epic nace sin historias; su duración es 0 hasta que se le agreguen.
- `UC-03` El epic aparece de inmediato en el árbol y en el timeline.

### US-004 — Editar y eliminar un epic

**COMO** PM
**QUIERO** editar el nombre, objetivo y milestone de un epic, o eliminarlo
**PARA** mantener el roadmap alineado a medida que cambia el scope

**Casos de uso**

- `UC-01` El PM edita nombre, objetivo, criterios de alto nivel y milestone.
- `UC-02` Al eliminar un epic, sus historias se eliminan tras confirmación (con conteo de historias afectadas).
- `UC-03` Si otras historias dependían de historias del epic eliminado, esas dependencias se limpian para no quedar huérfanas.

**Reglas**

- Cualquier epic es editable y eliminable (no hay epics protegidos en la versión genérica).

---

## Bloque 3 — Gestión de historias

### US-005 — Crear una historia (formulario completo o copiar)

**COMO** PM
**QUIERO** crear una historia nueva llenando el set completo, o copiando una existente
**PARA** agregar scope sin asumir nada y sin partir de cero cada vez

**Casos de uso**

- `UC-01` 'Nueva historia' abre un formulario con el set completo: Como/Quiero/Para, UCs, Reglas, esfuerzo por rol (escala de días), rol, dependencia, MVP%, tags.
- `UC-02` 'Copiar' duplica una historia existente para editarla como base.
- `UC-03` Al guardar, la historia entra al epic y su estimación impacta la duración y el timeline al instante.
- `UC-04` Una historia incompleta se muestra con un badge 'borrador' hasta redactar todos los campos.

**Reglas**

- El formulario pide todos los campos — ningún campo queda asumido por la tool.
- Copiar trae todos los campos y se editan.

### US-006 — Ver una historia en modo lectura

**COMO** PM
**QUIERO** abrir una historia y verla redactada en su formato completo
**PARA** revisar el scope tal como lo leería el equipo

**Casos de uso**

- `UC-01` Al seleccionar una historia, se muestra en lectura: Como/Quiero/Para, UCs, Reglas, Estados.
- `UC-02` Se muestran también sus campos de planificación: componente, epic, tags, estimación, rol, dependencias, profundidad.
- `UC-03` Un control 'Editar' pasa la historia a modo edición.

### US-007 — Editar una historia

**COMO** PM
**QUIERO** editar cualquier campo de una historia
**PARA** calibrar el scope, el esfuerzo o el comportamiento en vivo

**Casos de uso**

- `UC-01` En edición, todos los campos son editables (texto, UCs, reglas, estimación, rol, dependencias, profundidad, tags).
- `UC-02` Al guardar, los cambios que afectan el cálculo recalculan el timeline al instante.
- `UC-03` Al cancelar, la historia vuelve a su estado previo.

### US-008 — Eliminar y mover una historia

**COMO** PM
**QUIERO** eliminar una historia o moverla a otro epic
**PARA** corregir el scope cuando una pieza sobra o está mal ubicada

**Casos de uso**

- `UC-01` El PM elimina una historia tras confirmación; el epic recalcula su duración.
- `UC-02` El PM reasigna una historia a otro epic; su esfuerzo migra de un epic al otro.
- `UC-03` Si la historia tenía dependencias, se revalidan tras el movimiento.

---

## Bloque 4 — Estimación y roles

### US-009 — Estimar una historia por rol (escala de días)

**COMO** PM
**QUIERO** asignar el esfuerzo de una historia por rol eligiendo de una escala de días
**PARA** que la tool derive la duración sin que yo asuma ninguna unidad

**Casos de uso**

- `UC-01` El esfuerzo por rol se elige de una escala acotada: 1d · 2d · 3d · 1sem · 10d · 2sem · 3sem · 4sem.
- `UC-02` La tool convierte días a semanas usando la constante 'días por semana' (US-028).
- `UC-03` La duración = esfuerzo del rol cuello de botella ÷ gente de ese rol.
- `UC-04` El cambio se propaga: historia → epic → milestone → timeline.

**Reglas**

- El esfuerzo se elige de una escala, no se tipea libre.
- La escala es una lista editable.
- El esfuerzo es input; la duración la deriva la tool.

### US-028 — Configurar la escala de esfuerzo y la conversión

**COMO** PM
**QUIERO** definir la escala de días y cuántos días equivalen a una semana
**PARA** que ni la unidad ni la conversión sean supuestos ocultos

**Casos de uso**

- `UC-01` El PM ve la escala y puede agregar o quitar pasos.
- `UC-02` El PM ajusta 'días por semana' (default 5); toda la agenda se recalcula.

**Reglas**

- Default 5 días = 1 semana, editable.

### US-010 — Asignar rol a una historia

**COMO** PM
**QUIERO** asignar cada historia a uno o más roles del equipo
**PARA** que el toggle de equipo tenga un efecto real

**Casos de uso**

- `UC-01` El PM asigna la historia a los roles que la ejecutan.
- `UC-02` Si un rol asignado queda en 0 personas, la historia se bloquea y el efecto sube al milestone.

### US-011 — Ajustar la composición del equipo

**COMO** PM
**QUIERO** agregar o quitar personas por rol
**PARA** responder en vivo '¿cómo cambia el roadmap si cambia el equipo?'

**Casos de uso**

- `UC-01` El PM sube o baja la cantidad de personas por rol.
- `UC-02` El timeline se recalcula: las duraciones se comprimen o estiran y los milestones se mueven.
- `UC-03` Si un rol necesario queda en cero, las historias y epics que lo requieren se bloquean.

### US-034 — Gestionar roles dinámicos `[NUEVO]`

**COMO** PM
**QUIERO** crear, renombrar y borrar los roles de mi equipo
**PARA** modelar el equipo real de cada proyecto, no una lista fija

**Casos de uso**

- `UC-01` El roadmap arranca con un starter team de 4 roles editables.
- `UC-02` Creo un rol nuevo con el nombre que quiera y le doy capacidad.
- `UC-03` Renombro o borro un rol. Al borrar un rol con esfuerzo asignado, la tool avisa (con conteo) y limpia el esfuerzo huérfano.

**Reglas**

- Un rol sin esfuerzo (days=0) se descarta al guardar.

### US-012 — Ver la carga por rol

**COMO** PM
**QUIERO** ver cuánto trabajo total tiene cada rol a lo largo de todos los epics
**PARA** identificar el cuello de botella real sin afirmarlo de memoria

**Casos de uso**

- `UC-01` La tool suma el esfuerzo por rol sobre todas las historias y lo divide por la gente de ese rol.
- `UC-02` El rol más cargado se resalta como cuello de botella.

---

## Bloque 5 — Dependencias

### US-013 — Declarar dependencias entre historias

**COMO** PM
**QUIERO** declarar que una historia depende de otra
**PARA** que el orden del roadmap refleje restricciones reales

**Casos de uso**

- `UC-01` El PM declara una dependencia de una historia hacia otra.
- `UC-02` Si es dentro del mismo epic, es orden interno.
- `UC-03` Si cruza a otro epic, se propaga como dependencia entre esos dos epics.
- `UC-04` La tool impide dependencias circulares.

### US-014 — Editar y ver las dependencias en el roadmap

**COMO** PM
**QUIERO** ver y editar las dependencias directamente sobre el roadmap
**PARA** reordenar epics en vivo

**Casos de uso**

- `UC-01` Las dependencias que cruzan epics se muestran como conexiones en el timeline.
- `UC-02` El PM reordena la prioridad de epics sin dependencia dura.
- `UC-03` Si un reordenamiento rompe una dependencia real, la tool lo frena y explica por qué.

---

## Bloque 6 — Milestones y calendario

### US-015 — Crear milestones transversales

**COMO** PM
**QUIERO** definir milestones que agrupen historias de varios epics
**PARA** marcar hitos reales como 'MVP' o 'Beta'

**Casos de uso**

- `UC-01` El PM crea un milestone y le asocia historias de cualquier epic.
- `UC-02` El PM le pone nombre y fecha target.

**Reglas**

- Muestra siempre qué historias lo componen y de qué epic vienen.

### US-016 — Ver target vs. forecast de un milestone

**COMO** PM
**QUIERO** ver la fecha comprometida (target) y la proyectada (forecast)
**PARA** saber si llego, y mostrar la brecha en vivo

**Casos de uso**

- `UC-01` Cada milestone muestra su target fijo y su forecast calculado.
- `UC-02` Cuando el forecast supera el target, se marca 'en riesgo' con la brecha ('+2 semanas').
- `UC-03` Al cambiar equipo, scope o estimación, el forecast se mueve y el target queda quieto.

**Estados**

- `en fecha (forecast ≤ target)`
- `en riesgo (forecast > target)`

### US-029 — Calendario en días hábiles

**COMO** PM
**QUIERO** que las fechas se calculen en días hábiles desde una fecha de inicio configurable
**PARA** que el roadmap muestre fechas reales sin contar fines de semana ni feriados

**Casos de uso**

- `UC-01` El PM define la fecha de inicio del roadmap.
- `UC-02` La tool saltea sábados y domingos.
- `UC-03` La tool descuenta los feriados de una lista editable (hoy poblada con feriados US, editables).
- `UC-04` El timeline muestra los días salteados, con el feriado nombrado.

**Reglas**

- 5 días hábiles = 1 semana (US-028); "2 semanas de trabajo" = 10 días hábiles reales.
- `[BACKLOG]` Selector de país para traer feriados automáticamente (librería local, sin tokens).

---

## Bloque 7 — Scope, profundidad y tags

### US-017 — Alternar profundidad MVP / Full

**COMO** PM
**QUIERO** marcar una historia como MVP o Full y definir cuánto recorta su MVP
**PARA** mostrar el trade-off entre entregar antes y entregar completo

**Casos de uso**

- `UC-01` El PM cambia la profundidad; el esfuerzo se ajusta por el % de MVP de esa historia.
- `UC-02` El PM edita el % de MVP por historia.
- `UC-03` El timeline y los milestones se recalculan.
- `UC-04` Se muestra una nota de trade-off.

**Reglas**

- El % de MVP es input por historia. Fuera de 0–100 se clampea.

### US-018 — Gestionar tags (scope configurable)

**COMO** PM
**QUIERO** crear, activar, desactivar, editar o borrar tags, y asignarlos a historias
**PARA** responder '¿cómo cambia el roadmap si cambia el scope?' con mis propias dimensiones

**Casos de uso**

- `UC-01` El PM crea un tag con el nombre que quiera (ej. 'must-have', 'growth', 'backend').
- `UC-02` El PM asigna uno o más tags a una historia.
- `UC-03` Desactivar un tag **saca del roadmap** las historias que lo llevan: salen del Árbol y del Timeline, y epics/milestones se recalculan. Reactivarlo las restaura.
- `UC-04` El PM edita o borra un tag (con aviso si está en uso).

**Reglas**

- Los tags son una lista editable definida por el usuario.
- Modelo híbrido: desactivar un tag filtra sus historias aguas arriba del scheduler.
- El scope resultante se muestra como `SCOPE %`.
- Degradación (`amplifiedBy`): un tag puede enriquecer una historia sin gatearla; al apagarlo, la historia no se filtra, solo muestra score degradado (badge `⚠ −<TAG>`).

**Estados**

- `tag activo`
- `tag inactivo`

---

## Bloque 8 — Notas / Assumptions

### US-019 — Notas y supuestos en secciones libres

**COMO** PM
**QUIERO** anotar supuestos, decisiones y preguntas en secciones que yo defino
**PARA** dejar registrado el contexto del roadmap de forma estructurada

**Casos de uso**

- `UC-01` El PM crea secciones con el nombre que quiera (ej. "Riesgos", "Decisiones", "Preguntas").
- `UC-02` Dentro de cada sección agrega, edita y borra notas individuales.
- `UC-03` Cada roadmap tiene sus propias notas, persistidas con su estado.

**Reglas**

- Sin categorías fijas: las secciones las define el usuario.

---

## Bloque 9 — Escenarios y fit

### US-021 — Guardar y comparar escenarios

**COMO** PM
**QUIERO** guardar dos configuraciones del roadmap y verlas lado a lado
**PARA** mostrar el costo de cada camino sin decidir por el otro

**Casos de uso**

- `UC-01` El PM guarda el estado actual como Escenario A o B.
- `UC-02` La tool muestra ambos lado a lado con sus milestones y fechas.
- `UC-03` La tool no marca un 'ganador'.

### US-022 — Fit del roadmap contra un objetivo declarado

**COMO** PM
**QUIERO** elegir un objetivo (velocidad, cobertura, derisking) y ver qué tan bien mi roadmap lo sirve
**PARA** demostrar que el 'mejor' roadmap depende de qué se optimiza

**Casos de uso**

- `UC-01` El PM elige un objetivo; la tool muestra el fit del roadmap actual.
- `UC-02` Al cambiar el objetivo, el fit cambia.
- `UC-03` La fórmula de cada objetivo está siempre a la vista.

**Reglas**

- El fit es una heurística transparente, no un veredicto; su fórmula está siempre visible.

---

## Bloque 10 — Robustez

### US-023 — Reset a un estado limpio

**COMO** PM
**QUIERO** volver un roadmap a su estado base con un clic
**PARA** recuperarme si dejo todo desordenado

**Casos de uso**

- `UC-01` El PM hace 'Reset'; el roadmap vuelve a su estado inicial vacío (starter team + nada más).
- `UC-02` El reset de un roadmap no afecta a los otros roadmaps guardados.

---

## Bloque 11 — Agregación de estimaciones

### US-026 — Agregación de estimaciones por la jerarquía

**COMO** PM
**QUIERO** ver el esfuerzo total agregado a nivel epic y componente
**PARA** saber el tamaño real del trabajo sin sumarlo a mano

**Casos de uso**

- `UC-01` Al cargar/editar una estimación, el epic actualiza su esfuerzo total (suma) y su duración al instante.
- `UC-02` El componente agrega el esfuerzo de sus epics igual.
- `UC-03` Se muestra el desglose por rol en cada nivel.
- `UC-04` La tool distingue 'esfuerzo total' (suma) de 'duración' (cuándo termina).

**Reglas**

- La agregación es suma de esfuerzo, no promedio.

### US-027 — Estimación sugerida para historias sin estimar

**COMO** PM
**QUIERO** que la tool me sugiera un esfuerzo por defecto en las historias que todavía no estimé
**PARA** que el epic no quede subestimado mientras completo la carga

**Casos de uso**

- `UC-01` Al crear una historia sin estimación, la tool sugiere el promedio de las historias estimadas del epic.
- `UC-02` El valor sugerido se marca 'estimado automáticamente'.
- `UC-03` En cuanto el PM ingresa un valor real, reemplaza al sugerido.

**Reglas**

- Precedencia: auto-sugerido → estimado → sin estimar. La sugerencia solo aplica al primer estado.

---

> ### Historias retiradas respecto de la versión case-study
> - **US-024 (persistencia de sesión):** reemplazada por US-031 (persistencia multi-roadmap real en localStorage).
> - **US-025 (export a PDF/imagen):** **no construida.** Movida a `backlog.md` como mejora futura (conecta con "compartir roadmap").
> - **US-020 (supuestos locales en la historia):** absorbida por US-019 (notas libres); verificar si el campo de supuestos por historia sigue existiendo. `[VERIFICAR]`
