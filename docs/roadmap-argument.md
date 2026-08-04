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
- **"¿Cambia el scope?"** Apagar una amenaza **saca del roadmap** las historias con ese label
  (filtra Árbol + Timeline y recalcula epics/forecast); MVP/Full por historia con % editable (fino).
  El sidebar muestra el `SCOPE %` resultante — el supuesto de scope queda declarado, no oculto.
- **"¿Scope de un epic?"** Clic → detalle con datasets (Aurora-Heat/FloodGrid/GridWatch), esfuerzo,
  dependencia, milestone.
- **"¿Qué tan seguro de las fechas?"** "El esfuerzo es input editable, no un hecho; modelo
  determinístico a propósito, no Monte Carlo; el epic dice cuántas historias son estimadas reales
  vs sugeridas."
- **"¿No debería decirme el mejor roadmap?"** "No, a propósito. No hay respuesta correcta; el mejor
  depende del objetivo. La tool informa la decisión, no la reemplaza. Saber cuándo NO automatizar
  también es criterio de producto."

## Historias nuevas del baseline (H-012–H-016)

Dos incorporaciones al roadmap, ambas defienden la tesis del case (equipo completo + granularidad
consistente). Viven en `data/baseline.ts`; acá el *porqué*.

**Product Designer como rol real (no decorativo).** El brief exige 1 Product Designer en el equipo.
Tres historias de diseño lo ponen en el camino crítico, participando del mismo grafo de dependencias
y timeline que el resto:

| Historia | Epic | Rol · esfuerzo | Depende de | Por qué |
|---|---|---|---|---|
| H-012 Wireframes: Geospatial Visualizer | Geospatial Visualizer | Design 5d | — | El layout se acuerda antes de construir. Gatea las overlays (H-005/H-006 vía H-013). |
| H-013 Design system: risk overlays | Geospatial Visualizer | Design 3d · Full-stack 2d | H-012 | Lenguaje visual común (color/leyenda/tooltip) para heat/flood/multi-risk. Gatea H-005/H-006. |
| H-014 Report export prototype | AI Mitigation Plans | Design 3d | H-010 | Se valida el layout del reporte antes de que ingeniería construya el export (H-011). |

**Desglose de AI Mitigation por amenaza.** Antes el epic tenía 2 historias; ahora espeja la
granularidad de Risk Insights (heat / flood / general):

| Historia | Epic | Rol · esfuerzo | Depende de | Por qué |
|---|---|---|---|---|
| H-015 Heat mitigation plan generator | AI Mitigation Plans | AI 5d | H-010, H-007 | Especializa el plan general en acciones de calor (usa el score de calor). |
| H-016 Flood mitigation plan generator | AI Mitigation Plans | AI 5d | H-010, H-008 | Especializa el plan general en acciones de inundación (usa el score de flood). |

**Decisión de diseño (defendible en la sesión):** los generadores por-amenaza **refinan** el plan
general (dependen de H-010), no lo alimentan. Así el desglose agrega detalle y consistencia **sin
mover** el forecast comprometido del MVP (+2 wk), que corre a través de H-010. La alternativa —que
alimenten el general, espejo exacto de Risk Insights— empujaría el MVP a +4 wk: queda como palanca
declarada, no como accidente. Con un solo AI Engineer no se pueden tener ambas cosas; el número es
una elección, no un hecho.

**Coherencia con amenazas:** como H-015/H-016 llevan label `heat`/`flood`, apagar una amenaza saca
su scoring **y** su plan de mitigación del Árbol y el Timeline — un mismo gesto recorta el trabajo
consistentemente de punta a punta.

## Corrección de personas (historias de producto)

Las historias de producto hablaban todas como `As a PM…` — un error: la persona de una historia de
la **plataforma Lumeria** tiene que ser el usuario real del dominio, no el PM que gestiona el
roadmap. El `so that` ahora expresa **valor de usuario**, no consistencia interna del sistema.

| Historia(s) | Persona | Por qué |
|---|---|---|
| H-001 · H-002 · H-003 (ingesta) | **Data Engineer** | Excepción legítima: la ingesta/normalización es trabajo técnico; el valor es que la plataforma tenga datos vivos. |
| H-004 mapa base · H-005/H-006 overlays · H-017 energy overlay | **Urban Planner** | Ubica y compara riesgo por zona; las overlays son su superficie de decisión espacial. |
| H-007 · H-008 scoring · H-018 energy burden | **Council Risk Analyst** | Rankea y prioriza barrios; defiende ante el council dónde se interviene primero. |
| H-009 índice multi-riesgo | **member of the decision board** | Quiere una sola cifra honesta por barrio para priorizar sin malabarear tres scores. |
| H-010 plan general · H-016 flood mit. · H-019 energy mit. · H-011 export | **Urban Planner** | Recibe intervenciones priorizadas y accionables, las lleva al council y las comparte. |
| H-015 heat mitigation | **Emergency Coordinator** | Respuesta al calor (centros de enfriamiento, sombra) es gestión de emergencias. |
| H-012 · H-013 · H-014 (diseño) | **Product Designer** | Ya correctas: no son features de la plataforma, son el trabajo real del diseñador del equipo. |

Nota: la ingesta queda técnica **a propósito** (ahí la persona técnica *es* la real); todo el resto
—mapa, overlays, scoring, planes, export— habla como el usuario de negocio que obtiene el valor.

## Energy: pipeline propio + cruce heat↔energy con degradación

Antes `energy` solo tenía dataset (GridWatch); `heat` y `flood` tenían pipeline completo. Ahora
`energy` lo espeja, pero modelado como problema de **COSTO / CONSUMO**, no de riesgo físico:

| Historia | Epic | Rol · esfuerzo | Depende de | Por qué |
|---|---|---|---|---|
| H-017 Energy stress overlay | Geospatial Visualizer | Full-stack 5d | H-010, H-004, H-003, H-013 | Pinta el mapa por carga de red / intensidad de consumo por barrio (GridWatch). |
| H-018 Energy burden score | Risk Insights | Data 5d · AI 5d | H-010, H-003 | Rankea vulnerabilidad energética = consumo × (1/capacidad de pago). Bajos ingresos + alto consumo = más burden. |
| H-019 Energy cost mitigation plan | AI Mitigation Plans | AI 5d | H-010, H-018 | Refina el plan general en subsidios / eficiencia / gestión de demanda (patrón H-015/H-016). |

**El cruce heat↔energy es por DEGRADACIÓN, no por bloqueo.** El energy burden score tiene dos
componentes: uno **propio** (consumo × capacidad de pago) y uno de **amplificación por calor** (olas
de calor → pico de A/C → más estrés y costo de red). Al **desmarcar heat**, H-018 **no** se filtra
ni desaparece —no lleva label `heat`, solo `scoring`/`energy`—: sigue vivo con su componente propio
y **solo pierde la dimensión de amplificación**, mostrado en la UI como score *degradado*
(badge `⚠ −HEAT`), nunca como BLOCKED. Se modela con un campo nuevo `amplifiedBy` en la historia
(amenazas que la *enriquecen* sin gatearla). H-009 captura la interacción como **crisis compuesta**
(alto heat risk **Y** alto energy burden se refuerzan, no se suman) y también degrada al apagar
cualquier amenaza en vez de colapsar a un número parcial.

**Decisión de secuencia (declarada, no accidente): energy es post-MVP.** Medido contra el baseline,
el scheduler serializa **cada rol como recurso único** (el `people` solo acelera la duración, no da
slots paralelos); todos los roles salvo `design` están back-to-back hasta H-010. Por eso **cualquier**
historia de energy que use data/ai/full-stack **antes** de H-010 empuja el MVP de +2 wk a **+3 wk**
—incluso la versión independiente sin cruce—. Para respetar el forecast comprometido, las tres
historias de energy se **secuencian después del checkpoint MVP (H-010)**: el MVP es heat-focused,
energy es Beta. La dependencia a H-010 es una decisión de scope **visible en el grafo**, no un dato
oculto. Con un solo AI/Data Engineer no se puede tener energy en paralelo Y el +2 wk: el número es
una elección declarada, no un hecho. (Palanca en vivo: si el board quiere energy en el MVP, la tool
muestra el costo — +1 semana.)

## Cierre

Devolver la decisión al board con dos escenarios lado a lado (A: cobertura completa, M1 tarde; B:
piloto MVP, M1 temprano con deuda de scope). Sin ganador. Lo que se demuestra: cómo se piensa bajo
cambio, en tiempo real.
