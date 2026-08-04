# Test Cases — Roadmap Studio

> 48 casos para integrar en el código. Unit (lógica pura), E2E (interacción), Integration (flujos cruzados). Cada TC referencia su historia (US-XXX).

## TC-001 — Render de la jerarquía Componente › Epic › Historia (US-001)

**Descripción:** Verifica que la vista de árbol muestra los componentes con sus epics e historias.  
**Precondiciones:** La tool cargó el roadmap base (SCR-001).  
**Pasos:**

1. Abrir la tool en vista Árbol.
2. Expandir un epic.

**Resultado esperado:** Se listan los componentes; cada epic muestra sus historias con estado, estimación y rol.  
**Tipo:** E2E

## TC-002 — El esfuerzo del epic es la suma de sus historias (US-001)

**Descripción:** Verifica que el esfuerzo del epic se calcula (suma), no se tipea.  
**Precondiciones:** Un epic con 3 historias estimadas.  
**Pasos:**

1. Leer el esfuerzo agregado del epic.

**Resultado esperado:** El esfuerzo del epic = suma del esfuerzo de sus historias; no existe input directo de esfuerzo a nivel epic.  
**Tipo:** Unit

## TC-003 — El toggle Árbol/Timeline preserva la selección (US-002)

**Descripción:** Verifica que cambiar de vista mantiene la historia/epic seleccionado.  
**Precondiciones:** Una historia está seleccionada en la vista Árbol.  
**Pasos:**

1. Cambiar a Timeline.
2. Volver a Árbol.

**Resultado esperado:** La misma historia sigue seleccionada; ambas vistas reflejan los mismos datos.  
**Tipo:** E2E

## TC-004 — Crear un epic con naming correcto (US-003)

**Descripción:** Verifica que se crea un epic nuevo que nace sin historias.  
**Precondiciones:** Vista Árbol; un componente elegido (SCR-003).  
**Pasos:**

1. Crear un epic con nombre [Área] — [Resultado].

**Resultado esperado:** El epic aparece en árbol y timeline con duración 0 hasta que se le agreguen historias.  
**Tipo:** E2E

## TC-005 — Los epics del brief no son eliminables (US-004)

**Descripción:** Verifica que los cuatro epics pre-cargados no se pueden borrar.  
**Precondiciones:** Vista Árbol.  
**Pasos:**

1. Abrir el menú de un epic pre-cargado (ej. Data Foundation).

**Resultado esperado:** No se ofrece la acción eliminar; sí las de editar. Los epics creados por el PM sí muestran eliminar.  
**Tipo:** E2E

## TC-006 — Eliminar un epic marca dependencias rotas (US-004)

**Descripción:** Verifica que borrar un epic con historias referenciadas avisa.  
**Precondiciones:** Un epic creado por el PM del que dependen historias de otro epic.  
**Pasos:**

1. Eliminar el epic tras confirmación.

**Resultado esperado:** El epic y sus historias se eliminan; las dependencias que apuntaban a ellas se marcan como rotas para resolver.  
**Tipo:** Unit

## TC-007 — Crear una historia por formulario completo (US-005)

**Descripción:** Verifica que el formulario completo crea una historia y afecta el timeline.  
**Precondiciones:** Vista Árbol; un epic elegido (SCR-030).  
**Pasos:**

1. Abrir 'Nueva historia'.
2. Completar Como/Quiero/Para, UCs, reglas, esfuerzo por rol, rol, dependencia y MVP%.
3. Guardar.

**Resultado esperado:** La historia entra al epic; su estimación impacta la duración del epic y el timeline al instante.  
**Tipo:** E2E

## TC-008 — Copiar una historia duplica todos los campos (US-005)

**Descripción:** Verifica que 'Copiar' parte de una base editable.  
**Precondiciones:** Una historia existente seleccionada (SCR-031).  
**Pasos:**

1. Ejecutar 'Copiar' sobre la historia.

**Resultado esperado:** Se crea una historia nueva con todos los campos copiados, lista para editar.  
**Tipo:** E2E

## TC-009 — Historia incompleta muestra badge 'borrador' (US-005)

**Descripción:** Verifica el estado borrador de una historia sin redactar del todo.  
**Precondiciones:** Una historia creada con solo nombre y esfuerzo.  
**Pasos:**

1. Ver la historia en el árbol.

**Resultado esperado:** Se muestra con badge 'borrador' hasta que se completen todos los campos.  
**Tipo:** E2E

## TC-010 — Ver una historia en modo lectura (US-006)

**Descripción:** Verifica que el detalle muestra scope + campos de planificación.  
**Precondiciones:** Una historia redactada, seleccionada (SCR-007).  
**Pasos:**

1. Seleccionar la historia.

**Resultado esperado:** Se muestran Como/Quiero/Para, UCs, reglas, y componente, epic, labels, estimación, rol, dependencias y profundidad; hay control 'Editar'.  
**Tipo:** E2E

## TC-011 — Editar una historia recalcula; cancelar revierte (US-007)

**Descripción:** Verifica el guardado y la cancelación de la edición.  
**Precondiciones:** Historia en modo edición (SCR-008).  
**Pasos:**

1. Cambiar la estimación y guardar.
2. En otra edición, cambiar algo y cancelar.

**Resultado esperado:** Al guardar, el timeline se recalcula al instante. Al cancelar, la historia vuelve a su estado previo.  
**Tipo:** E2E

## TC-012 — Mover una historia migra su esfuerzo entre epics (US-008)

**Descripción:** Verifica que reasignar una historia mueve su esfuerzo.  
**Precondiciones:** Historia H en el epic A.  
**Pasos:**

1. Reasignar H al epic B.

**Resultado esperado:** El esfuerzo agregado de A baja y el de B sube; las dependencias de H se revalidan.  
**Tipo:** Unit

## TC-013 — El selector de esfuerzo ofrece la escala exacta (US-009)

**Descripción:** Verifica que el esfuerzo se elige de la escala acotada, no libre.  
**Precondiciones:** Historia en edición; selector de esfuerzo por rol (SCR-032).  
**Pasos:**

1. Abrir el selector de esfuerzo de un rol.

**Resultado esperado:** Las opciones son exactamente: 1d · 2d · 3d · 1sem · 10d · 2sem · 3sem · 4sem; no se puede tipear un valor libre.  
**Tipo:** E2E

## TC-014 — La duración deriva del rol cuello de botella (US-009)

**Descripción:** Verifica el cálculo de duración de una historia.  
**Precondiciones:** Historia con esfuerzo Data=10d, Full-stack=5d; team data=1, fullstack=2.  
**Pasos:**

1. Leer la duración derivada.

**Resultado esperado:** Duración = máx(10/1 , 5/2) = 10 días hábiles (2 semanas); nunca se carga a mano.  
**Tipo:** Unit

## TC-015 — La conversión días→semanas usa la constante (US-009)

**Descripción:** Verifica que el esfuerzo en días se convierte con 'días por semana'.  
**Precondiciones:** Constante = 5 días/semana; historia con 10 días de un rol.  
**Pasos:**

1. Calcular la duración de esa historia con 1 persona.

**Resultado esperado:** 10 días ÷ 5 = 2 semanas de trabajo; la agenda usa esa conversión.  
**Tipo:** Unit

## TC-016 — Cambiar 'días por semana' recalcula toda la agenda (US-028)

**Descripción:** Verifica que la conversión es un parámetro global editable.  
**Precondiciones:** Config global; días/semana = 5 (SCR-033).  
**Pasos:**

1. Cambiar la constante a 4.

**Resultado esperado:** Todas las duraciones y fechas se recalculan de inmediato usando 4 días = 1 semana.  
**Tipo:** Unit

## TC-017 — La escala de esfuerzo es una lista editable (US-028)

**Descripción:** Verifica que se pueden agregar o quitar pasos de la escala.  
**Precondiciones:** Panel de configuración de escala (SCR-033).  
**Pasos:**

1. Agregar el paso '6 semanas' a la escala.
2. Quitar '10 días'.

**Resultado esperado:** El selector de esfuerzo refleja la escala editada; ningún paso está clavado.  
**Tipo:** E2E

## TC-018 — Quitar un rol asignado bloquea la historia (US-010)

**Descripción:** Verifica que la asignación de rol conecta con el equipo.  
**Precondiciones:** Historia asignada al rol AI; team ai=1.  
**Pasos:**

1. Bajar AI a 0 personas.

**Resultado esperado:** La historia se marca bloqueada y el efecto sube hasta el milestone.  
**Tipo:** Unit

## TC-019 — Sumar personas comprime el timeline (US-011)

**Descripción:** Verifica que agregar gente acorta las duraciones.  
**Precondiciones:** Baseline; team data=1.  
**Pasos:**

1. Subir Data a 2 personas.

**Resultado esperado:** Las historias data-bound reducen su duración; los milestones se adelantan.  
**Tipo:** Unit

## TC-020 — Un rol en cero bloquea sus historias y epics (US-011)

**Descripción:** Verifica el estado bloqueado por falta de rol.  
**Precondiciones:** Baseline.  
**Pasos:**

1. Bajar Data a 0.

**Resultado esperado:** Todas las historias que requieren Data (y sus epics) se marcan bloqueadas; el total muestra 'bloqueado'.  
**Tipo:** Unit

## TC-021 — La carga por rol identifica el cuello de botella (US-012)

**Descripción:** Verifica el cálculo de carga total por rol.  
**Precondiciones:** Baseline con esfuerzos cargados.  
**Pasos:**

1. Leer el panel 'Role load ÷ people'.

**Resultado esperado:** Cada rol muestra su esfuerzo total ÷ gente; el rol más cargado (Data o AI) se resalta como cuello de botella.  
**Tipo:** Unit

## TC-022 — Dependencia interna vs. cruzada (US-013)

**Descripción:** Verifica la regla de propagación de dependencias.  
**Precondiciones:** Historia B1 depende de B2 (mismo epic); C1 depende de A2 (otro epic).  
**Pasos:**

1. Inspeccionar el efecto de cada dependencia.

**Resultado esperado:** B1→B2 es orden interno y no sale del epic. C1→A2 se propaga y se muestra como dependencia entre esos epics.  
**Tipo:** Unit

## TC-023 — La tool impide dependencias circulares (US-013)

**Descripción:** Verifica la prevención de ciclos.  
**Precondiciones:** Historia X depende de Y.  
**Pasos:**

1. Intentar declarar que Y depende de X.

**Resultado esperado:** La opción se bloquea o se rechaza; no se puede crear el ciclo.  
**Tipo:** Unit

## TC-024 — Reordenar epics respeta las dependencias duras (US-014)

**Descripción:** Verifica el reordenamiento en el roadmap.  
**Precondiciones:** Timeline; epics con y sin dependencia dura entre sí.  
**Pasos:**

1. Reordenar dos epics sin dependencia dura.
2. Intentar mover uno delante de su dependencia.

**Resultado esperado:** El primer reorden se aplica. El segundo se frena con una explicación de por qué rompería una dependencia real.  
**Tipo:** E2E

## TC-025 — Crear un milestone transversal (US-015)

**Descripción:** Verifica que un milestone agrupa historias de varios epics.  
**Precondiciones:** Vista Árbol/Timeline.  
**Pasos:**

1. Crear un milestone y asociarle historias de 2 epics distintos.
2. Ponerle nombre y fecha target.

**Resultado esperado:** El milestone se crea; muestra qué historias lo componen y de qué epic vienen.  
**Tipo:** E2E

## TC-026 — Forecast por encima del target marca en rojo (US-016)

**Descripción:** Verifica el cálculo target vs forecast.  
**Precondiciones:** Milestone con target W15 y forecast W18.  
**Pasos:**

1. Leer el estado del milestone.

**Resultado esperado:** Se marca en riesgo (rojo) con la brecha '+3 semanas'.  
**Tipo:** Unit

## TC-027 — Cambiar el equipo mueve el forecast, no el target (US-016)

**Descripción:** Verifica que el target queda fijo y el forecast se mueve.  
**Precondiciones:** Milestone en fecha (forecast ≤ target).  
**Pasos:**

1. Quitar una persona de un rol clave.

**Resultado esperado:** El forecast se corre hacia adelante; el target permanece igual; puede pasar a rojo.  
**Tipo:** Unit

## TC-028 — El calendario arranca el 24-ago-2026 y salta fines de semana (US-029)

**Descripción:** Verifica el cálculo en días hábiles desde la fecha de inicio.  
**Precondiciones:** Fecha de inicio = 24-ago-2026 (lunes); días/semana = 5.  
**Pasos:**

1. Ubicar una historia de 5 días hábiles que arranca en el día 0.

**Resultado esperado:** Termina el viernes 28-ago-2026; sábado y domingo no se cuentan como días de trabajo.  
**Tipo:** Unit

## TC-029 — El calendario descuenta un feriado federal US (US-029)

**Descripción:** Verifica que los feriados no cuentan como días hábiles.  
**Precondiciones:** Fecha de inicio previa a Labor Day (7-sep-2026); feriado activo.  
**Pasos:**

1. Ubicar una historia que cruce el 7-sep-2026.

**Resultado esperado:** El 7-sep (Labor Day) se saltea; la fecha de fin se corre un día hábil.  
**Tipo:** Unit

## TC-030 — El timeline muestra los días salteados (US-029)

**Descripción:** Verifica que fines de semana y feriados se ven marcados.  
**Precondiciones:** Timeline en vista de días hábiles (SCR-036).  
**Pasos:**

1. Observar el eje del timeline.

**Resultado esperado:** Los fines de semana y feriados aparecen marcados; el feriado se muestra nombrado (ej. 'Thanksgiving').  
**Tipo:** E2E

## TC-031 — Dos semanas de trabajo caen en la fecha hábil real (US-029)

**Descripción:** Verifica que no se usan días corridos.  
**Precondiciones:** Historia de 2 semanas (10 días hábiles) desde 24-ago-2026.  
**Pasos:**

1. Leer la fecha de fin.

**Resultado esperado:** Cae el 4-sep-2026 (10 hábiles), no el 7-sep (14 corridos); descontando fines de semana.  
**Tipo:** Unit

## TC-032 — El toggle MVP aplica el % de esa historia (US-017)

**Descripción:** Verifica que MVP usa el porcentaje propio de la historia.  
**Precondiciones:** Historia con MVP% = 45 y esfuerzo Full = 10d.  
**Pasos:**

1. Activar MVP en esa historia.

**Resultado esperado:** El esfuerzo pasa a 4,5d (45%); el timeline se recalcula; aparece nota de trade-off.  
**Tipo:** Unit

## TC-033 — El MVP% es editable por historia (US-017)

**Descripción:** Verifica que el porcentaje de recorte no es fijo.  
**Precondiciones:** Historia con MVP% = 55.  
**Pasos:**

1. Editar el MVP% a 40 y activar MVP.

**Resultado esperado:** El recorte usa 40%; dos historias distintas pueden tener % distintos.  
**Tipo:** E2E

## TC-034 — Apagar una capa de riesgo acelera el roadmap (US-018)

**Descripción:** Verifica el efecto de scope sobre el esfuerzo.  
**Precondiciones:** Tres capas activas.  
**Pasos:**

1. Desactivar la capa 'energía'.

**Resultado esperado:** El esfuerzo de las historias que la cubren se reduce; el timeline se acorta; aparece nota de lo no cubierto.  
**Tipo:** Unit

## TC-035 — Agregar una capa de riesgo nueva (US-018)

**Descripción:** Verifica que las capas no son solo las tres del brief.  
**Precondiciones:** Panel de capas de riesgo (SCR-034).  
**Pasos:**

1. Agregar la capa 'sequía'.

**Resultado esperado:** La capa entra al cálculo de scope al instante y queda disponible para activar/desactivar.  
**Tipo:** E2E

## TC-036 — Editar y eliminar una capa de riesgo (US-018)

**Descripción:** Verifica el CRUD de capas.  
**Precondiciones:** Panel de capas con una capa creada por el PM.  
**Pasos:**

1. Renombrar la capa.
2. Eliminarla.

**Resultado esperado:** El nombre se actualiza; al eliminar, el cálculo de scope se recalcula.  
**Tipo:** E2E

## TC-037 — Agregar un dataset global desde cero (US-019)

**Descripción:** Verifica la gestión de supuestos/datasets globales.  
**Precondiciones:** Panel de supuestos globales (SCR-020 equivalente).  
**Pasos:**

1. Agregar un dataset con nombre, resolución y frecuencia.

**Resultado esperado:** El dataset queda en el panel, editable; los pre-cargados (Aurora-Heat, etc.) también son editables.  
**Tipo:** E2E

## TC-038 — Supuestos locales dentro de una historia (US-020)

**Descripción:** Verifica que los supuestos locales viven en las reglas.  
**Precondiciones:** Historia con supuestos propios.  
**Pasos:**

1. Abrir el detalle de la historia.

**Resultado esperado:** Los supuestos locales aparecen en las Reglas y los datasets que consume se listan en su detalle, separados de los globales.  
**Tipo:** E2E

## TC-039 — Guardar y comparar escenarios (US-021)

**Descripción:** Verifica el comparador A/B.  
**Precondiciones:** Roadmap en un estado dado.  
**Pasos:**

1. Guardar como Escenario A.
2. Cambiar el equipo y guardar como B.

**Resultado esperado:** Ambos se muestran lado a lado con sus milestones y fechas; la tool no marca un 'ganador'.  
**Tipo:** E2E

## TC-040 — El fit cambia con el objetivo elegido (US-022)

**Descripción:** Verifica el fit por objetivo (pieza de visión).  
**Precondiciones:** Selector de objetivo disponible.  
**Pasos:**

1. Elegir 'velocidad' y leer el fit.
2. Cambiar a 'cobertura'.

**Resultado esperado:** El fit cambia según el objetivo; la fórmula de cada uno está a la vista; nunca afirma correctitud absoluta.  
**Tipo:** E2E

## TC-041 — El reset vuelve al baseline de fábrica (US-023)

**Descripción:** Verifica que el reset no restaura la sesión guardada.  
**Precondiciones:** Roadmap modificado (equipo, scope, estimaciones cambiados).  
**Pasos:**

1. Ejecutar 'Reset'.

**Resultado esperado:** Equipo, scope, estimaciones y profundidad vuelven al baseline de fábrica inmutable, sin recargar; la sesión guardada no lo sobrescribe.  
**Tipo:** E2E

## TC-042 — La sesión se guarda y restaura (US-024)

**Descripción:** Verifica la persistencia entre sesiones.  
**Precondiciones:** Cambios hechos en el roadmap.  
**Pasos:**

1. Recargar la tool.

**Resultado esperado:** El roadmap aparece como se dejó (historias, estimaciones, dependencias, escenarios).  
**Tipo:** Integration

## TC-043 — El guardado es best-effort ante fallo de storage (US-024)

**Descripción:** Verifica que un fallo de almacenamiento no rompe la tool.  
**Precondiciones:** Almacenamiento mockeado para fallar.  
**Pasos:**

1. Disparar un cambio que guardaría estado.

**Resultado esperado:** El error se traga silenciosamente; la tool sigue funcionando.  
**Tipo:** Unit

## TC-044 — El export refleja la configuración actual (US-025)

**Descripción:** Verifica el contenido del export.  
**Precondiciones:** Roadmap en un estado dado (SCR-026).  
**Pasos:**

1. Exportar el estado actual a PDF.

**Resultado esperado:** El archivo incluye timeline, epics, historias, milestones (target y forecast) y los supuestos activos; es una foto del momento.  
**Tipo:** E2E

## TC-045 — La agregación es suma, no promedio (US-026)

**Descripción:** Verifica la operación de agregación hacia arriba.  
**Precondiciones:** Epic con historias de 8 y 2 días.  
**Pasos:**

1. Leer el esfuerzo agregado del epic.

**Resultado esperado:** El esfuerzo del epic = 10 días (suma), no 5 (promedio); promediar borraría la escala.  
**Tipo:** Unit

## TC-046 — Se distingue esfuerzo total de duración (US-026)

**Descripción:** Verifica que la tool separa trabajo de tiempo.  
**Precondiciones:** Epic con historias en cadena de dependencia.  
**Pasos:**

1. Comparar 'esfuerzo total' y 'duración' del epic.

**Resultado esperado:** El esfuerzo total (suma de trabajo) puede ser distinto de la duración (cuándo termina, según dependencias y gente).  
**Tipo:** Unit

## TC-047 — Historia sin estimar recibe sugerencia marcada (US-027)

**Descripción:** Verifica el placeholder de estimación automática.  
**Precondiciones:** Epic con 3 historias estimadas; se crea una cuarta sin estimar.  
**Pasos:**

1. Crear la historia sin cargar esfuerzo.

**Resultado esperado:** La tool sugiere el promedio del epic, marcado 'estimado automáticamente', distinto de un valor cargado a mano.  
**Tipo:** Unit

## TC-048 — Precedencia auto → estimado → sin estimar (US-027)

**Descripción:** Verifica la regla de precedencia de estimación.  
**Precondiciones:** Historia con sugerencia automática.  
**Pasos:**

1. Cargar un valor real y luego vaciarlo a mano.

**Resultado esperado:** Tras cargar pasa a 'estimado'; al vaciarlo a mano queda 'sin estimar', no vuelve al placeholder automático.  
**Tipo:** Unit

---

> **Auditoría de bordes (TC-049…052).** Casos que ningún TC del brief cubría; agregados por auditoría del motor de cálculo. Cada uno protege un invariante contra un input inválido alcanzable en vivo (config editable, dato importado, localStorage corrupto).

## TC-049 — daysPerWeek < 1 bloquea de forma visible (US-028)

**Descripción:** Verifica que una conversión días→semanas inválida no rompe el scheduler ni se tapa en silencio.  
**Precondiciones:** Config global con `daysPerWeek = 0` (input alcanzable: la constante es editable por el PM).  
**Pasos:**

1. Agendar una historia con esfuerzo cargado y `daysPerWeek = 0`.

**Resultado esperado:** La historia queda `blocked` con `blockedReason = 'invalid-config'` y sin fechas (timeline vacío); nunca produce `NaN`/`Infinity`. El error es imposible de no ver; NO se clampea el valor (contradiría "nada asumido, todo visible").  
**Tipo:** Unit

## TC-050 — mvpPct fuera de 0–100 se clampea (US-017)

**Descripción:** Verifica que un MVP% inválido no viola el invariante #11 (el MVP nunca cuesta más que el Full).  
**Precondiciones:** Historia con esfuerzo Full y `mvpEnabled = true`.  
**Pasos:**

1. Fijar `mvpPct = 150` y leer la duración.
2. Fijar `mvpPct = -10` y leer la duración.
3. Fijar `mvpPct = 0` y leer la duración.

**Resultado esperado:** Con 150 la duración nunca supera la del Full (se clampea a 100). Con -10 la duración nunca es negativa (se clampea a 0). Con 0 la duración es 0, la historia NO queda bloqueada y `endDate = startDate`. Los bordes 0 y 100 quedan intactos.  
**Tipo:** Unit

## TC-051 — La historia bloqueada expone la causa raíz (US-011)

**Descripción:** Verifica que un bloqueo propagado por dependencia señala la causa raíz, no solo el eslabón inmediato.  
**Precondiciones:** Cadena A ← B ← C, donde A requiere un rol con 0 personas.  
**Pasos:**

1. Agendar A, B y C y leer el bloqueo de cada una.

**Resultado esperado:** Las tres quedan `blocked`. A (raíz) tiene `blockedBy = 'A'` y `blockedReason = 'role-unavailable'`. B y C tienen `blockedBy = 'A'` (heredan la raíz) manteniendo `blockedReason = 'dependency-blocked'`.  
**Tipo:** Unit

## TC-052 — Un ciclo en los datos se bloquea, no se agenda mal (US-013)

**Descripción:** Verifica que `schedule()` no agenda en silencio historias en ciclo (dato importado / localStorage corrupto), aunque la UI ya prevenga crear ciclos.  
**Precondiciones:** Tres historias en ciclo A→B→C→A pasadas directo al scheduler.  
**Pasos:**

1. Agendar las tres y leer su estado.

**Resultado esperado:** Las tres quedan `blocked` con `blockedReason = 'cycle'` y sin fechas; ninguna se ubica en el calendario como si no tuviera dependencias.  
**Tipo:** Unit

