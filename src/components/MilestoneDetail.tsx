import type { AppState, Milestone } from '../lib/types.ts'
import { parseDate } from '../lib/calendar.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  milestone: Milestone
  state: AppState
  onClose: () => void
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  return parseDate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// US-015 — a milestone always shows which stories compose it and which epic each
// comes from, so any date movement is explainable to the board (anti-friction rule).
export default function MilestoneDetail({ milestone, state, onClose }: Props) {
  const { t } = useI18n()

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

      <div className="rp-section-label">{t('msTarget')}</div>
      <span className="rp-date-val" style={{ fontFamily: 'var(--font-mono)' }}>
        {fmtDate(milestone.target)}
      </span>

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
