import { useMemo } from 'react'
import type { Assumption, AssumptionKind } from '../lib/types.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  assumptions: Assumption[]
  onAdd: (category: string, kind: AssumptionKind) => string
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}

// Fixed display order for the seeded categories; any PM-added category falls in
// after these, in first-seen order. Each category renders as a card.
const CATEGORY_ORDER = ['Datasets', 'Mitigation', 'Milestones & dates', 'Open questions']

// "Nada asumido" (invariant #15) made a first-class, editable surface. Assumptions
// the roadmap rests on and the questions we'd put to the board — visible in-tool,
// not just in the PM's head. Everything here is add/edit/delete live.
export default function AssumptionsView({ assumptions, onAdd, onUpdate, onDelete }: Props) {
  const { t } = useI18n()

  // Group by category, preserving CATEGORY_ORDER then first-seen order.
  const groups = useMemo(() => {
    const byCat = new Map<string, Assumption[]>()
    for (const a of assumptions) {
      if (!byCat.has(a.category)) byCat.set(a.category, [])
      byCat.get(a.category)!.push(a)
    }
    const cats = [...byCat.keys()].sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a)
      const ib = CATEGORY_ORDER.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
    return cats.map(cat => ({ cat, items: byCat.get(cat)! }))
  }, [assumptions])

  return (
    <main className="assumptions-view" data-testid="assumptions-view">
      <div className="asm-intro">
        <div className="asm-intro-title">{t('asmTitle')}</div>
        <div className="asm-intro-sub">{t('asmSubtitle')}</div>
      </div>

      {groups.map(({ cat, items }) => {
        // "Open questions" is a question category; everything else holds assumptions.
        const kind: AssumptionKind = cat === 'Open questions' ? 'question' : 'assumption'
        return (
          <section key={cat} className="asm-card" data-testid={`asm-card-${cat}`}>
            <div className="asm-card-head">
              <span className="asm-card-title">{cat}</span>
              <span className="asm-card-count">{items.length}</span>
            </div>
            <ul className="asm-list">
              {items.map(a => (
                <li key={a.id} className="asm-row" data-testid={`asm-row-${a.id}`}>
                  <span className={`asm-marker asm-marker--${a.kind}`} aria-hidden="true">
                    {a.kind === 'question' ? '?' : '›'}
                  </span>
                  <textarea
                    className="asm-input"
                    data-testid={`asm-input-${a.id}`}
                    value={a.text}
                    rows={2}
                    placeholder={kind === 'question' ? t('asmQuestionPlaceholder') : t('asmAssumptionPlaceholder')}
                    onChange={e => onUpdate(a.id, e.target.value)}
                  />
                  <button
                    className="asm-del"
                    data-testid={`asm-del-${a.id}`}
                    title={t('asmDelete')}
                    aria-label={t('asmDelete')}
                    onClick={() => onDelete(a.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="asm-add"
              data-testid={`asm-add-${cat}`}
              onClick={() => onAdd(cat, kind)}
            >
              + {kind === 'question' ? t('asmAddQuestion') : t('asmAddAssumption')}
            </button>
          </section>
        )
      })}
    </main>
  )
}
