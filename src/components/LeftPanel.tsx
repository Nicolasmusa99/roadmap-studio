import { useMemo, useState } from 'react'
import type { TeamRole, RiskLayer, Story } from '../lib/types.ts'
import { effortByRole } from '../lib/aggregation.ts'
import { storiesInScope, scopeSummary } from '../lib/threats.ts'
import { useI18n } from '../i18n/I18nContext.tsx'

interface Props {
  teamRoles: TeamRole[]
  riskLayers: RiskLayer[]
  stories: Story[]
  onSetPeople: (roleId: string, people: number) => void
  onAddRole: (name: string) => void
  onRenameRole: (roleId: string, name: string) => void
  onRemoveRole: (roleId: string) => void
  onAddTag: (name: string) => void
  onRemoveTag: (tagId: string) => void
  onToggleLayer: (layerId: string) => void
}

export default function LeftPanel({
  teamRoles,
  riskLayers,
  stories,
  onSetPeople,
  onAddRole,
  onRenameRole,
  onRemoveRole,
  onAddTag,
  onRemoveTag,
  onToggleLayer,
}: Props) {
  const { t } = useI18n()

  // roleId → current inline rename value (null = not editing)
  const [renamingRole, setRenamingRole] = useState<{ id: string; value: string } | null>(null)
  // new role name being typed (null = add form hidden)
  const [addingRole, setAddingRole] = useState<string | null>(null)
  // new tag name being typed (null = add form hidden)
  const [addingTag, setAddingTag] = useState<string | null>(null)

  // Role Load reflects only work in scope: dropping a threat shrinks its role bars.
  const scopedStories = useMemo(() => storiesInScope(stories, riskLayers), [stories, riskLayers])
  const scope = useMemo(() => scopeSummary(stories, riskLayers), [stories, riskLayers])

  const totalByRole = useMemo(() => effortByRole(scopedStories), [scopedStories])

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
          <div key={r.id} className="team-row" data-testid={`team-row-${r.id}`}>
            {renamingRole?.id === r.id ? (
              <input
                className="team-rename-input"
                data-testid={`role-rename-input-${r.id}`}
                value={renamingRole.value}
                autoFocus
                onChange={e => setRenamingRole({ id: r.id, value: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter' && renamingRole.value.trim()) {
                    onRenameRole(r.id, renamingRole.value)
                    setRenamingRole(null)
                  } else if (e.key === 'Escape') {
                    setRenamingRole(null)
                  }
                }}
                onBlur={() => {
                  if (renamingRole.value.trim()) onRenameRole(r.id, renamingRole.value)
                  setRenamingRole(null)
                }}
              />
            ) : (
              <span
                className="team-role-name"
                data-testid={`role-name-${r.id}`}
                onDoubleClick={() => setRenamingRole({ id: r.id, value: r.name })}
                title={r.name}
              >
                {r.name}
              </span>
            )}
            <div className="team-role-actions">
              <button
                className="tree-epic-action-btn"
                data-testid={`role-rename-btn-${r.id}`}
                title={t('renameRoleAria')}
                aria-label={t('renameRoleAria')}
                onClick={() => setRenamingRole({ id: r.id, value: r.name })}
              >
                ✎
              </button>
              <button
                className="tree-epic-action-btn tree-epic-action-btn--danger"
                data-testid={`role-delete-btn-${r.id}`}
                title={t('deleteRoleAria', { name: r.name })}
                aria-label={t('deleteRoleAria', { name: r.name })}
                onClick={() => onRemoveRole(r.id)}
              >
                ×
              </button>
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
          </div>
        ))}

        {/* Add role (Change 2 — dynamic roles) */}
        {addingRole !== null ? (
          <input
            className="team-add-input"
            data-testid="role-add-input"
            placeholder={t('newRolePlaceholder')}
            value={addingRole}
            autoFocus
            onChange={e => setAddingRole(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && addingRole.trim()) {
                onAddRole(addingRole)
                setAddingRole(null)
              } else if (e.key === 'Escape') {
                setAddingRole(null)
              }
            }}
            onBlur={() => {
              if (addingRole.trim()) onAddRole(addingRole)
              setAddingRole(null)
            }}
          />
        ) : (
          <button
            className="team-add-btn"
            data-testid="role-add-btn"
            onClick={() => setAddingRole('')}
          >
            + {t('addRoleBtn')}
          </button>
        )}
      </div>

      {/* Tags (replaces fixed "threats" — Change 3) */}
      <div className="panel-section">
        <div className="panel-label">
          {t('tags')} · {riskLayers.filter(l => l.active).length}/{riskLayers.length}
        </div>
        {riskLayers.map(l => (
          <div key={l.id} className="layer-row" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
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
            <button
              className="tree-epic-action-btn tree-epic-action-btn--danger"
              data-testid={`tag-delete-btn-${l.id}`}
              title={t('deleteTagAria', { name: l.name })}
              aria-label={t('deleteTagAria', { name: l.name })}
              onClick={() => onRemoveTag(l.id)}
            >
              ×
            </button>
          </div>
        ))}

        {/* Add tag */}
        {addingTag !== null ? (
          <input
            className="team-add-input"
            data-testid="tag-add-input"
            placeholder={t('newTagPlaceholder')}
            value={addingTag}
            autoFocus
            onChange={e => setAddingTag(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && addingTag.trim()) {
                onAddTag(addingTag)
                setAddingTag(null)
              } else if (e.key === 'Escape') {
                setAddingTag(null)
              }
            }}
            onBlur={() => {
              if (addingTag.trim()) onAddTag(addingTag)
              setAddingTag(null)
            }}
          />
        ) : (
          <button
            className="team-add-btn"
            data-testid="tag-add-btn"
            onClick={() => setAddingTag('')}
          >
            + {t('addTagBtn')}
          </button>
        )}

        {/* Scope readout — the assumption stays declared, never hidden (#12). */}
        <div className="scope-readout" data-testid="scope-readout">
          <div className="scope-readout-bar">
            <div className="scope-readout-fill" style={{ width: `${scope.pct}%` }} />
          </div>
          <div className="scope-readout-label">
            {t('scopeReadout', {
              pct: String(scope.pct),
              inScope: String(scope.storiesInScope),
              total: String(scope.storiesTotal),
            })}
          </div>
        </div>
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
                  {l.name.toUpperCase()}
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
