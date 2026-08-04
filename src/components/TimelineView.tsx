import { useMemo } from 'react'
import type { AppState, ScheduledStory } from '../lib/types.ts'
import type { MilestoneForecast } from '../lib/milestones.ts'
import { epicWindow } from '../lib/aggregation.ts'
import { parseDate, formatDate } from '../lib/calendar.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  state: AppState
  scheduledStories: ScheduledStory[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  selectedMilestoneId: string | null
  onSelectMilestone: (id: string | null) => void
  forecasts: Map<string, MilestoneForecast>
}

const MS_PER_DAY = 86_400_000

// Whole-calendar-day distance between two ISO dates (b - a).
function calDaysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / MS_PER_DAY)
}

function fmtTick(iso: string): string {
  return parseDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Bars fall on the REAL scheduler dates (working-day math already applied upstream).
// The X axis is plain calendar days: weekends/holidays just compress visually here;
// marking the skipped days on the axis is SCR-036 (Bloque 2.2), out of scope for 2.1.
export default function TimelineView({
  state,
  scheduledStories,
  selectedId,
  onSelect,
  selectedMilestoneId,
  onSelectMilestone,
  forecasts,
}: Props) {
  const { t } = useI18n()

  const schedMap = useMemo(
    () => new Map(scheduledStories.map(s => [s.storyId, s])),
    [scheduledStories],
  )

  const epicIndex = useMemo(() => {
    const m = new Map<string, number>()
    state.epics.forEach((e, i) => m.set(e.id, i + 1))
    return m
  }, [state.epics])

  // ── Time domain ──────────────────────────────────────────────────────────────
  // Domain spans every scheduled (non-blocked) story plus every milestone target,
  // so an aggressive target beyond the schedule still lands on the canvas.
  const domain = useMemo(() => {
    const dates: string[] = []
    for (const s of scheduledStories) {
      if (!s.blocked && s.startDate && s.endDate) dates.push(s.startDate, s.endDate)
    }
    for (const m of state.milestones) if (m.target) dates.push(m.target)
    if (dates.length === 0) return null
    const start = dates.reduce((a, b) => (a < b ? a : b))
    const end = dates.reduce((a, b) => (a > b ? a : b))
    const span = calDaysBetween(start, end) + 1 // inclusive
    return { start, end, span: Math.max(span, 1) }
  }, [scheduledStories, state.milestones])

  // Empty state: no scheduled stories and no milestone dates → nothing to place.
  // Must not explode; a plain notice is enough (per plan).
  if (!domain) {
    return (
      <main className="timeline-view timeline-view--empty" data-testid="timeline-view">
        <span style={{ fontSize: 24 }}>○</span>
        <span className="tl-empty-hint">{t('tlEmpty')}</span>
      </main>
    )
  }

  const leftPct = (iso: string) => (calDaysBetween(domain.start, iso) / domain.span) * 100
  // width covers the full end day (inclusive) → a 1-day task still has visible width
  const widthPct = (start: string, end: string) =>
    ((calDaysBetween(start, end) + 1) / domain.span) * 100

  // Weekly ticks from the domain start (local dates — never toISOString, which is UTC).
  const ticks: { pct: number; label: string }[] = []
  for (let d = 0; d <= domain.span; d += 7) {
    const dt = parseDate(domain.start)
    dt.setDate(dt.getDate() + d)
    ticks.push({ pct: (d / domain.span) * 100, label: fmtTick(formatDate(dt)) })
  }

  return (
    <main className="timeline-view" data-testid="timeline-view">
      {/* Legend — explains every visual element in one glance */}
      <div className="tl-legend" aria-label="Timeline legend">
        <span className="tl-legend-item">
          <span className="tl-legend-swatch tl-legend-swatch--bar" />
          scheduled work
        </span>
        <span className="tl-legend-item">
          <span className="tl-legend-swatch tl-legend-swatch--epic" />
          epic window
        </span>
        <span className="tl-legend-item">
          <span className="tl-legend-swatch tl-legend-swatch--target" />
          target (committed)
        </span>
        <span className="tl-legend-item">
          <span className="tl-legend-swatch tl-legend-swatch--forecast" />
          forecast (projected)
        </span>
      </div>

      <div className="tl-grid">
        {/* Axis */}
        <div className="tl-row tl-axis">
          <div className="tl-gutter tl-gutter--axis">{t('tlWeeks')}</div>
          <div className="tl-track">
            {ticks.map((tk, i) => (
              <div key={i} className="tl-tick" style={{ left: `${tk.pct}%` }}>
                <span className="tl-tick-lbl">{tk.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Epics as STAGES, each with its stories as bars */}
        {state.epics.map(epic => {
          const stageNum = String(epicIndex.get(epic.id) ?? 1).padStart(2, '0')
          const epicStories = state.stories.filter(s => s.epicId === epic.id)
          const win = epicWindow(epic.id, state.stories, scheduledStories)

          return (
            <div key={epic.id} className="tl-epic-block">
              <div className="tl-row tl-epic-row">
                <div className="tl-gutter tl-gutter--epic">
                  STAGE {stageNum} — {epic.name.toUpperCase()}
                </div>
                <div className="tl-track">
                  {ticks.map((tk, i) => (
                    <div key={i} className="tl-gridline" style={{ left: `${tk.pct}%` }} />
                  ))}
                  {win && (
                    <div
                      className="tl-epic-bar"
                      style={{ left: `${leftPct(win.startDate)}%`, width: `${widthPct(win.startDate, win.endDate)}%` }}
                    />
                  )}
                </div>
              </div>

              {epicStories.map(story => {
                const sched = schedMap.get(story.id)
                const blocked = sched?.blocked ?? false
                const isSelected = story.id === selectedId
                return (
                  <div
                    key={story.id}
                    className={`tl-row tl-story-row${isSelected ? ' tl-story-row--selected' : ''}`}
                    data-story-id={story.id}
                    data-selected={isSelected ? 'true' : 'false'}
                    onClick={() => onSelect(isSelected ? null : story.id)}
                  >
                    <div className="tl-gutter tl-gutter--story" title={story.title}>
                      <span className="story-id">{story.id}</span>
                      <span className="tl-story-title">{story.title}</span>
                      {blocked && <span className="tl-blocked-chip">⊘</span>}
                    </div>
                    <div className="tl-track">
                      {ticks.map((tk, i) => (
                        <div key={i} className="tl-gridline" style={{ left: `${tk.pct}%` }} />
                      ))}
                      {!blocked && sched?.startDate && (
                        <div
                          className={`tl-story-bar${isSelected ? ' tl-story-bar--selected' : ''}`}
                          style={{ left: `${leftPct(sched.startDate)}%`, width: `${widthPct(sched.startDate, sched.endDate)}%` }}
                          title={`${sched.startDate} → ${sched.endDate}`}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Milestones as CHECKPOINT markers over the track area (US-015).
            Target vs forecast styling is layered on in US-016. */}
        <div className="tl-markers">
          {state.milestones.map(ms => {
            if (!ms.target) return null
            const isSel = ms.id === selectedMilestoneId
            const fc = forecasts.get(ms.id)
            const atRisk = fc?.status === 'at-risk' || fc?.status === 'blocked'
            const targetTooltip = `TARGET · ${ms.name}: ${fmtTick(ms.target)} (committed date)`
            const forecastTooltip = fc?.forecast
              ? `FORECAST · ${ms.name}: ${fmtTick(fc.forecast)} (projected end, +${fc.gapWeeks} wk delay)`
              : ''
            return (
              <div key={ms.id}>
                {/* Gap shading — amber block between target and forecast */}
                {atRisk && fc?.forecast && (
                  <div
                    className="tl-gap-band"
                    style={{
                      left:  `${leftPct(ms.target)}%`,
                      width: `${leftPct(fc.forecast) - leftPct(ms.target)}%`,
                    }}
                    data-testid={`ms-gap-band-${ms.id}`}
                    aria-hidden="true"
                  >
                    <span className="tl-gap-label" data-testid={`ms-gap-label-${ms.id}`}>
                      {t('msGap', { n: String(fc.gapWeeks) })}
                    </span>
                  </div>
                )}
                {/* Target marker — always grey/dashed: committed date */}
                <div
                  className={[
                    'tl-marker',
                    atRisk ? 'tl-marker--risk' : '',
                    isSel ? 'tl-marker--selected' : '',
                  ].filter(Boolean).join(' ')}
                  style={{ left: `${leftPct(ms.target)}%` }}
                  title={targetTooltip}
                  data-testid={`ms-marker-${ms.id}`}
                  data-ms-id={ms.id}
                  data-status={fc?.status ?? 'on-track'}
                  onClick={() => onSelectMilestone(isSel ? null : ms.id)}
                >
                  <span className="tl-marker-flag">
                    <span className="tl-marker-kind">TARGET</span> ◇ {ms.name}
                  </span>
                </div>
                {/* Forecast marker — always amber/solid: where it actually lands */}
                {atRisk && fc?.forecast && (
                  <div
                    className="tl-forecast"
                    style={{ left: `${leftPct(fc.forecast)}%` }}
                    title={forecastTooltip}
                  >
                    <span className="tl-forecast-flag" data-testid={`ms-gap-${ms.id}`}>
                      <span className="tl-marker-kind tl-marker-kind--forecast">FORECAST</span>{' '}
                      {ms.name} {t('msGap', { n: String(fc.gapWeeks) })}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
