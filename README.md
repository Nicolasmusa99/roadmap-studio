# Roadmap Studio

Herramienta de roadmapping dinámica — case de Product Owner, Open Earth Foundation (escenario Lumeria).
La tool deja armar un roadmap (Componente → Epic → Historia) y responder en vivo "¿y si cambia el
scope / el equipo / la estimación?". No es la plataforma climática: es la herramienta con la que se
planifica.

## Cómo arrancar con Claude Code

1. Poné esta carpeta como raíz de un repo nuevo.
2. Scaffold del proyecto encima:
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   npm install -D vitest @playwright/test
   ```
3. Abrí Claude Code en la carpeta. Va a leer `CLAUDE.md` automáticamente (las reglas del modelo,
   el stack, los tokens de diseño y el mapa de docs).
4. Construí en orden (TDD): primero la lógica con los Unit tests como spec, después la UI.
   Ejemplo de prompt: *"Implementá el scheduler y el calendario de días hábiles según
   docs/product-model.md; hacé pasar TC-014, TC-015, TC-028, TC-029, TC-031."*
5. Después la UI por pantallas: *"Construí la vista Árbol (SCR-001) y el detalle de historia
   (SCR-007/SCR-008) según docs/screens.md, con los tokens de docs/design-tokens.md."*

## Estructura

```
CLAUDE.md                 ← constitución: stack, reglas del modelo (invariantes), diseño, build order
README.md
docs/
  product-model.md        ← el modelo en detalle
  user-stories.md         ← 29 historias (el qué)
  screens.md              ← 36 pantallas/estados
  test-cases.md           ← 48 casos (spec ejecutable)
  design-tokens.md        ← paleta OpenEarth-verde + arcade sobrio + metáfora
.claude/skills/
  new-user-story/SKILL.md ← procedimiento para agregar historias manteniendo trazabilidad
```

## Regla de oro

Nada asumido: todo dato es editable o una decisión declarada. No promediar (sumar). No contar fines
de semana ni feriados. No hardcodear la escala, la conversión ni los feriados. Ver `CLAUDE.md`.
