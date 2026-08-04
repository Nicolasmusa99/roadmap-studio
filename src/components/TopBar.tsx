import type { Dataset } from '../lib/types.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  datasets: Dataset[]
  onReset: () => void
}

export default function TopBar({ datasets, onReset }: Props) {
  const { t } = useI18n()

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

      <button className="btn-reset" onClick={handleReset}>
        {t('reset')}
      </button>
    </header>
  )
}
