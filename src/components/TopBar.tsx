import { useState } from 'react'
import type { Dataset } from '../lib/types.ts'
import type { StoredRoadmap, StorageError } from '../lib/storage.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  datasets: Dataset[]
  onReset: () => void
  // Multi-roadmap controls (absent → simple header with no roadmap controls)
  roadmapName?: string
  allRoadmaps?: StoredRoadmap[]
  activeId?: string
  storeError?: StorageError | null
  onHome?: () => void
  onSwitchRoadmap?: (id: string) => void
  onRenameRoadmap?: (name: string) => void
}

// One legend row: a rendered sample of the notation + what it means.
function LegendRow({ sample, desc }: { sample: React.ReactNode; desc: string }) {
  return (
    <div className="legend-row">
      <span className="legend-sample">{sample}</span>
      <span className="legend-desc">{desc}</span>
    </div>
  )
}

export default function TopBar({
  datasets,
  onReset,
  roadmapName,
  allRoadmaps,
  activeId,
  storeError,
  onHome,
  onSwitchRoadmap,
  onRenameRoadmap,
}: Props) {
  const { t } = useI18n()
  const [helpOpen, setHelpOpen] = useState(false)
  const [renamingName, setRenamingName] = useState<string | null>(null)

  function handleReset() {
    if (window.confirm(t('resetConfirm'))) onReset()
  }

  function submitRename() {
    if (renamingName !== null && renamingName.trim() && onRenameRoadmap) {
      onRenameRoadmap(renamingName.trim())
    }
    setRenamingName(null)
  }

  return (
    <>
      {storeError && (
        <div className="storage-error-banner" data-testid="storage-error-banner">
          {storeError === 'quota-exceeded' ? t('storageErrorQuota') : t('storageErrorUnavailable')}
        </div>
      )}
      <header className="topbar">
        {onHome && (
          <button className="btn-back-home" data-testid="btn-back-home" onClick={onHome}>
            {t('backHome')}
          </button>
        )}

        <span className="topbar-logo">◉ Roadmap Studio</span>

        {/* Current roadmap name — double-click to rename */}
        {roadmapName !== undefined && (
          renamingName !== null ? (
            <input
              className="topbar-rename-input"
              data-testid="topbar-rename-input"
              value={renamingName}
              autoFocus
              onChange={e => setRenamingName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') submitRename()
                if (e.key === 'Escape') setRenamingName(null)
              }}
              onBlur={submitRename}
            />
          ) : (
            <span
              className="topbar-roadmap-name"
              data-testid="topbar-roadmap-name"
              title={t('renameRoadmapAria')}
              onDoubleClick={() => setRenamingName(roadmapName)}
            >
              {roadmapName}
            </span>
          )
        )}

        {/* Roadmap switcher dropdown */}
        {allRoadmaps && allRoadmaps.length > 1 && onSwitchRoadmap && (
          <select
            className="topbar-switcher"
            data-testid="topbar-switcher"
            value={activeId ?? ''}
            aria-label={t('switchRoadmapAria')}
            onChange={e => onSwitchRoadmap(e.target.value)}
          >
            {allRoadmaps.map(rm => (
              <option key={rm.id} value={rm.id}>{rm.name}</option>
            ))}
          </select>
        )}

        <div className="topbar-divider" />
        <div className="topbar-chips">
          {datasets.map(d => (
            <span key={d.id} className="dataset-chip">
              {d.name} · {d.frequency}
            </span>
          ))}
        </div>

        {/* Notation legend */}
        <div className="legend-wrap">
          <button
            className="btn-help"
            data-testid="legend-toggle"
            aria-expanded={helpOpen}
            aria-label={t('legendTitle')}
            title={t('legendTitle')}
            onClick={() => setHelpOpen(o => !o)}
          >
            ?
          </button>
          {helpOpen && (
            <>
              <div className="legend-scrim" onClick={() => setHelpOpen(false)} aria-hidden="true" />
              <div className="legend-popover" data-testid="legend-popover" role="dialog" aria-label={t('legendTitle')}>
                <div className="legend-head">{t('legendTitle')}</div>
                <LegendRow sample={<span className="chip chip--data">DATA 10d</span>} desc={t('legendD')} />
                <LegendRow sample={<><span className="chip chip--fullstack">FULL 2d</span><span className="legend-mono"> · 2p</span></>} desc={t('legendP')} />
                <LegendRow sample={<span className="legend-mono">2sem</span>} desc={t('legendSem')} />
                <LegendRow
                  sample={<><span className="chip chip--data">DATA</span><span className="chip chip--fullstack">FULL</span><span className="chip chip--ai">AI</span><span className="chip chip--design">DESI</span></>}
                  desc={t('legendRoles')}
                />
                <LegendRow sample={<span className="story-badge story-badge--mvp">MVP</span>} desc={t('legendMvp')} />
                <LegendRow sample={<span className="story-badge story-badge--auto">AUTO</span>} desc={t('legendAuto')} />
                <LegendRow sample={<span className="story-badge story-badge--degraded">⚠ −HEAT</span>} desc={t('legendDegraded')} />
                <LegendRow sample={<span className="legend-mono">SCOPE 67%</span>} desc={t('legendScope')} />
                <LegendRow sample={<span className="legend-mono">TARGET / FORECAST</span>} desc={t('legendTargetForecast')} />
              </div>
            </>
          )}
        </div>

        <button className="btn-reset" onClick={handleReset}>
          {t('reset')}
        </button>
      </header>
    </>
  )
}
