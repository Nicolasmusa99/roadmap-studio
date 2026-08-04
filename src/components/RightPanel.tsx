import type { Story, ScheduledStory, TeamRole } from '../lib/types.ts'
import { parseDate } from '../lib/calendar.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  story: Story | null
  scheduled: ScheduledStory | null
  daysPerWeek: number
  teamRoles: TeamRole[]
}

const CHIP_CLASS: Record<string, string> = {
  data:      'rp-chip-lg chip--data',
  fullstack: 'rp-chip-lg chip--fullstack',
  ai:        'rp-chip-lg chip--ai',
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = parseDate(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtWeeks(days: number, dpw: number): string {
  if (days === 0) return '—'
  return `${days / dpw} sem`
}

export default function RightPanel({ story, scheduled, daysPerWeek, teamRoles }: Props) {
  const { t } = useI18n()

  if (!story) {
    return (
      <aside className="right-panel right-panel--empty">
        <span style={{ fontSize: 24 }}>○</span>
        <span className="right-empty-hint">{t('selectHint')}</span>
      </aside>
    )
  }

  const roleMap = new Map(teamRoles.map(r => [r.id, r]))

  function blockedMsg(): string {
    const r = scheduled?.blockedReason
    if (r === 'role-unavailable')  return t('blockedRole')
    if (r === 'dependency-blocked') return t('blockedDep')
    return t('blockedUnknown')
  }

  return (
    <aside className="right-panel">
      <div className="rp-id">{story.id}</div>
      <div className="rp-title">{story.title}</div>

      <div className="rp-sep" />

      {/* Narrative */}
      <div className="rp-section-label">{t('sectionNarrative')}</div>
      <div className="rp-narrative">
        {t('narrativeAs')} <em>{story.asA}</em>{t('narrativeWant')} {story.iWant},
      </div>
      <div className="rp-narrative">
        {t('narrativeSoThat')} {story.soThat}.
      </div>

      {/* Effort by role */}
      <div className="rp-section-label">{t('sectionEffort')}</div>
      <div className="rp-chips">
        {story.roleEfforts.map(re => {
          const role = roleMap.get(re.roleId)
          return (
            <span key={re.roleId} className={CHIP_CLASS[re.roleId] ?? 'rp-chip-lg chip--default'}>
              {re.roleId.toUpperCase()} {re.days}d
              {role && role.people > 0 && (
                <span style={{ opacity: 0.7 }}> · {role.people}p</span>
              )}
            </span>
          )
        })}
      </div>

      {/* Schedule */}
      <div className="rp-section-label">{t('sectionSchedule')}</div>
      {scheduled?.blocked ? (
        <div
          className="story-badge story-badge--blocked"
          style={{ display: 'inline-block', padding: '4px 8px', fontSize: 11 }}
        >
          {blockedMsg()}
        </div>
      ) : scheduled ? (
        <div className="rp-dates">
          <div>
            <div className="rp-date-lbl">{t('labelStart')}</div>
            <span className="rp-date-val">{fmtDate(scheduled.startDate)}</span>
          </div>
          <div>
            <div className="rp-date-lbl">{t('labelEnd')}</div>
            <span className="rp-date-val">{fmtDate(scheduled.endDate)}</span>
          </div>
          <div>
            <div className="rp-date-lbl">{t('labelDuration')}</div>
            <span className="rp-date-val" style={{ color: 'var(--oe-green)' }}>
              {fmtWeeks(scheduled.durationDays, daysPerWeek)}
            </span>
          </div>
        </div>
      ) : (
        <span style={{ color: 'var(--ink-muted)', fontSize: 12 }}>{t('notScheduled')}</span>
      )}

      {/* MVP */}
      <div className="rp-sep" />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{
          color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)',
          fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {t('mvpScope')}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--oe-green)', fontSize: 12 }}>
          {story.mvpPct}%
        </span>
        {story.mvpEnabled && (
          <span className="story-badge story-badge--mvp">{t('mvpActive')}</span>
        )}
      </div>

      {/* Dependencies */}
      {story.dependsOn.length > 0 && (
        <>
          <div className="rp-section-label">{t('sectionDeps')}</div>
          <div className="rp-deps">
            {story.dependsOn.map(dep => (
              <div key={dep} className="rp-dep">→ {dep}</div>
            ))}
          </div>
        </>
      )}

      {/* Labels */}
      {story.labels.length > 0 && (
        <>
          <div className="rp-section-label">{t('sectionLabels')}</div>
          <div className="rp-chips">
            {story.labels.map(l => (
              <span key={l} style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 6px',
                borderRadius: 2, background: 'var(--panel-alt)', color: 'var(--ink-muted)',
                border: '1px solid var(--line)',
              }}>
                {l}
              </span>
            ))}
          </div>
        </>
      )}
    </aside>
  )
}
