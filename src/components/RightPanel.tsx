import { useState, useEffect } from 'react'
import type { Story, ScheduledStory, TeamRole, EffortScaleStep } from '../lib/types.ts'
import { parseDate } from '../lib/calendar.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  story: Story | null
  scheduled: ScheduledStory | null
  daysPerWeek: number
  teamRoles: TeamRole[]
  effortScale: EffortScaleStep[]
  epicStories: Story[]
  onUpdateStory: (storyId: string, patch: Partial<Story>) => void
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

// Deep-copy a story so the draft is fully independent from the store.
function cloneStory(s: Story): Story {
  return {
    ...s,
    roleEfforts: s.roleEfforts.map(re => ({ ...re })),
    useCases:    [...s.useCases],
    rules:       [...s.rules],
    labels:      [...s.labels],
    dependsOn:   [...s.dependsOn],
    datasetIds:  [...s.datasetIds],
  }
}

export default function RightPanel({
  story,
  scheduled,
  daysPerWeek,
  teamRoles,
  effortScale,
  epicStories: _epicStories,
  onUpdateStory,
}: Props) {
  const { t } = useI18n()
  const [mode, setMode] = useState<'read' | 'edit'>('read')
  const [draft, setDraft] = useState<Story | null>(null)

  // Exit edit mode without saving whenever the selected story changes.
  useEffect(() => {
    setMode('read')
    setDraft(null)
  }, [story?.id])

  if (!story) {
    return (
      <aside className="right-panel right-panel--empty">
        <span style={{ fontSize: 24 }}>○</span>
        <span className="right-empty-hint">{t('selectHint')}</span>
      </aside>
    )
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function enterEdit() {
    setDraft(cloneStory(story!))
    setMode('edit')
  }

  // Roles added but never given an effort (days === 0) are discarded on save —
  // the PM added the row but didn't pick a scale value, so there's nothing to schedule.
  function handleSave() {
    if (!draft) return
    const cleanedRoleEfforts = draft.roleEfforts.filter(re => re.days > 0)
    onUpdateStory(draft.id, { ...draft, roleEfforts: cleanedRoleEfforts })
    setMode('read')
    setDraft(null)
  }

  function handleCancel() {
    setDraft(null)
    setMode('read')
  }

  // ── Edit mode ────────────────────────────────────────────────────────────────

  if (mode === 'edit' && draft) {
    const set = (field: keyof Story) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(prev => prev ? { ...prev, [field]: e.target.value } : prev)

    // Roles not yet assigned in the draft
    const assignedIds = new Set(draft.roleEfforts.map(re => re.roleId))
    const unassignedRoles = teamRoles.filter(r => !assignedIds.has(r.id))

    function setEffort(roleId: string, days: number) {
      setDraft(prev => {
        if (!prev) return prev
        return {
          ...prev,
          roleEfforts: prev.roleEfforts.map(re =>
            re.roleId === roleId ? { ...re, days } : re,
          ),
        }
      })
    }

    function addRole(roleId: string) {
      setDraft(prev => {
        if (!prev) return prev
        return {
          ...prev,
          roleEfforts: [...prev.roleEfforts, { roleId, days: 0 }],
        }
      })
    }

    function removeRole(roleId: string) {
      setDraft(prev => {
        if (!prev) return prev
        return {
          ...prev,
          roleEfforts: prev.roleEfforts.filter(re => re.roleId !== roleId),
        }
      })
    }

    return (
      <aside className="right-panel">
        <div className="rp-id">{draft.id}</div>
        <div className="rp-sep" />

        <label className="rp-edit-label" htmlFor="rp-title">{t('fieldTitle')}</label>
        <input
          id="rp-title"
          className="rp-edit-input"
          data-testid="rp-field-title"
          value={draft.title}
          onChange={set('title')}
        />

        <label className="rp-edit-label" htmlFor="rp-asA">{t('fieldAsA')}</label>
        <input
          id="rp-asA"
          className="rp-edit-input"
          data-testid="rp-field-asA"
          value={draft.asA}
          onChange={set('asA')}
        />

        <label className="rp-edit-label" htmlFor="rp-iWant">{t('fieldIWant')}</label>
        <textarea
          id="rp-iWant"
          className="rp-edit-input"
          data-testid="rp-field-iWant"
          rows={2}
          value={draft.iWant}
          onChange={set('iWant')}
        />

        <label className="rp-edit-label" htmlFor="rp-soThat">{t('fieldSoThat')}</label>
        <textarea
          id="rp-soThat"
          className="rp-edit-input"
          data-testid="rp-field-soThat"
          rows={2}
          value={draft.soThat}
          onChange={set('soThat')}
        />

        {/* ── Effort by role (US-009 / US-010) ───────────────────────────── */}
        <div className="rp-edit-label">{t('sectionRoles')}</div>

        {draft.roleEfforts.map(re => (
          <div key={re.roleId} className="rp-role-row" data-testid={`rp-role-row-${re.roleId}`}>
            <span className="rp-role-tag">{re.roleId.toUpperCase()}</span>
            <select
              className="rp-effort-select"
              data-testid={`rp-effort-select-${re.roleId}`}
              value={re.days}
              onChange={e => setEffort(re.roleId, Number(e.target.value))}
            >
              <option value={0}>{t('noEffortPlaceholder')}</option>
              {effortScale.map(step => (
                <option key={step.days} value={step.days}>{step.label}</option>
              ))}
            </select>
            <button
              className="rp-role-remove"
              data-testid={`rp-role-remove-${re.roleId}`}
              onClick={() => removeRole(re.roleId)}
              aria-label={`Remove ${re.roleId}`}
            >
              ×
            </button>
          </div>
        ))}

        {unassignedRoles.length > 0 && (
          <div className="rp-role-add-row">
            {unassignedRoles.map(r => (
              <button
                key={r.id}
                className="rp-role-add-btn"
                data-testid={`rp-role-add-${r.id}`}
                onClick={() => addRole(r.id)}
              >
                + {r.id.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* ── MVP depth (US-017) ─────────────────────────────────────────── */}
        <div className="rp-sep" />
        <div className="rp-edit-label">{t('sectionMvp')}</div>

        <div className="rp-mvp-row">
          <label className="rp-mvp-check-label">
            <input
              type="checkbox"
              data-testid="rp-mvp-enabled"
              checked={draft.mvpEnabled}
              onChange={e => setDraft(prev => prev ? { ...prev, mvpEnabled: e.target.checked } : prev)}
            />
            <span>{t('mvpEnabledLabel')}</span>
          </label>
          <div className="rp-mvp-pct-row">
            <span className="rp-edit-label" style={{ margin: 0 }}>{t('mvpPctLabel')}</span>
            <input
              type="number"
              className="rp-edit-input rp-mvp-pct-input"
              data-testid="rp-mvp-pct"
              min={0}
              max={100}
              value={draft.mvpPct}
              onChange={e => setDraft(prev => prev
                ? { ...prev, mvpPct: Math.min(100, Math.max(0, Number(e.target.value))) }
                : prev
              )}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>%</span>
          </div>
        </div>

        {draft.mvpEnabled && (
          <div className="rp-mvp-tradeoff">
            {t('mvpTradeoff')
              .replace('{pct}', String(draft.mvpPct))
              .replace('{rest}', String(100 - draft.mvpPct))}
          </div>
        )}

        <div className="rp-btn-row">
          <button className="btn-save" data-testid="rp-save-btn" onClick={handleSave}>
            {t('saveStory')}
          </button>
          <button className="btn-cancel-edit" data-testid="rp-cancel-btn" onClick={handleCancel}>
            {t('cancel')}
          </button>
        </div>
      </aside>
    )
  }

  // ── Read mode ────────────────────────────────────────────────────────────────

  const roleMap = new Map(teamRoles.map(r => [r.id, r]))

  function blockedMsg(): string {
    const r = scheduled?.blockedReason
    if (r === 'role-unavailable')   return t('blockedRole')
    if (r === 'dependency-blocked') return t('blockedDep')
    return t('blockedUnknown')
  }

  return (
    <aside className="right-panel">
      <div className="rp-header-row">
        <div className="rp-id">{story.id}</div>
        <button className="btn-edit" data-testid="rp-edit-btn" onClick={enterEdit}>
          {t('editStory')}
        </button>
      </div>
      <div className="rp-title">{story.title}</div>

      <div className="rp-sep" />

      {/* Narrative */}
      <div className="rp-section-label">{t('sectionNarrative')}</div>
      <div data-testid="rp-narrative">
        <div className="rp-narrative">
          {t('narrativeAs')} <em>{story.asA}</em>{t('narrativeWant')} {story.iWant},
        </div>
        <div className="rp-narrative">
          {t('narrativeSoThat')} {story.soThat}.
        </div>
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
      {story.mvpEnabled && (
        <div className="rp-mvp-tradeoff">
          {t('mvpTradeoff')
            .replace('{pct}', String(story.mvpPct))
            .replace('{rest}', String(100 - story.mvpPct))}
        </div>
      )}

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
