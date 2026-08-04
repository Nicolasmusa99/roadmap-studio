# Product Model — Roadmap Studio

La constitución larga del modelo. `CLAUDE.md` tiene el resumen operativo; esto es el detalle.

## Jerarquía y agregación

```
Componente → Epic → Historia
```
La **historia** es el átomo. Cada historia tiene: texto (Como/Quiero/Para, UCs, reglas), esfuerzo
por rol (escala de días), rol asignado, dependencia, MVP%, y su estado.

El **epic** no tiene esfuerzo propio: su esfuerzo = **suma** del de sus historias; su ventana de
tiempo = min(start) … max(end) de sus historias. El **componente** agrega sus epics igual.

## Esfuerzo (input) vs duración (derivada)

- **Esfuerzo:** cuánto trabajo hay. Se carga por rol, eligiendo de la escala de días. Es la única
  entrada de estimación. Se agrega hacia arriba por **suma**.
- **Duración:** cuándo termina. La deriva la tool. Nunca se carga.

`escala = [1, 2, 3, 5, 10, 15, 20]` días (= 1d,2d,3d,1sem,10d,2sem,3sem,4sem). Lista editable.
`diasPorSemana = 5` (editable).

## Scheduler (resource-leveled, greedy por dependencia)

Para cada historia: `mult = (mvp ? mvpPct/100 : 1)`.
`durSemanas = ceil( max_por_rol( (esfuerzoDias_rol * mult) / (diasPorSemana * gente_rol) ) )`.
El scope por amenazas NO entra en `mult`: se aplica **antes** del scheduler filtrando historias
fuera de scope (ver §Capas de riesgo), así el scheduler solo ve el trabajo en scope.

Agenda: procesar historias en orden de dependencia; una historia arranca en
`max(fin de su dependencia, primer momento en que sus roles necesarios están libres)`.
Un rol ocupa **todas** las historias que ejecuta de forma secuencial (no dos a la vez).
Si un rol necesario tiene 0 gente → historia **bloqueada** (y su epic).

> Simplificación declarada: el leveling es greedy por orden/prioridad, no un solver óptimo; y una
> historia ocupa todos sus roles por toda su duración. Elegido por legibilidad, no por precisión.

## Dependencias y propagación

Dependencia a nivel historia. Regla por el **target**:
- target en el **mismo epic** → dependencia **interna** (orden local, no sale del epic).
- target en **otro epic** → **cruza**; se propaga y se muestra como dependencia entre esos epics.

Prohibido crear ciclos (chequear transitividad antes de aceptar una dependencia).

## Calendario (días hábiles)

- Fecha de inicio configurable; default **2026-08-24** (lunes).
- Convertir semanas de trabajo a días hábiles: saltear sábados, domingos y feriados.
- **Feriados** = lista editable de feriados federales de EE.UU. En el rango del roadmap:
  Labor Day (1er lun de sep), Columbus Day (2º lun oct), Veterans Day (11 nov),
  Thanksgiving (4º jue nov), Christmas (25 dic), New Year (1 ene), MLK Day (3er lun ene),
  Presidents Day (3er lun feb). Se pueden quitar/agregar.
- Mostrar los días salteados; nombrar el feriado.
- Regla dura: "2 semanas de trabajo" = 10 días hábiles reales, NO 14 corridos.

## Milestones

Transversales: agrupan historias de cualquier epic. Cada milestone:
- `target` (semana/fecha comprometida, fija).
- `forecast = max(fin de sus historias)` (calculado).
- Estado: `en fecha` (forecast ≤ target) o `en riesgo` (forecast > target, mostrar brecha).
- Muestra siempre qué historias lo componen y de qué epic vienen.

## MVP / profundidad

`mvpPct` por historia (editable). Toggle MVP aplica ese % al esfuerzo. Mostrar nota de trade-off.

## Capas de riesgo (amenazas)

Lista editable (no las 3 del brief clavadas). Activar/desactivar/agregar/editar/eliminar.
Modelo **híbrido** (filtro + scope visible):

- **Filtrado (comportamiento principal):** desactivar una amenaza **saca del roadmap** las historias
  que llevan su label (`heat` / `flood` / `energy`). Salen del Árbol y del Timeline, y los epics y
  milestones se recalculan porque ese trabajo ya no está. El filtro corre *aguas arriba* del
  scheduler (`lib/threats.ts`), así toda fecha derivada refleja solo el trabajo en scope. Las
  historias multi-riesgo (sin un label de amenaza único) nunca se filtran.
- **Scope visible:** el sidebar muestra `SCOPE %` = esfuerzo aún en scope / esfuerzo total. El
  supuesto de scope queda **declarado, no oculto**.

Nota: el modelo anterior era un multiplicador lineal `capasActivas / capasTotales` sobre el esfuerzo
de todas las historias. Se reemplazó por el filtrado porque es más tangible ("¿y si dropeamos
flood?" saca las historias de flood) y evita encoger trabajo que no es de esa amenaza.

## Estimación sugerida (precedencia)

- `auto-sugerido`: historia nunca tocada → esfuerzo = promedio de las historias estimadas del epic,
  marcado "estimado automáticamente".
- `estimado`: el PM cargó un valor.
- `sin estimar`: el PM lo vació a mano (no vuelve al placeholder).
La sugerencia (promedio) solo aplica al primer estado y NUNCA maneja el roadmap: es placeholder.

## Escenarios y reset

- Guardar A/B y comparar lado a lado. La tool no elige "ganador".
- `baseline de fábrica` inmutable = único destino del Reset. La sesión guardada es independiente.

## Fit por objetivo (VISIÓN — opcional, no bloqueante)

Heurística transparente, no veredicto. Objetivos: velocidad (qué tan temprano cae el 1er milestone
de valor), cobertura (% de capas activas cubiertas en Full), derisking (qué tan temprano se ataca el
epic más incierto). La fórmula de cada uno siempre a la vista. Nunca "X% correcto".

## Decisiones de borde

Comportamientos no obvios que emergen de invariantes, elegidos por legibilidad y consistencia.

> **Borde-8 — Roles con days=0 se descartan al guardar.**
> Si el PM agrega un rol en modo edición pero nunca elige un valor de escala (days === 0), ese
> rol se filtra antes de llamar a `updateStory`. Razón: un rol sin esfuerzo no tiene semántica de
> scheduling (no se puede asignar duración ni bloquear recursos). Mantenerlo en el store crearía
> entradas incoherentes. El comportamiento es silencioso — el PM simplemente ve que el rol no
> aparece en lectura, lo que es la señal correcta para volver a editarlo y elegir un valor.
