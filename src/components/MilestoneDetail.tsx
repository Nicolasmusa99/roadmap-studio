import type { AppState, Milestone } from '../lib/types.ts'
import type { MilestoneForecast } from '../lib/milestones.ts'
import { parseDate } from '../lib/calendar.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  milestone: Milestone
  forecast: MilestoneForecast
  state: AppState
  onClose: () => void
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  return parseDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// US-015 — a milestone always shows which stories compose it and which epic each
// comes from, so any date movement is explainable to the board (anti-friction rule).
export default function MilestoneDetail({ milestone, forecast, state, onClose }: Props) {
  const { t } = useI18n()

  const statusMeta = {
    'on-track': { cls: 'ms-status--ok',      label: t('msOnTrack') },
    'at-risk':  { cls: 'ms-status--risk',    label: t('msAtRisk') },
    'blocked':  { cls: 'ms-status--blocked', label: t('msBlocked') },
  }[forecast.status]

  const epicOf = new Map(state.stories.map(s => [s.id, s.epicId]))
  const epicName = new Map(state.epics.map(e => [e.id, e.name]))
  const storyById = new Map(state.stories.map(s => [s.id, s]))

  // Group the milestone's stories by their epic (cross-epic composition made visible)
  const byEpic = new Map<string, string[]>()
  for (const sid of milestone.storyIds) {
    const eid = epicOf.get(sid)
    if (!eid) continue
    if (!byEpic.has(eid)) byEpic.set(eid, [])
    byEpic.get(eid)!.push(sid)
  }

  return (
    <aside className="right-panel" data-testid="milestone-detail">
      <div className="rp-id" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>◇ {t('msCheckpoint')}</span>
        <button className="ms-close" onClick={onClose} aria-label={t('cancel')}>✕</button>
      </div>
      <div className="rp-title">{milestone.name}</div>

      <div className="rp-dates" style={{ marginTop: 4 }}>
        <div>
          <div className="rp-date-lbl">{t('msTarget')}</div>
          <span className="rp-date-val">{fmtDate(milestone.target)}</span>
        </div>
        <div>
          <div className="rp-date-lbl">{t('msForecast')}</div>
          <span className="rp-date-val" data-testid="ms-forecast">
            {forecast.forecast ? fmtDate(forecast.forecast) : '—'}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <span className={`ms-status ${statusMeta.cls}`} data-testid="ms-status" data-status={forecast.status}>
          {statusMeta.label}
          {forecast.status === 'at-risk' && (
            <span className="ms-gap">{t('msGap', { n: String(forecast.gapWeeks) })}</span>
          )}
        </span>
      </div>

      <div className="rp-section-label">
        {t('msComposition')} · {milestone.storyIds.length}
      </div>
      <div className="ms-composition" data-testid="ms-composition">
        {[...byEpic.entries()].map(([eid, sids]) => (
          <div key={eid} className="ms-comp-group">
            <div className="ms-comp-epic">{epicName.get(eid) ?? eid}</div>
            {sids.map(sid => (
              <div key={sid} className="ms-comp-story">
                <span className="story-id">{sid}</span>
                <span className="ms-comp-title">{storyById.get(sid)?.title ?? sid}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}
