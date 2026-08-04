import { useI18n } from '../i18n/I18nContext.tsx'

export type View = 'tree' | 'timeline' | 'assumptions'

interface Props {
  view: View
  onChange: (v: View) => void
}

// Segmented control that swaps the center workspace between the Tree (planning)
// and Timeline (Gantt) views. Selection state lives in App and is shared by both
// views, so switching never loses the selected story (US-002 UC-02).
export default function ViewToggle({ view, onChange }: Props) {
  const { t } = useI18n()
  return (
    <div className="view-toggle" role="group" aria-label={t('viewToggleAria')}>
      <button
        className={`view-toggle-btn${view === 'tree' ? ' view-toggle-btn--active' : ''}`}
        onClick={() => onChange('tree')}
        data-testid="view-toggle-tree"
        aria-pressed={view === 'tree'}
      >
        ⊟ {t('viewTree')}
      </button>
      <button
        className={`view-toggle-btn${view === 'timeline' ? ' view-toggle-btn--active' : ''}`}
        onClick={() => onChange('timeline')}
        data-testid="view-toggle-timeline"
        aria-pressed={view === 'timeline'}
      >
        ▤ {t('viewTimeline')}
      </button>
      <button
        className={`view-toggle-btn${view === 'assumptions' ? ' view-toggle-btn--active' : ''}`}
        onClick={() => onChange('assumptions')}
        data-testid="view-toggle-assumptions"
        aria-pressed={view === 'assumptions'}
      >
        ? {t('viewAssumptions')}
      </button>
    </div>
  )
}
