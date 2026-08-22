import { useRef, useState } from 'react'
import type { Epic, TeamRole, EffortScaleStep, RiskLayer } from '../lib/types'
import {
  parseCsvText,
  applyMapping,
  type CsvParseOk,
  type ImportMapping,
  type PreparedImport,
} from '../lib/csvImport'

interface Props {
  epics: Epic[]
  teamRoles: TeamRole[]
  effortScale: EffortScaleStep[]
  riskLayers: RiskLayer[]
  defaultComponentId: string
  onImport: (prepared: PreparedImport) => void
  onClose: () => void
}

type Step = 'upload' | 'map' | 'preview'

// ── Helpers ───────────────────────────────────────────────────────────────────

const NONE = ''

function ColSelect({
  value,
  headers,
  onChange,
  placeholder = '— skip —',
}: {
  value: string
  headers: string[]
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <select
      className="csv-col-select"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value={NONE}>{placeholder}</option>
      {headers.map(h => (
        <option key={h} value={h}>{h}</option>
      ))}
    </select>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CsvImportModal({
  epics,
  teamRoles,
  effortScale,
  riskLayers,
  defaultComponentId,
  onImport,
  onClose,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep]             = useState<Step>('upload')
  const [parsed, setParsed]         = useState<CsvParseOk | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)

  const defaultEpicId = epics[0]?.id ?? ''
  const defaultRoleId = teamRoles[0]?.id ?? ''

  const [mapping, setMapping] = useState<ImportMapping>({
    titleCol:       NONE,
    epicCol:        NONE,
    fallbackEpicId: defaultEpicId,
    effortCol:      NONE,
    effortRoleId:   defaultRoleId,
    tagsCol:        NONE,
  })

  // Re-derive preview whenever mapping or parsed changes.
  // PreparedImport is a pure description — no side effects yet.
  const importResult: PreparedImport | null = parsed
    ? applyMapping(parsed, mapping, {
        epics,
        config: { effortScale, riskLayers, teamRoles, calendarConfig: { startDate: '', daysPerWeek: 5, holidays: [] } },
      }, defaultComponentId)
    : null

  // ── File reading ────────────────────────────────────────────────────────────

  function readFile(file: File) {
    setLoading(true)
    setParseError(null)
    const reader = new FileReader()
    reader.onload = e => {
      setLoading(false)
      const text = (e.target?.result as string) ?? ''
      const result = parseCsvText(text)
      if (!result.ok) {
        setParseError(result.error)
        return
      }
      setParsed(result)
      // Auto-pick columns by common names
      const titleGuess  = result.headers.find(h => h.toLowerCase() === 'title') ?? NONE
      const epicGuess   = result.headers.find(h => h.toLowerCase() === 'epic') ?? NONE
      const effortGuess = result.headers.find(h => /effort|estim/i.test(h)) ?? NONE
      const tagsGuess   = result.headers.find(h => /tag|label/i.test(h)) ?? NONE
      setMapping(m => ({
        ...m,
        titleCol: titleGuess,
        epicCol: epicGuess,
        effortCol: effortGuess,
        effortRoleId: effortGuess ? defaultRoleId : NONE,
        tagsCol: tagsGuess,
      }))
      setStep('map')
    }
    reader.onerror = () => {
      setLoading(false)
      setParseError('Could not read the file.')
    }
    reader.readAsText(file, 'utf-8')
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  // ── Confirm import ──────────────────────────────────────────────────────────

  function handleConfirm() {
    if (!importResult) return
    onImport(importResult)
  }

  // ── Patch helper ───────────────────────────────────────────────────────────

  function patch(updates: Partial<ImportMapping>) {
    setMapping(m => ({ ...m, ...updates }))
  }

  // ── Steps ───────────────────────────────────────────────────────────────────

  const headers = parsed?.headers ?? []

  // Preview is available as soon as title column is set.
  // An empty roadmap is fine — epics will be created from the CSV.
  const canPreview = mapping.titleCol !== NONE

  // Total objects to be created (for button label)
  const totalNewEpics = importResult?.newEpics.length ?? 0
  const totalNewTags  = importResult?.newTags.length  ?? 0
  const totalStories  = importResult?.rows.length     ?? 0

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal csv-modal" onClick={e => e.stopPropagation()}>

        {/* ── Step indicator ── */}
        <div className="csv-steps">
          <span className={`csv-step ${step === 'upload' ? 'csv-step--active' : 'csv-step--done'}`}>1 Upload</span>
          <span className="csv-step-sep">›</span>
          <span className={`csv-step ${step === 'map' ? 'csv-step--active' : step === 'preview' ? 'csv-step--done' : ''}`}>2 Map</span>
          <span className="csv-step-sep">›</span>
          <span className={`csv-step ${step === 'preview' ? 'csv-step--active' : ''}`}>3 Import</span>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STEP 1 — Upload
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 'upload' && (
          <>
            <div className="modal-title">IMPORT FROM CSV</div>

            <div
              className="csv-drop-zone"
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            >
              {loading
                ? <span className="csv-drop-hint">Reading…</span>
                : <>
                    <span className="csv-drop-icon">↑</span>
                    <span className="csv-drop-label">Click to select a CSV file</span>
                    <span className="csv-drop-hint">or drag and drop it here</span>
                  </>
              }
            </div>

            {parseError && (
              <div className="csv-error">{parseError}</div>
            )}

            <div className="csv-format-hint">
              <span className="csv-format-hint-label">Expected columns (all optional except title):</span>
              <span className="csv-col-badge">title</span>
              <span className="csv-col-badge">epic</span>
              <span className="csv-col-badge">effort</span>
              <span className="csv-col-badge">tags</span>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.txt"
              style={{ display: 'none' }}
              onChange={handleFileInput}
            />

            <div className="modal-actions">
              <button className="modal-btn modal-btn--ghost" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 2 — Map columns
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 'map' && parsed && (
          <>
            <div className="modal-title">MAP COLUMNS</div>

            {/* Detected columns pill row */}
            <div className="csv-detected-row">
              <span className="csv-detected-label">Detected:</span>
              {headers.map(h => (
                <span key={h} className="csv-col-badge">{h}</span>
              ))}
            </div>

            {/* Parse-level warning: rows dropped before mapping even runs */}
            {parsed.parseWarnings > 0 && (
              <div className="csv-skip-note">
                {parsed.parseWarnings} row{parsed.parseWarnings > 1 ? 's' : ''} had
                formatting issues (malformed quotes, shifted columns) and were dropped
                during parsing. They will not be imported. Review the preview carefully.
              </div>
            )}

            <div className="csv-map-table">

              {/* Title */}
              <div className="csv-map-row csv-map-row--required">
                <div className="csv-map-field">
                  <span className="csv-map-field-name">TITLE</span>
                  <span className="csv-map-required">required</span>
                </div>
                <ColSelect
                  value={mapping.titleCol}
                  headers={headers}
                  onChange={v => patch({ titleCol: v })}
                  placeholder="— select column —"
                />
              </div>

              {/* Epic */}
              <div className="csv-map-row">
                <div className="csv-map-field">
                  <span className="csv-map-field-name">EPIC / STAGE</span>
                </div>
                <div className="csv-map-controls">
                  <ColSelect
                    value={mapping.epicCol}
                    headers={headers}
                    onChange={v => patch({ epicCol: v })}
                    placeholder="— no column —"
                  />
                  <span className="csv-map-sub-label">Blank rows fallback:</span>
                  {epics.length > 0 ? (
                    <select
                      className="csv-col-select"
                      value={mapping.fallbackEpicId}
                      onChange={e => patch({ fallbackEpicId: e.target.value })}
                    >
                      <option value="">— creates 'General' stage —</option>
                      {epics.map(ep => (
                        <option key={ep.id} value={ep.id}>{ep.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="csv-map-note">Empty rows → 'General' stage</span>
                  )}
                </div>
              </div>
              <div className="csv-map-note">
                Stage names from CSV are created automatically if they don't exist yet.
              </div>

              {/* Effort */}
              <div className="csv-map-row">
                <div className="csv-map-field">
                  <span className="csv-map-field-name">EFFORT</span>
                </div>
                <div className="csv-map-controls">
                  <ColSelect
                    value={mapping.effortCol}
                    headers={headers}
                    onChange={v => patch({ effortCol: v, effortRoleId: v ? (mapping.effortRoleId || defaultRoleId) : NONE })}
                  />
                  {mapping.effortCol && (
                    <>
                      <span className="csv-map-sub-label">Assign to role:</span>
                      <select
                        className="csv-col-select"
                        value={mapping.effortRoleId}
                        onChange={e => patch({ effortRoleId: e.target.value })}
                      >
                        {teamRoles.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>
              {mapping.effortCol && (
                <div className="csv-map-note">
                  Values matched against scale: {effortScale.map(s => s.label).join(' · ')}
                </div>
              )}

              {/* Tags */}
              <div className="csv-map-row">
                <div className="csv-map-field">
                  <span className="csv-map-field-name">TAGS</span>
                </div>
                <div className="csv-map-controls">
                  <ColSelect
                    value={mapping.tagsCol}
                    headers={headers}
                    onChange={v => patch({ tagsCol: v })}
                  />
                </div>
              </div>
              {mapping.tagsCol && riskLayers.length > 0 && (
                <div className="csv-map-note">
                  Existing: {riskLayers.map(l => l.name).join(' · ')} · Unknown tags created automatically
                </div>
              )}
              {mapping.tagsCol && riskLayers.length === 0 && (
                <div className="csv-map-note">
                  No tags configured yet — new tags from this column will be created automatically.
                </div>
              )}

            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn--ghost" onClick={() => setStep('upload')}>← Back</button>
              <button
                className="modal-btn modal-btn--primary"
                disabled={!canPreview}
                onClick={() => setStep('preview')}
              >
                Preview →
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 3 — Preview & confirm
        ═══════════════════════════════════════════════════════════════════ */}
        {step === 'preview' && importResult && (
          <>
            <div className="modal-title">READY TO IMPORT</div>

            <div className="csv-preview-summary">
              <span className="csv-preview-count">{totalStories}</span>
              <span className="csv-preview-label"> {totalStories === 1 ? 'story' : 'stories'} will be created</span>
            </div>

            {/* New epics to be auto-created */}
            {totalNewEpics > 0 && (
              <div className="csv-new-items-note">
                <span className="csv-new-items-label">
                  {totalNewEpics} new stage{totalNewEpics !== 1 ? 's' : ''} will be created:
                </span>
                <span className="csv-new-items-list">
                  {importResult.newEpics.map(e => e.name).join(', ')}
                </span>
              </div>
            )}

            {/* New tags to be auto-created */}
            {totalNewTags > 0 && (
              <div className="csv-new-items-note">
                <span className="csv-new-items-label">
                  {totalNewTags} new tag{totalNewTags !== 1 ? 's' : ''} will be created:
                </span>
                <span className="csv-new-items-list">
                  {importResult.newTags.map(t => t.name).join(', ')}
                </span>
              </div>
            )}

            {/* Parse-level drops (malformed rows) */}
            {parsed && parsed.parseWarnings > 0 && (
              <div className="csv-skip-note">
                {parsed.parseWarnings} row{parsed.parseWarnings > 1 ? 's' : ''} dropped
                during parsing (malformed quotes / shifted columns) — not imported.
              </div>
            )}

            {importResult.skipped > 0 && (
              <div className="csv-skip-note">
                {importResult.skipped} row{importResult.skipped > 1 ? 's' : ''} skipped — no title found.
              </div>
            )}

            {totalStories === 0 && (
              <div className="csv-skip-note csv-skip-note--empty">
                Nothing to import. Make sure you selected the correct title column and that rows have values.
              </div>
            )}

            {totalStories > 0 && (
              <>
                <div className="csv-preview-subtitle">Preview (first {Math.min(5, totalStories)}):</div>
                <ul className="csv-preview-list">
                  {importResult.rows.slice(0, 5).map((row, i) => {
                    // Resolve epic name: existing epic or new epic spec
                    const existingEpic = epics.find(e => e.id === row.epicId)
                    const newEpic = importResult.newEpics.find(e => e.tempId === row.epicId)
                    const epicName = existingEpic?.name ?? newEpic?.name

                    const hasEffort = row.fields.roleEfforts.length > 0
                    const effortDays = hasEffort ? row.fields.roleEfforts[0].days : null
                    const effortLabel = effortDays !== null
                      ? (effortScale.find(s => s.days === effortDays)?.label ?? `${effortDays}d`)
                      : null
                    return (
                      <li key={i} className="csv-preview-item">
                        <span className="csv-preview-item-title">{row.fields.title}</span>
                        <span className="csv-preview-item-meta">
                          {epicName && (
                            <span className={`csv-preview-tag${newEpic ? ' csv-preview-tag--new' : ''}`}>
                              {epicName}{newEpic ? ' ✦' : ''}
                            </span>
                          )}
                          {effortLabel && <span className="csv-preview-tag">{effortLabel}</span>}
                          {row.fields.labels.map(l => {
                            const isNew = importResult.newTags.some(t => t.name === l)
                            return (
                              <span key={l} className={`csv-preview-tag csv-preview-tag--label${isNew ? ' csv-preview-tag--new' : ''}`}>
                                {l}{isNew ? ' ✦' : ''}
                              </span>
                            )
                          })}
                        </span>
                      </li>
                    )
                  })}
                  {totalStories > 5 && (
                    <li className="csv-preview-more">
                      …and {totalStories - 5} more
                    </li>
                  )}
                </ul>
                <div className="csv-preview-legend">✦ = will be created</div>
              </>
            )}

            <div className="modal-actions">
              <button className="modal-btn modal-btn--ghost" onClick={() => setStep('map')}>← Back</button>
              <button
                className="modal-btn modal-btn--primary"
                disabled={totalStories === 0}
                onClick={handleConfirm}
              >
                Import {totalStories} {totalStories === 1 ? 'story' : 'stories'}
                {totalNewEpics > 0 ? ` +${totalNewEpics} stage${totalNewEpics !== 1 ? 's' : ''}` : ''}
                {totalNewTags  > 0 ? ` +${totalNewTags} tag${totalNewTags   !== 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
