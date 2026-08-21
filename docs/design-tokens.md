# Design Tokens — Roadmap Studio

> **Nota de evolución.** La versión case-study proponía una dirección "green-phosphor HUD" sobre base
> clara. La herramienta actual usa un **tema oscuro con identidad propia** ("villano elegante",
> inspiración Venom + Dr. Doom): sobrio, minimalista, con un guiño arcade en la tipografía y no en el
> color. Este documento describe esa dirección. Los valores exactos deben confirmarse contra el
> código — están marcados `[VERIFICAR]`.

## Dirección estética

Oscuro, sobrio, minimalista. Villano elegante, no superhéroe brillante. La restricción es la
identidad: un fondo casi negro, un solo acento verde apagado, detalles en acero frío, y el guiño
"arcade noventoso" viviendo en el **tipo** y los **detalles**, nunca en un skin neón.

Regla de oro: el arcade se siente en la tipografía y la estructura. Un solo acento. Sin colores
chillones, sin parpadeos, sin personajes.

## Paleta `[VERIFICAR valores exactos contra el CSS del código]`

Dirección de la paleta (los hex son orientativos; tomar los reales del código):

```css
:root{
  /* Base oscura */
  --bg:#0E1512;          /* fondo casi negro, undertone verde/frío */
  --panel:#141D19;       /* superficies gris carbón */
  --line:#243029;        /* bordes tenues */
  --ink:#E6EDE8;         /* texto: blanco filoso / gris muy claro */
  --muted:#8A968F;       /* texto secundario, con contraste suficiente */

  /* Acento — verde apagado (no neón) */
  --accent:#1E7A4D;      /* verde Doom/OpenEarth apagado */
  --accent-weak:#16241D;

  /* Detalles */
  --steel:#9AA7A0;       /* acero frío para detalles secundarios */

  /* Señales de estado (versiones apagadas, NO semáforo brillante) */
  --ok:#1E7A4D;          /* en fecha / on-track */
  --warn:#B5551B;        /* en riesgo (ámbar apagado) */
  --danger:#8A3B2E;      /* bloqueado / error (rojo apagado) */
}
```

> Si el código define los tokens de otra forma (nombres, valores), este archivo debe alinearse a esos.
> Lo que NO se negocia: contraste legible sobre el fondo oscuro, y que los estados con significado
> (on-track / en riesgo / bloqueado) se distingan claramente entre sí y del fondo.

## Tipografía

- **Display / HUD / números:** fuente monoespaciada (JetBrains Mono / IBM Plex Mono `[VERIFICAR]`)
  para labels, IDs, métricas, headers de stage/epic y readouts tipo score. Números con
  `font-variant-numeric: tabular-nums`.
- **Prosa / UI general:** sans (Inter / system) para texto de historias y descripciones.
- Nada de pixel-fonts: la mono refinada da "precisión/ingeniería" + guiño arcade sin leerse a juguete.

## Metáfora arcade → roadmap (estructura que significa, no decora)

| Arcade | Roadmap Studio |
|---|---|
| STAGE 01, 02, 03 | Epics (eyebrow "STAGE 0X — <NOMBRE>") |
| Checkpoints | Milestones (target vs forecast) |
| Barras de stat | Carga por rol / barras de esfuerzo |
| Score / HI-SCORE | Readout de esfuerzo total y semana de fin |
| Level progression | Timeline (Gantt) |
| INSERT COIN / PRESS START | Estados vacíos ("crear la primera historia" / Home sin roadmaps) |

## Reglas de legibilidad (innegociables)

- Contraste suficiente para leer sin esfuerzo sobre el fondo oscuro; nada de gris oscuro sobre negro.
- Los estados con significado (on-track, en riesgo, bloqueado, target vs forecast, chips de rol y de
  tag, badge de degradación) deben distinguirse claramente. Si un estado comunica por color,
  mantener esa semántica legible en dark mode.
- El timeline/Gantt es la zona más delicada: barras, línea de forecast, zona at-risk y gridlines
  deben verse claras sobre fondo oscuro.

## Superficies específicas a cubrir por el tema

Home (cards de roadmap + dashboard), workspace (Árbol, Timeline), panel derecho, modales, tooltips,
selector de roadmap, y la pantalla de aviso "mejor en desktop" para mobile `[VERIFICAR si ya existe]`.

## Elemento firma (restraint total)

Un guiño HUD/CRT mínimo en un solo lugar: eyebrows `STAGE 0X —` en mono, readouts de métrica como
contador de score, y a lo sumo una scanline hairline apenas perceptible sobre header o timeline.
Sin fight screen, sin personajes, sin neón.
