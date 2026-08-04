import { useState } from 'react'
import type { AppState } from '../lib/types.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  state: AppState
  onSave: (name: string, target: string, storyIds: string[]) => void
  onClose: () => void
}

// US-015 — create a transversal milestone: name + target date + stories from ANY
// epic. Story picker is grouped by epic so the cross-epic nature is visible while
// choosing. Save is blocked until name + target + at least one story are set.
export default function MilestoneModal({ state, onSave, onClose }: Props) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [target, setTarget] = useState(state.config.calendarConfig.startDate)
  const [picked, setPicked] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setPicked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const canSave = name.trim() !== '' && target !== '' && picked.size > 0

  function save() {
    if (!canSave) return
    onSave(name.trim(), target, [...picked])
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-label={t('msCreateTitle')}
        data-testid="milestone-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-title">◇ {t('msCreateTitle')}</div>

        <label className="modal-field">
          <span className="modal-field-lbl">{t('msName')}</span>
          <input
            className="modal-input"
            data-testid="ms-name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="MVP"
            autoFocus
          />
        </label>

        <label className="modal-field">
          <span className="modal-field-lbl">{t('msTarget')}</span>
          <input
            className="modal-input"
            data-testid="ms-target"
            type="date"
            value={target}
            onChange={e => setTarget(e.target.value)}
          />
        </label>

        <div className="modal-field-lbl" style={{ marginTop: 6 }}>{t('msStories')}</div>
        <div className="modal-story-picker" data-testid="ms-stories">
          {state.epics.map(epic => {
            const epicStories = state.stories.filter(s => s.epicId === epic.id)
            if (epicStories.length === 0) return null
            return (
              <div key={epic.id} className="modal-epic-group">
                <div className="modal-epic-name">{epic.name}</div>
                {epicStories.map(story => (
                  <label key={story.id} className="modal-story-opt">
                    <input
                      type="checkbox"
                      checked={picked.has(story.id)}
                      onChange={() => toggle(story.id)}
                    />
                    <span className="story-id">{story.id}</span>
                    <span className="modal-story-title">{story.title}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn--ghost" onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            className="modal-btn modal-btn--primary"
            data-testid="ms-save"
            onClick={save}
            disabled={!canSave}
          >
            {t('msCreate')}
          </button>
        </div>
      </div>
    </div>
  )
}
