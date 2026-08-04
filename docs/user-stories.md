# Roadmap Studio — Historias de Usuario

> Backlog de la herramienta (Proyecto Lumeria · Open Earth Foundation). 29 historias. Persona por defecto: PM. UCs de comportamiento (pre-build).


## Bloque 1 — Modelo y jerarquía

### US-001 — Ver la jerarquía Componente › Epic › Historia

**COMO** PM  
**QUIERO** ver el trabajo organizado en Componente → Epic → Historia  
**PARA** entender de un vistazo dónde vive cada pieza y cómo se agrega hacia arriba

**Casos de uso**

- `UC-01` Al abrir la tool, se muestran los componentes, cada uno con sus epics.
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


## Bloque 2 — Gestión de epics

### US-003 — Crear un epic dentro de un componente

**COMO** PM  
**QUIERO** crear un epic nuevo dentro de un componente  
**PARA** scopear una capability que el brief no cubría

**Casos de uso**

- `UC-01` El PM elige un componente y crea un epic con naming [Área] — [Resultado].
- `UC-02` El epic nace sin historias; su duración es 0 hasta que se le agreguen.
- `UC-03` El epic aparece de inmediato en el árbol y en el timeline.

**Reglas**

- Los tres epics del brief más Data Foundation vienen pre-cargados.
- Los pre-cargados no se borran; cualquier epic nuevo es editable y eliminable.

### US-004 — Editar y eliminar un epic

**COMO** PM  
**QUIERO** editar el nombre, objetivo y milestone de un epic, o eliminarlo  
**PARA** mantener el roadmap alineado a medida que cambia el scope

**Casos de uso**

- `UC-01` El PM edita nombre, objetivo, criterios de alto nivel y milestone.
- `UC-02` Al eliminar un epic, sus historias se eliminan tras confirmación.
- `UC-03` Si otras historias dependían de historias del epic eliminado, esas dependencias se marcan como rotas y se piden resolver.

**Reglas**

- Los epics pre-cargados del brief no se eliminan, solo se editan.


## Bloque 3 — Gestión de historias

### US-005 — Crear una historia (formulario completo o copiar)

**COMO** PM  
**QUIERO** crear una historia nueva llenando el set completo, o copiando una existente  
**PARA** agregar scope sin asumir nada y sin partir de cero cada vez

**Casos de uso**

- `UC-01` El PM ve por default las historias ya creadas en cada epic.
- `UC-02` 'Nueva historia' abre un formulario con el set completo: Como/Quiero/Para, UCs, Reglas, esfuerzo por rol (escala de días), rol, dependencia, MVP%.
- `UC-03` 'Copiar' duplica una historia existente para editarla como base.
- `UC-04` Al guardar, la historia entra al epic y su estimación impacta la duración y el timeline al instante.
- `UC-05` Una historia incompleta se muestra con un badge 'borrador' hasta redactar todos los campos.

**Reglas**

- El formulario pide todos los campos de la base definida — ningún campo queda asumido por la tool.
- Copiar-pegar es un atajo, no una excepción: la copia trae todos los campos y se editan.
- El board puede ver al PM crear una historia en vivo.

### US-006 — Ver una historia en modo lectura

**COMO** PM  
**QUIERO** abrir una historia y verla redactada en su formato completo  
**PARA** revisar el scope tal como lo leería el equipo o el board

**Casos de uso**

- `UC-01` Al seleccionar una historia, se muestra en lectura: Como/Quiero/Para, UCs, Reglas, Estados.
- `UC-02` Se muestran también sus campos de planificación: componente, epic, labels, estimación, rol, dependencias, profundidad.
- `UC-03` Un control 'Editar' pasa la historia a modo edición.

**Estados**

- `lectura`
- `edición`

### US-007 — Editar una historia

**COMO** PM  
**QUIERO** editar cualquier campo de una historia  
**PARA** calibrar el scope, el esfuerzo o el comportamiento en vivo

**Casos de uso**

- `UC-01` En edición, todos los campos son editables (texto, UCs, reglas, estimación, rol, dependencias, profundidad).
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


## Bloque 4 — Estimación y roles

### US-009 — Estimar una historia por rol (escala de días)

**COMO** PM  
**QUIERO** asignar el esfuerzo de una historia por rol eligiendo de una escala de días  
**PARA** que la tool derive la duración sin que yo asuma ninguna unidad

**Casos de uso**

- `UC-01` El PM elige el esfuerzo por rol de una escala acotada: 1 día · 2 días · 3 días · 1 semana · 10 días · 2 semanas · 3 semanas · 4 semanas.
- `UC-02` La tool convierte los días a semanas para agendar, usando la constante 'días por semana' (US-028).
- `UC-03` La duración se calcula como el esfuerzo del rol cuello de botella ÷ gente de ese rol.
- `UC-04` El cambio se propaga: historia → epic → milestone → timeline.
- `UC-05` El esfuerzo agregado del epic se muestra en días y en su equivalente en semanas.

**Reglas**

- El esfuerzo se elige de una escala, no se tipea libre — evita falsa precisión (no hay '6,5 días').
- La escala es una lista editable, no un valor clavado: el PM puede sumar o quitar pasos.
- El esfuerzo es un input, nunca un hecho fijo; se carga a nivel historia, nunca directo en el epic.
- La duración la deriva la tool; nunca se carga a mano.

### US-028 — Configurar la escala de esfuerzo y la conversión

**COMO** PM  
**QUIERO** definir la escala de días y cuántos días equivalen a una semana  
**PARA** que ni la unidad ni la conversión sean supuestos ocultos de la tool

**Casos de uso**

- `UC-01` El PM ve la escala de esfuerzo (1d · 2d · 3d · 1sem · 10d · 2sem · 3sem · 4sem) y puede agregar o quitar pasos.
- `UC-02` El PM ajusta la constante 'días por semana' (default 5); toda la agenda se recalcula.
- `UC-03` El cambio impacta todas las estimaciones existentes a la vez.

**Reglas**

- Default: 5 días = 1 semana (semana laboral), editable.
- La escala y la conversión son configuración global visible, no constantes en el código.

### US-010 — Asignar rol a una historia

**COMO** PM  
**QUIERO** asignar cada historia a uno o más roles del equipo  
**PARA** que el toggle de equipo tenga un efecto real

**Casos de uso**

- `UC-01` El PM asigna la historia a los roles que la ejecutan.
- `UC-02` Si un rol asignado se remueve del equipo, la historia se bloquea y el efecto sube al milestone.
- `UC-03` El epic hereda la mezcla de roles de sus historias.

### US-011 — Ajustar la composición del equipo

**COMO** PM  
**QUIERO** agregar o quitar personas por rol  
**PARA** responder en vivo '¿cómo cambia el roadmap si cambia el equipo?'

**Casos de uso**

- `UC-01` El PM sube o baja la cantidad de personas por rol.
- `UC-02` El timeline se recalcula: las duraciones se comprimen o estiran y los milestones se mueven.
- `UC-03` Si un rol necesario queda en cero, las historias e epics que lo requieren se marcan bloqueados.

**Estados**

- `rol disponible`
- `rol en cero (bloquea)`

### US-012 — Ver la carga por rol

**COMO** PM  
**QUIERO** ver cuánto trabajo total tiene cada rol a lo largo de todos los epics  
**PARA** identificar el cuello de botella real sin afirmarlo de memoria

**Casos de uso**

- `UC-01` La tool suma el esfuerzo por rol sobre todas las historias y lo divide por la gente de ese rol.
- `UC-02` El rol más cargado se resalta como cuello de botella.
- `UC-03` La carga se actualiza al cambiar estimaciones, historias o equipo.


## Bloque 5 — Dependencias

### US-013 — Declarar dependencias entre historias

**COMO** PM  
**QUIERO** declarar que una historia depende de otra  
**PARA** que el orden del roadmap refleje restricciones reales, sin asumir

**Casos de uso**

- `UC-01` El PM declara una dependencia de una historia hacia otra.
- `UC-02` Si es dentro del mismo epic, es orden interno y no sale del epic.
- `UC-03` Si cruza a otro epic, se propaga y se muestra como dependencia entre esos dos epics.
- `UC-04` La tool impide dependencias circulares.

**Reglas**

- Criterio de propagación por el target: mismo epic = interna; otro epic = cruza y sube.

### US-014 — Editar y ver las dependencias en el roadmap

**COMO** PM  
**QUIERO** ver y editar las dependencias directamente sobre el roadmap  
**PARA** reordenar epics en vivo cuando el board pregunta '¿y si arrancamos por otro?'

**Casos de uso**

- `UC-01` Las dependencias que cruzan epics se muestran como conexiones en el timeline.
- `UC-02` El PM reordena la prioridad de epics sin dependencia dura entre ellos.
- `UC-03` Si un reordenamiento rompe una dependencia real, la tool lo frena y explica por qué.


## Bloque 6 — Milestones

### US-015 — Crear milestones transversales

**COMO** PM  
**QUIERO** definir milestones que agrupen historias específicas de varios epics  
**PARA** marcar hitos reales como 'MVP' o 'Beta' que cruzan componentes

**Casos de uso**

- `UC-01` El PM crea un milestone y le asocia historias de cualquier epic.
- `UC-02` El milestone se considera alcanzado cuando todas sus historias están terminadas.
- `UC-03` El PM le pone nombre y fecha target ficticia (ej. MVP semana 8).

**Reglas**

- Un milestone es un corte transversal de historias, no el fin de un epic entero.
- Muestra siempre qué historias lo componen y de qué epic vienen, para que cualquier movimiento de fecha sea explicable. [regla anti-fricción]

### US-016 — Ver target vs. forecast de un milestone

**COMO** PM  
**QUIERO** ver la fecha comprometida (target) y la proyectada (forecast) de cada milestone  
**PARA** saber si llego, y mostrar la brecha en vivo cuando cambia algo

**Casos de uso**

- `UC-01` Cada milestone muestra su target fijo y su forecast calculado de sus historias.
- `UC-02` Cuando el forecast supera el target, el milestone se marca en rojo con la brecha ('+2 semanas').
- `UC-03` Al cambiar equipo, scope o estimación, el forecast se mueve y el target se queda quieto.
- `UC-04` Si el movimiento viene de reordenar, el milestone indica qué historia/epic lo causó.

**Reglas**

- El target se queda clavado; el forecast se mueve; el valor está en la brecha entre los dos.

**Estados**

- `en fecha (forecast ≤ target)`
- `en riesgo (forecast > target)`

### US-029 — Calendario en días hábiles

**COMO** PM  
**QUIERO** que las fechas se calculen en días hábiles desde una fecha de inicio configurable  
**PARA** que el roadmap muestre fechas reales y no cuente fines de semana ni feriados

**Casos de uso**

- `UC-01` El PM define la fecha de inicio del roadmap (default 24-ago-2026, lunes).
- `UC-02` La tool mapea la duración en semanas laborales a días hábiles, salteando sábados y domingos.
- `UC-03` La tool descuenta los feriados federales de EE.UU. de una lista editable.
- `UC-04` El timeline muestra los días salteados (fin de semana y feriados, con el feriado nombrado).
- `UC-05` Todas las fechas de historias y milestones se expresan como fecha real de calendario.

**Reglas**

- Default: fecha de inicio 24-ago-2026; 5 días hábiles = 1 semana (US-028).
- Feriados = lista editable de feriados federales US; se pueden quitar o agregar.
- Nada de fechas corridas: 2 semanas de trabajo caen en la fecha hábil real, no 14 días corridos.


## Bloque 7 — Scope y profundidad

### US-017 — Alternar profundidad MVP / Full

**COMO** PM  
**QUIERO** marcar una historia como MVP o Full y definir cuánto recorta su MVP  
**PARA** mostrar el trade-off entre entregar antes y entregar completo, sin asumir el recorte

**Casos de uso**

- `UC-01` El PM cambia la profundidad; el esfuerzo se ajusta por el % de MVP de esa historia.
- `UC-02` El PM edita el % de MVP por historia (cuánto del esfuerzo Full cuesta el MVP).
- `UC-03` El timeline y los milestones se recalculan.
- `UC-04` Se muestra una nota de trade-off con lo que el MVP deja afuera.

**Reglas**

- El % de MVP es un input por historia, no un número clavado igual para todas.
- Ej.: el MVP de un motor de IA recorta más (45%) que el de un mapa (55%) — y ambos son editables.

**Estados**

- `MVP`
- `Full`

### US-018 — Gestionar capas de riesgo (amenazas)

**COMO** PM  
**QUIERO** activar, desactivar, agregar o editar las capas de riesgo  
**PARA** responder '¿cómo cambia el roadmap si cambia el scope?' sin quedar atado a las 3 del brief

**Casos de uso**

- `UC-01` El PM ve las capas por default (calor, inundación, energía) y puede activarlas/desactivarlas.
- `UC-02` 'Agregar capa' crea una amenaza nueva (ej. sequía); entra al cálculo de scope al instante.
- `UC-03` El PM edita o elimina una capa existente.
- `UC-04` Apagar o quitar una capa reduce el esfuerzo de las historias que la cubren y acelera el timeline, con nota de lo no cubierto.

**Reglas**

- Las capas de riesgo son una lista editable, no las tres del brief clavadas.
- El multiplicador de scope es lineal y visible (cada capa pesa igual) — supuesto declarado, no oculto.

**Estados**

- `capa activa`
- `capa inactiva`


## Bloque 8 — Supuestos y datasets

### US-019 — Gestionar supuestos y datasets globales

**COMO** PM  
**QUIERO** anotar los supuestos y datasets del proyecto en un panel visible  
**PARA** defender mi 'toma personal' cuando el board la cuestione

**Casos de uso**

- `UC-01` El PM ve y edita supuestos globales (fuentes climáticas, resolución, barrios, fecha de inicio).
- `UC-02` El PM agrega un dataset desde cero o edita uno pre-cargado.
- `UC-03` Los datasets vienen poblados con carácter (nombre, resolución, frecuencia) pero son todos editables.

**Reglas**

- Nada es un hecho; todo supuesto es un input visible y cuestionable.

### US-020 — Anotar supuestos locales dentro de una historia

**COMO** PM  
**QUIERO** registrar supuestos específicos dentro de las Reglas de una historia  
**PARA** responder desde la historia cuando el board cuestiona una decisión local

**Casos de uso**

- `UC-01` En las Reglas de una historia, el PM anota los supuestos propios de esa historia.
- `UC-02` Los datasets que la historia consume se listan en su detalle.

**Reglas**

- Supuestos globales van al panel; supuestos locales van a la Regla de la historia.


## Bloque 9 — Escenarios y '¿y si…?'

### US-021 — Guardar y comparar escenarios

**COMO** PM  
**QUIERO** guardar dos configuraciones del roadmap y verlas lado a lado  
**PARA** mostrarle al board el costo de cada camino sin decidir por ellos

**Casos de uso**

- `UC-01` El PM guarda el estado actual como Escenario A o B.
- `UC-02` La tool muestra ambos lado a lado con sus milestones y fechas.
- `UC-03` El PM no recibe un 'ganador'; ve el trade-off de cada uno.

**Reglas**

- La tool no dice cuál es el correcto — el case dice que no hay respuesta correcta.

### US-022 — Fit del roadmap contra un objetivo declarado

**COMO** PM  
**QUIERO** elegir un objetivo (velocidad, cobertura, derisking) y ver qué tan bien mi roadmap lo sirve  
**PARA** demostrar que el 'mejor' roadmap depende de qué se optimiza

**Casos de uso**

- `UC-01` El PM elige un objetivo; la tool muestra el fit del roadmap actual contra ese objetivo.
- `UC-02` Al cambiar el objetivo, el fit cambia y puede sugerir otro orden mejor para ese objetivo.
- `UC-03` La fórmula de cada objetivo está siempre a la vista: Velocidad = qué tan temprano cae el primer milestone de valor; Cobertura = % de amenazas activas cubiertas en Full; Derisking = qué tan temprano se ataca el epic más incierto.

**Reglas**

- El fit es una heurística transparente, no un veredicto; su fórmula está siempre visible.
- Es '90% alineado a este objetivo', nunca '78% correcto'. [Estado: visión — contar, no necesariamente construir]


## Bloque 10 — Robustez de la demo

### US-023 — Reset a un estado limpio

**COMO** PM  
**QUIERO** volver el roadmap al estado base con un clic  
**PARA** recuperarme en vivo si alguien del board deja todo desordenado

**Casos de uso**

- `UC-01` El PM hace 'Reset'; equipo, scope, estimaciones y profundidad vuelven al baseline de fábrica.
- `UC-02` El reset no recarga la página ni pierde las historias pre-cargadas.

**Reglas**

- El baseline de fábrica es inmutable y es el único destino del reset.
- La sesión guardada (US-024) es independiente y nunca sobrescribe el baseline. [regla anti-fricción]

### US-024 — Persistencia de la sesión de trabajo

**COMO** PM  
**QUIERO** que mi roadmap se conserve entre sesiones  
**PARA** no rearmar todo cada vez que abro la tool

**Casos de uso**

- `UC-01` Los cambios (historias, estimaciones, dependencias, escenarios) se guardan solos.
- `UC-02` Al reabrir, el roadmap aparece como lo dejé.

**Reglas**

- Best-effort; si el guardado falla, la tool no se rompe.
- [Estado: nice-to-have — el estado en memoria alcanza para la demo]


## Bloque 11 — Export y agregación de estimaciones

### US-025 — Exportar el roadmap

**COMO** PM  
**QUIERO** exportar el roadmap armado (o un escenario guardado) a un archivo  
**PARA** compartirlo con el board o el equipo después de la sesión

**Casos de uso**

- `UC-01` El PM elige exportar el estado actual o un escenario guardado (A/B).
- `UC-02` La tool genera un archivo con el timeline, epics, historias, milestones (target y forecast) y supuestos activos.
- `UC-03` El export refleja la configuración exacta al momento (equipo, scope, profundidad).
- `UC-04` El PM elige formato (PDF para leer; imagen del timeline para pegar en un mail).

**Reglas**

- El export es una foto del roadmap en ese momento, no un documento vivo.
- Incluye los supuestos para que sea defendible fuera de la sesión.

### US-026 — Agregación de estimaciones por la jerarquía

**COMO** PM  
**QUIERO** ver el esfuerzo total agregado a nivel epic y componente a medida que cargo historias  
**PARA** saber el tamaño real del trabajo sin sumarlo a mano

**Casos de uso**

- `UC-01` Al cargar o editar la estimación de una historia, el epic actualiza su esfuerzo total (suma) y su duración (schedule) al instante.
- `UC-02` El componente agrega el esfuerzo de todos sus epics igual.
- `UC-03` Se muestra el desglose por rol en cada nivel (semanas-persona de Data, de AI, etc.).
- `UC-04` La tool distingue 'esfuerzo total' (suma de trabajo) de 'duración' (cuándo termina).

**Reglas**

- La agregación es suma de esfuerzo, no promedio — promediar borraría la escala del trabajo.

### US-027 — Estimación sugerida para historias sin estimar

**COMO** PM  
**QUIERO** que la tool me sugiera un esfuerzo por defecto en las historias que todavía no estimé  
**PARA** que el epic no quede subestimado mientras completo la carga

**Casos de uso**

- `UC-01` Al crear una historia sin estimación, la tool sugiere un valor basado en el promedio de las historias ya estimadas de ese epic.
- `UC-02` El valor sugerido se muestra marcado como 'estimado automáticamente', distinto de uno cargado a mano.
- `UC-03` En cuanto el PM ingresa un valor real, reemplaza al sugerido y la marca desaparece.
- `UC-04` El agregado del epic indica cuántas historias son estimadas reales vs. sugeridas.

**Reglas**

- El promedio se usa solo como placeholder de lo no estimado, nunca como el número que maneja el roadmap.
- Precedencia: auto-sugerido (nunca tocado) → estimado (cargaste un número) → sin estimar (lo tocaste y lo vaciaste). La sugerencia solo aplica al primer estado. [regla anti-fricción]

