import { useState } from 'react'
import type { Epic, Story, TeamRole, EffortScaleStep, NewStoryInput, RiskLayer } from '../lib/types.ts'
import { clampMvpPct } from '../lib/validation.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  epicId: string
  epics: Epic[]
  teamRoles: TeamRole[]
  riskLayers: RiskLayer[]
  effortScale: EffortScaleStep[]
  stories: Story[]
  initialFields?: Partial<NewStoryInput>
  isCopy?: boolean
  onSave: (fields: NewStoryInput) => void
  onClose: () => void
}

// US-005 — create or copy a story.
// "create": empty form for the target epic.
// "copy" (isCopy=true): form pre-filled with initialFields; all editable before save.
export default function StoryModal({
  epicId,
  epics,
  teamRoles,
  riskLayers,
  effortScale,
  stories,
  initialFields,
  isCopy,
  onSave,
  onClose,
}: Props) {
  const { t } = useI18n()

  const [title,     setTitle]     = useState(initialFields?.title    ?? '')
  const [asA,       setAsA]       = useState(initialFields?.asA      ?? '')
  const [iWant,     setIWant]     = useState(initialFields?.iWant    ?? '')
  const [soThat,    setSoThat]    = useState(initialFields?.soThat   ?? '')
  const [mvpPct,    setMvpPct]    = useState(initialFields?.mvpPct   ?? 55)
  const [mvpEnabled, setMvpEnabled] = useState(initialFields?.mvpEnabled ?? false)
  const [roleEfforts, setRoleEfforts] = useState(
    () => (initialFields?.roleEfforts ?? []).map(re => ({ ...re })),
  )
  const [dependsOn, setDependsOn] = useState<Set<string>>(
    () => new Set(initialFields?.dependsOn ?? []),
  )
  const [labels, setLabels] = useState<string[]>(() => initialFields?.labels ?? [])

  const assignedIds    = new Set(roleEfforts.map(re => re.roleId))
  const unassignedRoles = teamRoles.filter(r => !assignedIds.has(r.id))
  const roleName = (id: string) => teamRoles.find(r => r.id === id)?.name ?? id

  function setEffort(roleId: string, days: number) {
    setRoleEfforts(prev => prev.map(re => re.roleId === roleId ? { ...re, days } : re))
  }
  function addRole(roleId: string) {
    setRoleEfforts(prev => [...prev, { roleId, days: 0 }])
  }
  function removeRole(roleId: string) {
    setRoleEfforts(prev => prev.filter(re => re.roleId !== roleId))
  }
  function toggleLabel(name: string) {
    setLabels(prev => prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name])
  }

  function toggleDep(storyId: string) {
    setDependsOn(prev => {
      const next = new Set(prev)
      next.has(storyId) ? next.delete(storyId) : next.add(storyId)
      return next
    })
  }

  const canSave = title.trim() !== ''

  function save() {
    if (!canSave) return
    onSave({
      title:      title.trim(),
      asA:        asA.trim(),
      iWant:      iWant.trim(),
      soThat:     soThat.trim(),
      roleEfforts: roleEfforts.filter(re => re.days > 0),
      mvpPct:     clampMvpPct(mvpPct),
      mvpEnabled,
      dependsOn:  [...dependsOn],
      labels,
    })
  }

  const epicName = epics.find(e => e.id === epicId)?.name ?? epicId
  const modalLabel = isCopy ? t('copyStory') : t('newStory')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-label={modalLabel}
        data-testid="story-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-title">
          {isCopy ? '⎘' : '+'} {modalLabel}
          <span style={{ opacity: 0.6, fontWeight: 400 }}> — {epicName}</span>
        </div>

        {/* Narrative */}
        <label className="modal-field">
          <span className="modal-field-lbl">{t('fieldTitle')}</span>
          <input
            className="modal-input"
            data-testid="story-modal-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </label>

        <label className="modal-field">
          <span className="modal-field-lbl">{t('fieldAsA')}</span>
          <input
            className="modal-input"
            data-testid="story-modal-asA"
            value={asA}
            onChange={e => setAsA(e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span className="modal-field-lbl">{t('fieldIWant')}</span>
          <textarea
            className="modal-input"
            data-testid="story-modal-iWant"
            rows={2}
            value={iWant}
            onChange={e => setIWant(e.target.value)}
          />
        </label>

        <label className="modal-field">
          <span className="modal-field-lbl">{t('fieldSoThat')}</span>
          <textarea
            className="modal-input"
            data-testid="story-modal-soThat"
            rows={2}
            value={soThat}
            onChange={e => setSoThat(e.target.value)}
          />
        </label>

        {/* Role effort */}
        <div className="modal-field-lbl" style={{ marginTop: 6 }}>{t('sectionRoles')}</div>

        {roleEfforts.map(re => (
          <div key={re.roleId} className="rp-role-row" data-testid={`story-modal-role-${re.roleId}`}>
            <span className="rp-role-tag">{roleName(re.roleId).toUpperCase()}</span>
            <select
              className="rp-effort-select"
              data-testid={`story-modal-effort-${re.roleId}`}
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
                data-testid={`story-modal-add-role-${r.id}`}
                onClick={() => addRole(r.id)}
              >
                + {r.name}
              </button>
            ))}
          </div>
        )}

        {/* MVP */}
        <div className="modal-field-lbl" style={{ marginTop: 12 }}>{t('sectionMvp')}</div>
        <div className="rp-mvp-row" style={{ marginBottom: 8 }}>
          <label className="rp-mvp-check-label">
            <input
              type="checkbox"
              data-testid="story-modal-mvp-enabled"
              checked={mvpEnabled}
              onChange={e => setMvpEnabled(e.target.checked)}
            />
            <span>{t('mvpEnabledLabel')}</span>
          </label>
          <div className="rp-mvp-pct-row">
            <span className="modal-field-lbl" style={{ margin: 0 }}>{t('mvpPctLabel')}</span>
            <input
              type="number"
              className="modal-input rp-mvp-pct-input"
              data-testid="story-modal-mvp-pct"
              min={0}
              max={100}
              value={mvpPct}
              onChange={e => setMvpPct(Math.min(100, Math.max(0, Number(e.target.value))))}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' }}>%</span>
          </div>
        </div>

        {/* Tags */}
        {riskLayers.length > 0 && (
          <>
            <div className="modal-field-lbl" style={{ marginTop: 12 }}>{t('sectionTags')}</div>
            <div className="rp-role-add-row" style={{ flexWrap: 'wrap', gap: 4 }}>
              {riskLayers.map(tag => {
                const active = labels.includes(tag.name)
                return (
                  <button
                    key={tag.id}
                    className="rp-role-add-btn"
                    data-testid={`story-modal-tag-${tag.id}`}
                    style={active ? { border: '1px solid var(--oe-green)', color: 'var(--oe-green)' } : undefined}
                    onClick={() => toggleLabel(tag.name)}
                  >
                    {active ? '✓' : '+'} {tag.name}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Dependencies */}
        {stories.length > 0 && (
          <>
            <div className="modal-field-lbl" style={{ marginTop: 6 }}>{t('fieldDependsOn')}</div>
            <div className="modal-story-picker" data-testid="story-modal-deps" style={{ maxHeight: 160 }}>
              {epics.map(epic => {
                const epicStories = stories.filter(s => s.epicId === epic.id)
                if (epicStories.length === 0) return null
                return (
                  <div key={epic.id} className="modal-epic-group">
                    <div className="modal-epic-name">{epic.name}</div>
                    {epicStories.map(story => (
                      <label key={story.id} className="modal-story-opt">
                        <input
                          type="checkbox"
                          checked={dependsOn.has(story.id)}
                          onChange={() => toggleDep(story.id)}
                        />
                        <span className="story-id">{story.id}</span>
                        <span className="modal-story-title">{story.title}</span>
                      </label>
                    ))}
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            className="modal-btn modal-btn--primary"
            data-testid="story-modal-save"
            onClick={save}
            disabled={!canSave}
          >
            {t('storyModalSave')}
          </button>
        </div>
      </div>
    </div>
  )
}
