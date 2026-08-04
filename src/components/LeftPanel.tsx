import { useMemo } from 'react'
import type { TeamRole, RiskLayer, Story } from '../lib/types.ts'
import { effortByRole } from '../lib/aggregation.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  teamRoles: TeamRole[]
  riskLayers: RiskLayer[]
  stories: Story[]
  onSetPeople: (roleId: string, people: number) => void
  onToggleLayer: (layerId: string) => void
}

export default function LeftPanel({ teamRoles, riskLayers, stories, onSetPeople, onToggleLayer }: Props) {
  const { t } = useI18n()

  const totalByRole = useMemo(() => effortByRole(stories), [stories])

  const loads = useMemo(() => {
    return teamRoles.map(r => {
      const total = totalByRole.get(r.id) ?? 0
      const load = r.people > 0 ? total / r.people : total
      return { id: r.id, name: r.name, people: r.people, total, load }
    })
  }, [teamRoles, totalByRole])

  const maxLoad = useMemo(
    () => Math.max(...loads.map(l => l.people > 0 ? l.load : 0), 1),
    [loads],
  )

  const bottleneckId = useMemo(
    () => loads.reduce((best, l) => l.load > (best?.load ?? 0) ? l : best, loads[0])?.id,
    [loads],
  )

  return (
    <aside className="left-panel">
      {/* Team */}
      <div className="panel-section">
        <div className="panel-label">{t('team')}</div>
        {teamRoles.map(r => (
          <div key={r.id} className="team-row">
            <span className="team-role-name">{r.name}</span>
            <div className="stepper">
              <button
                className="stepper-btn"
                onClick={() => onSetPeople(r.id, r.people - 1)}
                disabled={r.people <= 0}
                aria-label={t('removeRole', { name: r.name })}
              >
                −
              </button>
              <span className={`stepper-val${r.people === 0 ? ' stepper-val--zero' : ''}`}>
                {r.people}
              </span>
              <button
                className="stepper-btn"
                onClick={() => onSetPeople(r.id, r.people + 1)}
                aria-label={t('addRole', { name: r.name })}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Risk layers */}
      <div className="panel-section">
        <div className="panel-label">
          {t('threats')} · {riskLayers.filter(l => l.active).length}/{riskLayers.length}
        </div>
        {riskLayers.map(l => (
          <label key={l.id} className="layer-row" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              className="layer-checkbox"
              checked={l.active}
              onChange={() => onToggleLayer(l.id)}
            />
            <span className={`layer-name${l.active ? '' : ' layer-name--inactive'}`}>
              {l.name}
            </span>
          </label>
        ))}
      </div>

      {/* Role load bars */}
      <div className="panel-section">
        <div className="panel-label">{t('roleLoad')}</div>
        {loads.map(l => {
          const isBottleneck = l.id === bottleneckId
          const pct = maxLoad > 0 ? (l.load / maxLoad) * 100 : 0
          const fillClass = l.people === 0
            ? 'bar-fill bar-fill--blocked'
            : isBottleneck
              ? 'bar-fill bar-fill--bottleneck'
              : 'bar-fill bar-fill--active'

          return (
            <div key={l.id} className="load-row">
              <div className="load-header">
                <span className={`load-role-id${isBottleneck ? ' load-role-id--bottleneck' : ''}`}>
                  {l.id.toUpperCase()}
                  {isBottleneck && ' ←'}
                </span>
                <span className={`load-value${isBottleneck ? ' load-value--bottleneck' : ''}`}>
                  {l.people === 0 ? '0p' : `${l.load.toFixed(0)}d/p`}
                </span>
              </div>
              <div className="bar-track">
                <div className={fillClass} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
