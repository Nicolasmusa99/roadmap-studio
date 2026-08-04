# Roadmap de Lumeria — Argumento de producto (material de sesión)

> Esto NO es spec de la tool. Es el *porqué* del roadmap que la tool muestra. Guía para la sesión
> en vivo del case (Open Earth Foundation, escenario Lumeria). El baseline de `data/baseline.ts`
> refleja este razonamiento.

## Tesis (postura abierta)

No hay un roadmap "correcto". Hay **una única dependencia dura** — la fundación de datos — y de ahí
en más el orden de los epics de superficie es una **decisión de producto que depende de qué se
optimiza**. La tool deja ubicar los epics como el board quiera, respetando solo las dependencias
reales. El PDF del case dice textual "we're not looking for a correct answer": defender la postura
abierta ES lo que premia.

## La dependencia dura: la fundación de datos

Al scopear los tres componentes del brief aparece un **cuarto que ninguno nombra pero todos
necesitan**: `Data Foundation` (ingesta + normalización + geometría de los 40 barrios). No es el
Visualizer — es la capa que Visualizer, Insights y AI Plans *consumen*. Hacerla explícita es la
jugada senior: si se esconde dentro del primer epic, queda sub-recurseada y es el cuello de botella
invisible que hace explotar todas las fechas.

**Corrección clave (hacerla explícita en la sesión):** Risk Insights NO depende del Visualizer.
Ambos dependen de la fundación. Se puede calcular un score de riesgo por barrio sin renderizar jamás
un mapa. Por eso el orden de los tres de superficie está suelto — es elección, no necesidad técnica.

| Epic | Depende de | Por qué |
|---|---|---|
| Data Foundation | Nada — va primero | Dependencia dura y real. Ingesta/normalización que los otros consumen. |
| Geospatial Visualizer | Data Foundation | Necesita la grilla normalizada para renderizar capas. |
| Risk Insights | Data Foundation | Necesita la grilla, NO el mapa. Puede correr en paralelo al Visualizer. |
| AI Mitigation Plans | Risk Insights (blanda) | Necesita scores. Puede arrancar scaffolding con datos sintéticos antes de integrar. |

## Los tres órdenes válidos (según objetivo)

- **Time-to-value / buy-in:** fundación → Visualizer primero. Mapa vivo = lo más tangible para la
  primera demo; asegura financiamiento; valida la fundación end-to-end barato.
- **Decisión rápida:** fundación → Insights primero. Lista rankeada de barrios de riesgo sin mapa
  pulido. Decisión antes que visual.
- **Derisking:** atacar antes el motor de IA (lo más incierto), scaffolding en paralelo con datos
  sintéticos.

Remate: *"Tengo una preferencia —liderar con el Visualizer por el buy-in— pero no es necesidad
técnica, es elección de objetivo. Ustedes eligen el objetivo; la tool muestra el costo de cada
camino. Lo único que nadie puede saltear es la fundación de datos."*

## Clarifying questions (abrir con esto)

1. Alcance geográfico: ¿un barrio piloto o toda Lumeria desde el día uno?
2. Prioridad entre amenazas: ¿calor/inundación/energía pesan igual, o una aprieta primero?
3. Origen de datos: ¿data propia o fuentes públicas? (mayor incertidumbre → tamaño de la fundación)
4. Fecha dura: ¿hay un target estacional/público no negociable?
5. Definición de éxito: ¿velocidad, cobertura, o costo? (no hay "mejor" sin saber qué optimizan)

## Respuestas listas (cada una = mover una palanca en vivo)

- **"¿Cambia el equipo?"** Sumar Data adelanta M1/M2 no M3; sumar AI adelanta M3 no M1/M2; sacar
  Data bloquea la fundación entera. Mismo "+1 persona", efecto opuesto según el rol.
- **"¿Cambia el scope?"** Apagar una amenaza (grueso) o MVP/Full por historia con % editable (fino).
- **"¿Scope de un epic?"** Clic → detalle con datasets (Aurora-Heat/FloodGrid/GridWatch), esfuerzo,
  dependencia, milestone.
- **"¿Qué tan seguro de las fechas?"** "El esfuerzo es input editable, no un hecho; modelo
  determinístico a propósito, no Monte Carlo; el epic dice cuántas historias son estimadas reales
  vs sugeridas."
- **"¿No debería decirme el mejor roadmap?"** "No, a propósito. No hay respuesta correcta; el mejor
  depende del objetivo. La tool informa la decisión, no la reemplaza. Saber cuándo NO automatizar
  también es criterio de producto."

## Cierre

Devolver la decisión al board con dos escenarios lado a lado (A: cobertura completa, M1 tarde; B:
piloto MVP, M1 temprano con deuda de scope). Sin ganador. Lo que se demuestra: cómo se piensa bajo
cambio, en tiempo real.
