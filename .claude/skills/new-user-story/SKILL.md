---
name: new-user-story
description: >
  Usar SIEMPRE que se quiera agregar, redactar o registrar una historia de usuario nueva de Roadmap
  Studio (o cuando alguien diga "agregá una historia", "nueva US", "documentá esta feature como
  historia"). Fuerza el formato completo del proyecto y mantiene la trazabilidad actualizando los
  tres documentos: historias, pantallas y test cases. No usar para features de la plataforma
  climática de Lumeria; esto es para las historias de la TOOL.
---

# Skill: nueva historia de usuario

Cuando el usuario pida agregar una historia, seguí este procedimiento. No inventes campos: si falta
un dato, preguntá antes de escribir.

## 1. Completar el set completo (formato del proyecto)

- **ID:** siguiente `US-0XX` libre (revisar `docs/user-stories.md`).
- **Título** corto.
- **COMO / QUIERO / PARA** — persona válida del dominio (PM, analista de riesgo, operador de
  respuesta, planificador urbano, miembro del board, sistema).
- **Casos de uso** `UC-01 acción → resultado` — de **comportamiento**, no de implementación
  (no nombrar funciones/endpoints que no existen; estamos pre-build).
- **Reglas** — restricciones + supuestos locales + datasets que consume.
- **Estados** (si aplica).
- **Campos de planificación:** esfuerzo por rol (elegido de la escala de días: 1d·2d·3d·1sem·10d·
  2sem·3sem·4sem), rol, dependencia (marcar si cruza epic), MVP%, epic padre, component, labels feat-*.

## 2. Respetar los invariantes del modelo (ver CLAUDE.md)

La historia debe ser consistente con: esfuerzo como input (nunca a nivel epic), agregación por suma,
dependencias con regla de propagación, calendario en días hábiles, MVP% editable, nada asumido.

## 3. Mantener la trazabilidad — actualizar los 3 docs

1. **`docs/user-stories.md`** — agregar la historia en su bloque.
2. **`docs/screens.md`** — agregar la(s) pantalla(s)/estado(s) que la historia necesita, con
   `SCR-0XX`, Clave Foránea a su pantalla base, y detalle visual.
3. **`docs/test-cases.md`** — agregar al menos 1 test por caso de uso relevante (`TC-0XX`), con
   Tipo (Unit para lógica, E2E para interacción), referenciando la nueva `US-0XX`.

## 4. Confirmar la cadena

Cerrar mostrando la trazabilidad: `US-0XX → SCR-0XX → TC-0XX`. Esa cadena historia → pantalla →
test es la marca de calidad del proyecto; no dejar una historia sin sus pantallas y tests.
