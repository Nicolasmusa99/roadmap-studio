# Roadmap Studio — Proyecto (contexto para Claude Code)

Herramienta de roadmapping dinámica para el case de Product Owner de **Open Earth Foundation**
(escenario ficticio "Lumeria", una plataforma climática). **No** construimos la plataforma
climática: construimos la **tool de roadmapping**, y con ella se arma el roadmap de Lumeria.

La tool sirve para responder en vivo, frente a un board, "¿qué pasa si cambia el scope / el
equipo / la estimación?". Su razón de existir es contestar "¿y si…?" sin rehacer nada a mano.

---

## Stack y decisiones

- **Vite + React + TypeScript.** Single-page. Sin backend.
- **Estado en memoria** (React state). Persistencia opcional best-effort en `localStorage`.
- **Tests:** Vitest para unit, Playwright para E2E.
- **Deploy:** Vercel.
- No auth, no base de datos, no multiusuario. "Rough is fine" — el case evalúa cómo se piensa, no producción.

---

## Reglas del modelo — INVARIANTES (nunca violar)

Estas reglas son la tesis del producto. Si el código las rompe, está mal aunque "funcione".

1. **Jerarquía Componente → Epic → Historia. La historia es el átomo.**
   El esfuerzo, el rol y las dependencias viven en la historia. Epic y componente son *sumas*.
2. **El esfuerzo es un input, nunca un hecho.** Se carga solo a nivel historia, eligiendo de una
   **escala de días** (ver abajo). Nunca se tipea esfuerzo directo a nivel epic.
3. **Agregación = SUMA, no promedio.** El esfuerzo del epic es la suma del de sus historias.
   Promediar borraría la escala del trabajo. (Ver TC-045.)
4. **Esfuerzo ≠ duración.** El *esfuerzo* es cuánto trabajo hay (suma). La *duración* es cuándo
   termina, y la deriva la tool; nunca se carga a mano.
5. **Cálculo de duración.** Para una historia: `dur = ceil( max_por_rol( esfuerzo_dias_rol / gente_rol ) )`,
   convertido a semanas vía la constante `diasPorSemana` (default 5). El scheduler es
   **resource-leveled**: un rol no puede estar en dos historias a la vez.
6. **Escala de esfuerzo (editable, no clavada):** `1d · 2d · 3d · 1sem · 10d · 2sem · 3sem · 4sem`.
   Se elige de la escala, no se tipea libre (evita falsa precisión). El PM puede sumar/quitar pasos.
7. **Conversión días→semanas:** `diasPorSemana` default 5, editable. Recalcula toda la agenda.
8. **Dependencias a nivel historia.** Misma epic = orden interno (no sale del epic). Cruza a otro
   epic = se **propaga** como dependencia entre esos epics. Prohibido crear ciclos.
9. **Calendario en días hábiles.** Fecha de inicio configurable (default **2026-08-24, lunes**).
   Se saltean sábados, domingos y **feriados federales de EE.UU.** (lista editable). Los días
   salteados se muestran (feriado nombrado). Nada de días corridos: "2 semanas de trabajo" caen
   en la fecha hábil real, no 14 días después. (Ver TC-028 a TC-031.)
10. **Milestones transversales.** Agrupan historias de varios epics. Cada uno tiene **target** fijo
    (comprometido) y **forecast** calculado (de sus historias). Rojo cuando forecast > target;
    mostrar la brecha. El valor está en la brecha entre los dos.
11. **MVP% editable por historia.** El toggle MVP aplica el % propio de esa historia (no un número
    global). Ej. el MVP de un motor de IA recorta más (45%) que el de un mapa (55%).
12. **Capas de riesgo = lista editable** (no las 3 del brief clavadas). El multiplicador de scope es
    lineal y **visible** — es un supuesto declarado, no oculto.
13. **Reset = baseline de fábrica inmutable.** Es el único destino del reset. La sesión guardada es
    independiente y nunca sobrescribe el baseline.
14. **Precedencia de estimación:** `auto-sugerido` (nunca tocado → promedio del epic, marcado) →
    `estimado` (cargó un valor) → `sin estimar` (lo vació a mano). La sugerencia solo aplica al primero.
15. **"Nada asumido":** todo dato es *editable* o *una decisión declarada y defendible*. No hay
    números mágicos hardcodeados como si fueran verdad.

### Qué NO hacer
- No promediar en la agregación. No contar fines de semana ni feriados. No hardcodear la escala,
  la conversión (5) ni la lista de feriados. No tipear esfuerzo a nivel epic. No meter backend/auth.

---

## Orden de construcción (TDD guiado por los test cases)

1. **Modelo/lógica primero**, con los Unit tests como spec: scheduler, calendario de días hábiles,
   agregación, propagación de dependencias, precedencia de estimación.
   Empezar por: TC-014, TC-015, TC-020, TC-022, TC-023, TC-028, TC-029, TC-031, TC-045, TC-048.
2. **UI después**, por pantallas (ver `docs/screens.md`): vista Árbol y Timeline, detalle de historia,
   palancas (equipo, capas de riesgo), milestones, escenarios, formulario de nueva historia.
3. Iterar apuntando a test cases puntuales: "hacé pasar TC-XXX".

---

## Mapa de documentos (`/docs`)

- `product-model.md` — el modelo de datos y las reglas en detalle (la "constitución" larga).
- `user-stories.md` — las 29 historias (el *qué* construir).
- `screens.md` — las 36 pantallas/estados (las superficies de UI).
- `test-cases.md` — los 48 casos (el spec ejecutable / acceptance).
- `design-tokens.md` — paleta, tipografía y la metáfora arcade→roadmap.
- `roadmap-argument.md` — el PORQUÉ del roadmap (material de sesión): tesis, dependencias, órdenes válidos, respuestas al board.

## Skills (`.claude/skills`)

- `new-user-story` — procedimiento para agregar una historia respetando el formato completo y
  actualizando historias + pantallas + test cases (mantiene la trazabilidad).

---

## Diseño (resumen — detalle en docs/design-tokens.md)

Dirección: **"green-phosphor HUD"** — arcade sobrio. El verde de Open Earth Foundation es también el
verde-fósforo del CRT/terminal viejo: un mismo acento sirve al brand climático y al ADN arcade.
Monospace como firma (precisión + arcade), sans neutra para prosa, base clara y sobria, **un solo
acento verde**. La metáfora arcade se usa donde *significa* algo: epics = STAGES, milestones =
CHECKPOINTS, carga por rol = barras de stat (HP), esfuerzo total = readout tipo score. Minimalismo:
el arcade se siente en el tipo y la estructura, no en un skin neón. Nada de fight screen ni parpadeos.
