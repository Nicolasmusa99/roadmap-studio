# Design Tokens — Roadmap Studio

**Dirección:** *green-phosphor HUD* — arcade sobrio. Toma el ADN del portfolio arcade de Nicolás
(Marvel vs Capcom: stage select, barras de stat, HUD) y lo ejecuta minimalista y profesional.
El **verde de Open Earth Foundation** es también el **verde-fósforo del CRT** viejo: un mismo acento
sirve al brand climático y al guiño arcade. Esa es la decisión que unifica todo.

Regla de oro: el arcade se siente en el **tipo** y la **estructura**, no en un skin neón.
Un solo acento. Un solo flourish HUD. Todo lo demás, quieto.

## Paleta (CSS variables — base clara, sobria)

```css
:root{
  /* Acento — verde OpenEarth + guiño CRT phosphor */
  --oe-green:#1E7A4D;
  --oe-green-weak:#E4F0EA;
  /* Neutros */
  --ink:#14201C;      /* near-black cálido, undertone verde */
  --bg:#F5F6F3;       /* base neutra */
  --panel:#FFFFFF;
  --line:#E2E6E0;
  --muted:#6B7671;
  /* Señales (sobrias) */
  --ok:#1E7A4D;       /* en fecha */
  --warn:#B5551B;     /* en riesgo (ámbar apagado, no rojo neón) */
  /* Tonos de componente (quietos, desaturados) */
  --c-df:#6B7A72;  --c-vis:#2E6E6A;  --c-ri:#1E7A4D;  --c-ai:#5A6E52;
}
```

Variante **dark "terminal"** (opcional, swap de variables): `--bg:#0E1512; --panel:#141D19;
--ink:#E6EDE8; --line:#243029;` manteniendo `--oe-green` como acento. Es la más arcade; para una
demo en proyector, la base clara es más legible. Elegir una.

## Tipografía

- **Display / HUD / números:** `JetBrains Mono` (o IBM Plex Mono). Para labels, IDs, métricas,
  headers de stage y readouts tipo score. Números siempre `font-variant-numeric: tabular-nums`.
- **Prosa / UI general:** `Inter` (o system sans). Para texto de historias, descripciones.
- Nada de pixel-fonts: se lee como juguete. La mono refinada da "precisión/ingeniería" + arcade.

## Metáfora arcade → roadmap (estructura que SIGNIFICA, no decora)

| Arcade (portfolio) | Roadmap Studio |
|---|---|
| STAGE 01, 02, 03 (stage select) | Epics (eyebrow "STAGE 0X — DATA FOUNDATION") |
| Checkpoints | Milestones (target vs forecast) |
| Barras de stat (PRODUCT 95, DATA 85) | Carga por rol / barras de esfuerzo |
| Score / HI-SCORE counter | Readout de esfuerzo total y semana de fin |
| Level progression | Timeline (Gantt) |
| INSERT COIN / PRESS START | Estados vacíos ("crear la primera historia") |

## Elemento firma (la única cosa audaz, en un solo lugar)

Un guiño HUD/CRT mínimo: eyebrows tipo `STAGE 0X —` en mono, los readouts de métrica como contador
de score, y una textura de **scanline hairline** apenas perceptible sobre el header o el timeline.
Restraint total: sin fight screen, sin personajes, sin parpadeos, sin neón.
