import { useState } from 'react'
import type { Dataset } from '../lib/types.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  datasets: Dataset[]
  onReset: () => void
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

export default function TopBar({ datasets, onReset }: Props) {
  const { t } = useI18n()
  const [helpOpen, setHelpOpen] = useState(false)

  function handleReset() {
    if (window.confirm(t('resetConfirm'))) onReset()
  }

  return (
    <header className="topbar">
      <span className="topbar-logo">◉ Roadmap Studio</span>
      <div className="topbar-divider" />
      <div className="topbar-chips">
        {datasets.map(d => (
          <span key={d.id} className="dataset-chip">
            {d.name} · {d.frequency}
          </span>
        ))}
      </div>

      {/* Notation legend — clarifies d / p / sem / MVP / scope for the board */}
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
  )
}
