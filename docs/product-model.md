# Product Model — Roadmap Studio

La constitución larga del modelo. Describe **la herramienta genérica**: una app de roadmapping
multi-proyecto, con persistencia local, donde el usuario define sus propios roles, tags y notas.
`CLAUDE.md` tiene el resumen operativo; esto es el detalle.

---

## Alcance: herramienta genérica, multi-roadmap

Roadmap Studio no está atado a ningún proyecto ni dominio. El usuario maneja **varios roadmaps en
paralelo**, cada uno independiente, con sus propias historias, epics, roles, tags, checkpoints y
notas. No hay contenido de ejemplo pre-cargado: la app arranca vacía y el usuario crea sus propios
roadmaps desde cero.

### Multi-roadmap y persistencia

```
App
 └─ Roadmap (id, nombre)   ← varios en paralelo, sin límite
     └─ AppState completo   ← historias, epics, roles, tags, checkpoints, notas
```

- Cada roadmap es un `AppState` completo e independiente, con un `id` y un `nombre` editable.
- **Persistencia:** todos los roadmaps se guardan en **localStorage** y sobreviven al recargar o
  cerrar el browser. El guardado es automático (con debounce para no escribir en cada tecleo).
- **Limitación conocida:** localStorage es por **dominio y por dispositivo**. Los roadmaps viven en
  ese browser en esa máquina; no se sincronizan entre dispositivos ni sobreviven a un borrado de
  caché. (La sincronización en la nube es una mejora futura — ver `backlog.md`.)
- **Versionado:** el formato guardado lleva un `schemaVersion` para poder migrar si el modelo cambia.
- **Manejo de fallo:** si localStorage no está disponible o está lleno, la app avisa sin romperse.

### Pantalla Home y navegación

- **Home ("Mis Roadmaps"):** al abrir la app se muestra la lista de roadmaps guardados. Desde acá el
  usuario crea, abre, renombra y borra roadmaps (borrar pide confirmación porque borra datos).
- **Mini-dashboard por roadmap:** cada item de la lista muestra indicadores de un vistazo
  `[NUEVO — verificar detalles exactos contra el código]`: estado del checkpoint más próximo
  (en fecha / en riesgo), contadores (historias, roles, tags), fecha proyectada de fin, y fecha de
  última edición.
- **Selector (dropdown):** ya dentro de un roadmap, un selector en la barra superior permite saltar
  a otro roadmap sin volver a la home; un botón vuelve a la home.

---

## Jerarquía y agregación

```
Componente → Epic → Historia
```
La **historia** es el átomo. Cada historia tiene: texto (Como/Quiero/Para, UCs, reglas), esfuerzo
por rol (escala de días), rol asignado, dependencia, MVP%, tags, y su estado.

El **epic** no tiene esfuerzo propio: su esfuerzo = **suma** del de sus historias; su ventana de
tiempo = min(start) … max(end) de sus historias. El **componente** agrega sus epics igual.

---

## Esfuerzo (input) vs duración (derivada)

- **Esfuerzo:** cuánto trabajo hay. Se carga por rol, eligiendo de la escala de días. Es la única
  entrada de estimación. Se agrega hacia arriba por **suma**.
- **Duración:** cuándo termina. La deriva la tool. Nunca se carga.

`escala = [1, 2, 3, 5, 10, 15, 20]` días (= 1d,2d,3d,1sem,10d,2sem,3sem,4sem). Lista editable.
`diasPorSemana = 5` (editable).

---

## Roles (dinámicos, definidos por el usuario)

Los roles **no son fijos**. El usuario crea, renombra y borra los roles que quiera, y les asigna
capacidad (cantidad de personas).

- Un roadmap arranca con un **starter team editable** de 4 roles por defecto como punto de partida
  cómodo; los cuatro son renombrables y borrables, y se pueden agregar los que el usuario necesite.
- Cada historia asigna esfuerzo a cualquiera de los roles definidos, leídos dinámicamente.
- Al **borrar un rol** que tiene esfuerzo asignado en historias, la tool avisa (con conteo de las
  historias afectadas) y limpia el esfuerzo huérfano, para no dejar referencias rotas.
- **Borde: roles con days=0 se descartan al guardar.** Si el usuario agrega un rol en edición pero
  nunca elige un valor de escala (days === 0), ese rol se filtra antes de guardar la historia: un
  rol sin esfuerzo no tiene semántica de scheduling. Comportamiento silencioso; el rol simplemente
  no aparece en lectura.

---

## Scheduler (resource-leveled, greedy por dependencia)

Para cada historia: `mult = (mvp ? mvpPct/100 : 1)`.
`durSemanas = ceil( max_por_rol( (esfuerzoDias_rol * mult) / (diasPorSemana * gente_rol) ) )`.

El scope por **tags** NO entra en `mult`: se aplica **antes** del scheduler filtrando las historias
fuera de scope (ver §Tags), así el scheduler solo ve el trabajo en scope.

Agenda: procesar historias en orden de dependencia; una historia arranca en
`max(fin de su dependencia, primer momento en que sus roles necesarios están libres)`.
Un rol ocupa **todas** las historias que ejecuta de forma secuencial (no dos a la vez).
Si un rol necesario tiene 0 gente → historia **bloqueada** (y su epic).

> Simplificación declarada: el leveling es greedy por orden/prioridad, no un solver óptimo; y una
> historia ocupa todos sus roles por toda su duración. Elegido por legibilidad, no por precisión.
> El parámetro `people` de un rol solo **acelera la duración** (divide el esfuerzo); no da slots
> paralelos: cada rol es un recurso único que ejecuta sus historias en serie.

---

## Dependencias y propagación

Dependencia a nivel historia. Regla por el **target**:
- target en el **mismo epic** → dependencia **interna** (orden local, no sale del epic).
- target en **otro epic** → **cruza**; se propaga y se muestra como dependencia entre esos epics.

Prohibido crear ciclos (chequear transitividad antes de aceptar una dependencia). Ante un ciclo que
igual llegue al scheduler (dato importado / storage corrupto), las historias en ciclo quedan
`blocked` con razón `cycle`, nunca se agendan mal.

---

## Calendario (días hábiles)

- Fecha de inicio configurable; default **2026-08-24** (lunes). `[VERIFICAR: default exacto en el código]`
- Convertir semanas de trabajo a días hábiles: saltear sábados, domingos y feriados.
- **Feriados:** lista editable. Hoy poblada con feriados federales de EE.UU. (Labor Day, Columbus
  Day, Veterans Day, Thanksgiving, Christmas, New Year, MLK Day, Presidents Day), todos editables:
  se pueden quitar y agregar.
- Mostrar los días salteados; nombrar el feriado.
- Regla dura: "2 semanas de trabajo" = 10 días hábiles reales, NO 14 corridos.

> `[BACKLOG — no construido]` **Selector de país para feriados.** En vez de una lista US clavada,
> elegir el país y traer sus feriados automáticamente (vía librería local de feriados tipo
> `date-holidays`, sin API ni tokens). Relevante para uso fuera de EE.UU. Ver `backlog.md`.

---

## Milestones / Checkpoints

Transversales: agrupan historias de cualquier epic. Cada milestone:
- `target` (semana/fecha comprometida, fija).
- `forecast = max(fin de sus historias)` (calculado).
- Estado: `en fecha` (forecast ≤ target) o `en riesgo` (forecast > target, mostrar brecha).
- Muestra siempre qué historias lo componen y de qué epic vienen.

---

## MVP / profundidad

`mvpPct` por historia (editable). Toggle MVP aplica ese % al esfuerzo. Mostrar nota de trade-off.
El `mvpPct` es un input por historia, no un número igual para todas. Bordes: fuera de 0–100 se
clampea (150 → 100, negativo → 0); con 0 la duración es 0 y la historia NO queda bloqueada.

---

## Tags (scope configurable — antes "capas de riesgo / amenazas")

> **Nota de evolución.** En la versión case-study esto eran "capas de riesgo" (amenazas climáticas
> heat/flood/energy). Se generalizó: ahora son **tags libres** que el usuario crea y nombra como
> quiera (ej. `must-have`, `growth`, `backend`, `cliente-X`). El mecanismo de filtrado y degradación
> es idéntico; solo dejó de estar atado a un dominio.

Lista editable de tags. Crear / renombrar / borrar / activar / desactivar. El usuario asigna uno o
más tags a cada historia. Modelo **híbrido** (filtro + scope visible):

- **Filtrado (comportamiento principal):** desactivar un tag **saca del roadmap** las historias que
  lo llevan. Salen del Árbol y del Timeline, y los epics y milestones se recalculan porque ese
  trabajo ya no está. El filtro corre *aguas arriba* del scheduler (`lib/threats.ts`), así toda
  fecha derivada refleja solo el trabajo en scope. Las historias con varios tags (sin un tag único)
  no se filtran al apagar uno solo si conservan otro activo.
- **Scope visible:** el sidebar muestra `SCOPE %` = esfuerzo aún en scope / esfuerzo total. El
  supuesto de scope queda **declarado, no oculto**.
- **Degradación (no bloqueo) vía `amplifiedBy`:** una historia puede declarar tags que la
  *enriquecen* sin gatearla (`story.amplifiedBy`, distinto de `labels`). Cuando ese tag se apaga, la
  historia **no** se filtra: sigue agendada y solo pierde esa dimensión, mostrada como score
  *degradado* (badge `⚠ −<TAG>`), nunca BLOCKED. `storyDegradation()` en `lib/threats.ts` reporta
  las dimensiones perdidas; no toca el scope ni el scheduler.

> Nota interna: en código, el mecanismo conserva nombres heredados (`RiskLayer`, `threats.ts`,
> `labels`). Es solo naming interno; de cara al usuario son "tags". No requiere refactor.

---

## Notas / Assumptions (secciones libres — antes "supuestos y datasets")

> **Nota de evolución.** Antes era un panel con categorías fijas (datasets climáticos, mitigación,
> milestones, open questions) del case study. Se generalizó a un espacio de notas abierto.

Un tab de notas donde el usuario crea sus **propias secciones** con el nombre que quiera (ej.
"Riesgos", "Decisiones", "Preguntas al cliente", "Notas técnicas") y agrega notas individuales
dentro de cada una (agregar / editar / borrar cada nota y cada sección). Cada roadmap tiene sus
propias notas, persistidas con el resto de su estado en localStorage.

---

## Estimación sugerida (precedencia)

- `auto-sugerido`: historia nunca tocada → esfuerzo = promedio de las historias estimadas del epic,
  marcado "estimado automáticamente".
- `estimado`: el usuario cargó un valor.
- `sin estimar`: el usuario lo vació a mano (no vuelve al placeholder).
La sugerencia (promedio) solo aplica al primer estado y NUNCA maneja el roadmap: es placeholder.

---

## Escenarios y reset

- **Escenarios A/B:** guardar dos configuraciones del roadmap y compararlas lado a lado con sus
  milestones y fechas. La tool no elige "ganador": expone el trade-off de cada camino.
- **Reset:** cada roadmap se puede resetear a su estado inicial vacío (starter team + nada más).
  El reset de un roadmap **no** afecta a los otros roadmaps guardados.

---

## Fit por objetivo

Heurística transparente, no veredicto. Objetivos: velocidad (qué tan temprano cae el primer
milestone de valor), cobertura (% de tags activos cubiertos en Full), derisking (qué tan temprano se
ataca el epic más incierto). La fórmula de cada uno siempre a la vista. Nunca "X% correcto".

---

## Tema visual

`[VERIFICAR contra design-tokens.md y el código]` La app usa un tema oscuro con identidad propia
(dirección "villano elegante" — negro/gris carbón, acento verde apagado, detalles en acero,
tipografía mono para HUD/números). Ver `design-tokens.md` para los tokens exactos.

---

## Decisiones de borde

Comportamientos no obvios que emergen de invariantes, elegidos por legibilidad y consistencia.

> **Borde — Roles con days=0 se descartan al guardar.** (Ver §Roles.)
>
> **Borde — daysPerWeek < 1 bloquea de forma visible.** Config editable: si el usuario pone
> `daysPerWeek = 0`, las historias quedan `blocked` con razón `invalid-config` y sin fechas; nunca
> se produce `NaN`/`Infinity`, y NO se clampea en silencio (contradiría "nada asumido, todo visible").
>
> **Borde — bloqueo por dependencia expone la causa raíz.** En una cadena A ← B ← C donde A no puede
> agendarse (rol en 0), las tres quedan `blocked`, pero B y C apuntan a A como raíz
> (`blockedBy = 'A'`), no solo a su eslabón inmediato.
