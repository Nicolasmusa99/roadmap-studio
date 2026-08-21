import { useState } from 'react'
import type { StoredRoadmap } from '../lib/storage'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  roadmaps: StoredRoadmap[]
  onCreate: (name: string) => void
  onOpen: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function HomeScreen({ roadmaps, onCreate, onOpen, onRename, onDelete }: Props) {
  const { t } = useI18n()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  function submitCreate() {
    if (newName.trim()) onCreate(newName.trim())
    setNewName('')
    setCreating(false)
  }

  function submitRename(id: string) {
    if (renameValue.trim()) onRename(id, renameValue.trim())
    setRenamingId(null)
    setRenameValue('')
  }

  function handleDelete(roadmap: StoredRoadmap) {
    if (window.confirm(t('homeDeleteConfirm', { name: roadmap.name }))) {
      onDelete(roadmap.id)
    }
  }

  return (
    <div className="home-screen">
      <header className="home-header">
        <span className="topbar-logo">◉ Roadmap Studio</span>
      </header>

      <main className="home-main">
        <div className="home-title-row">
          <h1 className="home-title">{t('homeTitle')}</h1>
          {!creating && (
            <button
              className="home-create-btn"
              data-testid="home-create-btn"
              onClick={() => setCreating(true)}
            >
              {t('homeCreate')}
            </button>
          )}
        </div>

        {creating && (
          <div className="home-new-form">
            <input
              className="home-new-input"
              data-testid="home-new-input"
              placeholder={t('homeNewPlaceholder')}
              value={newName}
              autoFocus
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') submitCreate()
                if (e.key === 'Escape') { setCreating(false); setNewName('') }
              }}
              onBlur={() => { if (!newName.trim()) { setCreating(false) } }}
            />
            <button
              className="home-create-btn"
              onClick={submitCreate}
              disabled={!newName.trim()}
            >
              {t('homeCreate')}
            </button>
            <button
              className="home-cancel-btn"
              onClick={() => { setCreating(false); setNewName('') }}
            >
              {t('cancel')}
            </button>
          </div>
        )}

        {roadmaps.length === 0 && !creating ? (
          <div className="home-empty">
            <div className="home-empty-msg">{t('homeEmpty')}</div>
            <div className="home-empty-hint">{t('homeEmptyHint')}</div>
          </div>
        ) : (
          <ul className="home-list" data-testid="home-roadmap-list">
            {roadmaps.map(rm => (
              <li key={rm.id} className="home-item" data-testid={`home-item-${rm.id}`}>
                <div className="home-item-info">
                  {renamingId === rm.id ? (
                    <input
                      className="home-rename-input"
                      data-testid={`home-rename-input-${rm.id}`}
                      value={renameValue}
                      autoFocus
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') submitRename(rm.id)
                        if (e.key === 'Escape') { setRenamingId(null); setRenameValue('') }
                      }}
                      onBlur={() => submitRename(rm.id)}
                    />
                  ) : (
                    <button
                      className="home-item-name"
                      data-testid={`home-open-${rm.id}`}
                      onClick={() => onOpen(rm.id)}
                    >
                      {rm.name}
                    </button>
                  )}
                  <div className="home-item-meta">
                    <span>{t('homeNStories', { n: String(rm.state.stories.length) })}</span>
                    <span className="home-meta-sep">·</span>
                    <span>{t('homeLastEdited', { date: fmtDate(rm.lastEdited) })}</span>
                  </div>
                </div>
                <div className="home-item-actions">
                  <button
                    className="home-action-btn"
                    data-testid={`home-open-btn-${rm.id}`}
                    onClick={() => onOpen(rm.id)}
                  >
                    {t('homeOpen')}
                  </button>
                  <button
                    className="home-action-btn"
                    data-testid={`home-rename-btn-${rm.id}`}
                    onClick={() => { setRenamingId(rm.id); setRenameValue(rm.name) }}
                  >
                    {t('homeRename')}
                  </button>
                  <button
                    className="home-action-btn home-action-btn--danger"
                    data-testid={`home-delete-btn-${rm.id}`}
                    onClick={() => handleDelete(rm)}
                  >
                    {t('homeDelete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
