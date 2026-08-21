import { useState, useRef, useEffect } from 'react'
import type { AssumptionSection, Assumption } from '../lib/types'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  sections: AssumptionSection[]
  notes: Assumption[]
  onAddSection: (name: string) => string
  onRenameSection: (sectionId: string, name: string) => void
  onDeleteSection: (sectionId: string) => void
  onAddNote: (sectionId: string) => string
  onUpdateNote: (id: string, text: string) => void
  onDeleteNote: (id: string) => void
}

export default function AssumptionsView({
  sections,
  notes,
  onAddSection,
  onRenameSection,
  onDeleteSection,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: Props) {
  const { t } = useI18n()
  const [addingSection, setAddingSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const newSectionInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (addingSection) newSectionInputRef.current?.focus()
  }, [addingSection])

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus()
  }, [renamingId])

  function commitNewSection() {
    const name = newSectionName.trim()
    if (name) {
      onAddSection(name)
    }
    setNewSectionName('')
    setAddingSection(false)
  }

  function commitRename() {
    if (renamingId) {
      const name = renameValue.trim()
      if (name) onRenameSection(renamingId, name)
    }
    setRenamingId(null)
    setRenameValue('')
  }

  function startRename(section: AssumptionSection) {
    setRenamingId(section.id)
    setRenameValue(section.name)
  }

  function handleDeleteSection(section: AssumptionSection) {
    const sectionNotes = notes.filter(n => n.sectionId === section.id)
    const msg = t('asmDeleteSectionConfirm')
      .replace('{name}', section.name)
      .replace('{n}', String(sectionNotes.length))
    if (window.confirm(msg)) {
      onDeleteSection(section.id)
    }
  }

  return (
    <main className="assumptions-view" data-testid="assumptions-view">
      <div className="asm-header">
        <span className="asm-title">{t('asmTitle')}</span>
        <button
          className="asm-new-section-btn"
          data-testid="asm-new-section"
          onClick={() => setAddingSection(true)}
        >
          {t('asmNewSection')}
        </button>
      </div>

      {addingSection && (
        <div className="asm-new-section-form">
          <input
            ref={newSectionInputRef}
            className="asm-section-input"
            value={newSectionName}
            placeholder={t('asmSectionPlaceholder')}
            onChange={e => setNewSectionName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitNewSection()
              if (e.key === 'Escape') { setNewSectionName(''); setAddingSection(false) }
            }}
            onBlur={commitNewSection}
          />
        </div>
      )}

      {sections.length === 0 && !addingSection && (
        <div className="asm-empty" data-testid="asm-empty">
          <div className="asm-empty-msg">{t('asmNoSections')}</div>
          <div className="asm-empty-hint">{t('asmNoSectionsHint')}</div>
        </div>
      )}

      {sections.map(section => {
        const sectionNotes = notes.filter(n => n.sectionId === section.id)
        return (
          <section key={section.id} className="asm-card" data-testid={`asm-card-${section.id}`}>
            <div className="asm-card-head">
              {renamingId === section.id ? (
                <input
                  ref={renameInputRef}
                  className="asm-section-rename-input"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') { setRenamingId(null); setRenameValue('') }
                  }}
                  onBlur={commitRename}
                  aria-label={t('asmRenameSection')}
                />
              ) : (
                <span
                  className="asm-card-title"
                  onDoubleClick={() => startRename(section)}
                  title={t('asmRenameSection')}
                >
                  {section.name}
                </span>
              )}
              <span className="asm-card-count">{sectionNotes.length}</span>
              <div className="asm-card-actions">
                <button
                  className="asm-rename-btn"
                  title={t('asmRenameSection')}
                  onClick={() => startRename(section)}
                >
                  ✎
                </button>
                <button
                  className="asm-delete-section-btn"
                  title={t('asmDeleteSection')}
                  onClick={() => handleDeleteSection(section)}
                >
                  ×
                </button>
              </div>
            </div>

            <ul className="asm-list">
              {sectionNotes.map(note => (
                <li key={note.id} className="asm-row" data-testid={`asm-row-${note.id}`}>
                  <textarea
                    className="asm-input"
                    data-testid={`asm-input-${note.id}`}
                    value={note.text}
                    rows={2}
                    placeholder={t('asmNotePlaceholder')}
                    onChange={e => onUpdateNote(note.id, e.target.value)}
                  />
                  <button
                    className="asm-del"
                    data-testid={`asm-del-${note.id}`}
                    title={t('asmDelete')}
                    aria-label={t('asmDelete')}
                    onClick={() => onDeleteNote(note.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <button
              className="asm-add"
              data-testid={`asm-add-note-${section.id}`}
              onClick={() => onAddNote(section.id)}
            >
              {t('asmAddNote')}
            </button>
          </section>
        )
      })}
    </main>
  )
}
