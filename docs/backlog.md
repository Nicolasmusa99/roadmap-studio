# Backlog — Roadmap Studio

> Mejoras futuras y features no construidas. Ordenadas por prioridad práctica. Lo que sale de acá
> entra a la doc principal cuando se construye. Nada de esto está implementado hoy.

---

## Prioridad alta (desbloquean uso o difusión)

### B-01 — Mobile: que no se rompa `[EN CURSO / VERIFICAR]`
La app es de desktop (Gantt, timeline, dependencias). En pantallas chicas debe **no verse rota** y
comunicar que es una herramienta seria, con un aviso "optimizado para desktop" en el workspace y la
Home legible en mobile. NO se busca hacer el Gantt usable con el dedo. Bloquea difundir el link
públicamente (LinkedIn, etc.).

### B-02 — Importar historias desde archivo estructurado
Traer historias de otras herramientas sin cargarlas a mano.
- **Camino recomendado (sin tokens):** importar **CSV** (Jira y Linear exportan CSV nativo) o texto
  pautado pegado. Parser determinístico, gratis, confiable. Mapear columnas → campos del modelo
  (título, esfuerzo por rol, dependencia, tags).
- **PDF / documento libre:** requiere AI para interpretar texto no estructurado = tokens. Contradice
  el requisito "sin tokens". Solo si se acepta ese costo explícitamente. **No es el camino por defecto.**
- Decisión de diseño pendiente: qué formato de columnas se soporta, cómo se resuelven dependencias
  entre historias importadas.

---

## Prioridad media (mejoras de producto)

### B-03 — Priorización RICE / ICE
Frameworks de priorización de historias (RICE, ICE, valor vs esfuerzo). Acotado, encaja con el perfil
PM, es lo que se espera de una herramienta de roadmap. Complejidad media.

### B-04 — Selector de país para feriados
Hoy el calendario trae feriados US editables. Poder elegir el país y traer sus feriados
automáticamente vía **librería local de feriados** (tipo `date-holidays`) — local, gratis, sin API ni
tokens. Relevante para uso fuera de EE.UU. (US-029).

### B-05 — Exportar el roadmap (PDF / imagen) `[era US-025, no construido]`
Exportar el roadmap armado (o un escenario A/B) a un archivo para compartir fuera de la app: timeline,
epics, historias, milestones (target y forecast), notas activas. Foto del momento, no documento vivo.
Conecta con B-06 (compartir).

---

## Prioridad alta en valor, alto en esfuerzo (proyectos arquitectónicos)

### B-06 — Compartir por link / persistencia en la nube
Hoy los roadmaps viven en localStorage (por browser/dispositivo, no compartibles). Para que otro
pueda **ver** un roadmap con un link, o para acceder desde varios dispositivos, hace falta backend +
base de datos + cuentas. Es el salto de "herramienta personal" a "app multiusuario". Gran valor si la
herramienta se vuelve central; es un proyecto en sí mismo. Requiere migrar el modelo de persistencia
(el `schemaVersion` ya deja la puerta abierta).

### B-07 — Carga de equipo cross-roadmap
La joya que conecta con el dolor real de planificar capacidad entre múltiples programas: ver si un
mismo rol/persona está sobrecargado sumando **todos** los roadmaps ("este rol está al 130%"). Requiere
decidir el modelo de recursos compartidos:
- **Match por nombre:** simple pero frágil ("Full-stack" en A = "Full-stack" en B por nombre).
- **Pool de recursos global:** correcto conceptualmente (una entidad única asignada a varios
  roadmaps), pero cambia el modelo de datos — casi tan grande como la persistencia. Es lo que hacen
  las herramientas profesionales de portfolio.
Diseño pendiente antes de construir.

---

## Prioridad baja (nice-to-have)

### B-08 — Más vistas (swimlane, now-next-later)
Vistas alternativas del mismo dato (agrupar por equipo/tema en carriles; formato now/next/later).
De la investigación de competidores. El diferencial de la herramienta es el recálculo en vivo, no la
cantidad de vistas, así que baja prioridad.

---

> ### Notas de priorización
> - El diferencial de Roadmap Studio es **recalcular en vivo** cuando cambia scope o equipo. Las
>   mejoras que refuerzan eso (cross-roadmap, importación) valen más que sumar vistas o features
>   cosméticas.
> - Regla: hacer **de a una, en orden**, validando en uso real antes de encarar la siguiente. No
>   encimar features nuevas con rediseños.
